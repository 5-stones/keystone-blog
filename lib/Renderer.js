'use strict';
var jade = require('jade');
var Moment = require('moment');

/**
 * A class used to render jade templates
 */
class Renderer {
  /**
   * Render a jade template
   * @param  {Object} obj      The object to include in the template
   * @param  {String} template The path to the template
   * @return {rendered jade template} The rendered jade template
   */
  render(obj, template) {
    // TODO Pull dateFormat from a module configuration
    var dateFormat = "LL";

    var fn = jade.compileFile(__dirname + template);

    return fn({
      moment: Moment,
      dateFormat: dateFormat,
      obj: obj
    });
  }
}

module.exports = Renderer;
