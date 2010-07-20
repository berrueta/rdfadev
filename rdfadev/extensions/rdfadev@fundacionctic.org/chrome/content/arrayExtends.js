/* see license.txt for terms of usage */


function uniqueAdd(anArray, anObject) 
{
  var i = anArray.length;
  while (i--) 
  {
    if (anArray[i] === anObject) 
    {
      return false;
    }
  }
  anArray.push(anObject);
  return true;
} 

function removeElementFromArray(anArray, element)
{
  if((anArray == null) || (element == null))
  {
    return;
  }

  for(var i = anArray.length - 1; i >= 0; i--)
  {
    if(anArray[i] == element)
    {
      anArray.splice(i, 1);

      return;
    }
  }
}

function removeElementsFromArray(anArray, elements)
{
  if((anArray == null) || (elements == null))
  {
    return;
  }

  for(var i = 0; i < elements.length; i++)
  {
    removeElementFromArray(anArray, elements[i]);
  }
}

function copyArray(anArray)
{
  var newArray = [];

  for(var i = 0; i < anArray.length; i++)
  {
    newArray.push(anArray[i]);
  }

  return newArray;
}
