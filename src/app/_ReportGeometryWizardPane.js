define([
    'dojo/text!app/templates/_ReportGeometryWizardPane.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-class',
    'dojo/dom-attr',

    'dojo/on',
    'dojo/Stateful',
    'dojo/topic',
    'dojo/json',

    'esri/request',

    'agrc/modules/string',

    'app/_ReportWizardPaneBaseMixin'
], function(
    template,

    declare,
    lang,

    domClass,
    domAttr,

    on,
    Stateful,
    topic,
    json,

    esriRequest,

    strings,

    _WizardPaneBase
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare('app._ReportGeometryWizardPane', [_WizardPaneBase], {

        templateString: template,

        // numbersOnly: Regex
        numbersOnly: null,

        // activeTool: domNode
        activeTool: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log(this.declaredClass + '::constructor', arguments);

            this.numbersOnly = new RegExp('^[0-9.]+$');
            this.reportParams = new Stateful({
                geometry: null,
                buffer: 1,
                _bufferSetter: function(value) {
                    this.buffer = +value;
                },
                shapefile: false,
                zip: null
            });
        },
        postCreate: function() {
            // summary:
            //       This is fired after all properties of a widget are defined, 
            //       and the document fragment representing the widget is created—but
            //       before the fragment itself is added to the main document.
            console.log(this.declaredClass + '::postCreate', arguments);

            this.setupConnections();
            this.setupDisplay();
        },
        setupConnections: function() {
            // summary:
            //      connects, subscribes, watches
            console.log(this.declaredClass + '::setupConnections', arguments);

            this.subscribe('app/report-wizard-geometry', lang.hitch(this, 'setGeometry'));

            this.own(
                on(this.bufferInput, 'change', lang.hitch(this, 'update')),
                on(this.bufferInput, 'keyup', lang.hitch(this, 'update'))
            );

            this.reportParams.watch('geometry', lang.hitch(this, 'isValid'));
            this.reportParams.watch('buffer', lang.hitch(this, 'isValid'));
            this.reportParams.watch('shapefile', lang.hitch(this, 'isValid'));
            this.reportParams.watch('zip', lang.hitch(this, 'isValid'));
        },
        setupDisplay: function() {
            // summary:
            //      hides and shows nodes in the pane
            // 
            console.log(this.declaredClass + '::setupDisplay', arguments);

            domClass.add(this.shapefileGroup, 'hidden');
            domClass.add(this.drawingGroup, 'hidden');
        },
        update: function(evt) {
            // summary:
            //      updates the buffer radius
            // evt
            console.log(this.declaredClass + '::update', arguments);

            var data = this.getDataFromTextboxEvent(evt);
            this.reportParams.set(data.prop, data.value);
        },
        isValid: function() {
            // summary:
            //      validation without events or ui updates
            // 
            console.log(this.declaredClass + '::isValid', arguments);

            var valid = this.validate();

            var hideButton = true,
                disableButton = !valid;

            this.emit('on-validate', {
                button: 'next',
                hideButton: !hideButton,
                disableButton: disableButton
            });

            return valid;
        },
        validate: function() {
            // summary:
            //      validates email and password values on keyup event
            // returns: Boolean
            console.log(this.declaredClass + '::validate', arguments);

            if (this.reportParams.get('shapefile')) {
                return this.validateAsShapefile();
            }

            return this.validateDrawing();
        },
        validateAsShapefile: function() {
            // summary:
            //      validates the pane when shapefiles are selected
            // 
            console.log(this.declaredClass + '::validateAsShapefile', arguments);

            var file = this.reportParams.get('zip'),
                state = true,
                css = null;

            if (!file){
                state = false;
            }

            css = state ? 'glyphicon-ok-sign green' : 'glyphicon-exclamation-sign red';
            domClass.replace(this.fileStatus, 'glyphicon ' + css);

            return state;
        },
        validateDrawing: function() {
            // summary:
            //      validates the unique geometry view
            console.log(this.declaredClass + '::validateDrawing', arguments);

            var buffer = this.reportParams.buffer,
                geometry = this.reportParams.geometry;

            if (this.numbersOnly.test(buffer) && buffer > 0) {
                domClass.replace(this.bufferGroup, 'has-success', 'has-error');
            } else {
                domClass.replace(this.bufferGroup, 'has-error', 'has-success');
            }

            //update ui
            var css = this.reportParams.get('geometry') === null ? 'glyphicon-exclamation-sign red' : 'glyphicon-ok-sign green';
            domClass.replace(this.geometryStatus, 'glyphicon ' + css);

            if (!geometry || buffer < 1) {
                return false;
            }

            var area = this.getAreaOfExtent(geometry.getExtent(), buffer),
                acceptableArea = area <= AGRC.extentMaxArea;

            css = acceptableArea ? 'glyphicon-ok-sign green' : 'glyphicon-exclamation-sign red';
            domClass.replace(this.geometrySize, 'glyphicon ' + css);

            if (!acceptableArea) {
                var percentOver = ((area - AGRC.extentMaxArea) / area) * 100;
                this.geometryText.innerHTML = 'Shape is too large. Reduce your shape by ' + Math.round(percentOver * 100) / 100 + '%.';

                return false;
            }

            this.geometryText.innerHTML = '';

            return true;
        },
        setGeometry: function(geom) {
            // summary:
            //      topic subscription to geometry drawing
            // geom: the geometry of the shape to use for the report
            console.log(this.declaredClass + '::setGeometry', arguments);

            // set the geometry
            this.reportParams.set('geometry', geom);
            this.reportParams.set('shapefile', false);
        },
        getAreaOfExtent: function(extent, buffer) {
            // summary:
            //      gets the area of an esri.geometry.Extent
            // extent: esri/geometry/Extent
            //      the extent to get the area from
            // buffer: number
            //      the number of feet to buffer by
            console.log(this.declaredClass + '::getAreaOfExtent', arguments);

            var length = extent.xmax - extent.xmin,
                width = extent.ymax - extent.ymin,
                meterBuffer = 0;

            //coordinates are in meters, convert buffer to meters
            if (buffer > 0) {
                meterBuffer = 0.3048 * buffer;
            }

            length = length + meterBuffer;
            width = width + meterBuffer;

            return length * width;
        },
        uploadFile: function() {
            // summary:
            //      uploads the file to the gp service
            // 
            console.log(this.declaredClass + '::uploadFile', arguments);

            esriRequest({
                url: AGRC.urls.uploadUrl,
                form: this.uploadForm,
                content: {
                    f: "json"
                },
                handleAs: "json"
            }).then(lang.hitch(this, '_setUploadedFileId'));
        },
        _setUploadedFileId: function(response) {
            // summary:
            //      sets the 
            // response
            // {
            // "success": true,
            // "item": {
            //     "itemID": "iad35b26f-8f2a-410b-aa55-0542d7bbb3b2",
            //     "itemName": "KaneAddressPoints.zip",
            //     "description": null,
            //     "date": 1384453020224,
            //     "committed": true
            // }
            console.log(this.declaredClass + '::_setUploadedFileId', arguments);

            if (!response.success)
                return;

            for(var prop in response.item){
                if(prop != 'itemID'){
                    delete response.item[prop];
                }
            }

            this.reportParams.set('zip', json.stringify(response.item));
        },
        toolChoice: function(evt) {
            // summary:
            //      publishes the event that a user wants to define their area of interest
            // evt: button click event
            console.log(this.declaredClass + '::toolChoice', arguments);

            var data = this.getDataFromButtonClick(evt);

            if (this.activeTool) {
                domClass.remove(this.activeTool, 'btn-primary');
            }

            this.activeTool = data.node;
            domClass.add(this.activeTool, 'btn-primary');

            if (data.value === 'shapefile') {
                this.reportParams.set('shapefile', true);
                this.reportParams.geometry = null;

                domClass.remove(this.shapefileGroup, 'hidden');
                domClass.add(this.drawingGroup, 'hidden');

                return;
            }

            domClass.add(this.shapefileGroup, 'hidden');
            domClass.remove(this.drawingGroup, 'hidden');

            topic.publish('app/enable-tool', data.value);

            return data.value;
        }
    });
});