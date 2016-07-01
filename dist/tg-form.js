/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var tgForm = __webpack_require__(1),
	    tgModel = __webpack_require__(3),
	    tgFormMessage = __webpack_require__(4),
	    tgFormValidator = __webpack_require__(5);
	
	angular.module('tg.form', [])
	    .directive('tgForm', tgForm)
	    .directive('ngModel', tgModel)
	    .directive('tgFormMessage', tgFormMessage)
	    .directive('tgFormValidator', tgFormValidator);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var overrideFn = __webpack_require__(2);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function overrideFn(context, fnName, fn) {
	    if (typeof fnName === 'string') {
	        return overrideFnInternal(context, fnName, fn);
	    } else {
	        var obj = arguments[1],
	            keys = Object.keys(obj);
	
	        return keys.reduce(function (result, key) {
	            result[key] = overrideFnInternal(context, key, obj[key]);
	
	            return result;
	        }, {});
	    }
	
	    function overrideFnInternal(context, fnName, fn) {
	        var baseFn = context[fnName] || function () {};
	
	        context[fnName] = function overrideFunction() {
	            var args = arguments,
	                params = Array.prototype.slice.call(args),
	                isCalledLikeConstructor = this instanceof overrideFunction;
	
	            params.unshift(function () {
	                var _args = arguments.length ? arguments : args,
	                    _params = Array.prototype.slice.call(_args);
	
	                if (isCalledLikeConstructor) {
	                    _params.unshift(this);
	
	                    return new (Function.prototype.bind.apply(baseFn, _params));
	                }
	
	                return baseFn.apply(this, _params);
	            }.bind(this));
	
	            return fn.apply(this, params);
	        };
	
	        try {
	            Object.defineProperties(context[fnName], {
	                length: {
	                    get: function () {
	                        return baseFn.length;
	                    }
	                },
	                name: {
	                    get: function () {
	                        return baseFn.name;
	                    }
	                }
	            });
	        }
	        catch (ex) {
	            console.warn(ex);
	        }
	
	        context[fnName].toString = function () {
	            return baseFn.toString();
	        };
	
	        return baseFn;
	    }
	}
	
	if (typeof module === 'object' && typeof module.exports === 'object') {
	    module.exports = overrideFn;
	} else if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return overrideFn;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var overrideFn = __webpack_require__(2);
	
	tgModel.$inject = ['$q'];
	
	function tgModel($q) {
	    return {
	        restrict: 'EA',
	        require: ['ngModel', '^?tgForm'],
	        compile: function () {
	            function getValidationKey(str, prefix) {
	                var validationKey = str.substring(prefix.length);
	
	                return validationKey.charAt(0).toLowerCase() + validationKey.slice(1);
	            }
	
	            function preLink(scope, element, attrs, ctrls) {
	                var ngModelCtrl = ctrls[0],
	                    tgFormCtrl = ctrls[1],
	                    tgValidateStr = 'tgValidate',
	                    tgValidateAsyncStr = 'tgValidateAsync';
	
	                if (!tgFormCtrl) {
	                    return false;
	                }
	
	                if (ngModelCtrl.$name.indexOf('form-validator') === 0) {
	                    ngModelCtrl.$isFormValidator = true;
	                }
	
	                for (var prop in attrs) {
	                    if (attrs.hasOwnProperty(prop)) {
	                        var idx = prop.indexOf(tgValidateStr);
	
	                        if (idx === 0) {
	                            ngModelCtrl.$hasCustomValidations = true;
	
	                            var validationFn = attrs[prop],
	                                isAsync = prop.indexOf(tgValidateAsyncStr) === 0,
	                                validators = isAsync ? ngModelCtrl.$asyncValidators : ngModelCtrl.$validators,
	                                validationKey = getValidationKey(prop, isAsync ? tgValidateAsyncStr : tgValidateStr);
	
	                            validators[validationKey] = function (isAsync, validationFn, modelValue, viewValue) {
	                                var result = scope.$eval(validationFn, {
	                                    $form: tgFormCtrl,
	                                    $value: viewValue,
	                                    $model: modelValue
	                                });
	
	                                if (isAsync) {
	                                    // result is not promise
	                                    if (!(result && result.then)) {
	                                        result = (result) ? $q.resolve(result) : $q.reject(result);
	                                    }
	                                } else {
	                                    // convert result to boolean
	                                    result = !!result;
	                                }
	
	                                return result;
	                            }.bind(null, isAsync, validationFn);
	                        }
	                    }
	                }
	
	                overrideFn(ngModelCtrl, '$$runValidators', function (baseFn, modelValue, viewValue, doneCallback) {
	                    baseFn(modelValue, viewValue, function (allValid) {
	                        doneCallback(allValid);
	
	                        if (!allValid) {
	                            tgFormCtrl.$$updateControlErrors(ngModelCtrl);
	                        }
	                    });
	                });
	            }
	
	            return {
	                pre: preLink
	            };
	        }
	    };
	}
	
	module.exports = tgModel;


/***/ },
/* 4 */
/***/ function(module, exports) {

	tgFormMessage.$inject = [];
	
	function tgFormMessage() {
	    return {
	        restrict: 'EA',
	        require: '^tgForm',
	        scope: true,
	        template: '<span class="form-message">{{message}}</span>',
	        compile: function () {
	            function preLink(scope, element, attrs, tgFormCtrl) {
	                var inst = {
	                    name: attrs.name || '@',
	                    isFormMessage: (!attrs.name),
	                    setMessageByKey: function (key) {
	                        if (key) {
	                            key = key + 'Message';
	
	                            if (attrs.hasOwnProperty(key)) {
	                                var msg = scope.$parent.$eval(attrs[key]);
	
	                                this.setMessage(msg);
	                            }
	                        }
	                    },
	                    setMessage: function (message) {
	                        scope.message = message;
	                    },
	                    getMessage: function () {
	                        return scope.message;
	                    }
	                };
	
	                tgFormCtrl.$$addFormMessage(inst);
	
	                scope.$on('$destroy', function () {
	                    tgFormCtrl.$$removeFormMessage(inst);
	                });
	            }
	
	            return {
	                pre: preLink
	            };
	        }
	    };
	}
	
	module.exports = tgFormMessage;


/***/ },
/* 5 */
/***/ function(module, exports) {

	tgFormValidator.$inject = [];
	
	function tgFormValidator() {
	    return {
	        restrict: 'EA',
	        require: '^tgForm',
	        scope: true,
	        template: '<input type="hidden" ng-model="__validator" name="form-validator-{{$id}}">',
	        replace: true
	    };
	}
	
	module.exports = tgFormValidator;


/***/ }
/******/ ]);
//# sourceMappingURL=tg-form.js.map