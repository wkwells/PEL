require([
        'app/GeometryFromRoute',

        'dojo/dom-construct',

        'dojo/_base/window'
    ],

    function(
        WidgetUnderTest,

        domConstruct,

        win
    ) {
        describe('app/GeometryFromRoute', function() {
            var testWidget;
            beforeEach(function() {
                testWidget = new WidgetUnderTest({url: "http://localhost/arcgis/rest/services/PEL/MilepostSegment/GPServer/Milepost_Segment"}, domConstruct.create('div', {}, win.body()));
                testWidget.startup();
            });
            afterEach(function() {
                testWidget.destroy();
                testWidget = null;
            });

            it('creates a valid object', function() {
                expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
            });

            it('builds the route select', function() {
                expect(testWidget.routeNode.childElementCount).toEqual(251);
            });
        });
    });