'use strict';

/**
 * A helper for interacting with the Keystone instance that uses this module
 */
class KeystoneHelper {

  /**
   * Set the keystone object
   * @param {Keystone} keystone
   */
  setKeystone(keystone){
    var self = this;
    self.keystone = keystone;

    return self;
  }

  /**
   * Get the keystone object
   * @return {Keystone}
   */
  getKeystone(){
    var self = this;
    return self.keystone;
  }

  /**
   * Set the request object
   * @param {HttpRequest} req
   */
  setCurrentRequest(req){
    var self = this;
    self.request = req;
    return self;
  }

  /**
   * Get the request object
   * @return {HttpRequest}
   */
  getCurrentRequest(){
    var self = this;
    return self.request;
  }

}

module.exports = new KeystoneHelper();
