var OpenFDABrowser = React.createClass({
  displayName: "OpenFDABrowser",
  getInitialState: function() {
    return {
      response: "Nobody here but us chickens."
    };
  },
  doQuery: function(query) {
    console.log("Querying.");
    var xhr = new XMLHttpRequest(),
        apiEndpoint = "https://api.fda.gov/drug/event.json",
        self = this;

    xhr.onreadystatechange = function() {
      console.log("Got some response data.");
      self.setState({response: xhr.responseText})
    };
    console.log("Sending query RIGHT NOW: ", query);
    xhr.open("GET", apiEndpoint + query, true);
    xhr.send(null);
  },
  debouncedQuery: _.debounce(function(query) {this.doQuery(query);}, 1000),
  render: function() {
    return ReactBootstrap.Grid({fluid: true},
      ReactBootstrap.Row({},
        ReactBootstrap.Col({md: 12},
          BrowserTitle({})
      )),
      ReactBootstrap.Row({},
        ReactBootstrap.Col({md: 4},
          QueryBuilder({updateQuery: this.debouncedQuery})
        ),
        ReactBootstrap.Col({md: 8},
          OpenFDAGraph({}),
          ResponseJSONDisplay({response: this.state.response})
        )
      )
   );
  }
});

var BrowserTitle = React.createClass({
  displayName: "BrowserTitle",
  render: function() {
    return ReactBootstrap.PageHeader({},
            React.DOM.h1({}, "OpenFDA, meet d3.js ",
              React.DOM.small({}, "Investigate adverse drug event reports"
           )));
  }
});

var QueryBuilder = React.createClass({
  displayName: "QueryBuilder",
  mixins: [React.addons.LinkedStateMixin],
  paramNameMap: {
    genericDrug:      "patient.drug.openfda.generic_name",
    manufacturerName: "patient.drug.openfda.manufacturer_name",
    dosageForm:       "patient.drug.openfda.dosage_form",
    brandName:        "patient.drug.openfda.brand_name",
    productType:      "patient.drug.openfda.product_type",
    route:            "patient.drug.openfda.route"
  },
  predicate: function(value, openFDAParamName) {
    console.log("Making a predicate. idx:", openFDAParamName, "val:", value);
    return this.paramNameMap[openFDAParamName] + ':"' + value + '"';
  },
  conjunction: function(param1, param2) {
    return param1 + "+AND+" + param2;
  },
  constructSearch: function(params) {
    var prefix = "search=",
        predicates = _.chain(params)
                      .map(this.predicate)
                      .reduce(this.conjunction)
                      .value();

    return prefix + predicates;
  },
  makeQuery: function(props) {
    var limit = props.limit;
    delete props.limit;
    return this.constructSearch(props) + (limit ? "&limit=" + limit : "");
  },
  handleChange: function(unclear) {
    console.log("There was some change to the form.");
    console.log("constructed query: ", this.makeQuery(this.props));
    this.props.updateQuery('?search=patient.drug.openfda.substance_name:"' + this.state.genericDrug + '"');
  },
  getInitialState: function() {
    return {
      genericDrug: "fluoxetine"
    };
  },
  render: function() {
    console.log("Rendering builder.");
    //this.props.updateQuery({genericDrug: this.state.genericDrug, limit: this.state.numResults});

    return ReactBootstrap.Panel({},
      React.DOM.form({role: "form", onChange: this.handleChange },
        React.DOM.p({}, "Currently, all predicates are simply joined with a boolean AND. Take note!"),
        ReactBootstrap.Input({ref: "genericDrug", label: "Generic drug name", id: "genericDrug", valueLink: this.linkState('genericDrug'), type: "text"}, null),
        ReactBootstrap.Input({ref: "manufacturerName", label: "Manufacturer name", id: "manufacturerName", valueLink: this.linkState('manufacturerName'), type: "text"}, null),
        ReactBootstrap.Input({ref: "numResults", label: "Number of results (max 100)", id: "numResults", valueLink: this.linkState('numResults'), type: "text"}, null)
      )
    )
  }
});

var ResponseJSONDisplay = React.createClass({
  displayName: "ResponseJSONDisplay",
  render: function() {
    return ReactBootstrap.Panel({header: "Response JSON"}, React.DOM.pre({}, this.props.response));
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
**/
