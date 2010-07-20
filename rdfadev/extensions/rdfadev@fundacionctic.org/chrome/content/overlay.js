/* see license.txt for terms of usage */


var rdfadev = 
{
  onLoad: function() 
  {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("rdfadev-strings");
  },

  onToolbarButtonCommand: function(e) 
  {
    // just reuse the function above.  you can change this, obviously!
    rdfadev.onMenuItemCommand(e);
  }
};

window.addEventListener("load", rdfadev.onLoad, false);
