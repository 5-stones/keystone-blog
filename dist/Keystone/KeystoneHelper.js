'use strict';

/**
 * A helper for interacting with the Keystone instance that uses this module
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeystoneHelper = (function () {
  function KeystoneHelper() {
    _classCallCheck(this, KeystoneHelper);
  }

  _createClass(KeystoneHelper, [{
    key: 'setKeystone',

    /**
     * Set the keystone object
     * @param {Keystone} keystone
     */
    value: function setKeystone(keystone) {
      var self = this;
      self.keystone = keystone;

      return self;
    }

    /**
     * Get the keystone object
     * @return {Keystone}
     */

  }, {
    key: 'getKeystone',
    value: function getKeystone() {
      var self = this;
      return self.keystone;
    }

    /**
     * Set the request object
     * @param {HttpRequest} req
     */

  }, {
    key: 'setCurrentRequest',
    value: function setCurrentRequest(req) {
      var self = this;
      self.request = req;
      return self;
    }

    /**
     * Get the request object
     * @return {HttpRequest}
     */

  }, {
    key: 'getCurrentRequest',
    value: function getCurrentRequest() {
      var self = this;
      return self.request;
    }
  }]);

  return KeystoneHelper;
})();

module.exports = new KeystoneHelper();
//# sourceMappingURL=KeystoneHelper.js.map
