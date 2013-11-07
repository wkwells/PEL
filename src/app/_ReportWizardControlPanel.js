define([
    'dojo/text!app/templates/_ReportWizardControlPanel.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/dom-attr',
    'dojo/dom-class',

    'dojo/Stateful',
    'dojo/aspect',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'
], function(
    template,

    declare,
    lang,

    domAttr,
    domClass,

    Stateful,
    aspect,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
) {
    // summary:
    //      A mixin for shared code between the panes in LoginRegistration
    return declare('app._ReportWizardControlPanel', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        widgetsInTemplate: true,

        baseClass: 'report-wizard',

        // parameters passed in via the constructor

        // parentWidget: a reference to the parent widget
        parentWidget: null,

        // panes: an array of wizard panes
        panes: null,

        pointer: null,

        constructor: function() {
            // summary:
            //      constructor
            console.log(this.declaredClass + '::constructor', arguments);

            var then = this;

            this.pointer = new Stateful({
                position: 0,
                _positionSetter: function(value) {
                    if (value < 0) {
                        this.position = 0;

                        return;
                    }

                    var length = then.panes.length - 1;

                    if (value >= length) {
                        this.position = length;

                        return;
                    }

                    this.position = value;
                }
            });
        },
        postCreate: function() {
            // summary:
            //       This is fired after all properties of a widget are defined, 
            //       and the document fragment representing the widget is created—but
            //       before the fragment itself is added to the main document.
            console.log(this.declaredClass + '::postCreate', arguments);

            var last = this.panes.length - 1;

            for (var i = last; i >= 0; i--) {
                var pane = this.panes[i];

                pane.startup();
                pane.first = false;
                pane.middle = false;
                pane.last = false;

                if (i === 0) {
                    pane.first = true;
                    continue;
                }

                if (i === last) {
                    pane.last = true;
                    continue;
                }

                pane.middle = true;
            }

            this.setupConnections();
            this.updateButtonState();
        },
        setupConnections: function() {
            // summary:
            //      connects, subscribes, watches
            console.log(this.declaredClass + '::setupConnections', arguments);

            this.pointer.watch('position', lang.hitch(this, '_changePosition'));

            this.parentWidget.gp.on('status-update', lang.hitch(this, '_gpUpdating'));
            this.parentWidget.gp.on('job-complete', lang.hitch(this, '_gpComplete'));
            this.parentWidget.gp.on('get-result-data-complete', lang.hitch(this, '_gpResultComplete'));

            for (var i = this.panes.length - 1; i >= 0; i--) {
                this.panes[i].on('on-validate', lang.hitch(this, '_setButtonState'));
            }
        },
        next: function() {
            // summary:
            //      shows the next page
            console.info(this.declaredClass + '::next', arguments);

            var currentPosition = this.pointer.get('position');
            currentPosition = currentPosition + 1;

            this.pointer.set('position', currentPosition);
        },
        previous: function() {
            // summary:
            //      goes to the previous page
            console.log(this.declaredClass + '::previous', arguments);

            var currentPosition = this.pointer.get('position');

            currentPosition = currentPosition - 1;

            this.pointer.set('position', currentPosition);
        },
        _changePosition: function() {
            // summary:
            //      handles the displaying of the panes
            // newPosition: number
            //      the new position to move the wizard to
            console.log(this.declaredClass + '::_changePosition', arguments);

            var newPosition = this.pointer.get('position');
            var pane = this.panes[newPosition];

            this.parentWidget.sc.selectChild(pane);

            this.updateButtonState();
            pane.onShow();
        },
        updateButtonState: function() {
            // summary:
            //      sets the visibility and what buttons to show/hide
            console.log(this.declaredClass + '::updateButtonState', arguments);

            var index = this.pointer.get('position'),
                hideButton = true,
                disableButton = true;

            var activePane = this.panes[index];

            if (!activePane) {
                return;
            }

            if (activePane.first) {
                this._setButtonState({
                    node: this.nextButton,
                    hideButton: !hideButton,
                    disableButton: disableButton
                });

                this._setButtonState({
                    node: this.backButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.productButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.submitButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.cancelButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });

                return;
            }

            if (activePane.middle) {
                this._setButtonState({
                    node: this.nextButton,
                    hideButton: !hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.backButton,
                    hideButton: !hideButton,
                    disableButton: !disableButton
                });

                this._setButtonState({
                    node: this.productButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.submitButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.cancelButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
            }

            if (activePane.last) {
                this._setButtonState({
                    node: this.backButton,
                    hideButton: !hideButton,
                    disableButton: !disableButton
                });

                this._setButtonState({
                    node: this.nextButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.productButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.submitButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
                this._setButtonState({
                    node: this.cancelButton,
                    hideButton: hideButton,
                    disableButton: disableButton
                });
            }
        },
        _setButtonState: function(args) {
            // summary:
            //      shows the next button
            console.log(this.declaredClass + '::_setButtonState', arguments);

            if (!args.node) {
                if (args.button === 'next') {
                    args.node = this.nextButton;
                } else if (args.button === 'submit') {
                    args.node = this.submitButton;
                }
            }

            domAttr.set(args.node, 'disabled', null);
            domAttr.remove(args.node, 'disabled');
            domClass.remove(args.node, 'hidden');
            domClass.remove(args.node, 'disabled');

            if (args.hideButton) {
                domClass.add(args.node, 'hidden');
            }
            if (args.disableButton) {
                domAttr.set(args.node, 'disabled', true);
                domClass.add(args.node, 'disabled');
            }
        },
        submit: function(evt) {
            // summary:
            //      submits the form
            // evt: mouse click event
            console.log(this.declaredClass + '::submit', arguments);

            var valid = this.parentWidget.submit(evt);
            if (!valid) {
                this.messageBox.innerHTML = 'You haven\'t chosen all the required parts.';

                return;
            }

            this.messageBox.innerHTML = '';
            this.productButton.innerHTML = 'Submitting';

            this._setButtonState({
                node: this.cancelButton,
                hideButton: false,
                disableButton: false
            });

            this._setButtonState({
                node: this.backButton,
                hideButton: true,
                disableButton: true
            });

            this._setButtonState({
                node: this.submitButton,
                hideButton: true,
                disableButton: true
            });

            this._setButtonState({
                node: this.productButton,
                hideButton: false,
                disableButton: true
            });

            this._setButtonState({
                node: this.nextButton,
                hideButton: true,
                disableButton: true
            });
        },
        cancel: function() {
            // summary:
            //      cancels the wizard submission
            console.log(this.declaredClass + '::cancel', arguments);

            this._setButtonState({
                node: this.cancelButton,
                hideButton: true,
                disableButton: true
            });

            this._setButtonState({
                node: this.backButton,
                hideButton: false,
                disableButton: false
            });

            this._setButtonState({
                node: this.submitButton,
                hideButton: false,
                disableButton: false
            });

            this._setButtonState({
                node: this.productButton,
                hideButton: true,
                disableButton: true
            });

            this.messageBox.innerHTML = '';
            this.parentWidget.cancelJob();
        },
        _gpUpdating: function(status) {
            // summary:
            //      updates the ui for gp updates
            // status
            console.log(this.declaredClass + '::_gpUpdating', arguments);

            this.messageBox.innerHTML = '';

            switch (status.jobInfo.jobStatus) {
                case 'esriJobSubmitted':
                    this.productButton.innerHTML = 'Submitted';
                    break;
                case 'esriJobExecuting':
                    this.productButton.innerHTML = 'Processing';
                    break;
                case 'esriJobSucceeded':
                    this.productButton.innerHTML = 'Requesting Report Url';
                    break;
            }
        },
        _gpComplete: function(status) {
            // summary:
            //      the gp has finished reset buttons bases on status
            // status: esri/tasks/JobInfo
            console.log(this.declaredClass + '::_gpComplete', arguments);

            switch (status.jobInfo.jobStatus) {
                case 'esriJobCancelling':
                case 'esriJobCancelled':
                    this._setButtonState({
                        node: this.cancelButton,
                        hideButton: true,
                        disableButton: true
                    });

                    this._setButtonState({
                        node: this.backButton,
                        hideButton: false,
                        disableButton: false
                    });

                    this._setButtonState({
                        node: this.submitButton,
                        hideButton: false,
                        disableButton: true
                    });

                    this._setButtonState({
                        node: this.productButton,
                        hideButton: true,
                        disableButton: true
                    });
                    break;
                case 'esriJobSucceeded':
                    this.productButton.innerHTML = 'Requesting Report Url';
                    break;
                case 'esriJobFailed':
                    this._setButtonState({
                        node: this.cancelButton,
                        hideButton: true,
                        disableButton: true
                    });

                    this._setButtonState({
                        node: this.backButton,
                        hideButton: false,
                        disableButton: false
                    });

                    this._setButtonState({
                        node: this.submitButton,
                        hideButton: false,
                        disableButton: false
                    });

                    this._setButtonState({
                        node: this.productButton,
                        hideButton: true,
                        disableButton: true
                    });

                    this.messageBox.innerHTML = 'I\'m sorry but the job failed.';

                    break;
            }

            //reset validation
            var newPosition = this.pointer.get('position');
            var pane = this.panes[newPosition];
            pane.isValid();
        },
        _gpResultComplete: function(response) {
            // summary:
            //      got the result from the server
            // response
            console.log(this.declaredClass + '::_gpResultComplete', arguments);

            this.productButton.innerHTML = 'Download Report';

            this._setButtonState({
                node: this.cancelButton,
                hideButton: true,
                disableButton: true
            });

            this._setButtonState({
                node: this.backButton,
                hideButton: false,
                disableButton: false
            });

            this._setButtonState({
                node: this.submitButton,
                hideButton: false,
                disableButton: false
            });

            this._setButtonState({
                node: this.productButton,
                hideButton: false,
                disableButton: false
            });
            
            domAttr.set(this.productButton, 'href', response.result.value);
        }
    });
});