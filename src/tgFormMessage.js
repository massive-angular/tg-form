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
