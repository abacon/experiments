$(document).ready(function() {
  $("#refreshButton").bind("click", function(e) {
    var drugInput = $("#drug")[0],
        resultsDiv = $("#resultsJSON")[0];

    console.log("Hit the button!");
    $.ajax('https://api.fda.gov/drug/event.json',
           {
             data: {
               search: 'patient.drug.openfda.substance_name:"' + drugInput.value + '"',
               limit: 1
             },
             success: function(res, bod) {
               $(resultsDiv).children().remove();
               $(resultsDiv).append($("<pre />")).children("pre").append(JSON.stringify(res,null, "\t"));
             }
           }
          );
  });
});
