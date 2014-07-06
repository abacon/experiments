var OpenFDABrowser = React.createClass({
  displayName: "OpenFDABrowser",
  render: function() {
    return ReactBootstrap.Grid({fluid: true},
      ReactBootstrap.Row({},
        ReactBootstrap.Col({md: 12},
          BrowserTitle({})
      )),
      ReactBootstrap.Row({},
        ReactBootstrap.Col({md: 4},
          QueryBuilder({})
        ),
        ReactBootstrap.Col({md: 8},
          ResponseJSONDisplay({}),
          OpenFDAGraph({})
        )
      )
   );
  }
});

var BrowserTitle = React.createClass({
  displayName: "BrowserTitle",
  render: function() {
    return ReactBootstrap.PageHeader({},
            React.DOM.h1({}, "OpenFDA, meet Plot.ly ",
              React.DOM.small({}, "Investigate adverse drug event reports"
           )));
  }
});

var QueryBuilder = React.createClass({
  displayName: "QueryBuilder",
  render: function() {
    return ReactBootstrap.Panel({},
      React.DOM.form({role: "form"},
        ReactBootstrap.Input({label: "Drug", id: "drug", defaultValue: "fluoxetine", type: "text"}, null)
      )
    )
  }
});

var ResponseJSONDisplay = React.createClass({
  displayName: "ResponseJSONDisplay",
  render: function() {
    return ReactBootstrap.Panel({header: "Response JSON"}, "???")
  }
});

var OpenFDAGraph = React.createClass({
  displayName: "OpenFDAGraph",
  render: function() {
    return ReactBootstrap.Panel({header: "graph dat data"}, "")
  }
});


React.renderComponent(
  OpenFDABrowser(),
  document.getElementById('main')
);

/**
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
**/
