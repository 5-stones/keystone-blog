var KeystoneHelper = require('./dist/Keystone/KeystoneHelper');
var PostController = require('./dist/PostController');

module.exports = {
  import: function(keystone, routes){
    KeystoneHelper.setKeystone(keystone);
    keystone.import('node_modules/keystone-blog/models');
  },
  PostController: PostController
};
