var keystone = require('../dist/Keystone/KeystoneHelper').getKeystone();
var Types = keystone.Field.Types;

/**
 * Blog Post Mongoose Model
 */
var BlogPost = new keystone.List('BlogPost', {
  autokey: { path: 'slug', from: 'name', unique: true },
  drilldown: 'tags',
  defaultColumns: 'name, tags'
});

var userModel = keystone.get("user model");

BlogPost.add({
	name: { type: String, required: true },
  author: { type: Types.Relationship, ref: userModel, initial: true },
	slug: { type: String, readonly: true },
  tags: { type: Types.Relationship, ref: 'Tag', many: true, initial: true },

  featuredImage: { type: Types.S3File,
    s3path: '/images/blog',
    allowedTypes: ['image/png'],
    filename: function(post, filename) { return post.slug+'.png'; }
  },

  preview: { type: Types.Textarea, required: true, initial: true },
  body: { type: Types.Markdown, required: true, initial: true },
	createdAt: { type: Date, default: Date.now, noedit: true },
  views: {type: Number, default: 0},
  active: { type: Boolean, default: true }
});

BlogPost.defaultSort = '-createdAt';
BlogPost.register();
