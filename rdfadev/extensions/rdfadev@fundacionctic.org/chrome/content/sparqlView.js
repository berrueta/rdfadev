
var sparqlView = {

  sparqlPreQuery : null,
  doc            : null,
  browser        : null,

  preQuery : function()
  {
      var prequery        = new Object();

      prequery.urlFrom    = "http://www.w3.org/2007/08/pyRdfa/extract?format=pretty-xml&warnings=false&parser=lax&space-preserve=true&uri=" 
                            + encodeURIComponent(top.getBrowser().contentWindow.document.URL);

      return prequery;
  },

  init : function()
  {
    this.doc            = top.getBrowser().contentWindow.document;
    this.browser        = top.getBrowser().selectedBrowser;
    this.sparqlPreQuery = this.preQuery();

    document.getElementById("sparqlQuery").value     = "select * where { ?subject ?predicate ?object . }";
    document.getElementById("sparqlButton").disabled = false;
    
    sparqlResultsTreeView.cleanTree();
  },

  saveContext : function()
  {
    if(this.doc != null)
    {
      this.doc.sparqlPreQuery                 = this.sparqlPreQuery;
      this.doc.sparqlQuery                    = document.getElementById("sparqlQuery").value; 
      this.doc.sparqlResults                  = sparqlResultsTreeView.getContext();
      this.doc.sparqlButtonDisabled           = document.getElementById("sparqlButton").disabled; 
    }
  },

  restoreContext : function()
  {
    this.doc     = top.getBrowser().contentWindow.document;
    this.browser = top.getBrowser().selectedBrowser;

    if(this.doc.sparqlPreQuery == null)
    {
      this.sparqlPreQuery = this.preQuery();
    }
    else
    {
      this.sparqlPreQuery = this.doc.sparqlPreQuery;
    }

    if(this.doc.sparqlQuery != null)
    {
      document.getElementById("sparqlQuery").value = this.doc.sparqlQuery; 
    }
    else
    {
      document.getElementById("sparqlQuery").value = "select * where { ?subject ?predicate ?object . }"; 
    }

    sparqlResultsTreeView.cleanTree();
    if(this.doc.sparqlResults != null)
    {
      sparqlResultsTreeView.setHeaders(this.doc.sparqlResults.headers);
      sparqlResultsTreeView.setResults(this.doc.sparqlResults.results);
    }

    if(this.doc.sparqlButtonDisabled == true)
    {
      document.getElementById("sparqlButton").disabled = true; 
    }
    else
    {
      document.getElementById("sparqlButton").disabled = false; 
    }

  },  

  sendQuery : function()
  {
    var xmlhttp        = new XMLHttpRequest();
    var triplrUrl      = document.getElementById('sparqlService').value
                         + "?query=" + encodeURIComponent(document.getElementById("sparqlQuery").value)
                         + "&default-graph-uri=" + encodeURIComponent(this.sparqlPreQuery.urlFrom) 
                         + "&should-sponge=soft";
    var currentBrowser = top.getBrowser().selectedBrowser;
    var currentDoc     = top.getBrowser().contentWindow.document;

    try
    {
      xmlhttp.open("GET", triplrUrl, true);
      xmlhttp.setRequestHeader("accept", "application/sparql-results+xml");
      xmlhttp.send(null);

      document.getElementById("sparqlButton").disabled = true; 
      sparqlResultsTreeView.cleanTree();
    }
    catch(error)
    {
      return;
    }

    xmlhttp.onreadystatechange = function()
    {
      var hs = null;
      var rs = null;

      if(this.readyState == 4)
      {
        if(xmlhttp.status != 200)
        {
        }
        else
        {
          try
          {
            hs = sparqlView.getSparqlResponseHeads(xmlhttp.responseXML);
            rs = sparqlView.getSparqlResponseResults(xmlhttp.responseXML);
          }
          catch(error)
          {
          }
        }
        if(top.getBrowser().selectedBrowser == currentBrowser)
        {
          if(top.getBrowser().contentWindow.document == currentDoc)
          {
            {
              document.getElementById("sparqlButton").disabled = false; 

              sparqlResultsTreeView.setHeaders(hs);
              sparqlResultsTreeView.setResults(rs);
            }
          }
        }
        else if(currentBrowser.contentWindow.document == currentDoc)
        {
          if(currentDoc.sparqlResults == null)
          {
            currentDoc.sparqlResults = new Object();
          }
          currentDoc.sparqlResults.headers = hs;
          currentDoc.sparqlResults.results = rs;
          currentDoc.sparqlButtonDisabled  = false;
        }
      }
    }
  },

  getSparqlResponseHeads : function(responseXML)
  {
    if(responseXML != null)
    {
      var sparqlHeads = new Array();
      for(var i = 0; i < responseXML.getElementsByTagName("head").length; i++)
      {
        var variableElements = responseXML.getElementsByTagName("head")[i].getElementsByTagName("variable");

        for(var j = 0; j < variableElements.length; j++)
        {
          sparqlHeads.push(variableElements[j].getAttribute("name"));
        }
      }
    } 

    return sparqlHeads;

  },

  getSparqlResponseResults : function(responseXML)
  {

    if(responseXML != null)
    {
      var sparqlResults = new Array();

      for(var i = 0; i < responseXML.getElementsByTagName("result").length; i++)
      {

        var result          = new Object();
        var bindingElements = responseXML.getElementsByTagName("result")[i].getElementsByTagName("binding");

        for(var j = 0; j < bindingElements.length; j++)
        {
          for(var k = 0; k < bindingElements[j].childNodes.length; k++)
          {
            if(bindingElements[j].childNodes[k].nodeType != Node.TEXT_NODE)
            {
              var resultValues = new Object();

              result[bindingElements[j].getAttribute("name")] = resultValues;
              resultValues["type"]                            = bindingElements[j].childNodes[k].nodeName;
              resultValues["value"]                           = bindingElements[j].childNodes[k].childNodes[0].nodeValue;
              
              break;
            }
          }
        }

        sparqlResults.push(result);

      }
    } 

    return sparqlResults;

  },

}

var sparqlResultsTreeView = {

  results   : null,
  headers   : null,
  treeBox   : null,
  selection : null,

  get rowCount()                                        { 
                                                          if(this.results != null)
                                                          {
                                                            return this.results.length;
                                                          }
                                                          else
                                                          {
                                                            return 0;
                                                          }
                                                        },
  setTree             : function(treeBox)               { this.treeBox = treeBox; },
  getCellText         : function(idx, column)           { 
                                                          if((this.results != null) && (this.headers != null))
                                                          {
                                                            return this.results[idx][this.headers[column.index]].value;
                                                          }
                                                          else
                                                          {
                                                            return "";
                                                          }
                                                        },
  isContainer         : function(idx)                   { return false; },
  isContainerOpen     : function(idx)                   { return false; },
  isContainerEmpty    : function(idx)                   { return false; },
  isSeparator         : function(idx)                   { return false; },
  isSorted            : function()                      { return false; },
  isEditable          : function(idx, column)           { return false; },
  getImageSrc         : function(idx, column)           {},
  getProgressMode     : function(idx,column)            {},
  getCellValue        : function(idx, column)           {},
  cycleHeader         : function(col, elem)             {},
  selectionChanged    : function()                      {},
  cycleCell           : function(idx, column)           {},
  performAction       : function(action)                {},
  performActionOnCell : function(action, index, column) {},
  getRowProperties    : function(idx, column, prop)     {},
  getColumnProperties : function(column, element, prop) {},
  getParentIndex      : function(idx)                   {},
  getLevel            : function(idx)                   { return 0; },
  hasNextSibling      : function(idx, after)            { return false; },
  toggleOpenState     : function(idx)                   {},

  setHeaders : function(headers)
  {
    if(headers != null)
    {
      var treeCols      = document.getElementById("sparqlResultsTreeCols");
      var listTreeCols  = treeCols.getElementsByTagName("treecol");
      var x             = headers.length - listTreeCols.length;

      /* not enough columns */
      if(x > 0)
      {
        while(x-- > 0) 
        {
          var tc = document.createElement("treecol");
          treeCols.appendChild(tc);
          var sp = document.createElement("splitter");
          sp.setAttribute("class", "tree-splitter");
          treeCols.appendChild(sp);
        }
      }
      /* to many columns */
      else if(x < 0)
      {
        while(x++ < 0) 
        {
          /* remove columns */
          treeCols.removeChild(treeCols.childNodes[0]);
          /* remove splitter */
          treeCols.removeChild(treeCols.childNodes[0]);
        }
      }
 
      listTreeCols = treeCols.getElementsByTagName("treecol");
      x = -1;
      while(++x < listTreeCols.length) 
      {
        listTreeCols[x].setAttribute("label", headers[x]);
        if(!listTreeCols[x].flex)
        {
          listTreeCols[x].setAttribute("flex", 1);
        }
        if(!listTreeCols[x].crop)
        {
          listTreeCols[x].setAttribute("crop", "center");
        }
      }
    }
    else
    {
      this.cleanTree();
    }

    this.headers = headers;
  },

  setResults : function(results)
  {

    /* clean old data */
    if(this.results != null)
    {
      this.treeBox.rowCountChanged(0, -this.results.length);
    }

    /* put new results */
    this.results = results;

    if(results != null)
    {
      /* enable sparql results tree */
      var sparqlResults = document.getElementById("sparqlResultsTree");

      sparqlResults.setAttribute("disabled", "false");
      sparqlResults.setAttribute("hidecolumnpicker", "false");

      this.treeBox.rowCountChanged(0, this.results.length);
    }

  },

  cleanTree : function()
  {
    /* remove rows */
    if(this.results != null)
    {
      this.treeBox.rowCountChanged(0, -this.results.length);
    }

    this.results = null;

    /* remove columns */
    var treeCols     = document.getElementById("sparqlResultsTreeCols");
    var listTreeCols = treeCols.getElementsByTagName("treecol");
    var x            = listTreeCols.length;

    for(var i = 0; i < x; i++)
    {
      /* remove column */
      treeCols.removeChild(treeCols.childNodes[0]);

      /* remove header */
      treeCols.removeChild(treeCols.childNodes[0]);
    }

    this.headers = null;

    /* disable sparql results tree */
    var sparqlResults = document.getElementById("sparqlResultsTree");

    sparqlResults.setAttribute("disabled", "true");
    sparqlResults.setAttribute("hidecolumnpicker", "true");
  },

  getContext : function()
  {
    var context = new Object();

    context.results = this.results;
    context.headers = this.headers;

    return context;
  },

  onclick: function(event)
  {
    var row = {}, column = {}, part = {};

    this.treeBox.getCellAt(event.clientX, event.clientY, row, column, part);

    if((row.value != -1) && (column.value != null))
    {
      if(this.results[row.value][this.headers[column.value.index]].type == "uri")
      {
        rdfaTreeView.selectElementsByUri(this.results[row.value][this.headers[column.value.index]].value);
      }
      else
      {
        rdfaTreeView.selection.clearSelection();
      }
    }
  },

  getCellProperties: function(idx, column, prop)
  {
    var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

    if(this.results[idx][this.headers[column.index]].type == "uri")
    {
      prop.AppendElement(aserv.getAtom("uritext"));
      return;
    }

    if(this.results[idx][this.headers[column.index]].type == "bnode")
    {
      prop.AppendElement(aserv.getAtom("curietext"));
      return;
    }

    if(this.results[idx][this.headers[column.index]].type == "literal")
    {
      prop.AppendElement(aserv.getAtom("literaltext"));
      return;
    }

    if(this.results[idx][this.headers[column.index]].type == "typedliteral")
    {
      prop.AppendElement(aserv.getAtom("literaltext"));
      return;
    }

  },

}

function setSparqlTreeView()
{
  document.getElementById('sparqlResultsTree').view = sparqlResultsTreeView;
}

