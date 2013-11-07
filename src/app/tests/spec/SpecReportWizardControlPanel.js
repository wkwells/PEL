require([
    'app/_ReportWizardControlPanel',

    'dojo/dom-construct',
    'dojo/dom-attr',

    'dojo/_base/window'
], function(
    WidgetUnderTest,

    domConstruct,
    domAttr,

    win
) {
    describe('app/_ReportWizardControlPanel', function() {
        var testWidget;

        beforeEach(function() {
            testWidget = new WidgetUnderTest({
                    panes: [{
                        startup: function() {},
                        on: function(){},
                        onShow: function(){}
                    }, {
                        startup: function() {},
                        on: function(){},
                        onShow: function(){}
                    }, {
                        startup: function() {},
                        on: function(){},
                        onShow: function(){}
                    }],
                    parentWidget: {
                        gp: {
                            on: function(){}
                        },
                        sc: {
                            selectChild: function() {}
                        }
                    }
                },
                domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });

        afterEach(function() {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function() {
            expect(testWidget).toEqual(jasmine.any(WidgetUnderTest));
        });

        describe('panes', function(){
            it('sets the first middle and last flag on all panes', function(){
                expect(testWidget.panes[0].first).toEqual(true);
                expect(testWidget.panes[0].middle).toEqual(false);
                expect(testWidget.panes[0].last).toEqual(false);

                expect(testWidget.panes[1].first).toEqual(false);
                expect(testWidget.panes[1].middle).toEqual(true);
                expect(testWidget.panes[1].last).toEqual(false);
                
                expect(testWidget.panes[2].first).toEqual(false);
                expect(testWidget.panes[2].middle).toEqual(false);
                expect(testWidget.panes[2].last).toEqual(true);
            });
        });

        describe('next', function() {
            it('does not go out of bounds forward', function() {
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                testWidget.next();
                expect(testWidget.pointer.get('position')).toEqual(2);
            });

            it('does not go out of bounds backward', function() {
                testWidget.next();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                testWidget.previous();
                expect(testWidget.pointer.get('position')).toEqual(0);
            });
        });
    });
});