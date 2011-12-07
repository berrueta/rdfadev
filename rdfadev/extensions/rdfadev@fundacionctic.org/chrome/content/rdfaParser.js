/* see license.txt for terms of usage */


/* tree visualization modes */
treeVisualization = new Object();

treeVisualization.URIs   = 0;
treeVisualization.CURIEs = 1;
treeVisualization.Labels = 2;

/* error codes */
parserError = new Object();

parserError.undefinedPrefix            = 0;
parserError.nonConventionalPrefix      = 1;
parserError.redefinedPrefix            = 2;
parserError.unusedPrefix               = 3;

parserError.unusedAttribute            = 4;

parserError.badReservedWordOrCurie     = 5;
parserError.badUriOrSafeCurie          = 6;
parserError.badCurie                   = 7; 
parserError.badUri                     = 8;

parserError.defaultNamespace           = 9;
parserError.htmlRootElement            = 10;
parserError.documentVersion            = 11;
parserError.documentMediaType          = 12;
parserError.xmlDeclaration             = 13;

parserError.duplicatedTriple           = 14;
parserError.missingIncompleteTriple    = 15;
parserError.missingLanguage            = 16;
 
parserError.missingLiteralDatatype     = 17;
 
RDFa_parser.prototype.execute           = execute;
RDFa_parser.prototype.recorreElementos  = recorreElementos;
RDFa_parser.prototype.formaTripleta     = formaTripleta;
RDFa_parser.prototype.borraElementos    = borraElementos;
RDFa_parser.prototype.eliminaTripleta   = eliminaTripleta;
RDFa_parser.prototype.completaErrores   = completaErrores;
RDFa_parser.prototype.createMarkup      = createMarkup;
RDFa_parser.prototype.completaMarkupSrc = completaMarkupSrc;

var empty_bnode_prefix        = "rdfadevBnodeEmpty";
var bnode_prefix              = "rdfadevBnode";

var prefijos_habituales       = null;

var goodNodeClick = function (e) 
{ 
  document.getElementById("sidebarTabbox").selectedIndex = 0;
  errorTreeView.selection.clearSelection(); 
  rdfaTreeView.selectElementsById(this.id); 
}

var badNodeClick = function (e) 
{ 
  document.getElementById("sidebarTabbox").selectedIndex = 1;
  rdfaTreeView.selection.clearSelection(); 
  errorTreeView.selectElementsById(this.id); 
}

var fairNodeClick = function (e) 
{ 
  rdfaTreeView.selectElementsById(this.id); 
  errorTreeView.selectElementsById(this.id); 
}

function RDFa_parser()
{

  this.tripletas              = new Object();
  this.n3                     = "";
  this.errores                = new Array();
  this.id_counter             = { value: 0 };
  this.bnodes                 = { value: 0 };
  this.nuevas_tripletas       = new Object();
  this.nuevos_errores         = null;
  this.hay_nuevas_tripletas   = false;
  this.hay_elementos_borrados = false;
  this.hay_errores_borrados   = false;

}

function borraElementos(elemento)
{
  /* remove children */
  for(var current_element = elemento.firstChild; current_element != null; current_element = current_element.nextSibling)
  {
    this.borraElementos(current_element);
  }
  /* remove element */
  this.eliminaTripleta(elemento);
}

function eliminaTripleta(elemento)
{
  /* remove object */ 
  if(elemento.objectArray != null)
  {
    for(var i = 0; i < elemento.objectArray.length; i++)
    {
      /* remove subject elements */
      for(var j = 0; j < elemento.objectArray[i].parent_subject.elementos.length; j++)
      {
        if(elemento.objectArray[i].subject_element == elemento.objectArray[i].parent_subject.elementos[j])
        {
          elemento.objectArray[i].parent_subject.elementos.splice(j, 1);
          this.hay_elementos_borrados = true;

          break;
        }
      }

      /* remove predicate elements */
      for(var j = 0; j < elemento.objectArray[i].parent_predicate.elementos.length; j++)
      {
        if(elemento.objectArray[i].predicate_element == elemento.objectArray[i].parent_predicate.elementos[j])
        {
          elemento.objectArray[i].parent_predicate.elementos.splice(j, 1);
          this.hay_elementos_borrados = true;

          break;
        }
      }

      var strSubject             = elemento.objectArray[i].parent_subject.uri;
      var strPredicate           = elemento.objectArray[i].parent_predicate.uri;
      var oldObject              = elemento.objectArray[i];

      var current_subject        = elemento.objectArray[i].parent_subject;
      var current_predicate      = elemento.objectArray[i].parent_predicate;

      var d = new Date();

      for(var j = 0; j < current_predicate.objetos.length; j++)
      {
        if(current_predicate.objetos[j] == oldObject)
        {
          /* remove object markup */
          if((oldObject.marca_sel != null) && (oldObject.marca_sel.parentNode != null))
          {
            oldObject.marca_sel.parentNode.removeChild(oldObject.marca_sel);
          }

          if((oldObject.marca_unsel != null) && (oldObject.marca_unsel.parentNode != null))
          {
            oldObject.marca_unsel.parentNode.removeChild(oldObject.marca_unsel);
          }

          /* remove object */
          current_predicate.objetos.splice(j, 1);
          this.hay_elementos_borrados = true;

          /* update number of triples and children of the predicate */
          current_predicate.number_of_children -= 1;

          /* removed date */
          current_subject.nuevo   = d.getTime();
          current_predicate.nuevo = d.getTime();

          this.tripletas.number_of_triples -= 1;
          
          break;
        }
      }
    }
  }

  /* remove error */
  if(elemento.errorArray != null)
  {

    for(var i = 0; i < elemento.errorArray.length; i++)
    {
      for(var j = this.errores.length - 1; j >= 0; j--)
      {

        if(elemento.errorArray[i] == this.errores[j])
        {
          /* remove error markup */
          if((elemento.errorArray[i].marca_sel != null) && (elemento.errorArray[i].marca_sel.parentNode != null))
          {
            elemento.errorArray[i].marca_sel.parentNode.removeChild(elemento.errorArray[i].marca_sel);
          }

          if((elemento.errorArray[i].marca_unsel != null) && (elemento.errorArray[i].marca_unsel.parentNode != null))
          {
            elemento.errorArray[i].marca_unsel.parentNode.removeChild(elemento.errorArray[i].marca_unsel);
          }
        
          /* remove error */
          this.errores.splice(j, 1);
          this.hay_errores_borrados = true;
        }
      }
    }
  }
  
}

function execute(documento)
{
  var nuevo_contexto   = new context();
  var errores_elemento = new Array();
  var root_element     = documento.documentElement;
  
  /* check the local part of the root element */
  if((root_element == null) || (root_element.nodeName.toUpperCase() != "HTML"))
  {
    errores_elemento.push({code: parserError.htmlRootElement});

    this.completaErrores(errores_elemento, root_element, false);

    return;
  }

  if(documento.implementation.hasFeature("XMLVersion", null) == null)
  {
    errores_elemento.push({code: parserError.xmlDeclaration});
  }

  // Initial Evaluation Context 
  if(documento.URL != null)
  {
    nuevo_contexto.base = documento.URL;
  }
  else if(this.base != null)
  {
    nuevo_contexto.base = this.base;
  }
  else
  {
    return;
  }

  /* new base according to the base element */
  if(documento.getElementsByTagName("base")[0] != null)
  {
    /* error if href is not a URI would be managed inside the chaining */
    if(isURI(documento.getElementsByTagName("base")[0].getAttribute("href")) != null)
    {
      nuevo_contexto.base = documento.getElementsByTagName("base")[0].getAttribute("href");
    }
  }

  /* check document media type */
  var meta_tags                      = documento.getElementsByTagName("meta");
  var document_media_type_encontrado = false;

  if(meta_tags != null)
  {

    for(var i = 0; i < meta_tags.length; i++)
    {
      var http_equiv_content = meta_tags[i].getAttribute("http-equiv");

      if((http_equiv_content != null) && (http_equiv_content.toUpperCase() == "CONTENT-TYPE"))
      {
        var document_media_type;

        if((document_media_type = getDocMediaType(meta_tags[i].getAttribute("content"))) != null)
        {
          document_media_type_encontrado = true;
        }
      }
    }
  }

  if(document_media_type_encontrado == false)
  {
    errores_elemento.push({code: parserError.documentMediaType});
  }

  this.completaErrores(errores_elemento, root_element, false);

  /* get common prefixes from prefix.cc */
  if(prefijos_habituales == null)
  {
    prefijos_habituales = getCommonPrefixes();
  }

  nuevo_contexto.parent_subject                = new Object();
  nuevo_contexto.parent_subject.value          = nuevo_contexto.base;
  nuevo_contexto.parent_object                 = new Object();
  nuevo_contexto.list_of_URI_mappings          = new Object();
  //nuevo_contexto.list_of_URI_mappings["rdf"] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
  //nuevo_contexto.list_of_URI_mappings["xhv"] = "http://www.w3.org/1999/xhtml/vocab#";
  nuevo_contexto.list_of_incomplete_triples    = new Array();
  nuevo_contexto.language                      = null; 
  nuevo_contexto.bodyElement                   = null;  

  root_element.contexto = nuevo_contexto;

  this.recorreElementos(root_element, nuevo_contexto);

}

function recorreElementos(elemento, contexto)
{
  if(elemento == null)
  {
    return;
  }
  
  if(elemento.nodeType != Node.ELEMENT_NODE)
  {
    return;
  }
  
  if(elemento.getAttribute("class") == "rdfaeditor")
  {
    return;
  }

  var sujeto           = new Object();
  var predicado        = new Object();
  var objeto           = new Object();
  var errores_elemento = new Array();

  var usedAttributes   = {
                            about:    {used: false, hasAttribute: elemento.hasAttribute("about")},    // OK new_subject
                            resource: {used: false, hasAttribute: elemento.hasAttribute("resource")}, // OK new_subject, current_object_resource
                            property: {used: false, hasAttribute: elemento.hasAttribute("property")}, // OK propertyAttributeList
                            typeof:   {used: false, hasAttribute: elemento.hasAttribute("typeof")},   // OK typeAttributeList
                            datatype: {used: false, hasAttribute: elemento.hasAttribute("datatype")}  // current_object_literal.usedDatatypeAttribute
                         };
                         
  var new_subject_heredado = false;                       
  
  /* this two vars can be modified when recorreElementos is called */
  this.selectedNode    = null;
  this.unselectedNode  = null;

  /* vars that prevent calling the same function several times */
  var propertyAttributeList     = undefined;
  var typeAttributeList         = undefined;
  var relAttributeList          = undefined;
  var revAttributeList          = undefined;

  var bodyElement      = contexto.bodyElement;
  if(elemento.nodeName.toUpperCase() == "BODY")
  {
    bodyElement = true;
  }
  else if(elemento.nodeName.toUpperCase() == "HTML")
  {
    bodyElement = false;

    var default_namespace = elemento.getAttribute("xmlns");

    /* check default namespace */
    if(default_namespace != "http://www.w3.org/1999/xhtml")
    {
      errores_elemento.push({code: parserError.defaultNamespace});
    }

    var document_version = elemento.getAttribute("version");

    /* check document version */
    if(document_version != "XHTML+RDFa 1.0")
    {
      errores_elemento.push({code: parserError.documentVersion});
    }
  } 
  else if(elemento.nodeName.toUpperCase() == "HEAD")
  {
    bodyElement = false;
  }

  // Paso 1 de la secuencia de procesamiento
  var recurse                          = true;
  var skip_element                     = false;
  var new_subject                      = new Object();
  var current_object_resource          = new Object();
  var current_object_literal           = new Object();
  var local_list_of_URI_mappings       = clone(contexto.list_of_URI_mappings);
  var new_URI_mappings                 = new Array();
  var local_list_of_incomplete_triples = new Array();
  var current_language                 = contexto.language;

  // Paso 2 de la secuencia de procesamiento
  for(var i = 0; i < elemento.attributes.length; i++)
  {
    var attName = isNamespace(elemento.attributes[i].name);
    
    if((attName != null) && (isURI(elemento.attributes[i].value, errores_elemento, elemento.attributes[i].name) != null))
    {
      /* non-conventional prefix */
      if((prefijos_habituales != null) && 
         (prefijos_habituales[attName.NCName] != null) && 
         (prefijos_habituales[attName.NCName] != elemento.attributes[i].value))
      {
        errores_elemento.push({code: parserError.nonConventionalPrefix, prefix: attName.NCName, namespace: elemento.attributes[i].value, conventionalPrefix: prefijos_habituales[attName.NCName]});
      }

      /* redefined prefix */
      if(local_list_of_URI_mappings[attName.NCName] != null)
      {
        errores_elemento.push({code: parserError.redefinedPrefix, prefix: attName.NCName, oldNamespace: local_list_of_URI_mappings[attName.NCName].URI, newNamespace: elemento.attributes[i].value});
      }

      if(local_list_of_URI_mappings[attName.NCName] == null)
      {
        local_list_of_URI_mappings[attName.NCName] = new Object();
      }
      
      local_list_of_URI_mappings[attName.NCName].URI  = elemento.attributes[i].value;
      local_list_of_URI_mappings[attName.NCName].used = false;
      
      new_URI_mappings.push(attName.NCName);
    }
  }

  // Paso 3 de la secuencia de procesamiento
  if(elemento.getAttribute("xml:lang") != null)
  {
    current_language = elemento.getAttribute("xml:lang");
  }

  // Paso 4 de la secuencia de procesamiento 
  if(!elemento.hasAttribute("rel") && !elemento.hasAttribute("rev"))
  {
    if(isURIorSafeCURIE(elemento.getAttribute("about"), local_list_of_URI_mappings, this.errores_elemento, "about") != null)
    {
      new_subject.value     = elemento.getAttribute("about");
      new_subject.elemento  = elemento;
      new_subject.attribute = "about";
    }
    else if(isURI(elemento.getAttribute("src"), errores_elemento, "src") != null)
    {
      new_subject.value    = elemento.getAttribute("src");
      new_subject.elemento = elemento;
    }
    else if(isURIorSafeCURIE(elemento.getAttribute("resource"), local_list_of_URI_mappings, errores_elemento, "resource") != null)
    {
      new_subject.value     = elemento.getAttribute("resource");
      new_subject.elemento  = elemento;
      new_subject.attribute = "resource";      
    }
    else if(isURI(elemento.getAttribute("href"), errores_elemento, "href") != null)
    {
      new_subject.value    = elemento.getAttribute("href");
      new_subject.elemento = elemento;
    }
    else if((elemento.nodeName.toUpperCase() == "HEAD") || (elemento.nodeName.toUpperCase() == "BODY"))
    {
      new_subject.value    = "";
      new_subject.elemento = elemento;
    }
    else if((typeAttributeList = getCURIEs(elemento.getAttribute("typeof"), local_list_of_URI_mappings, errores_elemento, "typeof")) != null)
    {
      new_subject.value    = "[_:" + bnode_prefix + this.bnodes.value++ + "]";
      new_subject.elemento = elemento;
    }
    else
    {
      if(contexto.parent_object.value != null)
      {
        new_subject          = contexto.parent_object;
        new_subject_heredado = true;
      }
      if((propertyAttributeList = getCURIEs(elemento.getAttribute("property"), local_list_of_URI_mappings, errores_elemento, "property")) == null)
        skip_element = true; 
    }
  }
  // Paso 5 de la secuencia de procesamiento 
  else
  {
    if(isURIorSafeCURIE(elemento.getAttribute("about"), local_list_of_URI_mappings, errores_elemento, "about") != null)
    {
      new_subject.value    = elemento.getAttribute("about");
      new_subject.elemento = elemento;
      new_subject.attribute = "about";
    }
    else if(isURI(elemento.getAttribute("src"), errores_elemento, "src") != null)
    {
      new_subject.value    = elemento.getAttribute("src");
      new_subject.elemento = elemento;
    }
    else if((elemento.nodeName.toUpperCase() == "HEAD") || (elemento.nodeName.toUpperCase() == "BODY"))
    {
      new_subject.value = "";
      new_subject.elemento = elemento;
    }
    else if((typeAttributeList = getCURIEs(elemento.getAttribute("typeof"), local_list_of_URI_mappings, errores_elemento, "typeof")) != null)
    {
      new_subject.value     = "[_:" + bnode_prefix + this.bnodes.value++ + "]";
      new_subject.elemento  = elemento;
    }
    else if(contexto.parent_object.value != null)
    {
      new_subject           = contexto.parent_object;
      new_subject_heredado  = true;
    }

    if(isURIorSafeCURIE(elemento.getAttribute("resource"), local_list_of_URI_mappings, errores_elemento, "resource") != null)
    {
      current_object_resource.value    = elemento.getAttribute("resource");
      current_object_resource.elemento = elemento;
      current_object_resource.attribute = "resource";      
    }
    else if(isURI(elemento.getAttribute("href"), errores_elemento, "href") != null)
    {
      current_object_resource.value    = elemento.getAttribute("href");
      current_object_resource.elemento = elemento;
    }
  }

  // Paso 6 de la secuencia de procesamiento 
  if(new_subject.value != null)
  {
    if(typeAttributeList === undefined)
    {
      typeAttributeList = getCURIEs(elemento.getAttribute("typeof"), local_list_of_URI_mappings, errores_elemento, "typeof");
    }
    if(typeAttributeList != null)
    {
      for(var i in typeAttributeList)
      {
        sujeto.value       = new_subject.value;
        sujeto.elemento    = new_subject.elemento;
        predicado.value    = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"; 
        predicado.elemento = elemento;
        objeto.valor       = "[" + typeAttributeList[i].curie + "]";
        objeto.tipo        = "uriorsafecurie";
        
        new_subject.used              = true;
        
        usedAttributes["typeof"].used = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }
        
        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);
        
        this.hay_nuevas_tripletas = true;
      }
    }
  }

  // Paso 7 de la secuencia de procesamiento
  if(current_object_resource.value != null)
  {
    if(relAttributeList === undefined)
    {
      relAttributeList = getReservedWordOrCURIE(elemento.getAttribute("rel"), local_list_of_URI_mappings, errores_elemento, "rel");
    }
    if(relAttributeList != null)
    {
      for(var i in relAttributeList)
      {
        sujeto.value    = new_subject.value;
        sujeto.elemento = new_subject.elemento;
        if(relAttributeList[i].curie != null){
          predicado.value    = "[" + relAttributeList[i].curie + "]";
          predicado.elemento = elemento;
        }
        else
        {
          predicado.value    = "http://www.w3.org/1999/xhtml/vocab#" + relAttributeList[i].reserved_word;
          predicado.elemento = elemento;
        }
        objeto.valor = current_object_resource.value;
        objeto.tipo  = "uriorsafecurie"; 

        new_subject.used = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }

        if(current_object_resource.attribute != null)
        {
          usedAttributes[current_object_resource.attribute].used = true;
        }
        
        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);
        
        this.hay_nuevas_tripletas = true;
      }
    }
    if(revAttributeList === undefined)
    {
      revAttributeList = getReservedWordOrCURIE(elemento.getAttribute("rev"), local_list_of_URI_mappings, errores_elemento, "rev");
    }
    if(revAttributeList != null)
    {
      for(var i in revAttributeList)
      {
        objeto.valor = new_subject.value;
        objeto.tipo  = "uriorsafecurie"; 
        if(revAttributeList[i].curie != null)
        {
          predicado.value    = "[" + revAttributeList[i].curie + "]";
          predicado.elemento = elemento;
        }
        else
        {
          predicado.value    = "http://www.w3.org/1999/xhtml/vocab#" + revAttributeList[i].reserved_word;
          predicado.elemento = elemento;
        }
        sujeto.value    = current_object_resource.value;
        sujeto.elemento = current_object_resource.elemento;

        new_subject.used = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }        

        if(current_object_resource.attribute != null)
        {
          usedAttributes[current_object_resource.attribute].used = true;
        }        

        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);
        
        this.hay_nuevas_tripletas = true;
      }
    }
  }

  // Paso 8 de la secuencia de procesamiento 
  if(current_object_resource.value == null)
  { 
    if(relAttributeList === undefined)
    {
      relAttributeList = getReservedWordOrCURIE(elemento.getAttribute("rel"), local_list_of_URI_mappings, errores_elemento, "rel");
    }
    if(relAttributeList != null)
    {
      for(var i in relAttributeList)
      {
        if(relAttributeList[i].curie != null)
        {
          local_list_of_incomplete_triples.push(new incomplete_triple("[" + relAttributeList[i].curie + "]", "forward", elemento));
        }
        else
        {
          local_list_of_incomplete_triples.push(new incomplete_triple("http://www.w3.org/1999/xhtml/vocab#" + relAttributeList[i].reserved_word, "forward", elemento));
        }
        
      }
    }
    if(revAttributeList === undefined)
    { 
      revAttributeList = getReservedWordOrCURIE(elemento.getAttribute("rev"), local_list_of_URI_mappings, errores_elemento, "rev");
    }
    if(revAttributeList != null)
    {
      for(var i in revAttributeList)
      {
        if(revAttributeList[i].curie != null)
        {
          local_list_of_incomplete_triples.push(new incomplete_triple("[" + revAttributeList[i].curie + "]", "reverse", elemento));
        }
        else
        {
          local_list_of_incomplete_triples.push(new incomplete_triple("http://www.w3.org/1999/xhtml/vocab#" + revAttributeList[i].reserved_word, "reverse", elemento));
        }
        
      }
    }
    if((elemento.hasAttribute("rel") || elemento.hasAttribute("rev")))
    {
      /* XXX: sometimes a bnode is created without being used at any moment */
      current_object_resource.value = "[_:" + bnode_prefix  + this.bnodes.value++ + "]";
      current_object_resource.elemento = elemento;
    }    
  } 

  // Paso 9 de la secuencia de procesamiento
  if(propertyAttributeList === undefined)
  {
    propertyAttributeList = getCURIEs(elemento.getAttribute("property"), local_list_of_URI_mappings, errores_elemento, "property"); 
  }
  if(propertyAttributeList != null)
  {
    // typed literal 
    if((elemento.getAttribute("datatype") != null) && 
       (elemento.getAttribute("datatype") != "") && 
       (isCURIE(elemento.getAttribute("datatype"), local_list_of_URI_mappings, errores_elemento, "datatype") != null) &&
       (resolveCURIE(elemento.getAttribute("datatype"), contexto.base, local_list_of_URI_mappings) != "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"))
    {
      if(elemento.getAttribute("content") != null)
      {
        current_object_literal.value                 = elemento.getAttribute("content");
        current_object_literal.datatype              = "[" + elemento.getAttribute("datatype") + "]";
      }
      else
      {
        current_object_literal.value    = getChildrenText(elemento); 
        current_object_literal.datatype = "[" + elemento.getAttribute("datatype") + "]";
      }
      current_object_literal.usedDatatypeAttribute = true;        
    }
    // plain literal 
    else if(elemento.getAttribute("content") != null)
    {
      current_object_literal.value    = elemento.getAttribute("content");
      current_object_literal.language = current_language;
    }
    else if(isTextNode(elemento))
    {
      current_object_literal.value    = getChildrenText(elemento);
      current_object_literal.language = current_language;
    }
    else if(elemento.childNodes.length == 0)
    {
      current_object_literal.value    = "";
      current_object_literal.language = current_language;
    }
    else if(elemento.getAttribute("datatype") == "")
    {
      current_object_literal.value                 = getChildrenText(elemento);
      current_object_literal.language              = current_language;
      current_object_literal.usedDatatypeAttribute = true;        
    }
    // XML literal 
    else if(!isTextNode(elemento) && 
            ((elemento.getAttribute("datatype") == null) || 
             (isCURIE(elemento.getAttribute("datatype")) == null)))
    {
      current_object_literal.value    = serializeChildren(elemento);
      current_object_literal.datatype = "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral";
      recurse = false;
    }
    else if(!isTextNode(elemento) && 
            (isCURIE(elemento.getAttribute("datatype"), local_list_of_URI_mappings) != null) &&
            (resolveCURIE(elemento.getAttribute("datatype"), contexto.base, local_list_of_URI_mappings) == "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"))
    {
      current_object_literal.value                 = serializeChildren(elemento);
      current_object_literal.datatype              = "[" + elemento.getAttribute("datatype") + "]";
      current_object_literal.usedDatatypeAttribute = true;        
      recurse = false;
    }

    if(current_object_literal.value != null)
    {
      for(var i in propertyAttributeList)
      {
        sujeto.value       = new_subject.value;
        sujeto.elemento    = new_subject.elemento;
        predicado.value    = "[" + propertyAttributeList[i].curie + "]";
        predicado.elemento = elemento;
        objeto.valor       = current_object_literal.value;
        objeto.datatype    = current_object_literal.datatype;  
        objeto.language    = current_object_literal.language;
        objeto.tipo        = "literal";

        usedAttributes["property"].used = true;
 
        new_subject.used = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }        
      
        if(current_object_literal.usedDatatypeAttribute == true)
        {
          usedAttributes["datatype"].used = true;
        }
      
        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);
    
        this.hay_nuevas_tripletas = true;
      }
    }
  }

  // Paso 10 de la secuencia de procesamiento 
  if((skip_element == false) && (new_subject.value != null))
  {
    for(var indice_tripleta in contexto.list_of_incomplete_triples)
    {
      if(contexto.list_of_incomplete_triples[indice_tripleta].direction == "forward")
      {
        sujeto.value                 = contexto.parent_subject.value;
        sujeto.elemento              = contexto.parent_subject.elemento;
        contexto.parent_subject.used = true;
        predicado.value              = contexto.list_of_incomplete_triples[indice_tripleta].predicate;
        predicado.elemento           = contexto.list_of_incomplete_triples[indice_tripleta].elemento; 
        objeto.valor                 = new_subject.value;
        objeto.tipo                  = "uriorsafecurie";

        new_subject.used        = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }

        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);

        this.hay_nuevas_tripletas = true;

        contexto.list_of_incomplete_triples[indice_tripleta].completed = true;
      }
      else if (contexto.list_of_incomplete_triples[indice_tripleta].direction == "reverse")
      {
        objeto.valor                 = contexto.parent_subject.value;
        objeto.tipo                  = "uriorsafecurie";
        contexto.parent_subject.used = true;        
        predicado.value              = contexto.list_of_incomplete_triples[indice_tripleta].predicate;
        predicado.elemento           = contexto.list_of_incomplete_triples[indice_tripleta].elemento;
        sujeto.value                 = new_subject.value;
        sujeto.elemento              = new_subject.elemento;

        new_subject.used        = true;
        
        if((new_subject_heredado != true) && (new_subject.attribute != null))
        {
          usedAttributes[new_subject.attribute].used = true;
        }
        
        this.formaTripleta(elemento, sujeto, predicado, objeto, local_list_of_URI_mappings, contexto.base, bodyElement, errores_elemento);
        
        this.hay_nuevas_tripletas = true;
        
        contexto.list_of_incomplete_triples[indice_tripleta].completed = true;
      }
    }
  }
  
  this.completaErrores(errores_elemento, elemento, bodyElement);
  
  var selectedNode   = this.selectedNode;
  var unselectedNode = this.unselectedNode;

  // Paso 11 de la secuencia de procesamiento 
  if(recurse == true)
    /* BUG: <span/> elements are not well parsed */
    for(var current_element = elemento.firstChild; current_element != null; current_element = current_element.nextSibling)
    {
      var nuevo_contexto;
      if(skip_element == true)
      {
        nuevo_contexto = new context(contexto);

        // Copia del contexto de evaluación 
        nuevo_contexto.language = current_language;
        nuevo_contexto.list_of_URI_mappings = local_list_of_URI_mappings;
      }
      else
      {
        nuevo_contexto = new context();
        // Nuevos valores del contexto de evaluación
        nuevo_contexto.base = contexto.base;
        if(new_subject.value != null)
        {
          nuevo_contexto.parent_subject  = new_subject;
        }
        else
        {
          nuevo_contexto.parent_subject  = contexto.parent_subject;
        }
        if(current_object_resource.value != null)
        {
          nuevo_contexto.parent_object   = current_object_resource;
        }
        else if(new_subject.value != null)
        {
          nuevo_contexto.parent_object   = new_subject;
        }
        else
        {
          nuevo_contexto.parent_object   = contexto.parent_subject;
        }
        nuevo_contexto.list_of_URI_mappings       = local_list_of_URI_mappings;
        nuevo_contexto.list_of_incomplete_triples = local_list_of_incomplete_triples;
        nuevo_contexto.language                   = current_language; 
        nuevo_contexto.bodyElement                = bodyElement;
      }
      
      current_element.contexto = nuevo_contexto;
      
      this.recorreElementos(current_element, nuevo_contexto);

  }

  if((new_subject_heredado != true) && (new_subject.used == true) && (new_subject.attribute != null))
  {
    usedAttributes[new_subject.attribute].used = true;
  }
  
  if((current_object_resource.used == true) && (current_object_resource.attribute != null))
  {
    usedAttributes[current_object_resource.attribute].used = true;
  }

  var errores_elemento = new Array();

  /* restore node images */
  this.selectedNode   = selectedNode;
  this.unselectedNode = unselectedNode;
  
  /* check for missing incomplete triples */
  for(var i = 0; i < local_list_of_incomplete_triples.length; i++)
  {
    if(local_list_of_incomplete_triples[i].completed != true)
    {
      errores_elemento.push({code: parserError.missingIncompleteTriple, direction: local_list_of_incomplete_triples[i].direction, predicate: local_list_of_incomplete_triples[i].predicate});
    }  
  }
  
  /* update parent list of URI mappings */
  for(var i in local_list_of_URI_mappings)
  {
    if((contexto.list_of_URI_mappings[i] != null) &&
       (local_list_of_URI_mappings[i].URI == contexto.list_of_URI_mappings[i].URI) &&
       (local_list_of_URI_mappings[i].used == true))
    {
      contexto.list_of_URI_mappings[i].used = true;
    }
  }
  
  /* check for  unused URI mappings */
  for(var i = 0; i < new_URI_mappings.length; i++)
  {
    if(local_list_of_URI_mappings[new_URI_mappings[i]].used == false)
    {
      errores_elemento.push({code: parserError.unusedPrefix, prefix: new_URI_mappings[i], namespace: local_list_of_URI_mappings[new_URI_mappings[i]].URI});
    }
  }

  /* check for unused attributes */
  for(var i in usedAttributes)
  {
    if((usedAttributes[i].hasAttribute == true) && (usedAttributes[i].used == false))
    {
      errores_elemento.push({code: parserError.unusedAttribute, attribute: i, value: elemento.getAttribute(i)});
    }
  }
  
  this.completaErrores(errores_elemento, elemento, bodyElement);
  
  this.completaMarkupSrc();
  
}

function clone(obj)
{
  if(obj == null || typeof(obj) != 'object')
    return obj;

  var temp = new obj.constructor(); 
  for(var key in obj)
    temp[key] = clone(obj[key]);

  return temp;
}

// Clase tripleta incompleta 
function incomplete_triple(predicate, direction, elemento)
{
  this.predicate = predicate;
  this.direction = direction;
  this.elemento  = elemento;
}

// Clase context 
function context(contexto, elemento)
{
  if(contexto == null){
    this.base                       = null;
    this.parent_subject             = new Object();
    this.parent_object              = new Object();
    this.list_of_URI_mappings       = null;
    this.list_of_incomplete_triples = null;
    this.laguage                    = null;
    this.bodyElement                = null;
    
    return;
  }
  else{
    this.base                       = contexto.base;
    this.parent_subject             = contexto.parent_subject;
    this.parent_object              = contexto.parent_object;
    this.list_of_URI_mappings       = contexto.list_of_URI_mappings;
    this.list_of_incomplete_triples = contexto.list_of_incomplete_triples;
    this.laguage                    = contexto.language;
    this.bodyElement                = contexto.bodyElement;
    
    return;
  }
}
 
function getNodeContext(elemento)
{ 
  if(elemento == null)
  {
    return null;
  }
  if(elemento.contexto != null)
  {
    return elemento.contexto;
  }
  else
  {
    return getNodeContext(elemento.parentNode);
  }
}

function serializeChildren(elemento)
{

  var serializer = new XMLSerializer();
  var xml = "";

  for(var i = 0; i < elemento.childNodes.length; i++)
    xml = xml + serializer.serializeToString(elemento.childNodes[i]);

  return xml;

}

function isTextNode(elemento)
{
  for(var i = 0; i < elemento.childNodes.length; i++)
    if(elemento.childNodes[i].nodeType != Node.TEXT_NODE)
    {
      return false;
    }
  return true;
}

function getChildrenText(elemento)
{

  var cadena_resultante = "";

  for(var i = 0; i < elemento.childNodes.length; i++){
    if(elemento.childNodes[i].nodeType == Node.TEXT_NODE) 
    {
      cadena_resultante += elemento.childNodes[i].nodeValue; 
    }
    else if(elemento.childNodes[i].nodeType == Node.ELEMENT_NODE)
    {
      cadena_resultante += getChildrenText(elemento.childNodes[i]);
    }
  }

  return cadena_resultante;

}

function completaErrores(errores_elemento, elemento, bodyElement)
{

  var strbundle = document.getElementById("rdfadev-strings");

  for(var i = 0; i < errores_elemento.length; i++)
  {

    /* error string */
    switch(errores_elemento[i].code)
    {
      case parserError.undefinedPrefix: 
             errores_elemento[i].details = strbundle.getFormattedString("undefinedPrefix",            [errores_elemento[i].prefix, errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "error";
             errores_elemento[i].code    = parserError.undefinedPrefix;
             break;
      case parserError.nonConventionalPrefix: 
             errores_elemento[i].details = strbundle.getFormattedString("nonConventionalPrefix",      [errores_elemento[i].namespace, errores_elemento[i].prefix, errores_elemento[i].conventionalPrefix]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.nonConventionalPrefix;
             break;
      case parserError.redefinedPrefix: 
             errores_elemento[i].details = strbundle.getFormattedString("redefinedPrefix",            [errores_elemento[i].oldNamespace, errores_elemento[i].prefix, errores_elemento[i].newNamespace]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.redefinedPrefix;
             break;
      case parserError.unusedPrefix: 
             errores_elemento[i].details = strbundle.getFormattedString("unusedPrefix",               [errores_elemento[i].namespace, errores_elemento[i].prefix]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.unusedPrefix;
             break;
      case parserError.unusedAttribute: 
             errores_elemento[i].details = strbundle.getFormattedString("unusedAttribute",            [errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.unusedAttribute;
             break;
      case parserError.badCurie: 
             errores_elemento[i].details = strbundle.getFormattedString("badCurie",                   [errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "error";
             errores_elemento[i].code    = parserError.badCurie;
             break;
      case parserError.badUri: 
             errores_elemento[i].details = strbundle.getFormattedString("badUri",                     [errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "error";
             errores_elemento[i].code    = parserError.badUri;
             break;
      case parserError.badUriOrSafeCurie: 
             errores_elemento[i].details = strbundle.getFormattedString("badUriOrSafeCurie",          [errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "error";
             errores_elemento[i].code    = parserError.badUriOrSafeCurie;
             break;
      case parserError.badReservedWordOrCurie: 
             errores_elemento[i].details = strbundle.getFormattedString("badReservedWordOrCurie",     [errores_elemento[i].value, errores_elemento[i].attribute]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.badReservedWordOrCurie;
             break;
      case parserError.htmlRootElement: 
             errores_elemento[i].details = strbundle.getFormattedString("htmlRootElement",            []);
             errores_elemento[i].type    = "error"; 
             errores_elemento[i].code    = parserError.htmlRootElement;
             break;
      case parserError.documentVersion: 
             errores_elemento[i].details = strbundle.getFormattedString("documentVersion",            []);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.documentVersion;
             break;
      case parserError.defaultNamespace: 
             errores_elemento[i].details = strbundle.getFormattedString("defaultNamespace",           []);
             errores_elemento[i].type    = "error";
             errores_elemento[i].code    = parserError.defaultNamespace;
             break;
      case parserError.xmlDeclaration: 
             errores_elemento[i].details = strbundle.getFormattedString("xmlDeclaration",             []);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.xmlDeclaration;
             break;
      case parserError.documentMediaType: 
             errores_elemento[i].details = strbundle.getFormattedString("documentMediaType",          []);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.documentMediaType;
             break;
      case parserError.duplicatedTriple: 
             errores_elemento[i].details = strbundle.getFormattedString("duplicatedTriple",           [errores_elemento[i].triple]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.duplicatedTriple;
             break;
      case parserError.missingIncompleteTriple: 
             errores_elemento[i].details = strbundle.getFormattedString("missingIncompleteTriple",    [errores_elemento[i].predicate, errores_elemento[i].direction]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.missingIncompleteTriple;
             break;
      case parserError.missingLanguage: 
             errores_elemento[i].details = strbundle.getFormattedString("missingLanguage",            [errores_elemento[i].triple]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.missingLanguage;
             break;
      case parserError.missingLiteralDatatype: 
             errores_elemento[i].details = strbundle.getFormattedString("missingLiteralDatatype",     [errores_elemento[i].literal, errores_elemento[i].correctDatatype]);
             errores_elemento[i].type    = "warning";
             errores_elemento[i].code    = parserError.missingLiteralDatatype;
             break;
      default:
             continue;
    }
    /* error details */
    if(bodyElement == true)
    {
      errores_elemento[i].id           = this.createMarkup('bad');
      errores_elemento[i].marca_unsel  = this.unselectedNode;
      errores_elemento[i].marca_sel    = this.selectedNode;
    }
    else
    {
      errores_elemento[i].hiddenElement  = true;
    }
    
    errores_elemento[i].current_node = elemento;
    
    this.errores.push(errores_elemento[i]);

    /* add error to the dom node */
    if(elemento != null)
    {
      if(elemento.errorArray == null)
      {
        elemento.errorArray = new Array();
      }
      elemento.errorArray.push(errores_elemento[i]); 
    }
  }

  if(errores_elemento.length > 0)
  {
    this.hay_nuevos_errores = true;
  }

}

function createMarkup(type)
{
  var id;

  /* marcadores graficos del lugar donde se forman las tripletas  */
  if((this.selectedNode == null) && (this.unselectedNode == null))
  {
    this.id_counter.value++;
    
    id = "rdfadev_" + this.id_counter.value;

    var unselectedNode_image = new Image();
    
    this.unselectedNode = new XPCNativeWrapper(unselectedNode_image);
    this.unselectedNode.typeNode = type;
    this.unselectedNode.setAttribute("id", id);
    this.unselectedNode.setAttribute("style", "cursor: pointer; margin: 0; border-style: hidden; border-width: 0pt; width: 12px; height: 12px; background: none;");
    this.unselectedNode.setAttribute("class", "rdfaeditor");

    var selectedNode_image = new Image();
    
    this.selectedNode = new XPCNativeWrapper(selectedNode_image);
    this.selectedNode.typeNode = type;
    this.selectedNode.setAttribute("id", id);
    this.selectedNode.setAttribute("style", "cursor: pointer; margin: 0; border-style: hidden; border-width: 0pt; width: 12px; height: 12px; background: none;");
    this.selectedNode.setAttribute("class", "rdfaeditor");
    
    if(type == 'good')
    {
      this.unselectedNode.addEventListener('click', goodNodeClick, true);
      this.selectedNode.addEventListener('click', goodNodeClick , true);
    }
    else if(type == 'bad')
    {
      this.unselectedNode.addEventListener('click', badNodeClick, true);
      this.selectedNode.addEventListener('click', badNodeClick,  true);
    }

  }
  else
  {
    id = this.unselectedNode.getAttribute("id");
    if(((type == 'good') && (this.unselectedNode.typeNode == 'bad')) || ((type == 'bad') && (this.unselectedNode.typeNode == 'good')))
    {
      this.unselectedNode.typeNode = 'fair';
      this.selectedNode.typeNode   = 'fair';

      this.unselectedNode.removeEventListener('click', goodNodeClick, true);
      this.selectedNode.removeEventListener('click', goodNodeClick,  true);
      
      this.unselectedNode.removeEventListener('click', badNodeClick, true);
      this.selectedNode.removeEventListener('click', badNodeClick,  true);
      
      this.unselectedNode.addEventListener('click', fairNodeClick, true);
      this.selectedNode.addEventListener('click', fairNodeClick,  true);
    }
  }

  return id;
}

function completaMarkupSrc()
{
  if((this.unselectedNode != null) && (this.selectedNode != null))
  {
    if((this.unselectedNode.typeNode == 'good') && (this.selectedNode.typeNode == 'good'))
    {
      this.unselectedNode.src = "chrome://rdfadev/content/img/triple-good.png";
      this.selectedNode.src   = "chrome://rdfadev/content/img/triple-selected-good.png";
      this.unselectedNode.setAttribute("onClick", "return false;");
      this.selectedNode.setAttribute("onClick", "return false;");
    }
    else if((this.unselectedNode.typeNode == 'bad') && (this.selectedNode.typeNode == 'bad'))
    {
      this.unselectedNode.src = "chrome://rdfadev/content/img/triple-bad.png";
      this.selectedNode.src   = "chrome://rdfadev/content/img/triple-selected-bad.png";
      this.unselectedNode.setAttribute("onClick", "return false;");
      this.selectedNode.setAttribute("onClick", "return false;");
    }
    else if((this.unselectedNode.typeNode == 'fair') && (this.selectedNode.typeNode == 'fair'))
    {
      this.unselectedNode.src = "chrome://rdfadev/content/img/triple-fair.png";
      this.selectedNode.src   = "chrome://rdfadev/content/img/triple-selected-fair.png";
      this.unselectedNode.setAttribute("onClick", "return false;");
      this.selectedNode.setAttribute("onClick", "return false;");
    }
  }
}

function formaTripleta(elemento, sujeto, predicado, objeto, URI_mappings, baseURL, bodyElement, errores_elemento)
{
  var strSubject, strPredicate;
 
  if(this.tripletas.number_of_triples == null)
  {
    this.tripletas.number_of_triples  = 1;
  }
  else
  {
    this.tripletas.number_of_triples += 1;
  }

  /**** NEW SUBJECT ****/ 
  var subjectSafeCURIE = isSafeCURIE(sujeto.value, URI_mappings);

  if(subjectSafeCURIE != null)
  {
    if(subjectSafeCURIE.prefix == "_")
    {
      if(subjectSafeCURIE.reference == "")
        /* "_:" CURIE */
        strSubject = "_:" + empty_bnode_prefix;
      else
        /* do not resolve bnode */
        strSubject = sujeto.value;
    }
    else
    {
      /* resolve Safe CURIE */
      strSubject = resolveSafeCURIE(sujeto.value, baseURL, URI_mappings);
    }
  }
  else
  {
    /* resolve URI */
    strSubject = resolveURI(sujeto.value, baseURL);
  }

  /* create subject */
  if(this.tripletas.sujetos == null)
  {
    this.tripletas.sujetos            = new Array();
    this.tripletas.number_of_children = 0;
  }

  if(this.tripletas.sujetos[strSubject] == null)
  {
    newSubject                    = new Object();
    newSubject.type               = "subject";
    newSubject.predicados         = new Array();
    newSubject.number_of_children = 0;
    newSubject.elementos          = new Array();
    newSubject.repr               = new Array();
    newSubject.str                = strSubject;

    if(subjectSafeCURIE != null)
    {
      if(subjectSafeCURIE.prefix == "_")
      {
        /* subject bnode */
        newSubject.curie                          = subjectSafeCURIE.curie;
        newSubject.repr[treeVisualization.URIs]   = curieRepr(newSubject.curie);
        newSubject.repr[treeVisualization.CURIEs] = newSubject.repr[treeVisualization.URIs];
        newSubject.repr[treeVisualization.Labels] = newSubject.repr[treeVisualization.URIs];
      }
      else
      {
        /* subject curie */
        newSubject.uri                            = strSubject;
        newSubject.uriSchema                      = getURISchema(newSubject.uri);
        newSubject.repr[treeVisualization.URIs]   = uriRepr(newSubject.uri);
        newSubject.curie                          = subjectSafeCURIE.curie;
        newSubject.repr[treeVisualization.CURIEs] = curieRepr(newSubject.curie);
        newSubject.repr[treeVisualization.Labels] = newSubject.repr[treeVisualization.CURIEs];
      
        /* get label from RDF */
        /*if(subjectSafeCURIE.prefix != null)
          getLabel(URI_mappings[subjectSafeCURIE.prefix].URI, newSubject.uri, newSubject);
        else
          getLabel("http://www.w3.org/1999/xhtml/vocab#", newSubject.uri, newSubject);*/
      }
    }
    else
    {
      newSubject.uri                            = strSubject;
      newSubject.uriSchema                      = getURISchema(newSubject.uri);
      newSubject.repr[treeVisualization.URIs]   = uriRepr(newSubject.uri);
      newSubject.repr[treeVisualization.CURIEs] = newSubject.repr[treeVisualization.URIs];
      newSubject.repr[treeVisualization.Labels] = newSubject.repr[treeVisualization.URIs];

      var subjectDefVocPref = isDefVocPref(newSubject.uri);

      /* get label if the uri is a default vocabulary prefix */
      /*if(subjectDefVocPref != null)
      {
        getLabel(subjectDefVocPref.prefix, newSubject.uri, newSubject);
      }*/
    }

    this.tripletas.sujetos[strSubject] = newSubject;
    this.tripletas.number_of_children += 1;
  }
  else if(this.tripletas.sujetos[strSubject].number_of_children == 0)
  {
    this.tripletas.number_of_children += 1;
  }

  /* append subject DOM node */
  this.tripletas.sujetos[strSubject].elementos.push(sujeto.elemento);

  /**** NEW PREDICATE ****/
  var predicateSafeCURIE = isSafeCURIE(predicado.value, URI_mappings); 

  if(predicateSafeCURIE != null)
  {
    if(predicateSafeCURIE.prefix == "_")
    {
      if(predicateSafeCURIE.reference == "")
        /* "_:" CURIE */
        strSubject = "_:" + empty_bnode_prefix;
      else
        /* do not resolve bnode */
        strPredicate = predicado.value;
    }
    else
    {
      /* resolve Safe CURIE */
      strPredicate = resolveSafeCURIE(predicado.value, baseURL, URI_mappings);
    }
  }
  else
  {
    /* resolve URI */
    strPredicate = resolveURI(predicado.value, baseURL);
  }

  /* create predicate */
  if(this.tripletas.sujetos[strSubject].predicados[strPredicate] == null)
  {
    newPredicate                    = new Object();
    newPredicate.type               = "predicate";
    newPredicate.parent_subject     = this.tripletas.sujetos[strSubject];
    newPredicate.objetos            = new Array();
    newPredicate.number_of_children = 0;
    newPredicate.elementos          = new Array();
    newPredicate.repr               = new Array();
    newPredicate.str                = strPredicate;

    if(predicateSafeCURIE != null)
    {
      if(predicateSafeCURIE.prefix == "_")
      {
        /* predicate bnode */
        newPredicate.curie                          = predicateSafeCURIE.curie;
        newPredicate.repr[treeVisualization.URIs]   = curieRepr(newPredicate.curie);
        newPredicate.repr[treeVisualization.CURIEs] = newPredicate.repr[treeVisualization.URIs];
        newPredicate.repr[treeVisualization.Labels] = newpredicate.repr[treeVisualization.URIs];
      }
      else
      {
        /* predicate curie */
        newPredicate.uri                            = strPredicate;
        newPredicate.uriSchema                      = getURISchema(newPredicate.uri);
        newPredicate.repr[treeVisualization.URIs]   = uriRepr(newPredicate.uri); 
        newPredicate.curie                          = predicateSafeCURIE.curie;
        newPredicate.repr[treeVisualization.CURIEs] = curieRepr(newPredicate.curie);
        newPredicate.repr[treeVisualization.Labels] = newPredicate.repr[treeVisualization.CURIEs];

        /* get label from rdf */
        /*if(predicateSafeCURIE.prefix != null)
          getLabel(URI_mappings[predicateSafeCURIE.prefix].URI, newPredicate.uri, newPredicate);
        else
          getLabel("http://www.w3.org/1999/xhtml/vocab#", newPredicate.uri, newPredicate);*/
      }
    }
    else
    {
      newPredicate.uri                            = strPredicate;
      newPredicate.uriSchema                      = getURISchema(newPredicate.uri);
      newPredicate.repr[treeVisualization.URIs]   = uriRepr(newPredicate.uri); 
      newPredicate.repr[treeVisualization.CURIEs] = newPredicate.repr[treeVisualization.URIs];
      newPredicate.repr[treeVisualization.Labels] = newPredicate.repr[treeVisualization.URIs];

      var predicateDefVocPref = isDefVocPref(newPredicate.uri);

      /* get label if the uri is a default vocabulary prefix */
      /*if(predicateDefVocPref != null)
      {
        getLabel(predicateDefVocPref.prefix, newPredicate.uri, newPredicate);
      }*/
    }

    /* append predicate DOM node */
    this.tripletas.sujetos[strSubject].predicados[strPredicate] = newPredicate;
    this.tripletas.sujetos[strSubject].number_of_children += 1;
  }
  else if(this.tripletas.sujetos[strSubject].predicados[strPredicate].number_of_children == 0)
  {
    this.tripletas.sujetos[strSubject].number_of_children += 1;
  }

  /* append predicate to DOM */
  this.tripletas.sujetos[strSubject].predicados[strPredicate].elementos.push(predicado.elemento);

  /**** NEW OBJECT ****/
  newObject                    = new Object();
  newObject.parent_subject     = this.tripletas.sujetos[strSubject];
  newObject.subject_element    = sujeto.elemento;
  newObject.parent_predicate   = this.tripletas.sujetos[strSubject].predicados[strPredicate];
  newObject.predicate_element  = predicado.elemento;
  newObject.type               = "object";
  newObject.repr               = new Array();
  newObject.number_of_children = 0;

  if(objeto.tipo == "uriorsafecurie")
  {

    var objetoSafeCURIE = isSafeCURIE(objeto.valor, URI_mappings);

    if(objetoSafeCURIE != null)
    {
      /* bnode */
      if(objetoSafeCURIE.prefix == "_")
      {
        newObject.curie                          = objetoSafeCURIE.curie;
        newObject.repr[treeVisualization.URIs]   = curieRepr(newObject.curie);
        newObject.repr[treeVisualization.CURIEs] = newObject.repr[treeVisualization.URIs];
        newObject.repr[treeVisualization.Labels] = newObject.repr[treeVisualization.URIs];
      }
      /* safe curie */
      else
      {
        newObject.uri                            = resolveSafeCURIE(objeto.valor, baseURL, URI_mappings);
        newObject.uriSchema                      = getURISchema(newObject.uri);
        newObject.repr[treeVisualization.URIs]   = uriRepr(newObject.uri);
        newObject.curie                          = objetoSafeCURIE.curie;
        newObject.repr[treeVisualization.CURIEs] = curieRepr(newObject.curie);
        newObject.repr[treeVisualization.Labels] = newObject.repr[treeVisualization.CURIEs];
       
        /* get label from rdf */
        /*if(objetoSafeCURIE.prefix != null)
          getLabel(URI_mappings[objetoSafeCURIE.prefix].URI, newObject.uri, newObject);
        else
          getLabel("http://www.w3.org/1999/xhtml/vocab#", newObject.uri, newObject);*/
      }
    }
    /* uri */
    else
    {
      newObject.uri                            = resolveURI(objeto.valor, baseURL);
      newObject.uriSchema                      = getURISchema(newObject.uri);
      newObject.repr[treeVisualization.URIs]   = uriRepr(newObject.uri);
      newObject.repr[treeVisualization.CURIEs] = newObject.repr[treeVisualization.URIs];
      newObject.repr[treeVisualization.Labels] = newObject.repr[treeVisualization.URIs]; 

      var objectDefVocPref = isDefVocPref(newObject.uri);

      /* get label if the uri is a default vocabulary prefix */
      /*if(objectDefVocPref != null)
      {
        getLabel(objectDefVocPref.prefix, newObject.uri, newObject);
      }*/
    }

  }

  if (objeto.tipo == "literal")
  {

    newObject.literal   = objeto.valor;

    if(objeto.language != null)
    {
      newObject.language = objeto.language;
    }
 
    /* object datatype */
    if(objeto.datatype != null)
    {
      datatypeSafeCURIE = isSafeCURIE(objeto.datatype, URI_mappings);

      if(datatypeSafeCURIE != null)
      {
        newObject.datatype      = resolveSafeCURIE(objeto.datatype, baseURL, URI_mappings);
        newObject.datatypeCurie = datatypeSafeCURIE.curie;

        newObject.repr[treeVisualization.URIs]   = literalRepr(newObject.literal, newObject.datatype,      newObject.language);
        newObject.repr[treeVisualization.CURIEs] = literalRepr(newObject.literal, newObject.datatypeCurie, newObject.language);
        newObject.repr[treeVisualization.Labels] = literalRepr(newObject.literal, newObject.datatypeCurie, newObject.language);
      }
      else
      {
        newObject.datatype = resolveURI(objeto.datatype, baseURL);

        newObject.repr[treeVisualization.URIs]   = literalRepr(newObject.literal, newObject.datatype, newObject.language);
        newObject.repr[treeVisualization.CURIEs] = newObject.repr[treeVisualization.URIs];
        newObject.repr[treeVisualization.Labels] = newObject.repr[treeVisualization.URIs];
      }
    }
    else
    {
      newObject.repr[treeVisualization.URIs]   = literalRepr(newObject.literal, null, newObject.language);
      newObject.repr[treeVisualization.CURIEs] = newObject.repr[treeVisualization.URIs];
      newObject.repr[treeVisualization.Labels] = newObject.repr[treeVisualization.URIs];
    }
    
  }

  if(bodyElement == true)
  {
    newObject.id           = this.createMarkup('good');
    newObject.marca_unsel  = this.unselectedNode;
    newObject.marca_sel    = this.selectedNode;
  }
  else
  {
    newObject.hiddenElement  = true;
  }
 
  newObject.current_node = elemento;
 
  /* check for correct datatype */ 
  if((errores_elemento != null) && (newObject.literal != null))
  {
    checkDatatype(newObject.repr[treeVisualization.URIs], newObject.literal, newObject.datatype, errores_elemento)
  }
  
  /* check for missing language information */  
  if((errores_elemento != null) && (newObject.literal != null) && (newObject.language == null))
  {
    for(var i = 0; i < this.tripletas.sujetos[strSubject].predicados[strPredicate].objetos.length; i++)
    {
      if((this.tripletas.sujetos[strSubject].predicados[strPredicate].objetos[i].literal != null) &&
         (this.tripletas.sujetos[strSubject].predicados[strPredicate].objetos[i].language != null))
      {
        errores_elemento.push({code: parserError.missingLanguage, triple: this.tripletas.sujetos[strSubject].repr[treeVisualization.URIs] + 
                                                                          this.tripletas.sujetos[strSubject].predicados[strPredicate].repr[treeVisualization.URIs] + 
                                                                          newObject.repr[treeVisualization.URIs]});
        
        break;
      }
    }
  }
  
  this.tripletas.sujetos[strSubject].predicados[strPredicate].objetos.push(newObject);
  this.tripletas.sujetos[strSubject].predicados[strPredicate].number_of_children += 1;

  /**** DOM NODE REMOVED INFORMATION ****/

  /* add object to the dom node */
  if(elemento.objectArray == null)
  {
    elemento.objectArray = new Array();
  }
  elemento.objectArray.push(newObject); 

  /**** DOM NODE INSERTED INFORMATION ****/
  if(this.nuevas_tripletas[strSubject] == null)
  {
    this.nuevas_tripletas[strSubject] = new Object(); 
  }

  if(this.nuevas_tripletas[strSubject][strPredicate] == null)
  {
    this.nuevas_tripletas[strSubject][strPredicate] = new Array();
  }
  
  /* check for duplicated triples */
  if(errores_elemento != null)
  {
    for(var i = 0; i < this.nuevas_tripletas[strSubject][strPredicate].length; i++)
    {
      if(this.nuevas_tripletas[strSubject][strPredicate][i].repr[treeVisualization.URIs]  == newObject.repr[treeVisualization.URIs])
      {
        errores_elemento.push({code: parserError.duplicatedTriple, triple: this.tripletas.sujetos[strSubject].repr[treeVisualization.URIs] + 
                                                                           this.tripletas.sujetos[strSubject].predicados[strPredicate].repr[treeVisualization.URIs] + 
                                                                           newObject.repr[treeVisualization.URIs]});
        break;
      }
    }
  }
  
  this.nuevas_tripletas[strSubject][strPredicate].push(newObject);
  
  /* add triple to the n3 string */
  if(this.n3 != "")
  {
    this.n3 += "\n";
  }
  this.n3 += this.tripletas.sujetos[strSubject].repr[treeVisualization.URIs] + " " +
             this.tripletas.sujetos[strSubject].predicados[strPredicate].repr[treeVisualization.URIs] + " " + 
             newObject.repr[treeVisualization.URIs] + " .";


}

/* different element representation for each tree visualization mode */
function uriRepr(anURI)
{
  return "<" + anURI + ">";
}

function curieRepr(aCURIE)
{
  if(aCURIE == "_:")
    return "_:" + empty_bnode_prefix;
  else
    return aCURIE;
}

function literalRepr(aLiteral, datatype, lang)
{
  var escapedLiteral = aLiteral;

  /* replace new line and quote characters */
  escapedLiteral = escapedLiteral.replace(/\"/g, '\\"');
  escapedLiteral = escapedLiteral.replace(/\n/g, '\\n');

  resStr                       = '"'  + escapedLiteral + '"';
  if(datatype != null) resStr += '^^' + '<' + datatype + '>';
  if(lang     != null) resStr += '@'  + lang;

  return resStr;
}

function labelRepr(aLabel, lang)
{
  resStr = aLabel;

  return resStr;
}

function getCommonPrefixes()
{

  var prefixccClient      = new XMLHttpRequest();
  var prefixccClientUrl   = "http://prefix.cc/popular/all.file.json";

  prefixccClient.open("GET", prefixccClientUrl, false);
  prefixccClient.send();

 if(prefixccClient.status == 200)
 {
   return JSON.parse(prefixccClient.responseText);
 }
 else
 {
   return null;
 }

}

