define([
    'dojo/text!app/templates/_ReportNameWizardPane.html',

    'dojo/_base/declare',

    'dojo/Stateful',

    'app/_ReportWizardPaneBaseMixin'
], function(
    template,

    declare,

    Stateful,

    _WizardPaneBase
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare([_WizardPaneBase], {
        templateString: template,

        constructor: function() {
            // summary:
            //      constructor
            console.log('app._ReportNameWizardPane::constructor', arguments);

            this.reportParams = new Stateful({
                name: null,
                nameSetter: function(value) {
                    this.name = value.toLowerCase();
                }
            });
        },
        validate: function() {
            // summary:
            //      validates email and password values on keyup event
            // returns: Boolean
            console.log('app._ReportNameWizardPane::validate', arguments);

            var name = this.reportParams.get('name');

            if (!name) {
                return false;
            }

            return name.length > 0;
        },
        isValid: function() {
            // summary:
            //      validates without ui or events
            //
            console.log('app._ReportNameWizardPane::isValid', arguments);

            var valid = this.validate();

            var hideButton = true,
                disableButton = !valid;

            this.emit('on-validate', {
                button: 'submit',
                hideButton: !hideButton,
                disableButton: disableButton
            });

            return valid;
        },
        update: function(evt) {
            console.info('app._ReportNameWizardPane::update', arguments);

            var data = this.getDataFromTextboxEvent(evt);

            this.reportParams.set(data.prop, data.value);

            this.isValid();
        }
    });
});