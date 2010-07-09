/* see license.txt for terms of usage */


const STATE_START      = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP       = Components.interfaces.nsIWebProgressListener.STATE_STOP;
const STATE_IS_WINDOW  = Components.interfaces.nsIWebProgressListener.STATE_IS_WINDOW;
const STATE_IS_NETWORK = Components.interfaces.nsIWebProgressListener.STATE_IS_NETWORK;

/* new update timeout */
treeUpdate           = new Object();
treeUpdate.timeout   = 3000;

function exampleTabSelected(event)
{
  // browser is the XUL element of the browser that's just been selected
  var browser = top.getBrowser().getBrowserForTab(event.target);

  if(browser.webProgress.isLoadingDocument == false)
  {
    parseDocument(browser.contentWindow.document);
  }
    
  /* Error Tree */
  errorView.saveContext();
  errorView.restoreContext(browser); 

  /* RDFa Tree */
  rdfaView.saveContext();
  rdfaView.restoreContext(browser);

  /* SPARQL query */
  sparqlView.saveContext();
  sparqlView.restoreContext();
}

function examplePageLoad(event)   {}
function exampleTabAdded(event)   {}
function exampleTabMoved(event)   {}
function exampleTabRemoved(event) {}

var myListener = 
{

  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onStateChange    : function(aWebProgress, aRequest, aFlag, aStatus)                   {},
  onLocationChange : function(aProgress, aRequest, aURI)                                {},
  onProgressChange : function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {},
  onStatusChange   : function(aWebProgress, aRequest, aStatus, aMessage)                {},
  onSecurityChange : function(aWebProgress, aRequest, aState)                           {},

}

var myTabsListener = 
{

  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onStateChange: function(aBrowser, aWebProgress, aRequest, aFlag, aStatus) 
  { 

    if((aFlag & STATE_START) && (aFlag & STATE_IS_WINDOW))
    {

      if(top.getBrowser().selectedBrowser == aBrowser)
      {
        /* RDFa Tree */
        rdfaView.cleanView();

        /* Error Tree */
        errorView.cleanView();
      }

    }

    if((aFlag & STATE_STOP) && (aFlag & STATE_IS_WINDOW))
    {

      parseDocument(aBrowser.contentWindow.document);

      if(top.getBrowser().selectedBrowser == aBrowser)
      {
        /* RDFa Tree */
        rdfaView.init(); 

        /* Error Tree */
        errorView.init();

        /* SPARQL query */
        sparqlView.init();
      }

    }

  },

  onLocationChange : function(aBrowser, aProgress, aRequest, aURI)                                { },
  onProgressChange : function(aBrowser, aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { },
  onStatusChange   : function(aBrowser, aWebProgress, aRequest, aStatus, aMessage)                { },
  onSecurityChange : function(aBrowser, aWebProgress, aRequest, aState)                           { },

}

function listener_load()
{
  browser = top.getBrowser().selectedBrowser;

  parseDocument(browser.contentWindow.document);

  // RDFa Tree 
  rdfaView.init(); 

  // Error Tree 
  errorView.init();

  // SPARQL query 
  sparqlView.init();

  top.getBrowser().addProgressListener(myListener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
  top.getBrowser().tabContainer.addEventListener("TabOpen",   exampleTabAdded,    false);
  top.getBrowser().tabContainer.addEventListener("TabMove",   exampleTabMoved,    false);
  top.getBrowser().tabContainer.addEventListener("TabClose",  exampleTabRemoved,  false);
  top.getBrowser().tabContainer.addEventListener("TabSelect", exampleTabSelected, false);
  top.getBrowser().tabContainer.addEventListener("load",      examplePageLoad,    true);

  top.getBrowser().addTabsProgressListener(myTabsListener);

}

function listener_unload()
{

  top.getBrowser().removeProgressListener(myListener);
  top.getBrowser().tabContainer.removeEventListener("TabOpen",   exampleTabAdded,    false);
  top.getBrowser().tabContainer.removeEventListener("TabMove",   exampleTabMoved,    false);
  top.getBrowser().tabContainer.removeEventListener("TabClose",  exampleTabRemoved,  false);
  top.getBrowser().tabContainer.removeEventListener("TabSelect", exampleTabSelected, false);
  top.getBrowser().tabContainer.removeEventListener("load",      examplePageLoad,    true);

  top.getBrowser().removeTabsProgressListener(myTabsListener);

  rdfaView.unloadAllDocumentInformation();
  errorView.unloadAllDocumentInformation();
  unloadAllDocumentInformation();
  
}

function unloadAllDocumentInformation()
{
  var tabbrowser = top.getBrowser();
  var numTabs    = tabbrowser.browsers.length;

  for (var index = 0; index < numTabs; index++) 
  {
    var currentBrowser  = tabbrowser.getBrowserAtIndex(index);
    var currentDocument = currentBrowser.contentWindow.document;

    currentDocument.parsed = null;
  }
}

function parseDocument(doc)
{
  if(doc.parsed == true)
  {
    return;
  }
  else
  {
    doc.parsed = true;
  }

  var parser        = new RDFa_parser();
  var parserResults = null;
  
  doc.tripletas  = new Object();
  doc.errores    = new Array();
  doc.id_counter = { value: 0 };
  doc.bnodes     = { value: 0 };
  
  try
  {
    parser.tripletas   = doc.tripletas;
    parser.errores     = doc.errores;
    parser.id_counter  = doc.id_counter;
    parser.bnodes      = doc.bnodes;
    parserResults      = parser.execute(doc);

  }
  catch(error)
  {
    doc.tripletas  = null;
    doc.errores    = null;
    doc.id_counter = null;
    doc.bnodes     = null;
 
    return;
  }
  
  try
  {

    doc.addEventListener("DOMNodeInserted", function(event)
    { 
      /* unsafe element */
      //if(event.target.wrappedJSObject == null)
      //{
      //  return;
      //}
      //else
      //{
      //  /* TODO: falta completar el contexto con el lenguaje y los prefijos en ese nodo */
      //  var old_context = getNodeContext(event.target);
      //}
      /*if(old_context != null)
      {  
        var parser = new RDFa_parser();
        
        parser.tripletas  = doc.tripletas;
        parser.errores    = doc.errores;
        parser.id_counter = doc.id_counter;
        parser.bnodes     = doc.bnodes;
        
        parser.recorreElementos(event.target, old_context);

        if((top.getBrowser().contentWindow.document == doc) && (parser.hay_nuevas_tripletas == true))
        {
 
          rdfaTreeView.updateVisibleData();

          if((rdfaTreeView.elementMarkup == true) && (parser.hay_nuevas_tripletas == true))
          {
            rdfaTreeView.updateDocumentMarkup(rdfaTreeView.tripletas);
          }

          errorTreeView.updateVisibleData();

          if((errorTreeView.elementMarkup == true) && (parser.hay_nuevos_errores == true))
          {
            errorTreeView.updateDocumentMarkup(errorTreeView.errores);
          }
        }
               
      }*/
    }, false);

    doc.addEventListener("DOMNodeRemoved", function(event)
    { 

      /* unsafe element */
      //if(event.target.wrappedJSObject == null)
      //{  
      //  return;
      //}

      var parser = new RDFa_parser();

      parser.tripletas = doc.tripletas;
      parser.errores   = doc.errores;

      var rdfaTreeSelectedElements = null;
 
      parser.borraElementos(event.target);

      if(top.getBrowser().contentWindow.document == doc)
      {
        if(parser.hay_elementos_borrados == true)
        {
          rdfaTreeView.updateVisibleData();
        }

        if(parser.hay_errores_borrados   == true)
        {
          errorTreeView.updateVisibleData();
        }
      }

      window.setTimeout("rdfaTreeView.treeBox.invalidate()", treeUpdate.timeout);

    }, false);
    
    doc.addEventListener("DOMAttrModified", function(event)
    { 
    
      /* TODO: verificar atributos propios de RDFa */
      if(RDFaAttribute(event.attrName) == false)
      {
        return;
      }

      /* unsafe element */
      //if(event.target.wrappedJSObject == null)
      //{
      //  return;
      //}
      //else
      //{
      //  /* TODO: falta completar el contexto con el lenguaje y los prefijos en ese nodo */
      //  var old_context = getNodeContext(event.target);
      //}
      /*if(old_context != null)
      { 

        var parser = new RDFa_parser();
        
        parser.tripletas  = doc.tripletas;
        parser.errores    = doc.errores;
        parser.id_counter = doc.id_counter;
        parser.bnodes     = doc.bnodes;

        parser.borraElementos(event.target);

        parser.recorreElementos(event.target, old_context);

        if(top.getBrowser().contentWindow.document == doc)
        {

          rdfaTreeView.updateVisibleData();

          if((rdfaTreeView.elementMarkup == true) && (parser.hay_nuevas_tripletas == true))
          {
            rdfaTreeView.updateDocumentMarkup(rdfaTreeView.tripletas);
          }

          errorTreeView.updateVisibleData();

          if((errorTreeView.elementMarkup == true) && (parser.hay_nuevos_errores == true))
          {
            errorTreeView.updateDocumentMarkup(errorTreeView.errores);
          }

        }

      }*/
    }, false);
  }
  catch(error)
  {
  }

}
