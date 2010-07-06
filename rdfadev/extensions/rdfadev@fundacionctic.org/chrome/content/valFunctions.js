/* Declaring Namespaces: http://www.w3.org/TR/1999/REC-xml-names-19990114/#ns-decl */

var CombiningChar = 
  "[\\u0300-\\u0345]"    +
+ "[\\u0360-\\u0361] | " +
+ "[\\u0483-\\u0486] | " +
+ "[\\u0591-\\u05A1] | " +
+ "[\\u05A3-\\u05B9] | " +
+ "[\\u05BB-\\u05BD] | " +
+ "\\u05BF | "           +
+ "[\\u05C1-\\u05C2] | " +
+ "[\\u05C4 | "          +
+ "[\\u064B-\\u0652] | " +
+ "\\u0670 | "           +
+ "[\\u06D6-\\u06DC] | " +
+ "[\\u06DD-\\u06DF] | " +
+ "[\\u06E0-\\u06E4] | " +
+ "[\\u06E7-\\u06E8] | " +
+ "[\\u06EA-\\u06ED] | " +
+ "[\\u0901-\\u0903] | " +
+ "\\u093C | "           +
+ "[\\u093E-\\u094C] | " +
+ "\\u094D | "           +
+ "[\\u0951-\\u0954] | " +
+ "[\\u0962-\\u0963] | " +
+ "[\\u0981-\\u0983] | " +
+ "\\u09BC | "           +
+ "\\u09BE | "           +
+ "\\u09BF | "           +
+ "[\\u09C0-\\u09C4] | " +
+ "[\\u09C7-\\u09C8] | " +
+ "[\\u09CB-\\u09CD] | " +
+ "\\u09D7 | "           +
+ "[\\u09E2-\\u09E3] | " +
+ "\\u0A02 | "           +
+ "\\u0A3C | "           +
+ "\\u0A3E | "           +
+ "\\u0A3F | "           +
+ "[\\u0A40-\\u0A42] | " +
+ "[\\u0A47-\\u0A48] | " +
+ "[\\u0A4B-\\u0A4D] | " +
+ "[\\u0A70-\\u0A71] | " +
+ "[\\u0A81-\\u0A83] | " +
+ "\\u0ABC | "           +
+ "[\\u0ABE-\\u0AC5] | " +
+ "[\\u0AC7-\\u0AC9] | " +
+ "[\\u0ACB-\\u0ACD] | " +
+ "[\\u0B01-\\u0B03] | " +
+ "\\u0B3C | "           +
+ "[\\u0B3E-\\u0B43] | " +
+ "[\\u0B47-\\u0B48] | " +
+ "[\\u0B4B-\\u0B4D] | " +
+ "[\\u0B56-\\u0B57] | " +
+ "[\\u0B82-\\u0B83] | " +
+ "[\\u0BBE-\\u0BC2] | " +
+ "[\\u0BC6-\\u0BC8] | " + 
+ "[\\u0BCA-\\u0BCD] | " +
+ "\\u0BD7 | "           +
+ "[\\u0C01-\\u0C03] | " +
+ "[\\u0C3E-\\u0C44] | " +
+ "[\\u0C46-\\u0C48] | " +
+ "[\\u0C4A-\\u0C4D] | " +
+ "[\\u0C55-\\u0C56] | " +
+ "[\\u0C82-\\u0C83] | " +
+ "[\\u0CBE-\\u0CC4] | " +
+ "[\\u0CC6-\\u0CC8] | " +
+ "[\\u0CCA-\\u0CCD] | " +
+ "[\\u0CD5-\\u0CD6] | " +
+ "[\\u0D02-\\u0D03] | " +
+ "[\\u0D3E-\\u0D43] | " +
+ "[\\u0D46-\\u0D48] | " +
+ "[\\u0D4A-\\u0D4D] | " +
+ "\\u0D57 | "           +
+ "\\u0E31 | "           +
+ "[\\u0E34-\\u0E3A] | " +
+ "[\\u0E47-\\u0E4E] | " +
+ "\\u0EB1 | "           +
+ "[\\u0EB4-\\u0EB9] | " +
+ "[\\u0EBB-\\u0EBC] | " +
+ "[\\u0EC8-\\u0ECD] | " +
+ "[\\u0F18-\\u0F19] | " +
+ "\\u0F35 | "           +
+ "\\u0F37 | "           +
+ "\\u0F39 | "           +
+ "\\u0F3E | "           +
+ "\\u0F3F | "           +
+ "[\\u0F71-\\u0F84] | " +
+ "[\\u0F86-\\u0F8B] | " +
+ "[\\u0F90-\\u0F95] | " +
+ "\\u0F97 | "           +
+ "[\\u0F99-\\u0FAD] | " +
+ "[\\u0FB1-\\u0FB7] | " +
+ "\\u0FB9 | "           +
+ "[\\u20D0-\\u20DC] | " +
+ "\\u20E1 | "           +
+ "[\\u302A-\\u302F] | " +
+ "\\u3099 | "           +
+ "\\u309A"              ;

var Extender = 
  "\\u00B7 | "           +
+ "\\u02D0 | "           +
+ "\\u02D1 | "           +
+ "\\u0387 | "           +
+ "\\u0640 | "           +
+ "\\u0E46 | "           +
+ "\\u0EC6 | "           +
+ "\\u3005 | "           +
+ "[\\u3031-\\u3035] | " +
+ "[\\u309D-\\u309E] | " +
+ "[\\u30FC-\\u30FE]   " ;

var NCNameChar      = "(?:\\w|\\d|\\.|-|_" + CombiningChar + "|" + Extender + ")";
var NCName          = "(?:\\w|_)(?:" + NCNameChar + ")*";
var PrefixedAttName = "xmlns:(" + NCName + ")";

var DocMediaType    = "application/xhtml+xml" + "(?:;.*)?";


function getDocMediaType(attributeValue)
{

  if(attributeValue == null)
  {
    return null;
  }

  var docMediaType    = new RegExp("^" + DocMediaType + "$");
  var resDocMediaType = docMediaType.exec(attributeValue);

  if(resDocMediaType != null){

    var result = new Object();

    result.docMediaType = resDocMediaType[1];

    return result;

  }

  return null;

}

function isNamespace(attributeValue)
{

  if(attributeValue == null)
  {
    return null;
  }

  var attNameExp    = new RegExp("^" + PrefixedAttName + "$");
  var resAttNameExp = attNameExp.exec(attributeValue);

  if(resAttNameExp != null){

    var result = new Object();

    result.prefix = "xmlns";
    result.NCName = resAttNameExp[1];

    return result;

  }
 
  return null;

}

/* Internationalized Resource Identifiers (IRI): http://www.ietf.org/rfc/rfc3987.txt */
var irelative_ref = "(?:\\/\\/(?:[^\\/\\?\\#]*))?(?:[^\\?\\#]*)(?:\\?(?:[^\\#]*))?(?:\\#(?:.*))?";
// authority = $2
// path      = $3
// query     = $5
// fragment  = $7

/* Uniform Resource Identifiers (URI): http://www.ietf.org/rfc/rfc2396.txt */
/* '[' and ']' characters are excluded to distingish between safe curies and uris */ 
var URI_reference        = "(?:(?:[^\\[\\]\\:\\/\\?\\#]+):)?(?:\\/\\/(?:[^\\[\\]\\/\\?\\#]*))?(?:[^\\[\\]\\?\\#]*)(?:\\?(?:[^\\[\\]\\#]*))?(?:\\#(?:[^\\[\\]]*))?";
var URI_reference_parsed = "(?:([^\\[\\]\\:\\/\\?\\#]+):)?(?:\\/\\/([^\\[\\]\\/\\?\\#]*))?([^\\[\\]\\?\\#]*)(?:\\?([^\\[\\]\\#]*))?(?:\\#([^\\[\\]]*))?";
// scheme    = $2
// authority = $4
// path      = $5
// query     = $7
// fragment  = $9

// list of reserved values for @rel and @rev
var reserved_word = "(?:alternate|appendix|bookmark|cite|chapter|contents|copyright|first|glossary|help|icon|index|last|license|meta|next|p3pv1|prev|role|section|stylesheet|subsection|start|top|up)";

/* CURIE Syntax Definition: http://www.w3.org/TR/rdfa-syntax/#s_curies */
var prefix    = NCName;
var reference = irelative_ref; 
var curie     = "(?:(" + prefix + ")" + "?:)" + "(" + reference + ")";

var integerRegExp    = "(?:\\-|\\+)?\\d+";
var hexBinaryRegExp  = "(?:\\xhh)+";
var decimalRegExp    = "(?:\\-|\\+)?\\d+(?:\\.\\d*)?";
var booleanRegExp    = "(?:true|false|0|1)";
var floatRegExp      = "(?:" + decimalRegExp + "(?:(?:e|E)" + integerRegExp + ")?" + "|INF|-INF|NaN)";
var doubleRegExp     = "(?:" + decimalRegExp + "(?:(?:e|E)" + integerRegExp + ")?" + "|INF|-INF|NaN)";
var anyURIRegExp     = "(?:(?:[^\\[\\]\\:\\/\\?\\#]+):)(?:\\/\\/(?:[^\\[\\]\\/\\?\\#]*))(?:[^\\[\\]\\?\\#]*)(?:\\?(?:[^\\[\\]\\#]*))?(?:\\#(?:[^\\[\\]]*))?";
var timeZoneRegExp   = "(?:(?:(?:\\+|\\-)\\d\\d\\:\\d\\d)|Z)";
var dateTimeRegExp   = "(?:\\-)?\\d\\d\\d\\d\\d*\\-\\d\\d\\-\\d\\dT\\d\\d\\:\\d\\d\\:\\d\\d(\\.\\d+)?" + timeZoneRegExp + "?";
var timeRegExp       = "\\d\\d\\:\\d\\d\\:\\d\\d(\\.\\d+)?" + timeZoneRegExp + "?";
var dateRegExp       = "(?:\\-)?\\d\\d\\d\\d\\d*\\-\\d\\d\\-\\d\\d" + timeZoneRegExp + "?";
var gYearMonthRegExp = "(?:\\-)?\\d\\d\\d\\d\\d*\\-\\d\\d" + timeZoneRegExp + "?";
var gYearRegExp      = "(?:\\-)?\\d\\d\\d\\d\\d*" + timeZoneRegExp + "?";
var gMonthDayRegExp  = "\\d\\d\\-\\d\\d" + timeZoneRegExp + "?";
var gDayRegExp       = "\\d\\d" + timeZoneRegExp + "?";
var gMonthRegExp     = "\\d\\d" + timeZoneRegExp + "?";

var xsdDatatypes = [{regExp: integerRegExp,    datatype: "http://www.w3.org/2001/XMLSchema#integer",    short: "xsd:integer"},
                    {regExp: hexBinaryRegExp,  datatype: "http://www.w3.org/2001/XMLSchema#hexBinary ", short: "xsd:hexBinary"},
                    {regExp: decimalRegExp,    datatype: "http://www.w3.org/2001/XMLSchema#decimal ",   short: "xsd:decimal"},
                    {regExp: anyURIRegExp,     datatype: "http://www.w3.org/2001/XMLSchema#anyURI ",    short: "xsd:anyURI"},
                    {regExp: floatRegExp,      datatype: "http://www.w3.org/2001/XMLSchema#float",      short: "xsd:float"}, 
                    {regExp: doubleRegExp,     datatype: "http://www.w3.org/2001/XMLSchema#double",     short: "xsd:double"}, 
                    {regExp: dateTimeRegExp,   datatype: "http://www.w3.org/2001/XMLSchema#dateTime",   short: "xsd:dateTime"},
                    {regExp: timeRegExp,       datatype: "http://www.w3.org/2001/XMLSchema#time",       short: "xsd:time"}, 
                    {regExp: dateRegExp,       datatype: "http://www.w3.org/2001/XMLSchema#date",       short: "xsd:date"}, 
                    {regExp: gYearMonthRegExp, datatype: "http://www.w3.org/2001/XMLSchema#gYearMonth", short: "xsd:gYearMonth"},
                    {regExp: gYearRegExp,      datatype: "http://www.w3.org/2001/XMLSchema#gYear",      short: "xsd:gYear"},
                    {regExp: gMonthDayRegExp,  datatype: "http://www.w3.org/2001/XMLSchema#gMonthDay",  short: "xsd:gMonthDay"},
                    {regExp: gDayRegExp,       datatype: "http://www.w3.org/2001/XMLSchema#gDay",       short: "xsd:gDay"},
                    {regExp: gMonthRegExp,     datatype: "http://www.w3.org/2001/XMLSchema#gMonth",     short: "xsd:gMonth"},
                    {regExp: booleanRegExp,    datatype: "http://www.w3.org/2001/XMLSchema#boolean",    short: "xsd:boolean"}];

function checkDatatype(triple, literal, datatype, error_list)
{

  if((error_list == null) || (literal == null))
  {
    return;
  }

  var correctDatatypes = null;
  
  for(var i = 0; i < xsdDatatypes.length; i++)
  {
    var xsdExp          = new RegExp( "^" + xsdDatatypes[i].regExp + "$" );
    var resXsdExp       = xsdExp.exec(literal);

    if(resXsdExp != null)
    {      
      if(datatype == null)
      {
        if(correctDatatypes == null)
        {
          correctDatatypes = "" + '"' + xsdDatatypes[i].short + '"';
        } 
        else
        {
          correctDatatypes += ", " + '"' + xsdDatatypes[i].short + '"';
        }
      }
    }
  }
  
  if(correctDatatypes != null)
  {
    error_list.push({code: parserError.missingLiteralDatatype, literal: literal, correctDatatype: correctDatatypes});
  }
  
}

function isCURIE(attributeValue, URI_mappings, error_list, attributeName)
{

  if(attributeValue == null)
  {
    return null;
  }

  var curieExp    = new RegExp( "^" + curie + "$" );
  var resCurieExp = curieExp.exec(attributeValue);

  if((resCurieExp != null) && (resCurieExp[2] != null) && (resCurieExp[2] != "_"))
  {
    if(resCurieExp[1] != null)
    {
      if(URI_mappings == null)
      {
        return null;
      }
      if(URI_mappings[resCurieExp[1]] == null)
      {
        if(error_list != null)
        {
          error_list.push({code: parserError.undefinedPrefix, prefix: resCurieExp[1], attribute: attributeName, value: attributeValue});
        }
        return null;
      }
      URI_mappings[resCurieExp[1]].used = true;
    }

    var result = new Object();

    result.curie = resCurieExp[0];

    if(resCurieExp[1] != null)
      result.prefix = resCurieExp[1];

    if(resCurieExp[2] != null)
      result.reference = resCurieExp[2];

    return result;

  }

  if((error_list != null) && (attributeName != null))
  {
    error_list.push({code: parserError.badCurie, attribute: attributeName, value: attributeValue});
  }

  return null;

}

function isReservedWordOrCurie(attributeValue, URI_mappings, error_list, attributeName)
{

  if(attributeValue == null)
    return null;

  var reservedWordExp    = new RegExp( "^" + reserved_word + "$" );
  var resReservedWordExp = reservedWordExp.exec(attributeValue);

  if(resReservedWordExp != null)
  {
    var result = new Object();
    result.reserved_word = resReservedWordExp[0];

    return result;
  }

  var curieExp    = new RegExp( "^" + curie + "$" );
  var resCurieExp = curieExp.exec(attributeValue);

  if((resCurieExp != null) && (resCurieExp[2] != null) && (resCurieExp[2] != "_"))
  {
    if(resCurieExp[1] != null)
    {
      if(URI_mappings == null)
      {
        return null;
      }
      if(URI_mappings[resCurieExp[1]] == null)
      {
        if(error_list != null)
        {
          error_list.push({code: parserError.undefinedPrefix, prefix: resCurieExp[1], attribute: attributeName, value: attributeValue});
        }
        return null;
      }
      URI_mappings[resCurieExp[1]].used = true;
    }

    var result = new Object();

    result.curie = resCurieExp[0];

    if(resCurieExp[1] != null)
      result.prefix = resCurieExp[1];

    if(resCurieExp[2] != null)
      result.reference = resCurieExp[2];

    return result;

  }

  if((error_list != null) && (attributeName != null))
  {
    error_list.push({code: parserError.badReservedWordOrCurie, attribute: attributeName, value: attributeValue});
  }

  return null;

}

function isSafeCURIE(attributeValue, URI_mappings)
{

  if(attributeValue == null)
  {
    return null;
  }

  var curieExp    = new RegExp( "^\\[(" + curie + ")\\]$" );
  var resCurieExp = curieExp.exec(attributeValue);

  if(resCurieExp != null)
  {
    if((resCurieExp[1] != null) && (resCurieExp[2] != null) && (resCurieExp[2] != "_"))
    {
      if(URI_mappings == null)
      {
        return null;
      }
      if(URI_mappings[resCurieExp[2]] == null)
      {      
        return null;
      }
      URI_mappings[resCurieExp[2]].used = true;
    }

    var result   = new Object();

    result.curie = resCurieExp[1];

    if(resCurieExp[2] != null)
      result.prefix = resCurieExp[2];

    if(resCurieExp[3] != null)
      result.reference = resCurieExp[3];

    return result;

  }

  return null;

}

function isURI(attributeValue, error_list, attributeName)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var uriExp    = new RegExp( "^" + URI_reference  + "$" );
  var resUriExp = uriExp.exec(attributeValue);

  if(resUriExp != null)
  {
    return resUriExp[0];
  }

  if((error_list != null) && (attributeName != null))
  {
    error_list.push({code: parserError.badUri, attribute: attributeName, value: attributeValue});
  }
  
  return null;

}

function getURIParsed(attributeValue)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var uriExp    = new RegExp( "^" + URI_reference_parsed  + "$" );
  var resUriExp = uriExp.exec(attributeValue);

  if(resUriExp != null)
  {

    var result = new Object();

    result.uri = resUriExp[0];

    if(resUriExp[1] != null)
      result.scheme = resUriExp[1];

    if(resUriExp[2]!= null)
      result.authority = resUriExp[2]; 

    if(resUriExp[3] != null)
      result.path = resUriExp[3];

    if(resUriExp[4] != null)
      result.query = resUriExp[4];

    if(resUriExp[5] != null)
      result.fragment = resUriExp[5];

    return result

  }

  return null;

}

function recomposeParsedURI(parsedURI)
{

  var result = ""; 

  if(parsedURI.scheme != null)
    result = result + parsedURI.scheme + ":";

  if(parsedURI.authority != null)
    result = result + "//" + parsedURI.authority; 

  if(parsedURI.path != null)
    result = result + parsedURI.path;

  if(parsedURI.query != null)
    result = result + "?" + parsedURI.query;

  if(parsedURI.fragment != null)
    result = result + "#" + parsedURI.fragment;

  return result;

}

function isURIorSafeCURIE(attributeValue, URI_mappings, error_list, attributeName)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var resSafeCURIE = isSafeCURIE(attributeValue, URI_mappings);

  if(resSafeCURIE != null) 
  {
    return resSafeCURIE;
  }

  var resURI = isURI(attributeValue);

  if(resURI != null) 
  {
    return resURI;
  }

  if((error_list != null) && (attributeName != null))
  {
    error_list.push({code: parserError.badUriOrSafeCurie, attribute: attributeName, value: attributeValue});
  }
  
  return null;

}

function isReservedWord(attributeValue)
{
  if(attributeValue == null)
    return null;

  var reservedWordExp    = new RegExp( "^" + reserved_word + "$" );
  var resReservedWordExp = reservedWordExp.exec(attributeValue);

  if(resReservedWordExp != null)
  {
    var result = new Object();
    result.reserved_word = resReservedWordExp[0];
    return result;
  }

  return null;
  
}

function getCURIEs(attributeValue, URI_mappings, error_list, attributeName)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var listOfAttributes = attributeValue.split(/(?:$|^|\s+)/);
  var listOfCURIEs     = new Array();

  if(listOfAttributes.length == 0)
  {
    if((error_list != null) && (attributeName != null))
    {
      error_list.push({code: parserError.badCurie, attribute: attributeName, value: attributeValue});
    }
  }
  else
    {
    for(var i in listOfAttributes)
    {

      var resCurie = isCURIE(listOfAttributes[i], URI_mappings, error_list, attributeName);

      if(resCurie != null)
      {
        listOfCURIEs.push(resCurie);
      }

    }
  }

  if(listOfCURIEs.length > 0)
  {
    return listOfCURIEs;
  }
  else
  {
    return null;
  }

}

function getReservedWordOrCURIE(attributeValue, URI_mappings, error_list, attributeName)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var listOfAttributes            = attributeValue.split(/(?:$|^|\s+)/);
  var listOfReservedWordsOrCURIEs = new Array();

  if(listOfAttributes.length == 0)
  {
    if((error_list != null) && (attributeName != null))
    {
      error_list.push({code: parserError.badReservedWordOrCurie, attribute: attributeName, value: attributeValue});
    }
  }
  else
  {
    for(var i in listOfAttributes)
    {

      var resReservedWordOrCurie = isReservedWordOrCurie(listOfAttributes[i], URI_mappings, error_list, attributeName);

      if(resReservedWordOrCurie != null)
      {
        listOfReservedWordsOrCURIEs.push(resReservedWordOrCurie);
      }

    }
  }

  if(listOfReservedWordsOrCURIEs.length > 0)
  {
    return listOfReservedWordsOrCURIEs;
  }
  else
  {
    return null;
  }

}

function CURIEtoURI(aCurie, URI_mappings)
{

  var resCurie = isCURIE(aCurie, URI_mappings);
  var resURI   = "";

  if(resCurie != null)
  {

    if((resCurie.prefix != null) && ((URI_mappings == null) || (URI_mappings[resCurie.prefix] == null)))
      return null;

    if(resCurie.prefix != null)
    {
      resURI = resURI + URI_mappings[resCurie.prefix].URI;
    }
    /* default prefix mapping in RDFa */
    else
    {
      resURI = resURI + "http://www.w3.org/1999/xhtml/vocab#";
    }

    if(resCurie.reference != null)
      resURI = resURI + resCurie.reference;

    return resURI;

  }

  return null;

}

function SafeCURIEtoURI(aSafeCurie, URI_mappings)
{

  var resSafeCurie = isSafeCURIE(aSafeCurie, URI_mappings);
  var resURI       = "";

  if(resSafeCurie != null)
  {

    if((resSafeCurie.prefix != null) && ((URI_mappings == null) || (URI_mappings[resSafeCurie.prefix] == null)))
      return null;

    if(resSafeCurie.prefix != null)
    {
      resURI = resURI + URI_mappings[resSafeCurie.prefix].URI;
    }
    /* default prefix mapping in RDFa */
    else
    {
      resURI = resURI + "http://www.w3.org/1999/xhtml/vocab#";
    }

    if(resSafeCurie.reference != null)
      resURI = resURI + resSafeCurie.reference;

    return resURI;

  }

  return null;

}

// Reference Resolution: http://www.ietf.org/rfc/rfc3986.txt
function resolveURI(anURI, baseURI)
{

  if(anURI == null) 
    return null;

  var parsedURI     = getURIParsed(anURI);
  var parsedBaseURI = getURIParsed(baseURI);

  if(parsedURI.scheme == parsedBaseURI.scheme)
    parsedURI.scheme = null;

  var T_scheme;
  var T_authority;
  var T_path;
  var T_query;
  var T_fragment;

  if((parsedURI != null) && (parsedBaseURI != null))
  {
    if(parsedURI.scheme != null)
    {
      T_scheme = parsedURI.scheme;
      T_authority = parsedURI.authority;
      T_path = remove_dot_segments(parsedURI.path);
      T_query = parsedURI.query;
    }
    else{
      if(parsedURI.authority != null)
      {
        T_authority = parsedURI.authority;
        T_path = remove_dot_segments(parsedURI.path);
        T_query = parsedURI.query;
      }
      else{
        if(parsedURI.path == "")
        {
          T_path = parsedBaseURI.path;
          if(parsedURI.query)
            T_query = parsedURI.query;
          else
            T_query = parsedBaseURI.query;
        }
        else
        {
          if(parsedURI.path[0] == "/")
          {
            T_path = remove_dot_segments(parsedURI.path);
          }
          else
          {
            T_path = merge_paths(parsedBaseURI.path, parsedURI.path);
            T_path = remove_dot_segments(T_path);
          }
          T_query = parsedURI.query;         
        }
        T_authority = parsedBaseURI.authority; 
      } 
      T_scheme = parsedBaseURI.scheme
    } 
    T_fragment = parsedURI.fragment;

    return recompose_URI_components(T_scheme, T_authority, T_path, T_query, T_fragment);

  }

  return null;

}

function resolveCURIE(aCurie, baseURI, URI_mappings)
{

  var anURI = CURIEtoURI(aCurie, URI_mappings);

  if(anURI != null)
  {
    return resolveURI(anURI, baseURI);
  }
  else
  {
    return null;
  }

}

function resolveSafeCURIE(aSafeCurie, baseURI, URI_mappings)
{

  var anURI = SafeCURIEtoURI(aSafeCurie, URI_mappings);

  if(anURI != null)
  {
    return resolveURI(anURI, baseURI);
  }
  else
  {
    return null;
  }

}

function remove_dot_segments(path)
{

  var result = path;
  var previous_result;

  do
  {
    previous_result = result;
    result          = result.replace(/^(\.\.\/|\.\/)/, "");
  } while(previous_result != result);

  result = result.replace(/(\/\.\/|\/\.$)/g, "/");

  do
  {
    previous_result = result;
    result          = result.replace(/(\/?[^\/]*)?(\/\.\.\/|\/\.\.$)/, "/");
  } while(previous_result != result);

  result = result.replace(/^(\.\.|\.)$/g, "");

  return result;

}

function merge_paths(path1, path2)
{

  if(path1 == "")
  {
    return "/" + path2;
  }
  else
  {
    return path1.replace(/[^\/]*$/, "") + path2;
  }

}

function recompose_URI_components(scheme, authority, path, query, fragment)
{

  var result = ""; 

  if(scheme != null)
    result = result + scheme + ":";

  if(authority != null)
    result = result + "//" + authority; 

  if(path != null)
    result = result + path;

  if(query != null)
    result = result + "?" + query;

  if(fragment != null)
    result = result + "#" + fragment;

  return result;

}

var base_URI_reference = "((?:(?:[^\\:\\/\\?\\#]+):)?(?:\\/\\/(?:[^\\/\\?\#]*))?(?:[^\\?\\#]*)(?:\\?(?:[^\\#]*))?)(?:\\#(?:.*))?";

function getBaseURI(attributeValue)
{

  if(attributeValue == null) 
  {
    return null;
  }

  var uriExp    = new RegExp( "^" + base_URI_reference  + "$" );
  var resUriExp = uriExp.exec(attributeValue);

  if(resUriExp != null)
  {
    return resUriExp[1];
  }

  return null;

}

var URI_schema   = "(?:([^\\:\\/\\?\\#]+):)?(?:\\/\\/(?:[^\\/\\?\#]*))?(?:[^\\?\\#]*)(?:\\?(?:[^\\#]*))?(?:\\#(?:.*))?";
var URI_woschema = "(?:(?:[^\\:\\/\\?\\#]+):\\/\\/)?((?:[^\\/\\?\#]*)?(?:[^\\?\\#]*)(?:\\?(?:[^\\#]*))?(?:\\#(?:.*))?)";

function getURISchema(attributeValue)
{

  if(attributeValue == null) 
    return null;

  var uriExp    = new RegExp( "^" + URI_schema  + "$" );
  var resUriExp = uriExp.exec(attributeValue);

  if(resUriExp != null)
  {
    return resUriExp[1];
  }

  return null;

}

function getURIWithoutSchema(attributeValue)
{

  if(attributeValue == null) 
    return null;

  var uriExp    = new RegExp( "^" + URI_woschema  + "$" );
  var resUriExp = uriExp.exec(attributeValue);

  if(resUriExp != null)
  {
    return resUriExp[1];
  }

  return null;

}

/* TODO: que pasa si se mofica el atributo base? */
var RDFaAttributeExp = "(?:rel|rev|content|href|src|about|property|resource|datatype|typeof|xml\\:lang|" + PrefixedAttName + ")";

function RDFaAttribute(attrName)
{
  var attrExp    = new RegExp( "^" + RDFaAttributeExp  + "$" );
  var resAttrExp = attrExp.exec(attrName);

  if(resAttrExp != null)
  {
    return true;
  }

  return false;
}

var defVocPrefExp = "(" + "http\\:\\/\\/www\\.w3\\.org\\/1999\\/xhtml\\/vocab\\#"               + "|" + 
                          "http\\:\\/\\/www\\.w3\\.org\\/1999\\/02\\/22\\-rdf\\-syntax\\-ns\\#" +
                    ")(?:.*)";

function isDefVocPref(anURI)
{
  var defVocExp    = new RegExp( "^" + defVocPrefExp + "$" );
  var resDefVocExp = defVocExp.exec(anURI);

  if(resDefVocExp != null)
  {
    var result = new Object();
    result.prefix = resDefVocExp[1];
    return result;
  }

  return null;
}

