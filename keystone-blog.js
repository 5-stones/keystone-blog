var KeystoneHelper = require('./dist/Keystone/KeystoneHelper');
var PostController = require('./dist/PostController');

module.exports = {
  import: function(keystone, routes){
    KeystoneHelper.setKeystone(keystone);
    keystone.import('node_modules/keystone-blog/models');
    var Types = keystone.Field.Types;
    var userModel = keystone.get("user model");
    var User = keystone.list(userModel);
    if (!User.fields["name"]) {
      User.add({ name: { type: Types.Name, required: true, index: true }});
    }
    if (!User.fields["image"]) {
      User.add({ image: { type: Types.S3File,
        s3path: '/images/users',
        allowedTypes: ['image/png'],
        filename: function(user, filename) { return user.slug+'.png'; }
      }});
    }
    User.register();
  },
  PostController: PostController
};
