# tg-form
Extension for ngForm with powerful validation mechanism

## Quick start
Several quick start options are available:

* [Download the latest release](https://github.com/massive-angular/tg-form/archive/v1.0.0.zip)
* Clone the repo: `git clone https://github.com/massive-angular/tg-form.git`
* Install with [bower](http://bower.io): `bower install tg-form`
* Install with [npm](https://npmjs.com): `npm install tg-form`

## Examples

### Simple form validation
```html
<form tg-form novalidate name="simpleForm">
  <div>
    <label>
      Simple text
      <input type="text" name="simpleText" ng-model="simpleText" required minlength="3" />
    </label>
  </div>

  <div>
    Simple form is valid: {{ simpleForm.$valid }}
  </div>
  <div>
    <tg-form-message name="simpleText"
      required-message="simple text is required"
      minlength-message="simple text min length is 3">
    </tg-form-message>
  </div>
</form>
```

### Custom form validation
```javascript
$scope.equalTo = function(toField, value) {
  return toField === value;
};
```

```html
<form tg-form novalidate name="customForm">
  <div>
    <label>
      Field 1
      <input type="text" name="field1" ng-model="field1" required />
    </label>
  </div>
  <div>
    <label>
      Field 2
      <input type="text" name="field2" ng-model="field2" tg-validate-equal-to-field1="equalTo(field1, $value)" />
    </label>
  </div>

  <div>
    Custom form is valid: {{ customForm.$valid }}
  </div>
  <div>
    <tg-form-message name="field1"
      required-message="field1 is required">
    </tg-form-message>
    <tg-form-message name="field2"
      equal-to-field1-message="field2 must be equal to field1">
    </tg-form-message>
  </div>
</form>
```

### Custom async form validation
```javascript
$scope.someAsyncValidation = function(value) {
  var deferred = $q.defer();

  $timeout(function() {
    var result = value === '123';

    if(result) {
      deferred.resolve();
    }
    else {
      deferred.reject();
    }
  }, 2 * 1000);

  return deferred.promise;
};
```

```html
<form tg-form novalidate name="customAsyncForm">
  <div>
    <label>
      Async field
      <input type="text" name="asyncField" ng-model="asyncField" tg-validate-async-some-async-validation="someAsyncValidation($value)" />
    </label>
  </div>

  <div>
    Custom async form is valid: {{ (customAsyncForm.$pending) ? 'validating...' : customAsyncForm.$valid }}
  </div>
  <div>
    <tg-form-message name="asyncField"
      some-async-validation-message="Async field must be 123">
    </tg-form-message>
  </div>
</form>
```

### Custom validator form validation
```javascript
$scope.isDateValid = function(year, month, day) {
    month--;
    var date = new Date(year, month, day);

    return date.getDate() == day &&
        date.getMonth() == month &&
        date.getFullYear() == year;
};
```

```html
<form tg-form novalidate name="customValidatorForm">
  <tg-form-validator tg-validate-valid-date="isDateValid(year, month, day)"></tg-form-validator>

  <input type="number" name="year" ng-model="year" placeholder="year" />
  <input type="number" name="month" ng-model="month" placeholder="month" />
  <input type="number" name="day" ng-model="day" placeholder="day" />

  <div>
    Custom validator form is valid: {{ customValidatorForm.$valid }}
  </div>
  <div>
    <tg-form-message
      valid-date-message="Invalid Date"></tg-form-message>
  </div>
</form>
```

### Custom async validator form validation
```javascript
$scope.isDateValid = function(year, month, day) {
    month--;
    var date = new Date(year, month, day);

    return date.getDate() == day &&
        date.getMonth() == month &&
        date.getFullYear() == year;
};

$scope.isDateValidAsync = function(year, month, day) {
    var defer = $q.defer();

    $timeout(function() {
      if ($scope.isDateValid(year, month, day)) {
          defer.resolve();
      } else {
          defer.reject();
      }
    }, 2 * 1000);

    return defer.promise;
};
```

```html
<form tg-form novalidate name="customValidatorAsyncForm">
  <tg-form-validator tg-validate-async-valid-date="isDateValidAsync(asyncYear, asyncMonth, asyncDay)"></tg-form-validator>

  <input type="number" name="year" ng-model="asyncYear" placeholder="year" />
  <input type="number" name="month" ng-model="asyncMonth" placeholder="month" />
  <input type="number" name="day" ng-model="asyncDay" placeholder="day" />

  <div>
    Custom async validator form is valid: {{ (customValidatorAsyncForm.$pending) ? 'validating...' : customValidatorAsyncForm.$valid }}
  </div>
  <div>
    <tg-form-message
      valid-date-message="Invalid Date"></tg-form-message>
  </div>
</form>
```

## Creators
**Slava Matvienco**
* <https://github.com/felix-wfm>

**Alexandr Dascal**
* <https://github.com/adascal>

## License
Code released under [the MIT license](http://spdx.org/licenses/MIT).
