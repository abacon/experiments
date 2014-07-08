var OpenFDABrowser = React.createClass({
  displayName: "OpenFDABrowser",
  getInitialState: function() {
    return {
      response: "Nobody here but us chickens."
    };
  },
  doQuery: function(query) {
    var xhr = new XMLHttpRequest(),
        apiEndpoint = "https://api.fda.gov/drug/event.json",
        self = this;

    xhr.onreadystatechange = function() {
      self.setState({response: xhr.responseText})
    };
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
    var limit = this.state.openFDA.numResults;
    delete this.state.openFDA.numResults;
    return "?" + this.constructSearch(props) + (limit ? "&limit=" + limit : "");
  },
  handleChange: function(unclear) {
    this.props.updateQuery(this.makeQuery(this.state.openFDA));
  },
  getInitialState: function() {
    return {
      openFDA: {}
    };
  },
  updateOpenFDAParam: function(paramName, paramValue) {
    this.state.openFDA[paramName] = paramValue;
    this.handleChange();
  },
  render: function() {
    //this.props.updateQuery({genericDrug: this.state.genericDrug, limit: this.state.numResults});

    return ReactBootstrap.Panel({},
      React.DOM.form({role: "form"},
        React.DOM.p({}, "Currently, all predicates are simply joined with a boolean AND. Take note!"),
        OpenFDAParam({label: "Generic drug name", id: "genericDrug", updateOpenFDAParam: this.updateOpenFDAParam, type: "text"}, null),
        OpenFDAParam({label: "Manufacturer name", id: "manufacturerName", updateOpenFDAParam: this.updateOpenFDAParam, type: "text"}, null),
        OpenFDAParam({label: "Number of results (max 100)", id: "numResults", updateOpenFDAParam: this.updateOpenFDAParam, type: "text"}, null)
      )
    )
  }
});

var OpenFDAParam = React.createClass({
  displayName: "OpenFDAParam",
  handleChange: function(e) {
    this.props.updateOpenFDAParam(this.props.id, e.target.value);
    this.setState({value: e.target.value});
  },
  getInitialState: function() {
    return {
      value: (this.props.defaultValue ? this.props.defaultValue : "")
    }
  },
  render: function() {
    return ReactBootstrap.Input({ref: this.props.id, label: this.props.label, id: this.props.id, value: this.props.value, type: this.props.type, onChange: this.handleChange}, null);
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
