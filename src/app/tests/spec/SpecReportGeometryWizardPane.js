require([
    'app/_ReportGeometryWizardPane',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/dom-attr',

    'dojo/topic',

    'esri/geometry/Polyline'

], function(
    WidgetUnderTest,

    win,

    domConstruct,
    domAttr,

    topic,

    Geometry
) {
    describe('app/_ReportGeometryWizardPane', function() {
        var testWidget,
            goodPolyline = new Geometry({
                "type": "polyline",
                "paths": [
                    [
                        [242994.6799999997, 4514126.4399999995],
                        [243094, 4514138.92],
                        [243228.6299999999, 4514162.800000001],
                        [243248.40000000037, 4514167.01],
                        [243303.59999999963, 4514180.01],
                        [243387, 4514202.51],
                        [243414.40000000037, 4514211.01],
                        [243497.90000000037, 4514238.51],
                        [243553.40000000037, 4514259.01],
                        [243608.40000000037, 4514281.01],
                        [243960.09999999963, 4514434.01],
                        [244041.90000000037, 4514469.01],
                        [244069.40000000037, 4514480.01],
                        [244258.7000000002, 4514563.51],
                        [244286.7999999998, 4514573.51],
                        [244313.7000000002, 4514586.01],
                        [244642.40000000037, 4514728.51],
                        [244697.40000000037, 4514752.51],
                        [244753, 4514775.51],
                        [244836.7000000002, 4514808.01],
                        [244921.59999999963, 4514838.51],
                        [245036.40000000037, 4514876.01],
                        [245095, 4514893.51],
                        [245184.2999999998, 4514918.01],
                        [245250.25999999978, 4514934.470000001],
                        [245363.09999999963, 4514959.51],
                        [245422.09999999963, 4514971.01],
                        [245452, 4514975.51],
                        [245511, 4514986.51],
                        [245571.40000000037, 4514996.01],
                        [245631, 4515003.51],
                        [245691.09999999963, 4515009.51],
                        [245828.7000000002, 4515021.51],
                        [245903.90000000037, 4515026.51],
                        [246024.7000000002, 4515030.01],
                        [246085.2999999998, 4515030.01],
                        [246176.2000000002, 4515028.01],
                        [246267, 4515023.51],
                        [246328.09999999963, 4515019.51],
                        [246389.7999999998, 4515014.51],
                        [246450.90000000037, 4515008.01],
                        [246542.7000000002, 4514996.51],
                        [246603.7000000002, 4514987.51],
                        [246694.09999999963, 4514971.51],
                        [246763.40000000037, 4514957],
                        [246873.40000000037, 4514933.01],
                        [246962.90000000037, 4514910.51],
                        [247080.8799999999, 4514877.460000001],
                        [247111.7999999998, 4514869.01],
                        [247485.5, 4514765.51],
                        [247715, 4514703.01],
                        [247801.2000000002, 4514678.51],
                        [247976.90000000037, 4514630.51],
                        [248063.90000000037, 4514607.51],
                        [248327.40000000037, 4514541.01],
                        [248475.7999999998, 4514506.01],
                        [248635.7999999998, 4514470.01],
                        [248648.59999999963, 4514467.51],
                        [248746.59999999963, 4514446.51],
                        [249047.09999999963, 4514386.51],
                        [249207.7999999998, 4514358.51],
                        [249508.2000000002, 4514309.01],
                        [249728.2000000002, 4514275.800000001],
                        [249813.09999999963, 4514263.51],
                        [249967.2999999998, 4514245.01],
                        [250122, 4514225.01],
                        [250434.90000000037, 4514189.01],
                        [250591.7999999998, 4514172.51],
                        [250748.59999999963, 4514156.51],
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

        beforeEach(function() {
            testWidget = new WidgetUnderTest({},
                domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });

        afterEach(function() {
            testWidget.destroy(false);
            testWidget = null;
        });

        it('creates a valid object', function() {
            expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
        });

        describe('valid', function() {
            describe('shapefile', function() {
                it('should be invalid if file upload is empty', function() {
                    expect(testWidget.valid()).toEqual(false);
                });
            });

            describe('user drawn geometry', function() {
                it('should be valid if area is smaller than max allowed', function() {
                    testWidget.reportParams.shapefile = false;
                    testWidget.reportParams.buffer = 1;
                    testWidget.reportParams.geometry = goodPolyline;

                    expect(testWidget.valid()).toEqual(true);
                });

                it('should be invalid if buffer is less than 1', function() {
                    testWidget.reportParams.shapefile = false;
                    testWidget.reportParams.buffer = 0;
                    testWidget.reportParams.geometry = goodPolyline;

                    expect(testWidget.valid()).toEqual(false);
                });

                it('should be invalid if area is larger than max allowed', function() {
                    testWidget.reportParams.shapefile = false;
                    testWidget.reportParams.buffer = 1210000000;
                    testWidget.reportParams.geometry = goodPolyline;

                    expect(testWidget.valid()).toEqual(false);
                });
            });
        });

        describe('update', function() {
            it('sets the buffer', function() {
                var node = domConstruct.create('input');
                domAttr.set(node, 'data-prop', 'buffer');
                domAttr.set(node, 'type', 'text');
                domAttr.set(node, 'value', '5');

                var evt = {
                    target: node
                };

                testWidget.update(evt);

                expect(testWidget.reportParams.buffer).toEqual(5);
            });

            it('sets the geometry after a user draws a shape', function() {
                testWidget.reportParams.shapefile = true;

                spyOn(testWidget, 'validate');
                topic.publish('app/report-wizard-geometry', goodPolyline);

                expect(testWidget.reportParams.geometry).toEqual(goodPolyline);
                expect(testWidget.reportParams.shapefile).toEqual(false);
                expect(testWidget.validate).toHaveBeenCalled();
            });
        });

        describe('toolChoice', function() {
            var t;

            beforeEach(function() {
                t = {
                    handler: jasmine.createSpy('handler')
                };
            });

            it('publishes an event to app to take control for everything but shapefile', function() {
                topic.subscribe('app/enable-tool', t.handler);

                var node = domConstruct.create('button');
                domAttr.set(node, 'data-prop', 'tool');
                domAttr.set(node, 'data-tool', 'line');

                var evt = {
                    target: node
                };

                var tool = testWidget.toolChoice(evt);

                expect(tool).toEqual('line');

                expect(t.handler).toHaveBeenCalledWith('line');
            });

            it('does not publish an event for uploading a shapefile', function() {
                var node = domConstruct.create('button');
                domAttr.set(node, 'data-prop', 'tool');
                domAttr.set(node, 'data-tool', 'shapefile');

                var evt = {
                    target: node
                };

                var tool = testWidget.toolChoice(evt);

                expect(tool).toEqual(undefined);

                expect(t.handler).not.toHaveBeenCalled();
            });
        });
    });
});