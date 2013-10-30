define([
    'dojo/text!app/templates/GeometryFromRouteTemplate.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/window',
    'dojo/_base/Color',

    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/dom-attr',

    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'esri/tasks/Geoprocessor',
    'esri/graphic',
    'esri/symbols/SimpleLineSymbol',

    'app/resources/routes',

    'jquery/jquery'
], function(
    template,

    declare,
    lang,
    win,
    Color,

    domConstruct,
    domClass,
    domAttr,

    topic,

    _WidgetBase,
    _TemplatedMixin,

    Geoprocessor,
    Graphic,
    SimpleLineSymbol,

    routes
) {
    return declare('app/GeometryFromRoute', [_WidgetBase, _TemplatedMixin], {
        baseClass: 'geometry-from-route',

        templateString: template,

        routeName: null,

        start: 0,

        end: 0,

        url: null,

        postCreate: function() {
            // summary:
            //      its a postCreate
            console.log(this.declaredClass + '::postCreate', arguments);

            var that = this;

            for (var i = routes.length - 1; i >= 0; i--) {
                var option = domConstruct.toDom(lang.replace('<option value="{0}">{0}</option>', [routes[i]]));
                domConstruct.place(option, this.routeNode);
            }

            this.initGp(this.url);

            domConstruct.place(this.domNode, win.body());

            // this is to make sure that bootstrap is loaded after jQuery
            require(['bootstrap'], function() {
                that.modal = $(that.modalDiv).modal({
                    backdrop: 'static',
                    keyboard: false,
                    show: false
                });
            });
        },
        hide: function() {
            // summary:
            //      hides the modal dialog
            console.log(this.declaredClass + '::hideDialog', arguments);

            $(this.modalDiv).modal('hide');
        },
        show: function() {
            // summary:
            //      shows the login modal
            //
            console.log(this.declaredClass + '::show', arguments);

            $(this.modalDiv).modal('show');
        },
        submit: function() {
            // summary:
            //      submits the values to the gp service
            //
            console.log(this.declaredClass + '::submit', arguments);

            var valid = this.validate();

            if (!valid) {
                return;
            }

            this.submitJob();
        },
        updateValues: function() {
            // summary:
            //      updates the values from the widget
            // evt
            console.log(this.declaredClass + '::updateValues', arguments);

            this.routeName = this.routeNode.value || 0;
            this.start = +this.startNode.value || 0;
            this.end = +this.endNode.value || 0;

            this.validate();
        },
        validate: function() {
            // summary:
            //      validates inputs
            //
            console.log(this.declaredClass + '::validate', arguments);

            var valid = true;

            var elements = [this.routeNode.parentElement, this.startNode.parentElement, this.endNode.parentElement];
            for (var i = elements.length - 1; i >= 0; i--) {
                domClass.remove(elements[i], 'has-error');
            }

            if (!this.routeName) {
                valid = false;
                domClass.add(this.routeNode.parentElement, 'has-error');
            }

            if (this.start < 0 || this.start >= this.end) {
                valid = false;
                domClass.add(this.startNode.parentElement, 'has-error');
            }

            if (this.end < 0 || this.end <= this.start) {
                valid = false;
                domClass.add(this.endNode.parentElement, 'has-error');
            }

            return valid;
        },
        initGp: function(url) {
            // summary:
            //      description
            console.info(this.declaredClass + '::initGp', arguments);

            this.gp = new Geoprocessor(url);

            this.own(
                this.gp.on('job-complete', lang.hitch(this, 'gpComplete')),
                this.gp.on('get-result-data-complete', lang.hitch(this, 'displayResult'))
            );
        },
        submitJob: function() {
            // summary:
            //      sends the download filter to the gp service
            console.log(this.declaredClass + '::submitJob', arguments);

            domAttr.set(this.submitButton, 'disabled', true);

            var gpObject = {
                'Route_ID': this.routeName,
                'Start_Milepost': this.start,
                'End_Milepost': this.end
            };

            this.gp.submitJob(gpObject);
        },
        gpComplete: function(status) {
            // summary:
            //      description
            // status: esri/tasks/JobInfo
            console.log(this.declaredClass + '::gpComplete', arguments);

            domAttr.set(this.submitButton, 'disabled', false);

            switch (status.jobInfo.jobStatus) {
                case 'esriJobCancelling':
                case 'esriJobCancelled':
                    break;
                case 'esriJobSucceeded':
                    this.gp.getResultData(status.jobInfo.jobId, 'routeSegment',
                        function() {
                            //success
                        },
                        lang.hitch(this,
                            function(eb) {
                                console.log(eb);
                                this.errorDiv.innerHTML = eb;
                            })
                    );
                    break;
                case 'esriJobFailed':
                    this.onFail(status.jobInfo);
                    break;
            }
        },
        onFail: function(status) {
            // summary:
            //      description
            // status: esri/tasks/JobInfo
            console.log(this.declaredClass + '::onFail', arguments);

            domAttr.remove(this.submitButton, 'disabled');
            this.errorDiv.innerHTML = 'Your mile posts may be out of range. ' + status.messages;

        },
        displayResult: function(response) {
            // summary:
            //      sets the download link's href
            // data: the esri/tasks/ParameterInfo object
            console.log(this.declaredClass + '::displayResult', arguments);

            this.hide();

            var feature = response.result.value.features[0];

            topic.publish('app/publish-graphic', feature);
        }
    });
});