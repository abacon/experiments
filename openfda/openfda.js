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
      self.setState({response: xhr.responseText});
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

// QueryBuilder:
// ->Params
// -->ParamAdder
// -->Param1, Param2, etc.
// ->CountAdder (checkbox + listbox)
// ->LimitAdder (checkbox + number)

var QueryBuilder = React.createClass({
  displayName: "QueryBuilder",
  makeQueryString: function() {
    return "?" + this.constructSearch(this.state.search) + this.constructLimit(this.state.limit) + this.constructCount(this.state.count);
  },
  getInitialState: function() {
    return {};
  },
  mixins: [React.addons.LinkedStateMixin],
  paramNameMap: {
    genericDrug:      {label: "Generic drug name",       paramName: "patient.drug.openfda.generic_name"},
    manufacturerName: {label: "Manufacturer name",       paramName: "patient.drug.openfda.manufacturer_name"},
    dosageForm:       {label: "Dosage form",             paramName: "patient.drug.openfda.dosage_form"},
    brandName:        {label: "Brand-name",              paramName: "patient.drug.openfda.brand_name"},
    productType:      {label: "Product type",            paramName: "patient.drug.openfda.product_type"},
    route:            {label: "Route of administration", paramName: "patient.drug.openfda.route"}
  },
  paramsList: function() {
    return _.object(_.map(this.paramNameMap, function(value, id) {
      return [id, value.label];
    }));
  },
  predicate: function(value, paramId) {
    return this.paramNameMap[paramId].paramName + ':"' + value + '"';
  },
  conjunction: function(param1, param2) {
    return param1 + "+AND+" + param2;
  },
  constructLimit: function(limit) {
    if (limit)
      return "&limit=" + parseInt(limit);
    else
      return "";
  },
  constructCount: function(count) {
    if (count)
      return "&count=" + count.trim();
    else
      return "";
  },
  constructSearch: function(params) {
    var prefix, predicates;
    if (!params || _.isEmpty(params))
      return "";
    prefix = "search=";
    predicates = _.chain(params)
                  .map(this.predicate)
                  .reduce(this.conjunction)
                  .value();

    return prefix + predicates;
  },
  updateData: function(key, value) {
    var data = {},
        self = this;
    data[key] = value;
    this.setState(data, function() { self.handleChange(); });
  },
  updateCount: function(val) { return this.updateData.apply(this, ["count"].concat(val)); },
  updateLimit: function(val) { return this.updateData.apply(this, ["limit"].concat(val)); },
  updateSearch: function(val) { return this.updateData.apply(this, ["search"].concat(val)); },
  handleChange: function() {
    this.props.updateQuery(this.makeQueryString());
  },
  render: function() {

    info = "All predicates are simply joined with a boolean AND. Take note!";

    return ReactBootstrap.Panel({},
                                React.DOM.form({role: "form"},
                                               React.DOM.p({}, info),
                                               // Need to add handleChanges for below
                                               Params({paramsList: this.paramsList(), updateSearch: this.updateSearch}, null),
                                               Count({updateCount: this.updateCount}, null),
                                               Limit({updateLimit: this.updateLimit}, null)
                                              )
                               );
  }
});

var Params = React.createClass({
  displayName: "Params",
  getInitialState: function() {
    return {
      activePredicates: {}
    };
  },
  updateParam: function(predicateType, value) {
    var activePreds = this.state.activePredicates;
    activePreds[predicateType] = value;
    this.setState({activePredicates: activePreds});
    this.props.updateSearch(this.state.activePredicates);
  },
  addParam: function(predicateType) {
    this.updateParam(predicateType, "");
  },
  removeParam: function(predicateType) {
    var activePreds = this.state.activePredicates;
    delete activePreds[predicateType];
    this.setState({activePredicates: activePreds});
    this.props.updateSearch(this.state.activePredicates);
  },
  unusedPredicates: function() {
    var self                  = this,
        availablePredicateIds = _.difference(_.keys(this.props.paramsList), _.keys(this.state.activePredicates)),
        predicatesWithLabels  = _.object(_.map(availablePredicateIds, function(id) {
          return [id, self.props.paramsList[id]];
        }));

    // { id: long name, id2: long name }
    return predicatesWithLabels;
  },
  render: function() {
    var self = this,
        args = [{}, ParamAdder({unusedPredicates: this.unusedPredicates, addParam: this.addParam}, null)];

    args = args.concat(_.map(this.state.activePredicates, function(value, id) {
      return Param({label: self.props.paramsList[id], id: id, removable: true, type: "text", updateParam: self.updateParam, removeParam: self.removeParam, value: value}, null);
    }));

    return React.DOM.div.apply(this, args);
  }
});

var ParamAdder = React.createClass({
  displayName: "ParamAdder",
  addParam: function(key) {
    this.props.addParam(key);
  },
  render: function() {
    var unusedPredicatesOptions = _.map(this.props.unusedPredicates(), function(itemDescription, itemId) {
      return ReactBootstrap.MenuItem({key: itemId}, itemDescription);
    });

    var selectArgs = [{
      //className: "form-control",
      title: "Add a predicate",
      onSelect: this.addParam,
      disabled: !unusedPredicatesOptions.length
    }].concat(unusedPredicatesOptions);

    return ReactBootstrap.DropdownButton.apply(this, selectArgs);
  }
});

var Param = React.createClass({
  displayName: "Param",
  handleChange: function(e) {
    if (this.props.updateParam)
      this.props.updateParam(this.props.id, e.target.value);
    else {
      updater = this.props.updateLimit || this.props.updateCount;
      updater(e.target.value);
    }
    this.setState({value: e.target.value});
  },
  removable: function() {
    if (this.props.removable)
      return RemoveButton({remove: this.remove}, null);
    else
      return "";
  },
  remove: function() {
    this.props.removeParam(this.props.id);
  },
  getInitialState: function() {
    return {
      value: (this.props.defaultValue ? this.props.defaultValue : "")
    };
  },
  render: function() {
    return ReactBootstrap.Input({ref: this.props.id, addonAfter: this.removable(), label: this.props.label, id: this.props.id, value: this.props.value, type: this.props.type, onChange: this.handleChange}, null);
  }
});

var RemoveButton = React.createClass({
  handleClick: function() {
    this.props.remove();
  },
  render: function() {
    return ReactBootstrap.Button({onClick: this.handleClick}, ReactBootstrap.Glyphicon({glyph: "remove"}, null));
  },
  // ReactBootstrap.Input doesn't recognize when a button is passed as an addon.
  componentDidMount: function() {
    var parent = this.getDOMNode().parentElement;
    if (parent.classList.contains("input-group-addon"))
      this.getDOMNode().parentElement.className = "input-group-btn";
  }
});

var Count = React.createClass({
  displayName: "CountAdder",
  render: function() {
    return React.DOM.p({}, "A bootstrap checkbox-listbox combo.");
  }
});

var Limit = React.createClass({
  displayName: "Limit",
  render: function() {
    return Param({updateLimit: this.props.updateLimit, label: "# of results (max 100)", type: "text" }, null);
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
    return ReactBootstrap.Panel({header: "graph dat data"}, "");
  }
});


React.renderComponent(
  OpenFDABrowser(),
  document.getElementById('main')
);
