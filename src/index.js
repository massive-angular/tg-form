var tgForm = require('./tgForm'),
    tgModel = require('./tgModel'),
    tgFormMessage = require('./tgFormMessage'),
    tgFormValidator = require('./tgFormValidator');

angular.module('tg.form', [])
    .directive('tgForm', tgForm)
    .directive('ngModel', tgModel)
    .directive('tgFormMessage', tgFormMessage)
    .directive('tgFormValidator', tgFormValidator);
