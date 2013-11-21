define([
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-attr',
    'dojo/dom-class',

    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/tasks/Geoprocessor'
], function(
    declare,
    lang,

    domAttr,
    domClass,

    topic,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Geoprocessor
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,

        baseClass: 'report-wizard',

        // gp: esri/tasks/geoprocessing
        gp: null,

        //async gp task job id
        jobId: null,

        // parameters passed in via the constructor

        // parentWidget: a reference to the parent widget
        parentWidget: null,

        // url: url to gp tool
        url: null,

        //resultName: string property to request the result from the gp
        resultName: null,

        postCreate: function() {
            console.info('app._ReportWizardAsyncGeoprocessing::postCreate', arguments);

            this.inherited(arguments);

            this.initGp(this.url);
        },
        initGp: function(url) {
            // summary:
            //      creates the gp
            //
            console.log('app._ReportWizardAsyncGeoprocessing::initGp', arguments);

            this.gp = new Geoprocessor(url);

            this.own(
                this.gp.on('job-complete', lang.hitch(this, 'gpComplete')),
                this.gp.on('status-update', lang.hitch(this, 'statusUpdate')),
                this.gp.on('job-cancel', lang.hitch(this, 'jobCancelled'))
            );
        },
        submitJob: function(data) {
            // summary:
            //      sends the download filter to the gp service
            console.log('app._ReportWizardAsyncGeoprocessing::submitJob', arguments);

            this.gp.submitJob(data);
        },
        cancelJob: function() {
            // summary:
            //      cancels the download job
            console.log('app._ReportWizardAsyncGeoprocessing::cancelJob', arguments);

            try {
                //throws error if it's already done and you try to cancel
                this.gp.cancelJob(this.jobId);
            } catch (a) {}
        },
        jobCancelled: function() {
            // summary:
            //      successful cancel
            console.log('app._ReportWizardAsyncGeoprocessing::jobCancelled', arguments);
        },
        statusUpdate: function(status) {
            // summary:
            //      status updates from the gp service
            // jobinfo: esri/tasks/JobInfo
            console.log('app._ReportWizardAsyncGeoprocessing::statusUpdate', arguments);

            this.jobId = status.jobInfo.jobId;
        },
        gpComplete: function(status) {
            // summary:
            //      description
            // status: esri/tasks/JobInfo
            console.log('app._ReportWizardAsyncGeoprocessing::gpComplete', arguments);

            if (status.jobInfo.jobStatus === 'esriJobSucceeded' && this.resultName) {
                this.gp.getResultData(status.jobInfo.jobId, this.resultName);
            }
        }
    });
});