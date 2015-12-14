var keystone = require('../lib/Keystone/KeystoneHelper').getKeystone();
var Types = keystone.Field.Types;

/**
 * Blog Post Mongoose Model
 */
var BlogPost = new keystone.List('BlogPost', {
  autokey: { path: 'slug', from: 'name', unique: true },
  drilldown: 'tags',
  defaultColumns: 'name, tags'
});

BlogPost.add({
	name: { type: String, required: true },
	slug: { type: String, readonly: true },
  tags: { type: Types.Relationship, ref: 'Tag', many: true, initial: true },

  image: { type: Types.S3File,
    s3path: '/images/blog',
    allowedTypes: ['image/png'],
    filename: function(post, filename) { return post.slug+'.jpg'; }
  },

  preview: { type: Types.Textarea, required: true, initial: true },
  body: { type: Types.Markdown, required: true, initial: true },
	createdAt: { type: Date, default: Date.now }
});

BlogPost.register();
