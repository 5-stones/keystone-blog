var keystone = require('../dist/Keystone/KeystoneHelper').getKeystone();
var Types = keystone.Field.Types;

// TODO Get these fields working without needing to reference them via _doc
var userModel = keystone.get("user model");
var User = keystone.list(userModel);
if (!User.fields["name"]) {
  User.add({ name: { type: Types.Name, required: true, index: true, initial: true }});
}
if (!User.fields["image"]) {
  User.add({ image: { type: Types.S3File,
    s3path: '/images/users',
    allowedTypes: ['image/png'],
    filename: function(user, filename) { return user.slug+'.png'; }
  }});
}
// User.register();
