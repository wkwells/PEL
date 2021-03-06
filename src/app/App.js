define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/_base/window',

    'dojo/topic',
    'dojo/aspect',
    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/toolbars/draw',
    'esri/graphic',
    'esri/symbols/SimpleLineSymbol',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMapSelector',

    'ijit/widgets/layout/SideBarToggler',
    'ijit/widgets/authentication/LoginRegister',

    'app/ReportGeneratorWizard',
    'app/GeometryFromRoute',

    //no mapping
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function(
    template,

    declare,
    lang,
    Color,
    win,

    topic,
    aspect,
    domConstruct,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Draw,
    Graphic,
    SimpleLineSymbol,

    BaseMap,
    FindAddress,
    MagicZoom,
    BaseMapSelector,

    SideBarToggler,
    LoginRegister,

    Wizard,
    GeometryFromRoute
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,

        templateString: template,

        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        //esri/toolbars/draw
        drawingToolbar: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.app::constructor', arguments);

            AGRC.app = this;

            this.inherited(arguments);
        },
        postCreate: function() {
            // summary:
            //      Fires when widget has been build
            console.log('app.app::postCreate', arguments);

            // set version number
            this.version.innerHTML = AGRC.version;

            this.inherited(arguments);

            this.login = new LoginRegister({
                appName: AGRC.appName,
                logoutDiv: this.logoutDiv,
                securedServicesBaseUrl: AGRC.urls.baseUrl
            });
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.app::startup', arguments);

            var toggler,
                geocoder,
                zoomer,
                cityZoomer,
                wizard;

            this.initMap();

            toggler = new SideBarToggler({
                sidebar: this.sideBar.domNode,
                mainContainer: this.mainContainer,
                map: this.map,
                centerContainer: this.centerContainer.domNode
            }, this.sidebarToggle);

            geocoder = new FindAddress({
                map: this.map,
                apiKey: AGRC.apiKey
            }, this.geocodeNode);

            zoomer = new MagicZoom({
                map: this.map,
                mapServiceURL: AGRC.urls.vector,
                searchLayerIndex: 4,
                searchField: 'NAME',
                placeHolder: 'place name...',
                maxResultsToDisplay: 10,
                'class': 'first'
            }, this.gnisNode);

            cityZoomer = new MagicZoom({
                map: this.map,
                mapServiceURL: AGRC.urls.vector,
                searchLayerIndex: 1,
                searchField: 'NAME',
                placeHolder: 'city name...',
                maxResultsToDisplay: 10
            }, this.cityNode);

            wizard = new Wizard({
                url: AGRC.urls.mainReport,
                resultName: 'url'
            }, this.reportNode);

            this.routeMilepost = new GeometryFromRoute({
                url: AGRC.urls.routeMilepost
            });

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      sets up the topics and ons and aspects
            //
            console.log('app.app::setupConnections', arguments);

            this.subscribe('app/enable-tool', lang.hitch(this, 'activateTool'));
            this.subscribe('app/wizard-reset', lang.hitch(this, 'removeGraphic'));
            this.subscribe('app/publish-graphic', lang.hitch(this, 'publishGraphic'));

            this.drawingToolbar.on('draw-end', lang.hitch(this, 'publishGraphic'));
        },
        activateTool: function(tool) {
            // summary:
            //      handles the topic app/enable-tool
            // tool: string: route-mile-post, line, polygon
            console.log('app.app::activateTool', arguments);

            this.drawingToolbar.deactivate();

            if (!tool) {
                return;
            }

            switch (tool) {
                case 'shapefile':
                    if (this.activeGraphic) {
                        this.map.graphics.remove(this.activeGraphic);
                        this.activeGraphic = null;
                    }
                    break;
                case 'route-mile-post':
                    this.routeMilepost.show();
                    break;
                case 'line':
                    this.drawingToolbar.activate(Draw.POLYLINE);
                    break;
                case 'polygon':
                    this.drawingToolbar.activate(Draw.POLYGON);
                    break;
            }
        },
        publishGraphic: function(evt) {
            // summary:
            //      handles the toolbars draw-end event.
            // evt
            console.log('app.app::publishGraphic', arguments);

            if (!evt || !evt.geometry) {
                return;
            }

            if (this.activeGraphic) {
                this.map.graphics.remove(this.activeGraphic);
                this.activeGraphic = null;
            }

            this.activeGraphic = new Graphic(evt.geometry, this.graphicSymbol);

            this.map.setExtent(this.activeGraphic.geometry.getExtent(), true);
            this.map.graphics.add(this.activeGraphic);

            topic.publish('app/report-wizard-geometry', this.activeGraphic.geometry);
        },
        initMap: function() {
            // summary:
            //      Sets up the map
            console.info('app.app::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false
            });

            this.graphicSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                new Color('428bca'), 3);

            var selector;

            selector = new BaseMapSelector({
                map: this.map,
                id: 'claro',
                position: 'TR'
            });

            this.drawingToolbar = new Draw(this.map);
        },
        removeGraphic: function() {
            // summary:
            //      removes the map graphic
            console.log('app.app::removeGraphic', arguments);

            this.map.graphics.remove(this.activeGraphic);
        }
    });
});