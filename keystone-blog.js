var KeystoneHelper = require('./lib/Keystone/KeystoneHelper');
var PostController = require('./lib/PostController');

module.exports = {
  import: function(keystone, routes){
    KeystoneHelper.setKeystone(keystone);
    keystone.import('node_modules/keystone-blog/models');
  },
  PostController: PostController
};
