var overrideFn = require('override-fn');

tgForm.$inject = ['$parse', '$timeout'];

function tgForm($parse, $timeout) {
    return {
        restrict: 'EA',
        require: ['form', 'tgForm'],
        compile: function () {
            function preLink(scope, element, attrs, ctrls) {
                var formCtrl = ctrls[0],
                    tgFormCtrl = ctrls[1],
                    onSubmit = $parse(attrs.onSubmit);

                formCtrl.$isExtendedForm = true;
                tgFormCtrl.$form = formCtrl;

                formCtrl.submit = function () {
                    var event = new Event('submit'),
                        nativeElement = element[0];


                    /**
                     *  Current angular submit handler:
                     *  var handleFormSubmission = function(event) {
                         *      scope.$apply(function() {
                         *          controller.$commitViewValue();
                         *          controller.$setSubmitted();
                         *      });
                         *
                         *      event.preventDefault();
                         *  };
                     *
                     *  Cause this block working in angular context
                     *  and to prevent Error: $digest already in progress
                     *  We've to run this asynchronously
                     */
                    setTimeout(function () {
                        nativeElement.dispatchEvent(event);
                    });
                };

                formCtrl.hasErrorOfType = function (errorType) {
                    return !!(errorType && formCtrl.$error[errorType]);
                };
                
                overrideFn(formCtrl, {
                    $addControl: function (baseFn, control) {
                        baseFn();

                        tgFormCtrl.$$addFormControl(control);

                        if (control.hasOwnProperty('$parsers') &&
                            control.hasOwnProperty('$formatters')) {
                            var validationTrigger = function (value) {
                                tgFormCtrl.$$validateCustoms(control);

                                return value;
                            };

                            control.$parsers.push(validationTrigger);
                            control.$formatters.push(validationTrigger);
                        }
                    },
                    $removeControl: function (baseFn, control) {
                        baseFn();

                        tgFormCtrl.$$removeFormControl(control);
                    },
                    $setSubmitted: function (baseFn) {
                        if (formCtrl.$$inSubmition) {
                            return;
                        }

                        baseFn();

                        if (attrs.showErrorsOnSubmit === 'true') {
                            tgFormCtrl.$$updateFormErrors();
                        }

                        if (attrs.submitChildForms === 'true') {
                            tgFormCtrl.formControls.forEach(function (formControl) {
                                if (formControl.hasOwnProperty('$setSubmitted') && !formControl.$submitted) {
                                    formCtrl.$$inSubmition = true;
                                    formControl.$setSubmitted();
                                    formCtrl.$$inSubmition = false;
                                }
                            });
                        }

                        if (formCtrl.$valid) {
                            onSubmit(scope, {
                                $form: formCtrl
                            });
                        }
                    }
                });
            }

            return {
                pre: preLink
            };
        },
        controller: ['$attrs', function tgFormController(attrs) {
            this.formMessages = [];
            this.formControls = [];

            this.$$addFormMessage = function (formMessage) {
                this.formMessages.push(formMessage);
            };

            this.$$removeFormMessage = function (formMessage) {
                var idx = this.formMessages.indexOf(formMessage);

                if (idx !== -1) {
                    this.formMessages.splice(idx, 1);
                }
            };

            this.$$addFormControl = function (formControl) {
                this.formControls.push(formControl);
            };

            this.$$removeFormControl = function (formControl) {
                var idx = this.formControls.indexOf(formControl);

                if (idx !== -1) {
                    this.formControls.splice(idx, 1);
                }
            };

            this.$$validateCustoms = function (excluded) {
                var self = this;

                if (!Array.isArray(excluded)) {
                    excluded = [excluded];
                }

                $timeout(function () {
                    self.formControls.forEach(function (ngModelCtrl) {
                        if (ngModelCtrl.hasOwnProperty('$hasCustomValidations') &&
                            excluded.indexOf(ngModelCtrl) === -1) {
                            ngModelCtrl.$validate();
                        }
                    });

                    self.$$updateFormErrors();
                });
            };

            this.$$updateFormErrors = function () {
                var self = this;

                self.formMessages.forEach(function (formMessage) {
                    formMessage.setMessage(null);
                });

                var fUpdateFormErrorsFor = function (formCtrl) {
                    if (attrs.showErrorsOnSubmit !== 'true' || formCtrl.$submitted) {
                        for (var validationKey in formCtrl.$error) {
                            if (formCtrl.$error.hasOwnProperty(validationKey)) {
                                var controls = formCtrl.$error[validationKey];

                                if (!Array.isArray(controls)) {
                                    controls = [controls];
                                }

                                controls.forEach(function (control) {
                                    if (control.hasOwnProperty('$submitted')) {
                                        if (!control.$isExtendedForm) {
                                            fUpdateFormErrorsFor(control);
                                        }
                                    }
                                    else if (control.$invalid) {
                                        self.formMessages.forEach(function (formMessage) {
                                            if (control.$name === formMessage.name ||
                                                (formMessage.isFormMessage && control.$isFormValidator)) {
                                                if (!formMessage.getMessage()) {
                                                    formMessage.setMessageByKey(validationKey);
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                };

                fUpdateFormErrorsFor(self.$form);
            };

            this.$$updateControlErrors = function (ngModelCtrl) {
                var self = this;

                if (ngModelCtrl.$invalid) {
                    if (attrs.showErrorsOnSubmit !== 'true' || self.$form.$submitted) {
                        for (var validationKey in ngModelCtrl.$error) {
                            if (ngModelCtrl.$error.hasOwnProperty(validationKey) &&
                                ngModelCtrl.$error[validationKey]) {
                                self.formMessages.forEach(function (formMessage) {
                                    if ((ngModelCtrl.$name === formMessage.name) ||
                                        (formMessage.isFormMessage && ngModelCtrl.$isFormValidator)) {
                                        if (!formMessage.getMessage()) {
                                            formMessage.setMessageByKey(validationKey);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            };
        }]
    };
}

module.exports = tgForm;
