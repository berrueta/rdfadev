/* see license.txt for terms of usage */



var consoleView = {

  rdfTestManifestUrl : "http://triplr.org/json/www.w3.org/2006/07/SWD/RDFa/testsuite/xhtml1-testcases/rdfa-xhtml1-test-manifest.rdf",
  queryServiceUrl    : "http://localhost:8080/sparql_queries/Ask_service",

  validateParser : function()
  {
    var strbundle              = document.getElementById("rdfadev-strings");
    var console                = document.getElementById("console");
    var rdfTestManifestClient  = new XMLHttpRequest();
    var testCases;

    try
    {
      rdfTestManifestClient.open("GET", this.rdfTestManifestUrl, false);
      rdfTestManifestClient.send();

      if(rdfTestManifestClient.status == 200)
      {
        testCases = JSON.parse(rdfTestManifestClient.responseText);
      }
      else
      {
        console.value += strbundle.getFormattedString("testManifestValidationError", []) + "\n";

        return;
      }
    }
    catch(error)
    {
      console.value += strbundle.getFormattedString("testManifestValidationError", []) + "\n";

      return;
    }

    var correctApprovedTestCases     = 0;
    var correctRejectedTestCases     = 0;
    var correctUnreviewedTestCases   = 0;
    var incorrectApprovedTestCases   = 0;
    var incorrectRejectedTestCases   = 0;
    var incorrectUnreviewedTestCases = 0;
    var totalTestCases               = 0;
    var errorTestCases               = 0;

    for(var testCase in testCases)
    {

      try
      {
        var infoResInputClient      = new XMLHttpRequest();
        var infoResInputClientUrl   = testCases[testCase]["http://www.w3.org/2006/03/test-description#informationResourceInput"][0]["value"]; 

        infoResInputClient.open("GET", infoResInputClientUrl, false);
        infoResInputClient.send();

       if(infoResInputClient.status == 200)
        {
          var parser  = new RDFa_parser();
          parser.base = infoResInputClientUrl;
   
          parser.execute(infoResInputClient.responseXML);
        }
        else
        {
          console.value += strbundle.getFormattedString("askQueryValidationError", [testCase]) + "\n";  

          continue;
        }

        var infoResResultsClient    = new XMLHttpRequest();      
        var infoResResultsClientUrl = testCases[testCase]["http://www.w3.org/2006/03/test-description#informationResourceResults"][0]["value"]  
        var sendQueryResult;
        var reviewStatus;
        var expectedResult = "true";

        infoResResultsClient.open("GET", infoResResultsClientUrl, false);
        infoResResultsClient.send();

        if(infoResResultsClient.status == 200)
        {
          sendQueryResult = this.sendQuery(infoResResultsClient.responseText, parser.n3);
        }
        else
        {
          console.value += strbundle.getFormattedString("askQueryValidationError", [testCase]) + "\n";  

          continue;
        }
   
        if(testCases[testCase]["http://www.w3.org/2006/03/test-description#reviewStatus"][0]["value"] == "http://www.w3.org/2006/03/test-description#rejected")
        {
          reviewStatus = "rejected";
        }
        else if(testCases[testCase]["http://www.w3.org/2006/03/test-description#reviewStatus"][0]["value"] == "http://www.w3.org/2006/03/test-description#approved")
        {
          reviewStatus = "approved";
        }
        else if(testCases[testCase]["http://www.w3.org/2006/03/test-description#reviewStatus"][0]["value"] == "http://www.w3.org/2006/03/test-description#unreviewed")
        {
          reviewStatus = "unreviewed";
        }

        if(testCases[testCase]["http://www.w3.org/2006/03/test-description#expectedResults"] != null)
        {
          expectedResult = testCases[testCase]["http://www.w3.org/2006/03/test-description#expectedResults"][0]["value"];
        }

        if(sendQueryResult.status == 200)
        {

          console.value += strbundle.getFormattedString("askQueryValidationResult", [sendQueryResult.responseText, expectedResult, reviewStatus, testCase]) + "\n";

          /* Test cases results count */
          if(reviewStatus == "approved")
          {
            if(((sendQueryResult.responseText == "true")  && (expectedResult == "true")) ||
               ((sendQueryResult.responseText == "false") && (expectedResult == "false"))) 
            { 
              correctApprovedTestCases += 1;
            }
            else 
            {
              //console.value  += "Query:\n" + infoResResultsClient.responseText + "\nTriples:\n" + parser.n3 + "\n";
              incorrectApprovedTestCases += 1;
            }
          }
          else if(reviewStatus == "rejected")
          {
            if(((sendQueryResult.responseText == "true")  && (expectedResult == "true")) ||
               ((sendQueryResult.responseText == "false") && (expectedResult == "false"))) 
            {  
              correctRejectedTestCases += 1;
            }
            else 
            {
              incorrectRejectedTestCases += 1;
            }
          }
          else if(reviewStatus == "unreviewed")
          {
            if(((sendQueryResult.responseText == "true")  && (expectedResult == "true")) ||
               ((sendQueryResult.responseText == "false") && (expectedResult == "false"))) 
            {  
              correctUnreviewedTestCases += 1;
            }
            else 
            {
              incorrectUnreviewedTestCases += 1;
            }
          }
        }
        else
        {
          console.value += strbundle.getFormattedString("askQueryValidationError", [testCase]) + "\n";  

          errorTestCases += 1;
        }
      }
      catch(error)
      {
        console.value += strbundle.getFormattedString("askQueryValidationError", [testCase]) + "\n";  

        continue;
      }

      totalTestCases += 1;
    }

    console.value += strbundle.getFormattedString("totalTestCases",             [totalTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("errorTestCases",             [errorTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("correctApprovedTestCases",   [correctApprovedTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("incorrectApprovedTestCases", [incorrectApprovedTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("correctRejectedTestCases",   [correctRejectedTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("incorrectRejectedTestCases", [incorrectRejectedTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("correctUnreviewedTestCases",   [correctUnreviewedTestCases]) + "\n";  
    console.value += strbundle.getFormattedString("incorrectUnreviewedTestCases", [incorrectUnreviewedTestCases]) + "\n";  

  },

  sendQuery : function(query, triples)
  {
    var queryServiceClient = new XMLHttpRequest();
    var queryObject        = { "triples": triples, "query": query };
    var queryString        = JSON.stringify(queryObject);

    queryServiceClient.open("POST", this.queryServiceUrl, false);
    queryServiceClient.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
    queryServiceClient.send(queryString);

    return { "status": queryServiceClient.status, "responseText": queryServiceClient.responseText };
  },

  clearConsole : function()
  {
    var console   = document.getElementById("console");

    console.value = "";

    console.top = console.height;
  },

}
