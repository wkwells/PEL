define([
    'dojo/_base/declare',

    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dijit/layout/ContentPane'
], function(
    declare,

    domAttr,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,

        baseClass: 'report-wizard',

        // parameters passed in via the constructor

        // parentWidget: a reference to the parent widget
        parentWidget: null,

        getDataFromButtonClick: function(evt) {
            console.info('app._ReportWizardPaneBaseMixin::getDataFromButtonClick', arguments);

            var data = {
                node: evt.target,
                value: null
            };

            data.prop = domAttr.get(data.node, 'data-prop');
            data.value = domAttr.get(data.node, 'data-' + data.prop);

            return data;
        },
        getDataFromTextboxEvent: function(evt) {
            // summary:
            //      gets the value from a textbox
            // evt: onchange event on a input type='text'
            console.log('app._ReportWizardPaneBaseMixin::getDataFromTextboxEvent', arguments);

            var data = {
                node: evt.target,
                value: null
            };

            data.prop = domAttr.get(data.node, 'data-prop');
            data.value = domAttr.get(data.node, 'value');

            return data;
        },
        valid: function() {
            // summary:
            //      validates the widget
            console.log('app._ReportWizardPaneBaseMixin::valid', arguments);

            return this.isValid();
        },
        onShow: function() {
            // summary:
            //      onShowates the widget
            console.log('app._ReportWizardPaneBaseMixin::onShow', arguments);

            return this.isValid();
        },
        onHide: function() {
            // summary:
            //      onShowates the widget
            console.log('app._ReportWizardPaneBaseMixin::onHide', arguments);
        }
    });
});