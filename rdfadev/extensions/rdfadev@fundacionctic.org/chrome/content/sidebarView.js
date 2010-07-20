/* see license.txt for terms of usage */


var mainWindow = null;

function startup() 
{
  mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIWebNavigation)
                     .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                     .getInterface(Components.interfaces.nsIDOMWindow);


  // Sidebar is loaded and mainwindow is ready                  
  setRDFaTreeView();
  setErrorTreeView();
  setSparqlTreeView();

  listener_load();
}

function shutdown() 
{
  // Sidebar is unloading
  listener_unload();
}

function showPrefixes()
{
  if(document.getElementById('predefinedPrefixesLabels').getAttribute('hidden') == 'true')
  { 
    document.getElementById('predefinedPrefixesLabels').setAttribute('hidden', 'false');
    document.getElementById('showMorePrefixesLabel').setAttribute('hidden', 'true');
  }
}

window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);


