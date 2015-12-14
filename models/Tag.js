var keystone = require('../lib/Keystone/KeystoneHelper').getKeystone();
var Types = keystone.Field.Types;

/**
 * Blog Tag Mongoose Model
 */
var Tag = new keystone.List('Tag', {
  autokey: { path: 'slug', from: 'name', unique: true },
  defaultColumns: 'name'
});

Tag.add({
	name: { type: String, required: true },
	slug: { type: String, readonly: true }
});

Tag.register();
