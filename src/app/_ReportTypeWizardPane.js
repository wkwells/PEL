define([
    'dojo/text!app/templates/_ReportTypeWizardPane.html',

    'dojo/_base/declare',

    'dojo/dom-class',

    'dojo/Stateful',

    'app/_ReportWizardPaneBaseMixin'
], function(
    template,

    declare,

    domClass,

    Stateful,

    _WizardPaneBase
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare('app._ReportTypeWizardPage', [_WizardPaneBase], {

        templateString: template,

        // activeTool: domNode
        activeTool: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log(this.declaredClass + '::constructor', arguments);

            this.reportParams = new Stateful({
                type: null,
                _typeSetter: function(value) {
                    this.type = value.toLowerCase();
                }
            });
        },
        isValid: function () {
            // summary:
            //      another validation without event emittion
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
  
            var valid = !!this.reportParams.get('type');

            return valid;
        },
        update: function(evt) {
            console.info(this.declaredClass + '::update', arguments);

            var data = this.getDataFromButtonClick(evt);
            this.reportParams.set(data.prop, data.value);

            if (this.activeTool) {
                domClass.remove(this.activeTool, 'btn-primary');
            }

            this.activeTool = data.node;
            domClass.add(this.activeTool, 'btn-primary');

            this.isValid();
        }
    });
});