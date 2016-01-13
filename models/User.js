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
if (!User.fields["bio"]) {
  User.add({ bio: { type: Types.Markdown }});
}
if (!User.fields["websiteName"]) {
  User.add({ websiteName: { type: String }});
}
if (!User.fields["websiteUrl"]) {
  User.add({ websiteUrl: { type: Types.Url }});
}
if (!User.fields["facebook"]) {
  User.add({ facebook: { type: Types.Url }});
}
if (!User.fields["twitter"]) {
  User.add({ twitter: { type: Types.Url }});
}
if (!User.fields["googlePlus"]) {
  User.add({ googlePlus: { type: Types.Url }});
}
// User.register();
