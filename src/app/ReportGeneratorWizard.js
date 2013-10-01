define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/event',

        'dojo/text!app/templates/ReportGeneratorWizard.html',

        'dojo/dom',
        'dojo/on',
        'dojo/aspect',
        'dojo/Stateful',
        'dojo/topic',

        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-attr',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/layout/StackContainer',
        'dijit/layout/ContentPane',
        'dijit/_WidgetsInTemplateMixin',

        'esri/tasks/Geoprocessor'
    ],

    function(
        declare,
        lang,
        array,
        events,

        template,

        dom,
        on,
        aspect,
        Stateful,
        topic,

        domClass,
        domConstruct,
        domAttr,

        _WidgetBase,
        _TemplatedMixin,
        StackContainer,
        ContentPane,
        _WidgetsInTemplateMixin,

        Geoprocessor
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.ReportGeneratorWizard", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            baseClass: 'report-wizard',

            widgetsInTemplate: true,

            templateString: template,

            // the template page that is visible
            currentPage: 0,

            //regex
            numbersOnly: null,

            //dojo stateful
            reportParams: null,

            //properties to validate in order to show submit button
            validationProps: ['type', 'geometry', 'buffer', 'name'],

            //esri/tasks/geoprocessing
            gp: null,

            //async gp task job id
            jobId: null,

            constructor: function() {
                // summary:
                //      constructor
                console.log(this.declaredClass + "::constructor", arguments);

                this.inherited(arguments);

                this.reportParams = new Stateful({
                    type: null,
                    geometry: null,
                    buffer: null,
                    name: null
                });

                this.numbersOnly = new RegExp("(\\d*[.])?\\d+");
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.setupWizard();

                this.setupConnections();
            },
            setupWizard: function() {
                // summary:
                //      sets up the wizard pane functionality
                console.log(this.declaredClass + "::setupWizard", arguments);

                this.pages = [this.cp1, this.cp2, this.cp3];

                this.cp1.updateParameters = lang.hitch(this, 'updateParamsFromButton');
                this.cp1.validate = lang.hitch(this, 'initReportType');

                this.cp2.updateParameters = lang.hitch(this, 'updateParamsFromTextBox');
                this.cp2.validate = lang.hitch(this, 'validateGeometryPane');
                this.cp2.onShow = lang.hitch(this, 'validateGeometryPane');
                this.cp2.next = lang.hitch(this, 'showNextPage');

                this.cp3.updateParameters = lang.hitch(this, 'updateParamsFromTextBox');
                this.cp3.validate = lang.hitch(this, 'showSubmitButton');

                this.sc.startup();
            },
            setupConnections: function() {
                // summary:
                //      sets up the connections obviously
                console.log(this.declaredClass + "::setupConnections", arguments);

                this.subscribe('app/report-wizard-geometry', lang.hitch(this, 'setGeometry'));

                this.own(
                    on(this.bufferInput, 'change', lang.hitch(this, 'updateParams')),
                    on(this.bufferInput, 'keyup', lang.hitch(this, 'updateParams'))
                );

                aspect.after(this, 'showNextPage', lang.hitch(this, 'setupWizardPane'));
                aspect.after(this, 'setGeometry', lang.hitch(this, 'displayGeometryConfirmation'));
                aspect.after(this, 'setGeometry', lang.hitch(this, 'validateGeometryPane'));
            },
            showNextPage: function(direction) {
                // summary:
                //      shows the next wizard panel
                // direction: string: forward or backward. default and null is forward.
                console.info(this.declaredClass + "::showNextPage", arguments);

                if (direction && direction == "back") {
                    if (this.currentPage > 0) {
                        this.currentPage--;
                    }

                    if (this.currentPage === 0) {
                        domClass.add(this.controlPanel, 'hidden');
                    }
                } else {
                    if (this.currentPage < 0) {
                        domClass.add(this.controlPanel, 'hidden');

                        this.currentPage = 0;

                        return;
                    }

                    if (this.currentPage < this.pages.length - 1) {
                        this.currentPage++;
                    }

                    domClass.remove(this.controlPanel, 'hidden');
                }

                var pane = this.pages[this.currentPage];
                this.sc.selectChild(pane);

                if (lang.isFunction(pane.onShow)) {
                    pane.onShow();
                }
            },
            back: function() {
                console.info(this.declaredClass + "::back", arguments);

                this.showNextPage("back");
            },
            next: function() {
                // summary:
                //      calls the next funciton of the current page
                console.log(this.declaredClass + "::next", arguments);

                var pane = this.pages[this.currentPage];
                pane.next();
            },
            updateParams: function(evt) {
                // summary:
                //      generic method called from the widget pane form elements
                // evt: the form element event. Could be click, change, keyDown, etc
                console.log(this.declaredClass + "::updateParams", arguments);

                var currentPage = this.pages[this.currentPage];
                if (lang.isFunction(currentPage.updateParameters)) {
                    currentPage.updateParameters(evt);
                }
                if (lang.isFunction(currentPage.validate)) {
                    currentPage.validate(evt);
                }

                this.showSubmitButton();
            },
            updateParamsFromButton: function(evt) {
                console.info(this.declaredClass + "::updateParamsFromButton", arguments);

                var node = evt.target,
                    prop = node.getAttribute("data-prop"),
                    value = null;

                value = node.getAttribute("data-" + prop);

                this.reportParams.set(prop, value.toLowerCase());
            },
            updateParamsFromTextBox: function(evt) {
                // summary:
                //      gets the value from a textbox
                // evt: onchange event on a input type='text'
                console.log(this.declaredClass + "::updateParamsFromTextBox", arguments);

                var node = evt.target,
                    prop = node.getAttribute("data-prop"),
                    value = null;

                value = node.value.toLowerCase();

                this.reportParams.set(prop, value.toLowerCase());
            },
            setGeometry: function(geom) {
                // summary:
                //      topic subscription to geometry drawing
                // geom: the geometry of the shape to use for the report
                console.log(this.declaredClass + "::setGeometry", arguments);

                // set the geometry
                this.reportParams.set('geometry', geom);
            },
            displayGeometryConfirmation: function() {
                // summary:
                //      handles the toggling of the has geometry flag in the wizard
                console.log(this.declaredClass + "::displayGeometryConfirmation", arguments);

                var cssState = this.reportParams.get('geometry') === null ? 'glyphicon-exclamation-sign' : 'glyphicon-ok-sign';

                domClass.replace(this.geometryStatus, "glyphicon " + cssState);
            },
            validateGeometryPane: function(cb) {
                // summary:
                //      validates the unique geometry view
                console.log(this.declaredClass + "::validateGeometryPane", arguments);

                var buffer = this.reportParams.get('buffer');

                if (this.numbersOnly.test(buffer)) {
                    domClass.add(this.bufferGroup, 'has-success', 'has-error');
                } else {
                    domClass.add(this.bufferGroup, 'has-error', 'has-success');
                }

                if (!this.reportParams.get('geometry') || !buffer) {
                    domAttr.set(this.nextButton, 'disabled', true);

                    return;
                }

                domAttr.remove(this.nextButton, 'disabled');
            },
            setupWizardPane: function() {
                // summary:
                //      handles the state of the pane and it's buttons
                console.log(this.declaredClass + "::setupWizardPane", arguments);

                this.showSubmitButton();
                this.showNextButton();
            },
            showSubmitButton: function() {
                console.info(this.declaredClass + "::showSubmitButton", arguments);

                if (!this.valid()) {
                    console.log('::showSubmitButton::!valid');

                    domClass.add(this.submitButton, 'hidden');
                    domAttr.set(this.submitButton, 'disabled', true);

                    return;
                }

                domClass.remove(this.submitButton, 'hidden');
                domAttr.set(this.submitButton, 'disabled', false);
            },
            showNextButton: function() {
                // summary:
                //      shows the next button on the content pane
                console.log(this.declaredClass + "::showNextButton", arguments);

                var pane = this.pages[this.currentPage];

                if (!lang.isFunction(pane.next)) {
                    console.log('::showNextButton::!next');

                    domClass.add(this.nextButton, 'hidden');
                    domAttr.set(this.nextButton, 'disabled', true);

                    return;
                }

                domClass.remove(this.nextButton, 'hidden');
            },
            validate: function(evt) {
                console.info(this.declaredClass + "::validate", arguments);

                if (!this.valid()) {
                    domClass.add(this.submitButton, 'hidden');
                    domAttr.set(this.submitButton, 'disabled', true);

                    events.stop(evt);
                    return;
                }
            },
            valid: function() {
                // summary:
                //      validates the download object
                console.log(this.declaredClass + "::valid", arguments);

                return array.every(this.validationProps, function(item) {
                    return !!this.reportParams.get(item);
                }, this);
            },
            publishTool: function(evt) {
                // summary:
                //      publishes the event that a user wants to define their area of interest
                // evt: button click event
                console.log(this.declaredClass + "::publishTool", arguments);

                var node = evt.target,
                    prop = node.getAttribute("data-prop"),
                    value = null;

                value = node.getAttribute("data-" + prop);

                topic.publish('app/enable-tool', value);
            },
            initReportType: function() {
                // summary:
                //      sets up the gp for the report type
                console.log(this.declaredClass + "::initReportType", arguments);

                this.showNextPage();

                var url;

                switch (this.reportParams.get("type")) {
                    case "main":
                        url = AGRC.urls.mainReport;
                        break;
                    case "catex":
                        url = AGRC.urls.catexReport;
                        break;
                }

                this.initGp(url);
            },
            initGp: function(url) {
                // summary:
                //      description
                console.info(this.declaredClass + "::initGp", arguments);

                this.gp = new Geoprocessor(url);

                this.own(
                    this.gp.on('job-complete', lang.hitch(this, 'gpComplete')),
                    this.gp.on('status-update', lang.hitch(this, 'statusUpdate')),
                    this.gp.on('get-result-data-complete', lang.hitch(this, 'displayLink')),
                    this.gp.on('job-cancel', lang.hitch(this, 'jobCancelled'))
                );
            },
            submitJob: function() {
                // summary:
                //      sends the download filter to the gp service
                console.log(this.declaredClass + "::submitJob", arguments);

                if (!this.valid()) {
                    this.messagebox.innerHTML = "You haven't chosen all the required parts.";
                    return;
                }

                this.messagebox.innerHTML = "";
                this.downloadButton.innerHTML = 'Submitting';
                this.gp.submitJob(this.reportPar);

                domClass.remove(this.cancelButton, 'hidden');
                domAttr.set(this.cancelButton, 'disabled', false);

                domClass.add(this.backButton, 'hidden');
                domAttr.set(this.backButton, 'disabled', true);

                domAttr.set(this.submitButton, 'disabled', true);
                domClass.add(this.submitButton, 'hidden');

                domAttr.set(this.downloadButton, 'disabled', null);
                domClass.remove(this.downloadButton, 'hidden');
            },
            cancelJob: function() {
                // summary:
                //      cancels the download job
                console.log(this.declaredClass + "::cancelJob", arguments);

                domAttr.set(this.cancelButton, 'disabled', null);
                domClass.add(this.cancelButton, 'hidden');

                domAttr.set(this.downloadButton, 'disabled', null);
                domClass.add(this.downloadButton, 'hidden');

                domAttr.remove(this.backButton, 'disabled');
                domClass.remove(this.backButton, 'hidden');

                domAttr.remove(this.submitButton, 'disabled');
                domClass.remove(this.submitButton, 'hidden');

                this.messagebox.innerHTML = "";

                console.log('canceling job');
                try {
                    this.gp.cancelJob(this.jobId);
                } catch (a) {}
            },
            jobCancelled: function() {
                // summary:
                //      successful cancel
                console.log(this.declaredClass + "::jobCancelled", arguments);
            },
            statusUpdate: function(status) {
                // summary:
                //      status updates from the gp service
                // jobinfo: esri/tasks/JobInfo
                console.log(this.declaredClass + "::statusUpdate", arguments);

                this.jobId = status.jobInfo.jobId;
                this.messagebox.innerHTML = "";

                switch (status.jobInfo.jobStatus) {
                    case 'esriJobSubmitted':
                        this.downloadButton.innerHTML = 'Submitted';
                        break;
                    case 'esriJobExecuting':
                        this.downloadButton.innerHTML = 'Processing';
                        break;
                    case 'esriJobSucceeded':
                        this.downloadButton.innerHTML = 'Requesting Report Url';
                        break;
                }
            },
            gpComplete: function(status) {
                // summary:
                //      description
                // status: esri/tasks/JobInfo
                console.log(this.declaredClass + "::gpComplete", arguments);

                switch (status.jobInfo.jobStatus) {
                    case 'esriJobCancelling':
                    case 'esriJobCancelled':
                        domClass.remove(this.backButton, 'hidden');
                        domAttr.set(this.backButton, 'disabled', false);

                        domClass.add(this.cancelButton, 'hidden');
                        domAttr.set(this.cancelButton, 'disabled', true);

                        domAttr.set(this.submitButton, 'disabled', false);
                        domClass.remove(this.submitButton, 'hidden');

                        domAttr.set(this.downloadButton, 'disabled', true);
                        domClass.add(this.downloadButton, 'hidden');
                        break;
                    case 'esriJobSucceeded':
                        this.gp.getResultData(status.jobInfo.jobId, 'url', null, lang.hitch(this,
                            function(eb) {
                                console.log(eb);
                                this.messagebox.innerHTML = eb;
                            }));
                        break;
                    case 'esriJobFailed':
                        domClass.remove(this.backButton, 'hidden');
                        domAttr.set(this.backButton, 'disabled', false);

                        domClass.add(this.cancelButton, 'hidden');
                        domAttr.set(this.cancelButton, 'disabled', true);

                        domAttr.set(this.submitButton, 'disabled', false);
                        domClass.remove(this.submitButton, 'hidden');

                        domAttr.set(this.downloadButton, 'disabled', true);
                        domClass.add(this.downloadButton, 'hidden');

                        this.messagebox.innerHTML = "I'm sorry but the job failed.";

                        break;
                }
            },
            displayLink: function(response) {
                // summary:
                //      sets the download link's href
                // data: the esri/tasks/ParameterInfo object
                console.log(this.declaredClass + "::displayLink", arguments);

                this.set('downloadUrl', response.result.value.url);

                domClass.remove(this.backButton, 'hidden');
                domAttr.set(this.backButton, 'disabled', false);

                domClass.add(this.cancelButton, 'hidden');
                domAttr.set(this.cancelButton, 'disabled', true);

                domAttr.set(this.submitButton, 'disabled', false);
                domClass.remove(this.submitButton, 'hidden');

                domAttr.remove(this.downloadButton, 'disabled');
            }
        });
    });