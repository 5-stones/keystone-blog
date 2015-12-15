'use strict';
var jade = require('jade');
var Moment = require('moment');

class Renderer {
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
