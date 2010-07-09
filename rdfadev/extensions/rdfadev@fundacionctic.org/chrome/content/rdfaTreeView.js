/* see license.txt for terms of usage */


 
var rdfaView = {

  init : function()
  {
    this.doc      = top.getBrowser().selectedBrowser.contentWindow.document;
    this.browser  = top.getBrowser().selectedBrowser;

    document.getElementById("rdfaTreeChildren").removeAttribute('class');

    rdfaTreeView.cleanTree();
    rdfaTreeView.cleanDocumentMarkup(this.doc);
    rdfaTreeView.setVisibleData(this.doc.tripletas);
  },

  saveContext : function()
  {
    if((this.doc != null) && (this.doc.tripletas != null))
    {
      this.doc.tripletas.visibleData     = copyArray(rdfaTreeView.visibleData);
      this.doc.tripletas.selectedIndexes = rdfaTreeView.getSelectedIndexes();
      this.doc.tripletas.firstVisibleRow = rdfaTreeView.treeBox.getFirstVisibleRow();
    }
  },

  restoreContext : function(browser)
  {
    this.doc            = browser.contentWindow.document;
    this.browser        = browser.contentWindow;

    rdfaTreeView.cleanTree();
    rdfaTreeView.cleanDocumentMarkup(this.doc);

    if((browser.webProgress.isLoadingDocument == true) || (this.doc.parsed != true))
    {
      document.getElementById("rdfaTreeChildren").setAttribute('class', 'cargando');
    }
    else
    {
      document.getElementById("rdfaTreeChildren").removeAttribute('class');
      rdfaTreeView.setVisibleData(this.doc.tripletas);
    }
  },

  cleanView : function()
  {
    if((this.browser != null) && (this.browser.tripletas != null))
    {
      this.browser.tripletas = null;
    }

    rdfaTreeView.cleanTree();
    rdfaTreeView.cleanDocumentMarkup(this.doc);

    document.getElementById("rdfaTreeChildren").setAttribute('class', 'cargando');
  },

  unloadAllDocumentInformation: function()
  {

    var tabbrowser = top.getBrowser();
    var numTabs    = tabbrowser.browsers.length;

    rdfaTreeView.unhighlightElements(rdfaTreeView.selectedElements);
    rdfaTreeView.unhighlightNodes(rdfaTreeView.selectedNodes);

    for (var index = 0; index < numTabs; index++) 
    {
      var currentBrowser  = tabbrowser.getBrowserAtIndex(index);
      var currentDocument = currentBrowser.contentWindow.document;

      rdfaTreeView.cleanDocumentMarkup(currentDocument);
      currentDocument.tripletas = null;
    }

  },

}

var rdfaTreeView = {

  tripletas           : {},
  visibleData         : [],
  treeBox             : null,  
  selection           : null,
  selectedElements    : [],
  selectedNodes       : [],
  treeVisualization   : treeVisualization.CURIEs,
  sortDirection       : null,
  sortResource        : null,
  elementHighlighting : true,
  elementMarkup       : false,

  get rowCount()                                             { return this.visibleData.length; },
  setTree                  : function(treeBox)               { this.treeBox = treeBox; },
  getCellText              : function(idx, column)           { if(column.id == "triples")
                                                               {
                                                                 return this.getElement(idx).repr[this.treeVisualization]; 
                                                               } 
                                                               else
                                                               {
                                                                 if(this.getElement(idx).number_of_children > 0)
                                                                 {
                                                                   return this.getElement(idx).number_of_children; 
                                                                 }
                                                                 else
                                                                 {
                                                                   return "";
                                                                 }
                                                               }
                                                             },
  isContainer              : function(idx)                   { return (this.getElement(idx).number_of_children > 0) ? true : false; },
  isContainerOpen          : function(idx)                   { return this.visibleData[idx][1]; },
  openContainer            : function(idx)                   { this.visibleData[idx][1] = true; },
  closeContainer           : function(idx)                   { this.visibleData[idx][1] = false;  },
  getLevel                 : function(idx)                   { return this.visibleData[idx][2]; },
  getElement               : function(idx)                   { return this.visibleData[idx][3]; },
  getVisibleDataItemLevel  : function(elm)                   { return elm[2]; },
  getVisibleDataItem       : function(elm)                   { return elm[3]; },
  getVisibleDataParentItem : function(elm)                   { return elm[4]; },
  isContainerEmpty         : function(idx)                   { return false; },
  isSeparator              : function(idx)                   { return false; },
  isSorted                 : function()                      { return false; },
  isEditable               : function(idx, column)           { return false; },
  getImageSrc              : function(idx, column)           {},  
  getProgressMode          : function(idx,column)            {},  
  getCellValue             : function(idx, column)           {},  
  cycleHeader              : function(col, elem)             {},  
  selectionChanged         : function()                      {},  
  cycleCell                : function(idx, column)           {},  
  performAction            : function(action)                {},  
  performActionOnCell      : function(action, index, column) {},  
  getColumnProperties      : function(column, prop)          {},

  getElementIndex: function(element)
  {
    for(var i = 0; i < this.visibleData.length; i++)
    {
       if(this.getElement(i) == element)
      {
         return i;
      }
    }

    return -1;
  },

  getFirstSelectedIndex: function()
  {
    var start           = new Object();
    var end             = new Object();
    var numRanges       = this.selection.getRangeCount();
    var selectedIndexes = [];

    for (var t = 0; t < numRanges; t++)
    {
      this.selection.getRangeAt(t, start, end);
      for (var v = start.value; v <= end.value; v++)
      {
        return v;
      }
    }

    return -1; 
  },

  getSelectedIndexes: function()
  {
    var start           = new Object();
    var end             = new Object();
    var numRanges       = this.selection.getRangeCount();
    var selectedIndexes = [];

    for (var t = 0; t < numRanges; t++)
    {
      this.selection.getRangeAt(t, start, end);
      for (var v = start.value; v <= end.value; v++)
      {
        selectedIndexes.push(v);
      }
    }

    return selectedIndexes; 
  },

  cleanTree: function()
  { 
    this.treeBox.rowCountChanged(0, -this.visibleData.length);
    this.visibleData = [];

    /* update number of triples */
    var rdfaTab              = document.getElementById("rdfaTab");
    var strbundle            = document.getElementById("rdfadev-strings");
    var strRdfaTabLabelEmpty = strbundle.getString("rdfaTabLabelEmpty");

    rdfaTab.setAttribute("label", strRdfaTabLabelEmpty);
  },

  getVisibleItem: function(from_idx, element, level)
  {

    for(var i = from_idx; i < this.visibleData.length; i++)
    {
       if((this.getElement(i) == element) && (this.getLevel(i) == level))
      {
         return i;
      }
    }

  },

  /* select tree elements by a given id */
  selectElementsById: function(id)
  {
    this.selection.clearSelection();
    this.stopScroll = true;
    
    for(var i in this.tripletas.sujetos)
    {
      for(var j in this.tripletas.sujetos[i].predicados)
      {
        for(var k in this.tripletas.sujetos[i].predicados[j].objetos)
        {
          if(id == this.tripletas.sujetos[i].predicados[j].objetos[k].id)
          {
            /* subject element */
            idx = this.getVisibleItem(0, this.tripletas.sujetos[i], 0);
            if(!this.isContainerOpen(idx))
            {
              this.toggleOpenState(idx);
            }

            /* predicate element */
            idx = this.getVisibleItem(idx, this.tripletas.sujetos[i].predicados[j], 1);
            if(!this.isContainerOpen(idx))
            {
              this.toggleOpenState(idx);
            }

            /* object element */
            idx = this.getVisibleItem(idx, this.tripletas.sujetos[i].predicados[j].objetos[k], 2);
            this.selection.rangedSelect(idx, idx, true);
          }
        }
      }
    }
    this.treeBox.ensureRowIsVisible(this.getFirstSelectedIndex());
    this.stopScroll = false;
    
  },

  /* select tree elements by a given uri */   
  selectElementsByUri: function(uri)
  {

    this.selection.clearSelection();
    this.stopScroll = true;
    
    for(var i in this.tripletas.sujetos)
    {
      if(uri == this.tripletas.sujetos[i].uri)
      {
        idx = this.getVisibleItem(0, this.tripletas.sujetos[i], 0);
        this.selection.rangedSelect(idx, idx, true);
      }
      for(var j in this.tripletas.sujetos[i].predicados)
      {
        if(uri == this.tripletas.sujetos[i].predicados[j].uri)
        {
          idx = this.getVisibleItem(0, this.tripletas.sujetos[i], 0);
          if(!this.isContainerOpen(idx))
          {
            this.toggleOpenState(idx);
          }

          idx = this.getVisibleItem(idx, this.tripletas.sujetos[i].predicados[j], 1);
          this.selection.rangedSelect(idx, idx, true);
        }
        for(var k in this.tripletas.sujetos[i].predicados[j].objetos)
        {
          if(uri == this.tripletas.sujetos[i].predicados[j].objetos[k].uri)
          {
            /* subject element */
            idx = this.getVisibleItem(0, this.tripletas.sujetos[i], 0);
            if(!this.isContainerOpen(idx))
            {
              this.toggleOpenState(idx);
            }

            /* predicate element */
            idx = this.getVisibleItem(idx, this.tripletas.sujetos[i].predicados[j], 1);
            if(!this.isContainerOpen(idx))
            {
              this.toggleOpenState(idx);
            }

            /* object element */
            idx = this.getVisibleItem(idx, this.tripletas.sujetos[i].predicados[j].objetos[k], 2);
            this.selection.rangedSelect(idx, idx, true);
          }
        }
      }
    }

    this.treeBox.ensureRowIsVisible(this.getFirstSelectedIndex());
    this.stopScroll = false;
    
  },
  
  getParentIndex: function(idx) 
  {  
    if (this.getLevel(idx) == 0) return -1;  
    for (var t = idx - 1; 0 <= t ; t--) 
    {  
      if (this.getLevel(t) < this.getLevel(idx)) return t;  
    }
  },  

  hasNextSibling: function(idx, after) 
  {  
    var thisLevel = this.getLevel(idx);  
    for (var t = after + 1; t < this.visibleData.length; t++) 
    {  
      var nextLevel = this.getLevel(t);  
      if (nextLevel == thisLevel) return true;  
      if (nextLevel < thisLevel) break;  
    }  
    return false;  
  }, 

  /* open or close tree element */ 
  toggleOpenState: function(idx) 
  { 

    if(!this.isContainer(idx))
    {
      return;  
    }

    /* close element */
    if(this.isContainerOpen(idx)) 
    {  
      this.closeContainer(idx);

      var thisLevel = this.getLevel(idx);
      var deletecount = 0; 

      for(var t = idx + 1; t < this.visibleData.length; t++) 
      {  
        if (thisLevel < this.getLevel(t)) 
          deletecount++;  
        else 
          break;  
      }  

      if(deletecount) 
      {  
        this.visibleData.splice(idx + 1, deletecount);  
        this.treeBox.rowCountChanged(idx + 1, -deletecount);  
      }  
    }  
    /* open element */
    else 
    {  
      this.openContainer(idx);
  
      var toinsert = new Array();
      var iscontainer;

      if(this.getLevel(idx) == 0)
      {
        for(var i in this.getElement(idx).predicados)
        {
          toinsert.push(this.getElement(idx).predicados[i]);
        }
      }
      else if(this.getLevel(idx) == 1)
      {
        for(var i = 0; i < this.getElement(idx).objetos.length; i++)
        {
          toinsert.push(this.getElement(idx).objetos[i]);
        }
      }

      function columnSort(a, b)
      {
        var order = (rdfaTreeView.sortDirection == "ascending") ? 1 : -1;

        if(a.repr[rdfaTreeView.treeVisualization] > b.repr[rdfaTreeView.treeVisualization])
          return -1 * order;
        if(a.repr[rdfaTreeView.treeVisualization] < b.repr[rdfaTreeView.treeVisualization])
          return  1 * order;
        return 0;
      }

      /* sort data to insert */
      toinsert.sort(columnSort);

      for (var i = 0; i < toinsert.length; i++) 
      {  
        this.visibleData.splice(idx + i + 1, 0, [(this.getLevel(idx)+1 == 2) ? false : true, false, this.getLevel(idx)+1, toinsert[i], this.visibleData[idx]]);  
      }
      this.treeBox.rowCountChanged(idx + 1, toinsert.length);  
    }
    this.treeBox.invalidateRow(idx);  
  },  
 
  getRowProperties: function(idx, prop)             
  {
    var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
    var elemento = this.getElement(idx);

    if(elemento.nuevo != null)
    {
      var d = new Date();

      if((d.getTime() - elemento.nuevo) < treeUpdate.timeout)
      {
        prop.AppendElement(aserv.getAtom("newelement"));
        return;
      }
      else
      {
        elemento.nuevo = null;
      }
    }
  },  

  getCellProperties: function(idx, column, prop)
  {
    var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);
    var elemento = this.getElement(idx);

    if(column.id == "number")
    {
      prop.AppendElement(aserv.getAtom("numbertext"));

      return;
    }

    /* Hidden Elements */
    /*if(elemento.hiddenElement == true)
    {
      prop.AppendElement(aserv.getAtom("hiddentext"));
    }*/

    /* Literals */
    if(elemento.literal != null)
    {
      prop.AppendElement(aserv.getAtom("literaltext"));
      prop.AppendElement(aserv.getAtom("literalicon"));

      return;
    }

    /* text */
    if((this.treeVisualization == treeVisualization.Labels) && (elemento.label != null))
    {
      prop.AppendElement(aserv.getAtom("labeltext")); 
    } 
    else if((this.treeVisualization == treeVisualization.URIs) && (elemento.uri != null))
    {
      prop.AppendElement(aserv.getAtom("uritext"));
    }
    else if(elemento.curie != null)
    {
      prop.AppendElement(aserv.getAtom("curietext"));
    }
    else
    {
      prop.AppendElement(aserv.getAtom("uritext"));
    }

    /* icons */
    if(elemento.checkingCURIE == true)
    {
      prop.AppendElement(aserv.getAtom("checkingcurieicon"));
    }
    else if(elemento.checkingCURIEError == false)
    {
      prop.AppendElement(aserv.getAtom("curieicon"));
    }
    else if(elemento.checkingCURIEError == true)
    {
      prop.AppendElement(aserv.getAtom("curieerroricon"));
    }
    else if(elemento.fetchingStatus == true)
    {
      prop.AppendElement(aserv.getAtom("fetchingstatusicon"));
    }
    else if(elemento.uriStatusError == false)
    {
      prop.AppendElement(aserv.getAtom("uriicon"));
    }
    else if(elemento.uriStatusError == true)
    {
      prop.AppendElement(aserv.getAtom("urierroricon"));
    }
    else
    {
      prop.AppendElement(aserv.getAtom("uriicon"));
    }

    return;

  },

  highlightElements: function(elements)
  { 
    if(elements == null)
    {
      return;
    }

    for(var i = 0; i < elements.length; i++)
    {   
      if(this.elementMarkup == true)
      {
        if((elements[i].marca_unsel != null) && (elements[i].marca_sel != null) && (elements[i].marca_unsel.parentNode != null))
        {
          elements[i].marca_unsel.parentNode.replaceChild(elements[i].marca_sel, elements[i].marca_unsel); 
        }
      }
      if((elements[i].current_node != null) && (elements[i].hiddenElement != true)) 
      {
        this.highlightNodes([elements[i].current_node]);
      }
    }
  },
  
  unhighlightElements: function(elements)
  { 
    if(elements == null)
    {
      return;
    }

    for(var i = 0; i < elements.length; i++)
    {
      if((elements[i].marca_unsel != null) && (elements[i].marca_sel != null) && (elements[i].marca_sel.parentNode != null))
      {
        elements[i].marca_sel.parentNode.replaceChild(elements[i].marca_unsel, elements[i].marca_sel); 
      }
      if(elements[i].current_node != null) 
      {
        this.unhighlightNodes([elements[i].current_node]);
      }
    }
  },

  highlightNodes: function(nodes)
  {
    if(nodes == null)
    {
      return;
    }
 
    for(var i = 0; i < nodes.length; i++)
    {   
      if(this.elementHighlighting == true)
      {
        if(nodes[i].hasOldStyle != true) /*&& (elements[i].elementos[j].childNodes.length > 0)*/
        {
          nodes[i].hasOldStyle = true;
          nodes[i].oldStyle = nodes[i].getAttribute("style"); 

          nodes[i].setAttribute("style", "border: 1px solid White; background-color: DarkRed; opacity: 0.7");
        }
      }
    }
  },
  
  unhighlightNodes: function(nodes)
  { 
    if(nodes == null)
    {
      return;
    }

    for(var i = 0; i < nodes.length; i++)
    {
      if(nodes[i].hasOldStyle == true)
      {
        nodes[i].setAttribute("style", nodes[i].oldStyle);
        nodes[i].hasOldStyle = false;
        nodes[i].oldStyle    = null;
      }
    }
  },
  
  scrollToFirstSelectedNode: function()
  {
    var element       = null;
    var elementOffset = null;
    var currentOffset = null;

    if(this.stopScroll != true)
    {

      if(this.elementMarkup == true)
      {
        for(var i = 0; i < this.selectedElements.length; i++)
        {
          if(this.selectedElements[i].marca_sel != null)
          {
            currentOffset = getElementScroll(this.selectedElements[i].marca_sel);
            
            if((currentOffset != null) && ((elementOffset == null) || (currentOffset.top < elementOffset.top)))
            {
              elementOffset = currentOffset;
              element       = this.selectedElements[i].marca_sel;
            }
          }
        }
      }

      if(this.elementHighlighting == true)
      {
        for(var i = 0; i < this.selectedNodes.length; i++)
        {
          currentOffset = getElementScroll(this.selectedNodes[i]);
           
          if((currentOffset != null) && ((elementOffset == null) || (currentOffset.top < elementOffset.top)))
          {
            elementOffset = currentOffset;
            element       = this.selectedNodes[i];
          }
        }
      }

    }

    if(element != null)
    {
      var viewportOffset = getViewportScroll(top.getBrowser().selectedBrowser.contentWindow);

      if(isVisibleInViewport(elementOffset, viewportOffset) == false)
      {
        element.scrollIntoView(true); 
      }
    }
  },
  
  updateHighlighting: function()
  {
    var selectedIndexes   = this.getSelectedIndexes();

    oldSelectedElements   = this.selectedElements;
    this.selectedElements = new Array();

    oldSelectedNodes      = this.selectedNodes;
    this.selectedNodes    = new Array();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      removeElementFromArray(oldSelectedElements, this.getElement(selectedIndexes[i]));
      this.selectedElements.push(this.getElement(selectedIndexes[i]));

      if(this.getElement(selectedIndexes[i]).elementos != null)
      {
        removeElementsFromArray(oldSelectedNodes, this.getElement(selectedIndexes[i]).elementos);
        this.selectedNodes = this.selectedNodes.concat(this.getElement(selectedIndexes[i]).elementos);
      }
    }

    this.unhighlightElements(oldSelectedElements);
    this.unhighlightNodes(oldSelectedNodes);

    this.highlightElements(this.selectedElements);
    this.highlightNodes(this.selectedNodes);

    this.scrollToFirstSelectedNode();
  },

  cleanDocumentMarkup: function(doc)
  {

    if(doc == null)
    {
      return;
    }

    var elementos = doc.getElementsByTagName("img");
    var longitud_final = 0;

    while(longitud_final < elementos.length)
    {
      if((elementos[longitud_final].getAttribute("class") == "rdfaeditor") && 
        ((elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-fair.png") || 
         (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-selected-fair.png") || 
         (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-good.png") || 
         (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-selected-good.png")))
      {
        elementos[longitud_final].parentNode.removeChild(elementos[longitud_final]);
      }
      else
      {
        longitud_final = longitud_final + 1;
      }
    }

  },

  restoreDocumentMarkup: function(tripletas)
  {

    if(tripletas == null)
    {
      return;
    }

    for(var sujeto in tripletas.sujetos)
    {
      for(var predicado in tripletas.sujetos[sujeto].predicados)
      {
        for(var objeto in tripletas.sujetos[sujeto].predicados[predicado].objetos)
        {
          currentObject = tripletas.sujetos[sujeto].predicados[predicado].objetos[objeto];
          if((currentObject.marca_unsel != null) && (currentObject.marca_sel != null))
          {
            currentObject.current_node.parentNode.insertBefore(currentObject.marca_unsel, currentObject.current_node);
          }
        }
      }
    }

  },

  updateDocumentMarkup: function(tripletas)
  {

    if(tripletas == null)
    {
      return;
    }

    for(var sujeto in tripletas.sujetos)
    {
      for(var predicado in tripletas.sujetos[sujeto].predicados)
      {
        for(var objeto in tripletas.sujetos[sujeto].predicados[predicado].objetos)
        {
          currentObject = tripletas.sujetos[sujeto].predicados[predicado].objetos[objeto];
          if((currentObject.marca_unsel            != null) && (currentObject.marca_sel            != null) && 
             (currentObject.marca_unsel.parentNode == null) && (currentObject.marca_sel.parentNode == null))
          {
            currentObject.current_node.parentNode.insertBefore(currentObject.marca_unsel, currentObject.current_node);
          }
        }
      }
    }

  },
  
  cleanAllDocumentMarkup: function()
  {   
    var tabbrowser = top.getBrowser();
    var numTabs    = tabbrowser.browsers.length;

    for (var index = 0; index < numTabs; index++) 
    {
      var currentBrowser  = tabbrowser.getBrowserAtIndex(index);
      var currentDocument = currentBrowser.contentWindow.document;

      this.cleanDocumentMarkup(currentDocument);
    }
  },

  restoreAllDocumentMarkup: function()
  {

    var tabbrowser = top.getBrowser();
    var numTabs    = tabbrowser.browsers.length;

    for (var index = 0; index < numTabs; index++) 
    {
      var currentBrowser  = tabbrowser.getBrowserAtIndex(index);
      var currentDocument = currentBrowser.contentWindow.document;

      this.restoreDocumentMarkup(currentDocument.tripletas);
    }

  },

  toggleElementHighlighting: function()
  {
    if(this.elementHighlighting == true)
    {
      this.elementHighlighting = false;
      this.unhighlightElements(this.selectedElements);
      this.unhighlightNodes(this.selectedNodes);
    }
    else
    {
      this.elementHighlighting = true;
      this.highlightElements(this.selectedElements);
      this.highlightNodes(this.selectedNodes);
    }
  },
   
  toggleElementMarkup: function()
  {
    if(this.elementMarkup == true)
    {
      this.elementMarkup = false;
      this.cleanAllDocumentMarkup();
    }
    else
    {
      this.elementMarkup = true;
      this.restoreAllDocumentMarkup();
      this.highlightElements(this.selectedElements);
    }
  },

  /* open first selected URI */
  openSelectedURI: function()
  {
    var selectedIndexes = this.getSelectedIndexes();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if(this.getElement(selectedIndexes[i]).uri != null)
      {
        top.getBrowser().loadURI(this.getElement(selectedIndexes[i]).uri);
        return;
      }
    }
  },
  
  /* open first selected URI in a new window */
  openSelectedURIsNewWindow: function()
  {
    var selectedIndexes = this.getSelectedIndexes();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if(this.getElement(selectedIndexes[i]).uri != null)
      {
        window.open(this.getElement(selectedIndexes[i]).uri);
        window.document.designMode = "On";
        return;
      }
    }
  },

  /* open selected URIs in tabs */
  openSelectedURIs: function()
  {
    var selectedIndexes = this.getSelectedIndexes();
    var tabCount        = 0;
    var newTab          = null;

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if(this.getElement(selectedIndexes[i]).uri != null)
      {
        newTab = top.getBrowser().addTab(this.getElement(selectedIndexes[i]).uri);
        tabCount += 1;
      }
    }
    if(tabCount == 1)
    {
      top.getBrowser().selectedTab = newTab;
    }
  },

  /* open first selected object element source */
  openElementSource: function()
  {
    var focusedWindow = content;
    var docCharset    = "charset=" + focusedWindow.document.characterSet;
    var reference     = focusedWindow.getSelection();
    var range         = document.createRange();

    reference.removeAllRanges();

    for(var i = 0; i < this.selectedElements.length; i++)
    {
       if(this.selectedElements[i].current_node != null)
       {
         range.selectNode(this.selectedElements[i].current_node);
         reference.addRange(range);

         break;
       }
    }

    window.openDialog("chrome://global/content/viewPartialSource.xul", "_blank", "scrollbars,resizable,chrome,dialog=no", null, docCharset, reference, "selection")

    return;
  },
  

  /* check with vapour the first http URI */
  checkWithVapour: function()
  {
    var selectedIndexes = this.getSelectedIndexes();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if((this.getElement(selectedIndexes[i]).uri != null) && (this.getElement(selectedIndexes[i]).uriSchema == "http"))
      {
        var url = "http://validator.linkeddata.org/vapour?vocabUri=" + encodeURIComponent(this.getElement(selectedIndexes[i]).uri); 
        top.getBrowser().selectedTab = top.getBrowser().addTab(url);
        return;
      }
    }
  },

  /* copy selected elements to clipboard */
  copySelectedElements: function()
  {
    var selectedIndexes = this.getSelectedIndexes();
    var strResult       = "";

    /* get selected elements */
    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if(strResult != "")
      {
        strResult    += "\r\n";
      }
      
      /* concatenate element text to result string */
      strResult += this.getElement(selectedIndexes[i]).repr[this.treeVisualization];
    }

    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);

    /* copy result string to clipboard */
    gClipboardHelper.copyString(strResult);
  },

  /* copy triples to clipboard */
  copyTriples: function()
  {
    var selectedIndexes = this.getSelectedIndexes();
    var strResult       = "";

    /* get selected elements */
    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if(strResult != "")
      {
        strResult    += "\r\n";
      }
      if(this.getElement(selectedIndexes[i]).type == "object")
      {
        strResult += this.getObjectRepr(this.getElement(selectedIndexes[i]));
      }
      else if(this.getElement(selectedIndexes[i]).type == "predicate")
      {
        strResult += this.getPredicateRepr(this.getElement(selectedIndexes[i]));
      }
      else if(this.getElement(selectedIndexes[i]).type == "subject")
      {
        strResult += this.getSubjectRepr(this.getElement(selectedIndexes[i]));
      }
    }

    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);

    /* copy result string to clipboard */
    gClipboardHelper.copyString(strResult);

  },

  getObjectRepr: function(obj)
  {
    var strResult = obj.parent_predicate.parent_subject.repr[treeVisualization.URIs] + " " +
                    obj.parent_predicate.repr[treeVisualization.URIs]                + " " +
                    obj.repr[treeVisualization.URIs]                                 + " .";

    return strResult;
  },

  getPredicateRepr: function(pred)
  {
    strResult = ""; 

    for(var i = 0; i < pred.objetos.length; i++)
    {
      if(strResult != "")
      {
        strResult    += "\r\n";
      }
      strResult += this.getObjectRepr(pred.objetos[i]);
    }

    return strResult;
  },

  getSubjectRepr: function(sub)
  {
    strResult = ""; 

    for(var pred in sub.predicados)
    {
      if(strResult != "")
      {
        strResult    += "\r\n";
      }
      strResult += this.getPredicateRepr(sub.predicados[pred]);
    }

    return strResult;
  },

  /* column sorting */
  sort: function(column)
  {

    var columnName;
    var order = (this.sortDirection == "ascending") ? 1 : -1;
    var selectedElements;

    columnName = column.id;
    if(this.sortResource == columnName) 
    {
      order *= -1;
    }

    function columnSort(a, b)
    {
      if(rdfaTreeView.getVisibleDataItemLevel(a) < rdfaTreeView.getVisibleDataItemLevel(b))
        return columnSort(a, rdfaTreeView.getVisibleDataParentItem(b));
      if(rdfaTreeView.getVisibleDataItemLevel(a) > rdfaTreeView.getVisibleDataItemLevel(b))
        return columnSort(rdfaTreeView.getVisibleDataParentItem(a), b);
      if((rdfaTreeView.getVisibleDataItemLevel(a) == rdfaTreeView.getVisibleDataItemLevel(a)) && 
         (rdfaTreeView.getVisibleDataParentItem(a) != rdfaTreeView.getVisibleDataParentItem(b)))
        return columnSort(rdfaTreeView.getVisibleDataParentItem(a), rdfaTreeView.getVisibleDataParentItem(b));
      if(rdfaTreeView.getVisibleDataItem(a).repr[rdfaTreeView.treeVisualization] > rdfaTreeView.getVisibleDataItem(b).repr[rdfaTreeView.treeVisualization])
        return -1 * order;
      if(rdfaTreeView.getVisibleDataItem(a).repr[rdfaTreeView.treeVisualization] < rdfaTreeView.getVisibleDataItem(b).repr[rdfaTreeView.treeVisualization])
        return  1 * order;
      return 0;
    }

    this.selection.clearSelection();

    /* sort visibleData */
    this.visibleData.sort(columnSort);

    this.sortDirection = (order == 1) ? "ascending" : "descending";
    this.sortResource  = columnName;
  },

  selectElement: function(elements)
  {
    
    for(var idx = 0; idx < this.visibleData.length; idx++)
    {
      this.selection.rangedSelect(idx, idx, true);
    }
    
  },

  onclick: function(event)
  {
    /* display right mouse button popup */
    if(event.button == 2)
    {
      var selectedIndexes = this.getSelectedIndexes();
      var uriCount        = 0;
      var curieCount      = 0;
      var httpUriCount    = 0;
      var objCount        = 0;

      for(var i = 0; i < selectedIndexes.length; i++)
      {
        if(this.getElement(selectedIndexes[i]).uri != null)
        {
          uriCount += 1;
          
          if(this.getElement(selectedIndexes[i]).uriSchema == "http")
          {
            httpUriCount += 1;
          }
        }
        if((this.getElement(selectedIndexes[i]).curie != null) && (this.getElement(selectedIndexes[i]).curie.prefix != "_"))
        {
          curieCount += 1;
        }
        if(this.getElement(selectedIndexes[i]).type == "object")
        {
          objCount += 1;
        }
      }

      this.popupSetup(event.screenX, event.screenY, selectedIndexes.length, uriCount, httpUriCount, objCount, curieCount);
    }
  },

  /* add tree and document visualization modes to a popup */
  popupSetup: function(screenX, screenY, eleCount, uriCount, httpUriCount, objCount, curieCount)
  {
    const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var popup                     = document.getElementById("popup-empty");
    var popupInv                  = document.getElementById("popup-invisible");

    /* clear popup */
    for(var i = popup.childNodes.length - 1; i >= 0; i--)
    {
      popupInv.appendChild(popup.childNodes[i]);
    }

    var menuTreevisualization     = document.getElementById("menu-treevisualization");
    var menuDocumentvisualization = document.getElementById("menu-documentvisualization");
    var menuShowGraph             = document.getElementById("menuitem-showgraph");
    var menuSeparatorGraph        = document.getElementById("menuseparator-graph");

    var menuExpandAll             = document.getElementById("menuitem-expandall");
    var menuContractAll           = document.getElementById("menuitem-contractall");
    var menuGetAllURIsStatus      = document.getElementById("menuitem-fetchurisstatus");
    var menuSeparatorExpand       = document.getElementById("menuseparator-expand");

    popup.appendChild(menuExpandAll);
    popup.appendChild(menuContractAll);
    popup.appendChild(menuSeparatorExpand);
    
    if(eleCount == 1)
    {
      var menuItemCopy              = document.getElementById("menuitem-copy");
      var menuItemCopyTriple        = document.getElementById("menuitem-copytriple");
      var menuSeparatorCopy         = document.getElementById("menuseparator-copy");

      popup.appendChild(menuItemCopy);
      popup.appendChild(menuItemCopyTriple);
      popup.appendChild(menuSeparatorCopy);
    }

    if(eleCount > 1)
    {
      var menuItemCopy              = document.getElementById("menuitem-copy");
      var menuItemCopyTriples       = document.getElementById("menuitem-copytriples");
      var menuSeparatorCopy         = document.getElementById("menuseparator-copy");

      popup.appendChild(menuItemCopy);
      popup.appendChild(menuItemCopyTriples);
      popup.appendChild(menuSeparatorCopy);
    }

    if(httpUriCount == 1)
    {
      var menuItemOpen              = document.getElementById("menuitem-open");
      var menuItemOpenNewWindow     = document.getElementById("menuitem-opennewwindow");
      var menuItemOpenNewTab        = document.getElementById("menuitem-opennewtab");
      var menuSeparatorOpen         = document.getElementById("menuseparator-open");

      popup.appendChild(menuItemOpen);
      popup.appendChild(menuItemOpenNewWindow);
      popup.appendChild(menuItemOpenNewTab);
      popup.appendChild(menuSeparatorOpen);
    }

    if(httpUriCount > 1)
    {
      var menuItemOpenNewTabs       = document.getElementById("menuitem-opennewtabs");
      var menuSeparatorOpen         = document.getElementById("menuseparator-open");

      popup.appendChild(menuItemOpenNewTabs);
      popup.appendChild(menuSeparatorOpen);
    }

    if(objCount == 1)
    {
      var menuItemSource            = document.getElementById("menuitem-source");
      var menuSeparatorOpen         = document.getElementById("menuseparator-open");

      popup.appendChild(menuItemSource);
      popup.appendChild(menuSeparatorOpen);
    }

    if(httpUriCount == 1) 
    {
      var menuItemCheckWithVapour   = document.getElementById("menuitem-checkwithvapour");

      popup.appendChild(menuItemCheckWithVapour);
    }

    popup.appendChild(menuGetAllURIsStatus);
    popup.appendChild(menuShowGraph);
    popup.appendChild(menuTreevisualization);
    popup.appendChild(menuDocumentvisualization);

    popup.openPopupAtScreen(screenX, screenY, true);
  },

  setVisibleData: function(tripletas)
  { 
    var rdfaTab         = document.getElementById("rdfaTab");
    var strbundle       = document.getElementById("rdfadev-strings");

    if(tripletas != null)
    {
      /* new triplets */
      this.tripletas = tripletas;

      /* update number of triples */
      if((tripletas.number_of_triples != null) && (tripletas.number_of_triples > 0))
      {
        var strRdfaTabLabel = strbundle.getFormattedString("rdfaTabLabel", [tripletas.number_of_triples]);

        rdfaTab.setAttribute("label", strRdfaTabLabel);
      }
      else
      {
        var strRdfaTabLabelEmpty = strbundle.getString("rdfaTabLabelEmpty");

        rdfaTab.setAttribute("label", strRdfaTabLabelEmpty);
      }

      /* restore old visible data */
      if(tripletas.visibleData != null)
      {
        this.visibleData = tripletas.visibleData;
        this.treeBox.rowCountChanged(0, this.visibleData.length);
        this.updateVisibleData();
      }
      /* new visible data from triplets */
      else
      { 
        this.visibleData = [];
        for(var i in this.tripletas.sujetos)
        {
          this.visibleData.push([true, false, 0, this.tripletas.sujetos[i], null]);
          this.treeBox.rowCountChanged(this.visibleData.length - 1, 1);
        }
      }

      if(this.elementMarkup == true)
      {
        this.restoreDocumentMarkup(tripletas);
      }

      /* restore old selection */
      this.stopScroll = true;
      if(tripletas.selectedIndexes != undefined)
      {
        for(var i = 0; i < tripletas.selectedIndexes.length; i++)
        { 
          this.selection.rangedSelect(tripletas.selectedIndexes[i], tripletas.selectedIndexes[i], true);
        }
      }
      this.stopScroll = false;

      if(tripletas.firstVisibleRow != undefined)
      {
        /* TODO: when some element is selected, it scrolls the tree to the selected element */
        this.treeBox.scrollToRow(tripletas.firstVisibleRow);
      }
    }
    else
    {
      this.tripletas = null;

      var strRdfaTabLabelEmpty = strbundle.getString("rdfaTabLabelEmpty");

      rdfaTab.setAttribute("label", strRdfaTabLabelEmpty);
    }

  },


  updateVisibleData: function()
  {

    for(var i = this.visibleData.length - 1; i >= 0; i--)
    {
      /* NODE REMOVED FROM VISIBLE DATA */
      if((this.tripletas == null) || (this.tripletas.sujetos == null))
      {
        this.visibleData.splice(i, 1);
        this.treeBox.rowCountChanged(i, -1); 

        continue;
      }

      var current_element = this.getElement(i);

      if(current_element.type == 'subject')
      {
        if(this.tripletas.sujetos[current_element.str] == null)
        {
          this.visibleData.splice(i, 1);
          this.treeBox.rowCountChanged(i, -1);          
        }

        continue;
      }

      if(current_element.type == 'predicate')
      {
        if((this.tripletas.sujetos[current_element.parent_subject.str] == null) || 
           (this.tripletas.sujetos[current_element.parent_subject.str].predicados[current_element.str] == null))
        {
          this.visibleData.splice(i, 1);
          this.treeBox.rowCountChanged(i, -1);          
        }        
      
        continue;
      }

      if(current_element.type == 'object')
      {
        var current_subject   = this.tripletas.sujetos[current_element.parent_predicate.parent_subject.str];

        if(current_subject == null)
        {
          this.visibleData.splice(i, 1);
          this.treeBox.rowCountChanged(i, -1);          

          continue;
        }

        var current_predicate = current_subject.predicados[current_element.parent_predicate.str];

        if(current_predicate == null)
        {
          this.visibleData.splice(i, 1);
          this.treeBox.rowCountChanged(i, -1);          

          continue;
        }

        var encontrado = false;

        for(var j = 0; j < current_predicate.objetos.length; j++)
        {
          if(current_predicate.objetos[j] == current_element)
          {
            encontrado = true;
            break;
          }
        }

        if(encontrado == false)
        {
          this.visibleData.splice(i, 1);
          this.treeBox.rowCountChanged(i, -1);          
        }
      }

    }

    this.treeBox.invalidate();
    this.updateHighlighting();

    var rdfaTab         = document.getElementById("rdfaTab");
    var strbundle       = document.getElementById("rdfadev-strings");

    /* update number of triples */
    if((this.tripletas != null) && (this.tripletas.number_of_triples != null) && (this.tripletas.number_of_triples > 0))
    {

      var strRdfaTabLabel = strbundle.getFormattedString("rdfaTabLabel", [this.tripletas.number_of_triples]);

      rdfaTab.setAttribute("label", strRdfaTabLabel);
    }
    else
    {
      var strRdfaTabLabelEmpty = strbundle.getString("rdfaTabLabelEmpty");

      rdfaTab.setAttribute("label", strRdfaTabLabelEmpty);
    }

  },

  expandAll: function()
  {
    for(var i = 0; i < this.rowCount; i++)
    {
      if(!this.isContainerOpen(i))
      {
        this.toggleOpenState(i);
      }
    }
  },
  
  contractAll: function()
  {
    for(var i = 0; i < this.rowCount; i++)
    {
      if(this.isContainerOpen(i))
      {
        this.toggleOpenState(i);
      }
    }
  },
  
  checkVocabElements: function()
  {
    var selectedIndexes = this.getSelectedIndexes();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if((this.getElement(selectedIndexes[i]).uri != null) && 
         (this.getElement(selectedIndexes[i]).uriSchema == "http"))
      {
        this.checkElement(this.getElement(selectedIndexes[i]).uri, this.getElement(selectedIndexes[i]), selectedIndexes[i]);
      }
    }
  },

  checkElement: function(anURL, anObject)
  {
     if(getURISchema(anURL) != "http")
     {
       anObject.checkingCURIE       = null;
       anObject.checkingCURIEError  = null;

       this.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));

       return;
     }

     anObject.checkingCURIE       = true;
     anObject.checkingCURIEError  = null;

     if(rdfaTreeView.getElementIndex(anObject) >= 0)
     {
       rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
     }
     
     var xmlhttp = new XMLHttpRequest();

     xmlhttp.onreadystatechange = function() 
     {
       if(this.readyState == 4)
       {
         anObject.checkingCURIE = false;

         if(this.status == 200)
         {
            try
            {
              evalResult = JSON.parse(xmlhttp.responseText);

              if(evalResult != null)
              {
                if(evalResult[anURL] != null)
                {
                   anObject.checkingCURIEError = false;
                
                }
                else
                {
                   anObject.checkingCURIEError = true;
                }

                try
                {
                  if((evalResult[anURL] != null) && 
                     (evalResult[anURL]["http://www.w3.org/2000/01/rdf-schema#label"] != null) &&
                     (evalResult[anURL]["http://www.w3.org/2000/01/rdf-schema#label"].length != null))
                  {
                    for(var i = 0; i < evalResult[anURL]["http://www.w3.org/2000/01/rdf-schema#label"].length; i++)
                    {             
                      label = evalResult[anURL]["http://www.w3.org/2000/01/rdf-schema#label"][i]["value"];
                      lang  = evalResult[anURL]["http://www.w3.org/2000/01/rdf-schema#label"][i]["lang"];

                      if((lang == null) || (lang.toLowerCase() == navigator.language.toLowerCase()))
                      {      
                        anObject.label = label;

                        if(lang != null)
                        {
                          anObject.labelLanguage = lang.toLowerCase();
                        }
 
                        anObject.repr[treeVisualization.Labels] = labelRepr(anObject.label, anObject.labelLanguage);

                        if((lang != null) && (lang.toLowerCase() == navigator.language.toLowerCase()))
                        {
                          break;    
                        }
                      }
                    }
                  }
                }
                catch(error)
                {
                }

                rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));

                return;
              } 

            }
            catch(error)
            {
              anObject.checkingCURIEError = true;
         
              rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
            }
         }
         else
         {
           anObject.checkingCURIE       = null;
           anObject.checkingCURIEError  = null;       
         
           rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
         }
       }
     }

     try
     {
       var triplrUrl = "http://triplr.org/json/" + getURIWithoutSchema(anURL); 

       xmlhttp.open("GET", triplrUrl, true); 
       xmlhttp.send();
     }
     catch(error)
     {
       anObject.checkingCURIE       = null;
       anObject.checkingCURIEError  = null;       

       rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
     }
  },

  /* fetch the status of every http URI */
  fetchURIsStatus: function()
  {
    var selectedIndexes = this.getSelectedIndexes();

    for(var i = 0; i < selectedIndexes.length; i++)
    {
      if((this.getElement(selectedIndexes[i]).uri != null) &&
         (this.getElement(selectedIndexes[i]).uriSchema == "http"))
      {
        this.fetchStatus(this.getElement(selectedIndexes[i]).uri, this.getElement(selectedIndexes[i]), selectedIndexes[i]);
      }
    }
  },

  fetchStatus: function(anURL, anObject)
  {
     if(getURISchema(anURL) != "http")
     {
       anObject.fetchingStatus = null;
       anObject.uriStatusError = null;

       this.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));

       return;
     }

     anObject.fetchingStatus = true;
     anObject.uriStatusError = null;

     rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
     
     var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function() 
     {
       if(this.readyState == 4)
       {
         anObject.fetchingStatus   = false;
         
         if(this.status != 200)
         {
           anObject.uriStatusError = true;
         }
         else
         {
           anObject.uriStatusError = false;

           rdfaTreeView.checkElement(anURL, anObject);
         }

         rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
       }
     }

     try
     {
       xmlhttp.open("HEAD", anURL, true); 
       xmlhttp.send();
     }
     catch(error)
     {
       anObject.fetchingStatus = false;
       anObject.uriStatusError = true;
       
       rdfaTreeView.treeBox.invalidateRow(rdfaTreeView.getElementIndex(anObject));
     }
  }, 

  getAllURIsStatus: function()
  {
    if(this.tripletas == null)
    {
      return;
    }

    for(var i in this.tripletas.sujetos)
    {
      var aSubject = this.tripletas.sujetos[i];

      if((aSubject.uri            != null) && (aSubject.checkingCURIE  == null) && (aSubject.checkingCURIEError == null) && 
         (aSubject.fetchingStatus == null) && (aSubject.uriStatusError == null) && (aSubject.label              == null))

      {
        this.fetchStatus(aSubject.uri, aSubject);
      }

      for(var j in this.tripletas.sujetos[i].predicados)
      {
        var aPredicate = this.tripletas.sujetos[i].predicados[j];

        if((aPredicate.uri            != null) && (aPredicate.checkingCURIE  == null) && (aPredicate.checkingCURIEError == null) && 
           (aPredicate.fetchingStatus == null) && (aPredicate.uriStatusError == null) && (aPredicate.label              == null))
        {
          this.fetchStatus(aPredicate.uri, aPredicate);
        }

        for(var k = 0; k < this.tripletas.sujetos[i].predicados[j].objetos.length; k++)
        {
          var anObject = this.tripletas.sujetos[i].predicados[j].objetos[k];

          if((anObject.uri            != null) && (anObject.checkingCURIE  == null) && (anObject.checkingCURIEError == null) && 
             (anObject.fetchingStatus == null) && (anObject.uriStatusError == null) && (anObject.label              == null))
          {
            this.fetchStatus(anObject.uri, anObject);
          }
        }
      }
    }
  },

  showGraph: function()
  {
    var encodedUrl          = encodeURIComponent(top.getBrowser().contentWindow.document.URL);
    var distillerUrl        = "http://www.w3.org/2007/08/pyRdfa/extract" + "?" + 
                              "uri=" + encodedUrl + "&format=pretty-xml&warnings=false&parser=lax&space-preserve=true";
    var encodedDistillerUrl = encodeURIComponent(distillerUrl);
    var validatorUrl        = "http://www.w3.org/RDF/Validator/ARPServlet" + "?" + 
                              "URI=" + encodedDistillerUrl + "&PARSE=Parse+URI%3A+&TRIPLES_AND_GRAPH=PRINT_BOTH&FORMAT=PNG_EMBED#graph";

    top.getBrowser().selectedTab = top.getBrowser().addTab(validatorUrl);
  },
}

function setRDFaTreeView()
{
  document.getElementById('rdfaTree').view = rdfaTreeView;
}
