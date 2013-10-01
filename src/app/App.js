define([
        'dojo/text!app/templates/App.html',

        'dojo/_base/declare',
        
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'agrc/widgets/map/BaseMap',
        'agrc/widgets/locate/FindAddress',
        'agrc/widgets/locate/MagicZoom',
        'agrc/widgets/map/BaseMapSelector',

        'ijit/widgets/layout/SideBarToggler',

        'app/reportGeneratorWizard',

        'dijit/layout/BorderContainer',
        'dijit/layout/ContentPane'
    ],

    function(
        template,
        
        declare,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        
        BaseMap,
        FindAddress,
        MagicZoom,
        BaseMapSelector,

        SideBarToggler,

        Wizard
    ) {
        return declare('app/App', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // summary:
            //      The main widget for the app

            widgetsInTemplate: true,

            templateString: template,
            
            baseClass: 'app',

            // map: agrc.widgets.map.Basemap
            map: null,

            constructor: function() {
                // summary:
                //      first function to fire after page loads
                console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);

                AGRC.app = this;

                this.inherited(arguments);
            },
            postCreate: function() {
                // summary:
                //      Fires when 
                console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

                // set version number
                this.version.innerHTML = AGRC.version;

                this.inherited(arguments);
            },
            startup: function() {
                // summary:
                //      Fires after postCreate when all of the child widgets are finished laying out.
                console.log(this.declaredClass + '::' + arguments.callee.nom, arguments);

                // call this before creating the map to make sure that the map container is 
                // the correct size
                this.inherited(arguments);

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

                wizard = new Wizard({}, this.reportNode);

                this.inherited(arguments);
            },
            initMap: function() {
                // summary:
                //      Sets up the map
                console.info(this.declaredClass + '::' + arguments.callee.nom, arguments);

                this.map = new BaseMap(this.mapDiv, {
                    useDefaultBaseMap: false
                });

                var selector;

                selector = new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR'
                });
            }
        });
    });