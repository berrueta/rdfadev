
var errorView = {

  doc     : null,
  browser : null,

  init : function()
  {
    this.doc      = top.getBrowser().contentWindow.document;
    this.browser  = top.getBrowser().selectedBrowser;

    document.getElementById("errorTreeChildren").removeAttribute('class');

    errorTreeView.cleanTree();
    errorTreeView.cleanDocumentMarkup(this.doc);
    errorTreeView.setErrores(this.doc);
  },

  saveContext : function()
  {
    if((this.doc != null) && (this.doc.tripletas != null))
    {
      this.doc.errorTreeVisibleData     = errorTreeView.visibleData;
      this.doc.errorTreeSelectedIndexes = errorTreeView.getSelectedIndexes();
      this.doc.errorTreeFirstVisibleRow = errorTreeView.treeBox.getFirstVisibleRow();
    }
  },

  restoreContext : function(browser)
  {
    this.doc            = browser.contentWindow.document;
    this.browser        = browser.contentWindow;

    errorTreeView.cleanTree();
    errorTreeView.cleanDocumentMarkup(this.doc);

    if((browser.webProgress.isLoadingDocument == true) || (this.doc.parsed != true))
    {
      document.getElementById("errorTreeChildren").setAttribute('class', 'cargando');
    }
    else
    {
      document.getElementById("errorTreeChildren").removeAttribute('class');
      errorTreeView.setErrores(this.doc);
    }
  },

  cleanView : function()
  {
    if((this.browser != null) && (this.browser.errores != null))
    {
      this.browser.errores = null;
    }

    errorTreeView.cleanTree();
    errorTreeView.cleanDocumentMarkup(this.doc);

    document.getElementById("errorTreeChildren").setAttribute('class', 'cargando');
  },

  unloadAllDocumentInformation: function()
  {

    var tabbrowser = top.getBrowser();
    var numTabs    = tabbrowser.browsers.length;

    errorTreeView.unhighlightElements(errorTreeView.selectedElements);

    for (var index = 0; index < numTabs; index++) 
    {
      var currentBrowser  = tabbrowser.getBrowserAtIndex(index);
      var currentDocument = currentBrowser.contentWindow.document;

      errorTreeView.cleanDocumentMarkup(currentDocument);
      currentDocument.errores = null;
    }
     
  },
 
}

var errorTreeView = {

  errores             : null,
  visibleData         : [],
  treeBox             : null,
  selection           : null,
  selectedElements    : [],
  elementMarkup       : false, 
  elementHighlighting : true, 

  get rowCount()                                        { if(this.visibleData != null) return this.visibleData.length;  else return 0; },
  setTree             : function(treeBox)               { this.treeBox = treeBox; },
  getCellText         : function(idx, column)           { if(this.visibleData != null) return this.visibleData[idx].details; else return ""; },
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
  getLevel            : function(idx)                   { return 0; },
  toggleOpenState     : function(idx)                   {},
  getParentIndex      : function(idx)                   {},
  hasNextSibling      : function(idx, after)            { return false; },

  getCellProperties: function(idx, column, prop)
  {
    var aserv=Components.classes["@mozilla.org/atom-service;1"].getService(Components.interfaces.nsIAtomService);

    prop.AppendElement(aserv.getAtom("errortext"));
    
    /* Hidden Elements */
    /*if(this.visibleData[idx].hiddenElement == true)
    {
      prop.AppendElement(aserv.getAtom("hiddentext"));
    }*/

    if(this.visibleData[idx].type == "error")
    {
      prop.AppendElement(aserv.getAtom("noticeerroricon"));
    }

    if(this.visibleData[idx].type == "warning")
    {
      prop.AppendElement(aserv.getAtom("noticewarningicon"));
    }
   
    return;
  },
 
  setErrores : function(doc)
  {
    var errorTab        = document.getElementById("errorTab");
    var strbundle       = document.getElementById("rdfadev-strings");

    /* clean old data */
    if((doc != null) && (doc.errores != null))
    {

      /* put new results */
      this.errores = doc.errores;

      /* update number of errors */
      if(this.errores.length > 0)
      {
        var strErrorTabLabel = strbundle.getFormattedString("errorTabLabel", [doc.errores.length]);

        errorTab.setAttribute("label", strErrorTabLabel);
      }
      else
      {
        var strErrorTabLabelEmpty = strbundle.getString("errorTabLabelEmpty");

        errorTab.setAttribute("label", strErrorTabLabelEmpty);
      }

      /* restore old errors */
      if(doc.errorTreeVisibleData != null)
      {
        this.visibleData = doc.errorTreeVisibleData;

        this.treeBox.rowCountChanged(0, this.errores.length);
        this.updateVisibleData();
      }
      /* new visibleData from errors */
      else
      {
        this.visibleData = copyArray(doc.errores);
        this.treeBox.rowCountChanged(0, doc.errores.length);
      }
      
      if(this.elementMarkup == true)
      {
        this.restoreDocumentMarkup(doc.errores);
      }

      /* restore old selection */
      this.stopScroll = true;
      if(doc.errorTreeSelectedIndexes != undefined)
      {
        for(var i = 0; i < doc.errorTreeSelectedIndexes.length; i++)
        {
          this.selection.rangedSelect(doc.errorTreeSelectedIndexes[i], doc.errorTreeSelectedIndexes[i], true);
        }
      }
      this.stopScroll = false;

      if(doc.errorTreeFirstVisibleRow != undefined)
      {
        /* TODO: when some element is selected, it scrolls the tree to the selected element */
        this.treeBox.scrollToRow(doc.errorTreeFirstVisibleRow);
      }

    }
    else
    {
      this.errores = null;

      var strErrorTabLabelEmpty = strbundle.getString("errorTabLabelEmpty");

      errorTab.setAttribute("label", strErrorTabLabelEmpty);
    }
  },

  cleanTree : function()
  {
    this.treeBox.rowCountChanged(0, -this.visibleData.length);
    this.visibleData = [];

    /* update number of errors */
    var errorTab              = document.getElementById("errorTab");
    var strbundle             = document.getElementById("rdfadev-strings");
    var strErrorTabLabelEmpty = strbundle.getString("errorTabLabelEmpty");

    errorTab.setAttribute("label", strErrorTabLabelEmpty);

  },

  cleanDocumentMarkup : function(doc)
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
         ((elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-selected-fair.png") || 
          (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-fair.png") || 
          (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-selected-bad.png") || 
          (elementos[longitud_final].getAttribute("src") == "chrome://rdfadev/content/img/triple-bad.png")))
       {
         elementos[longitud_final].parentNode.removeChild(elementos[longitud_final]);
       }
       else
       {
         longitud_final = longitud_final + 1;
       }
     }
  },

  restoreDocumentMarkup: function(errores)
  {

    if(errores == null)
    {
      return;
    }

    for(var i = 0; i < errores.length; i++)
    {
      if((errores[i].marca_unsel != null) && (errores[i].marca_sel != null))
      {
        errores[i].current_node.parentNode.insertBefore(errores[i].marca_unsel, errores[i].current_node);
      }
    }

  },

  updateDocumentMarkup: function(errores)
  {

    if(errores == null)
    {
      return;
    }

    for(var i = 0; i < errores.length; i++)
    {
      if((errores[i].marca_unsel            != null) && (errores[i].marca_sel            != null) && 
         (errores[i].marca_unsel.parentNode == null) && (errores[i].marca_sel.parentNode == null))
      {
        errores[i].current_node.parentNode.insertBefore(errores[i].marca_unsel, errores[i].current_node);
      }
    }

  },
  
  /* select tree elements by a given id */
  selectElementsById: function(id)
  {
    this.selection.clearSelection();
    this.stopScroll = true;

    for(var i in this.visibleData)
    {
      if(id == this.visibleData[i].id)
      {
        this.selection.rangedSelect(i, i, true);
      }
    } 

    this.treeBox.ensureRowIsVisible(this.getFirstSelectedIndex());
    this.stopScroll = false;
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

  updateHighlighting: function()
  {
   var selectedIndexes   = this.getSelectedIndexes();
   oldSelectedElements   = this.selectedElements;
   this.selectedElements = new Array();

   for(var i = 0; i < selectedIndexes.length; i++)
   {
     removeElementFromArray(oldSelectedElements, this.visibleData[selectedIndexes[i]]);
     this.selectedElements.push(this.visibleData[selectedIndexes[i]]);
   }

   this.unhighlightElements(oldSelectedElements);
   this.highlightElements(this.selectedElements);

   this.scrollToFirstSelectedNode();
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

  highlightElements: function(elements)
  {
   for(var i = 0; i < elements.length; i++)
   {
     if(this.elementMarkup == true)
     {
       if((elements[i].marca_unsel != null) && (elements[i].marca_sel != null) && (elements[i].marca_unsel.parentNode != null))
       {
         elements[i].marca_unsel.parentNode.replaceChild(elements[i].marca_sel, elements[i].marca_unsel);
       }
     }
     if(this.elementHighlighting == true)
     {
       if((elements[i].current_node != null) && (elements[i].hiddenElement != true))
       {
         if((elements[i].current_node.hasOldStyle != true) /*&& (elements[i].current_node.childNodes.length > 0)*/)
         {
           elements[i].current_node.hasOldStyle = true;
           elements[i].current_node.oldStyle = elements[i].current_node.getAttribute("style");

           elements[i].current_node.setAttribute("style", "border: 1px solid White; background-color: DarkRed; opacity: 0.7");
         }
       }
       if(elements[i].elementos != null)
       {
         for(var j = 0; j < elements[i].elementos.length; j++)
         {
           if((elements[i].elementos[j].hasOldStyle != true) /*&& (elements[i].elementos[j].childNodes.length > 0)*/)
           {
             elements[i].elementos[j].hasOldStyle = true;
             elements[i].elementos[j].oldStyle = elements[i].elementos[j].getAttribute("style");

             elements[i].elementos[j].setAttribute("style", "border: 1px solid White; background-color: DarkRed; opacity: 0.7");
           }
         }
       }
     }
   }
  },

  unhighlightElements: function(elements)
  {
   for(var i = 0; i < elements.length; i++)
   {
     if(this.elementMarkup == true)
     {
       if((elements[i].marca_unsel != null) && (elements[i].marca_sel != null) && (elements[i].marca_sel.parentNode != null))
       {
         elements[i].marca_sel.parentNode.replaceChild(elements[i].marca_unsel, elements[i].marca_sel);
       }
     }
     if(elements[i].elementos != null)
     {
       for(var j = 0; j < elements[i].elementos.length; j++){
         if(elements[i].elementos[j].hasOldStyle == true)
         {
           elements[i].elementos[j].setAttribute("style", elements[i].elementos[j].oldStyle);

           elements[i].elementos[j].hasOldStyle = false;
           elements[i].elementos[j].oldStyle = null;
         }
       }
     }
     if(elements[i].current_node != null)
     {
       if(elements[i].current_node.hasOldStyle == true)
       {
         elements[i].current_node.setAttribute("style", elements[i].current_node.oldStyle);

         elements[i].current_node.hasOldStyle = false;
         elements[i].current_node.oldStyle = null;
       }
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
     }

     if(this.elementHighlighting == true)
     {
       for(var i = 0; i < this.selectedElements.length; i++)
       {
         currentOffset = getElementScroll(this.selectedElements[i].current_node);

         if((currentOffset != null) && ((elementOffset == null) || (currentOffset.top < elementOffset.top)))
         {
           elementOffset = currentOffset;
           element       = this.selectedElements[i].current_node;
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

  onclick: function(event)
  {
   /* display right mouse button popup */
   if(event.button == 2)
   {
     var selectedIndexes = this.getSelectedIndexes();
     
     var badPrefixCount  = 0;

     for(var i = 0; i < selectedIndexes.length; i++)
     {
       if((this.visibleData[selectedIndexes[i]].code == parserError.undefinedPrefix) ||
          (this.visibleData[selectedIndexes[i]].code == parserError.nonConventionalPrefix))
       {
         badPrefixCount += 1;
       }
     }
      
     this.popupSetup(event.screenX, event.screenY, selectedIndexes.length, badPrefixCount);
   }
  },

  /* add tree and document visualization modes to a popup */
  popupSetup: function(screenX, screenY, eleCount, badPrefixCount)
  {
   const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

   var popup                     = document.getElementById("popup-empty");
   var popupInv                  = document.getElementById("popup-invisible");

   /* clear popup */
   for(var i = popup.childNodes.length - 1; i >= 0; i--)
   {
     popupInv.appendChild(popup.childNodes[i]);
   }

   if(eleCount > 0)
   {
     var menuItemCopy              = document.getElementById("menuitem-errorcopy");
     var menuSeparatorCopy         = document.getElementById("menuseparator-copy");

     popup.appendChild(menuItemCopy);
     popup.appendChild(menuSeparatorCopy);
   }

   if(eleCount == 1)
   {
     var menuItemSource            = document.getElementById("menuitem-errorsource");
     var menuSeparatorOpen         = document.getElementById("menuseparator-open");
     
     popup.appendChild(menuItemSource);
     
     if(badPrefixCount == 1)
     {
       var menuItemBadPrefix         = document.getElementById("menuitem-errorbadprefix"); 

       popup.appendChild(menuItemBadPrefix); 
     }
     
     popup.appendChild(menuSeparatorOpen);
   }

   var menuValidateMarkup = document.getElementById("menu-validatemarkup");

   popup.appendChild(menuValidateMarkup);

   var menuDocumentvisualization = document.getElementById("menu-documentvisualization");

   popup.appendChild(menuDocumentvisualization);

   popup.openPopupAtScreen(screenX, screenY, true);

  },

  toggleElementHighlighting: function()
  {
    if(this.elementHighlighting == true)
    {
      this.elementHighlighting = false;
      this.unhighlightElements(this.selectedElements);
    }
    else
    {
      this.elementHighlighting = true;
      this.highlightElements(this.selectedElements);
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

      this.restoreDocumentMarkup(currentDocument.errores);
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
         if(this.selectedElements[i].hiddenElement == true)
         {
           window.openDialog("chrome://global/content/viewSource.xul", "_blank", "scrollbars,resizable,chrome,dialog=no",
                             top.getBrowser().contentWindow.document.URL, docCharset);

           return;
         }
         else
         {
           range.selectNode(this.selectedElements[i].current_node);
           reference.addRange(range);

           window.openDialog("chrome://global/content/viewPartialSource.xul", "_blank", "scrollbars,resizable,chrome,dialog=no",
                             null, docCharset, reference, "selection")

           return; 
         }
       }
    }

    return;
  },

  /* copy triples to clipboard */
  copySelectedElements: function()
  {

    var selectedIndexes = this.getSelectedIndexes();
    var strResult       = "";

    /* get selected elements */
    for(var i = 0; i < selectedIndexes.length; i++)
    {
      strResult += this.visibleData[selectedIndexes[i]].details + '\r\n';
    }

    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);

    /* copy result string to clipboard */
    gClipboardHelper.copyString(strResult);

  },

  updateVisibleData: function()
  {

    for(var i = this.visibleData.length - 1; i >= 0; i--)
    {

      if(this.errores == null)
      {
        this.visibleData.splice(i, 1);
        this.treeBox.rowCountChanged(i, -1); 

        continue;
      }
      
      var encontrado = false;
      
      for(var j = 0; j < this.errores.length; j++)
      {

        if(this.visibleData[i] == this.errores[j])
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
    
    this.treeBox.invalidate();
    
    var errorTab        = document.getElementById("errorTab");
    var strbundle       = document.getElementById("rdfadev-strings");

    /* update number of triples */
    if((this.errores != null) && (this.errores.length > 0))
    {
      var strErrorTabLabel = strbundle.getFormattedString("errorTabLabel", [this.errores.length]);

      errorTab.setAttribute("label", strErrorTabLabel);
    }
    else
    {
      var strErrorTabLabelEmpty = strbundle.getString("errorTabLabelEmpty");

      errorTab.setAttribute("label", strErrorTabLabelEmpty);
    }
  },

    /* check with vapour the first http URI */
  validateMarkup: function()
  {
    var url = "http://validator.w3.org/check?uri=" + encodeURIComponent(top.getBrowser().contentWindow.document.URL);

    top.getBrowser().selectedTab = top.getBrowser().addTab(url);
  },

  /* check with vapour the first http URI */
  openPrefixNamespaceURI: function()
  {
    var url = "http://prefix.cc/" + this.selectedElements[0].prefix;

    top.getBrowser().selectedTab = top.getBrowser().addTab(url);
  },
  
}

function setErrorTreeView() 
{
  document.getElementById("errorTree").view = errorTreeView;
}

