'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Binder = (function () {
  function Binder() {
    _classCallCheck(this, Binder);
  }

  _createClass(Binder, [{
    key: '_bind',
    value: function _bind(methods) {
      var self = this;
      methods.forEach(function (method) {
        self[method] = self[method].bind(self);
      });
    }
  }]);

  return Binder;
})();

module.exports = Binder;
//# sourceMappingURL=Binder.js.map
