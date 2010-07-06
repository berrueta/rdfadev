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

function toggleBottomBar()
{
  if(document.getElementById('rdfadevContentSplitter').collapsed == true)
  {
    document.getElementById('rdfadevContentSplitter').collapsed = false;
    document.getElementById('rdfadevContentBox').collapsed = false;
  }
  else
  { 
    document.getElementById('rdfadevContentSplitter').collapsed = true;
    document.getElementById('rdfadevContentBox').collapsed = true;
  }
}

window.addEventListener("load", rdfadev.onFirefoxLoad, false);
