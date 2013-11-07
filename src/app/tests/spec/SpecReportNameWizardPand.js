require([
    'app/_ReportNameWizardPane',

    'dojo/dom-construct',
    'dojo/dom-attr',

    'dojo/_base/window'
], function(
    WidgetUnderTest,

    domConstruct,
    domAttr,

    win
) {
    describe('app/_ReportNameWizardPane', function() {
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
                testWidget.reportParams.set('name', 'my report');

                expect(testWidget.valid()).toEqual(true);
            });
        });

        describe('update', function() {
            it('it should set report name param', function() {
                var node = domConstruct.create('input');
                domAttr.set(node, 'data-prop', 'name');
                domAttr.set(node, 'type', 'text');
                domAttr.set(node, 'value', 'title');

                var evt = {
                    target: node
                };

                testWidget.update(evt);

                expect(testWidget.reportParams.get('name')).toEqual('title');
            });
        });
    });
});