var KeystoneHelper = require('./lib/Keystone/KeystoneHelper');
var BlogBuilder = require('./lib/Blog/BlogBuilder');
var Blog = require('./lib/Blog/Blog');
var PostBuilder = require('./lib/Post/PostBuilder');
var Post = require('./lib/Post/Post');

module.exports = {
  import: function(keystone){
    KeystoneHelper.setKeystone(keystone);
    keystone.import('node_modules/keystone-blog/models');
  },
  blogBuilder: function(){
    return new BlogBuilder();
  },
  postBuilder: function(){
    return new PostBuilder();
  },
  routeParser: function(req, res, next){
    KeystoneHelper.setCurrentRequest(req);
    next();
  }
};
