/* see license.txt for terms of usage */


function getViewportScroll(win)
{
  if(win == null)
  {
    return null;
  }

  var viewportLeft   = 0;
  var viewportTop    = 0;
  var viewportHeight = win.innerHeight;
  var viewportWidth  = win.innerWidth;

  if( win.document.documentElement            != null && 
      win.document.documentElement.scrollLeft != null && 
      win.document.documentElement.scrollTop  != null) 
  {
    viewportLeft = win.document.documentElement.scrollLeft;
    viewportTop  = win.document.documentElement.scrollTop;
  }
  else if( win.document.body            != null && 
           win.document.body.scrollLeft != null && 
           win.document.body.scrollTop  != null)
  {
    viewportLeft = win.document.body.scrollLeft;
    viewportTop  = win.document.body.scrollTop;
  }
  else if( win.pageXOffset != null && 
           win.pageYOffset != null)
  {
    viewportLeft = win.pageXOffset;
    viewportTop  = win.pageYOffset;
  }
  else if( win.viewportLeft != null && 
           win.viewportTop  != null) 
  {
    viewportLeft = win.viewportLeft;
    viewportTop  = win.viewportTop;
  }
  else
  {
    return null;
  }

  return { top: viewportTop, left: viewportLeft, height: viewportHeight, width: viewportWidth };
}

function getElementScroll(element)
{
  if(element == null)
  {
    return null;
  }

  var elementTop    = element.offsetTop;
  var elementLeft   = element.offsetLeft;
  var elementWidth  = element.offsetWidth;
  var elementHeight = element.offsetHeight;

  while(element.offsetParent) 
  {
    element      = element.offsetParent;
    elementTop  += element.offsetTop;
    elementLeft += element.offsetLeft;
  }

  return { top: elementTop, left: elementLeft, width: elementWidth, height: elementHeight };
}

function isVisibleInViewport(elementScroll, viewportScroll)
{
  if((elementScroll != null) && (viewportScroll != null))
  {
    return  (elementScroll.top  < (viewportScroll.top   + viewportScroll.height)) &&
            (elementScroll.left < (viewportScroll.left  + viewportScroll.width )) &&
           ((elementScroll.top  + elementScroll.height) > viewportScroll.top   )  &&
           ((elementScroll.left + elementScroll.width ) > viewportScroll.left  );
  }
}
