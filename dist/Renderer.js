'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jade = require('jade');
var Moment = require('moment');

/**
 * A class used to render jade templates
 */

var Renderer = (function () {
  function Renderer() {
    _classCallCheck(this, Renderer);
  }

  _createClass(Renderer, [{
    key: 'render',

    /**
     * Render a jade template
     * @param  {Object} obj      The object to include in the template
     * @param  {String} template The path to the template
     * @return {rendered jade template} The rendered jade template
     */
    value: function render(obj, template, dateFormat) {
      var fn = jade.compileFile(__dirname + template);

      return fn({
        moment: Moment,
        dateFormat: dateFormat,
        obj: obj
      });
    }
  }]);

  return Renderer;
})();

module.exports = Renderer;
//# sourceMappingURL=Renderer.js.map
