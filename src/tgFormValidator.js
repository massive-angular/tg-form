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
