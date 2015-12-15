'use strict';

class Binder {
  _bind(methods) {
    var self = this;
    methods.forEach(function(method){
      self[method] = self[method].bind(self)
    });
  }
}

module.exports = Binder;
