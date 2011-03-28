/* see license.txt for terms of usage */


rdfadev.onFirefoxLoad = function(event)
{
  document.getElementById("contentAreaContextMenu")
          .addEventListener("popupshowing", function (e){ rdfadev.showFirefoxContextMenu(e); }, false);
};

rdfadev.showFirefoxContextMenu = function(event) 
{
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-rdfadev").hidden = gContextMenu.onImage;
};

function onBottomBarClick(event)
{
  if(event.button == 2)
  {
    var popup                     = document.getElementById("popup-empty");
    var popupInv                  = document.getElementById("popup-invisible");

    /* clear popup */
    for(var i = popup.childNodes.length - 1; i >= 0; i--)
    {
      popupInv.appendChild(popup.childNodes[i]);
    }

    var menuTreevisualization     = document.getElementById("menu-treevisualization");
    var menuDocumentvisualization = document.getElementById("menu-documentvisualization");

    var menuSeparatorAbout        = document.getElementById("menuseparator-about");
    var menuItemAbout             = document.getElementById("menuitem-about");

    popup.appendChild(menuTreevisualization);
    popup.appendChild(menuDocumentvisualization);

    popup.appendChild(menuSeparatorAbout);
    popup.appendChild(menuItemAbout);

    popup.openPopupAtScreen(event.screenX, event.screenY, true);
	
	event.stopPropagation();
    event.preventDefault();
	
  }
  else
  {
    toggleBottomBar();
  }

}

function toggleBottomBar()
{
  if(document.getElementById('rdfadevContentSplitter').collapsed == true)
  {
    document.getElementById('rdfadevContentSplitter').collapsed = false;
    document.getElementById('rdfadevContentBox').collapsed      = false;
  }
  else
  { 
    document.getElementById('rdfadevContentSplitter').collapsed = true;
    document.getElementById('rdfadevContentBox').collapsed      = true;
  }
}

function showAbout()
{
  var ExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
  var datasource       = ExtensionManager.datasource;

  window.openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", "urn:mozilla:item:rdfadev@fundacionctic.org", datasource);
}

window.addEventListener("load", rdfadev.onFirefoxLoad, false);
