require([
    'app/_ReportTypeWizardPane',

    'dojo/dom-construct',
    'dojo/dom-attr',

    'dojo/_base/window'
], function(
    WidgetUnderTest,

    domConstruct,
    domAttr,

    win
) {
    describe('app/_ReportTypeWizardPane', function() {
        var testWidget;

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
            it('it should not be valid if empty', function() {
                expect(testWidget.valid()).toEqual(false);
            });

            it('it should be valid with text input', function() {
                testWidget.reportParams.set('type', 'catex');

                expect(testWidget.valid()).toEqual(true);
            });
        });

        describe('update', function() {
            it('it should set report type param', function() {
                var node = domConstruct.create('button');
                domAttr.set(node, 'data-prop', 'type');
                domAttr.set(node, 'data-type', 'main');

                var evt = {
                    target: node
                };

                testWidget.update(evt);

                expect(testWidget.reportParams.get('type')).toEqual('main');
            });
        });
    });
});