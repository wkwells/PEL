define([
    'dojo/text!app/templates/ReportGeneratorWizard.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/request/iframe',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/_ReportWizardControlPanel',
    'app/_ReportTypeWizardPane',
    'app/_ReportGeometryWizardPane',
    'app/_ReportNameWizardPane',
    'app/_ReportWizardAsyncGeoprocessing',

    'esri/tasks/FeatureSet',
    'esri/graphic',

    'dijit/layout/StackContainer'
], function(
    template,

    declare,
    lang,
    array,

    iframe,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    ControlPanel,
    TypePane,
    GeometryPane,
    NamePane,
    AsyncGp,

    FeatureSet,
    Graphic
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare('app.ReportGeneratorWizard', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, AsyncGp], {
        baseClass: 'report-wizard',

        widgetsInTemplate: true,

        templateString: template,

        //the planners email
        email: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log(this.declaredClass + '::constructor', arguments);

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      dom is ready
            console.info(this.declaredClass + '::postCreate', arguments);

            this.inherited(arguments);

            this.setupWizard();

            this.setupConnections();
        },
        setupWizard: function() {
            // summary:
            //      sets up the wizard pane functionality
            console.log(this.declaredClass + '::setupWizard', arguments);

            var reportTypePane = new TypePane({
                parentWidget: this
            }, this.cp1),

                geometryPane = new GeometryPane({
                    parentWidget: this
                }, this.cp2),

                reportTitlePane = new NamePane({
                    parentWidget: this
                }, this.cp3),

                controls = new ControlPanel({
                    parentWidget: this,
                    panes: [reportTypePane, geometryPane, reportTitlePane]
                }, this.controlPanelNode);

            this.panes = [reportTypePane, geometryPane, reportTitlePane];

            controls.startup();
            this.sc.startup();
        },
        setupConnections: function() {
            // summary:
            //      sets up the connections obviously
            console.log(this.declaredClass + '::setupConnections', arguments);

            this.subscribe('LoginRegister/sign-in-success', lang.hitch(this, function(response) {
                this.email = response.user.email;
            }));
        },
        isValid: function() {
            console.info(this.declaredClass + '::isValid', arguments);

            // validate all the panes
            return array.every(this.panes, function(pane) {
                return pane.validate();
            }, this);
        },
        submit: function() {
            // summary:
            //      handles the submitting of the wizard
            // evt: the mouse click or submission event
            console.log(this.declaredClass + '::submit', arguments);

            if (!this.isValid()) {
                return false;
            }

            var data = this.collectData();

            this.initReportType(data);

            var gpData = this.transformData(data);

            this.submitJob(gpData);

            return true;
        },
        collectData: function() {
            // summary:
            //      collects the data parts from the various panes
            //
            console.log(this.declaredClass + '::collectData', arguments);
            var data = {};

            array.forEach(this.panes, function(pane) {
                for (var x in pane.reportParams) {
                    if (pane.reportParams.hasOwnProperty(x) &&
                        x != '_watchCallbacks' && !lang.isFunction(pane.reportParams[x])) {
                        data[x] = pane.reportParams.get(x);
                    }
                }
            }, this);

            return data;
        },
        transformData: function(data) {
            // summary:
            //      modifies the data for the gp service
            // data: object
            //      the data collected from the wizard panes
            console.log(this.declaredClass + '::transformData', arguments);
            var sourceOptions = {
                noData: 0,
                shapefile: 1,
                folderWithShapefiles: 2,
                userDrawn: 3
            },
                inputFields = {
                    default: 0,
                    userInput: 1,
                    attributes: 2
                };


            //Set units to feet
            var units = 'feet',
                reportName = data.name,
                prjID = this.email + '_' + reportName,
                features = [],
                graphic = null,
                featureSet = null;

            var gpObject = {
                Project_Name: reportName,
                Project_ID: prjID,
                Units_for_Buffer_Distance: units,
                Buffer_Distance: 0,
                Line_Source_Option: sourceOptions.noData,
                Polygon_Source_Option: sourceOptions.userDrawn,
                Input_Fields: inputFields.userInput,
                Planner: this.email
            };

            if (graphic) {
                graphic = new Graphic(data.geometry);
                featureSet = new FeatureSet();

                features.push(graphic);
                featureSet.features = features;

                gpObject.Dynamic_Project_Drawing = featureSet;

                if (graphic.geometry.type === 'polyline') {
                    gpObject.Buffer_Distance = data.buffer;
                    gpObject.Line_Source_Option = sourceOptions.userDrawn;
                    gpObject.Polygon_Source_Option = sourceOptions.noData;
                    gpObject.Input_Fields = inputFields.userInput;
                }

                return gpObject;
            } else {
                //send both as shapefile and figure out in python gp.
                gpObject.Line_Source_Option = sourceOptions.shapefile;
                gpObject.Polygon_Source_Option = sourceOptions.shapefile;
                gpObject.zip = data.zip;
            }
            return gpObject;
        },
        initReportType: function(data) {
            // summary:
            //      sets up the gp for the report type
            //      this mucks with the gp internals and could easily break
            console.log(this.declaredClass + '::initReportType', arguments);

            if (data.shapefile) {
                return data.type === 'catex' ? AGRC.urls.catexReport : AGRC.urls.mainReport;
            }

            if (data.type === 'catex') {
                this.gp.url = AGRC.urls.catexReport;

                if (!this.gp._url) {
                    this.gp._url = {
                        path: null,
                        query: null
                    };
                }

                this.gp._url.path = AGRC.urls.catexReport;
            }
        }
    });
});