/*globals AGRC:true*/
require([
        'app/ReportGeneratorWizard',

        'dojo/dom-construct',

        'dojo/_base/window',

        'esri/geometry/Polyline'
    ],

    function(
        WidgetUnderTest,

        domConstruct,

        win,

        Geometry
    ) {
        describe('app/ReportGeneratorWizard', function() {
            var testWidget;
            beforeEach(function() {
                testWidget = new WidgetUnderTest({},
                    domConstruct.create('div', {}, win.body()));
                testWidget.startup();
                AGRC = {extentMaxArea: 1210000000};
            });
            afterEach(function() {
                testWidget.destroy();
                testWidget = null;
            });

            it('creates a valid object', function() {
                expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
            });

            describe('CollectData', function() {
                it('collects all the keys from the panes stateful object', function() {
                    var polyline = new Geometry({
                        "type": "polyline",
                        "paths": [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        "_path": 0,
                        "spatialReference": {
                            "wkid": 26912,
                            "latestWkid": 26912
                        },
                        "_extent": {
                            "xmin": 242994.6799999997,
                            "ymin": 4514126.4399999995,
                            "xmax": 250811.23000000045,
                            "ymax": 4515030.01,
                            "spatialReference": {
                                "wkid": 26912,
                                "latestWkid": 26912
                            }
                        },
                        "_partwise": null
                    });

                    testWidget.panes[0].reportParams.set('type', 'main');
                    testWidget.panes[1].reportParams.set('buffer', 1);
                    testWidget.panes[1].reportParams.set('geometry', polyline);
                    testWidget.panes[2].reportParams.set('name', 'my report');

                    var data = testWidget.collectData();
                    expect(data).toEqual({
                        type: 'main',
                        buffer: 1,
                        geometry: polyline,
                        name: 'my report',
                        shapefile: false,
                        zip: null
                    });
                });
            });

            describe('valid', function() {
                it('validates all panes', function() {
                    var polyline = new Geometry({
                        "type": "polyline",
                        "paths": [
                            [
                                [242994.6799999997, 4514126.4399999995],
                                [243094, 4514138.92],
                                [243228.6299999999, 4514162.800000001],
                                [250811.23000000045, 4514150.75]
                            ]
                        ],
                        "_path": 0,
                        "spatialReference": {
                            "wkid": 26912,
                            "latestWkid": 26912
                        },
                        "_extent": {
                            "xmin": 242994.6799999997,
                            "ymin": 4514126.4399999995,
                            "xmax": 250811.23000000045,
                            "ymax": 4515030.01,
                            "spatialReference": {
                                "wkid": 26912,
                                "latestWkid": 26912
                            }
                        },
                        "_partwise": null
                    });

                    testWidget.panes[0].reportParams.set('type', 'main');
                    testWidget.panes[1].reportParams.set('buffer', 1);
                    testWidget.panes[1].reportParams.set('geometry', polyline);
                    testWidget.panes[2].reportParams.set('name', 'my report');

                    spyOn(testWidget.panes[0], 'validate').andCallThrough();
                    spyOn(testWidget.panes[1], 'validate').andCallThrough();
                    spyOn(testWidget.panes[2], 'validate').andCallThrough();

                    expect(testWidget.isValid()).toEqual(true);
                    expect(testWidget.panes[0].validate).toHaveBeenCalled();
                    expect(testWidget.panes[1].validate).toHaveBeenCalled();
                    expect(testWidget.panes[2].validate).toHaveBeenCalled();
                });
            });
        });
    });