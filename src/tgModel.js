var overrideFn = require('override-fn');

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
