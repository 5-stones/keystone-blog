'use strict';
var KeystoneHelper = require('./Keystone/KeystoneHelper');
var Promise = require('bluebird');
var Binder = require('./Binder');
var Renderer = require('./Renderer');
var _ = require('lodash');

class PostController extends Binder {

  constructor(render){
    super();
    this.render = render || true;
    this._bind(['index', 'show']);
  }

  index(req, res, next){
    var self = this;
    var render = self.render;
    var page = req.query.page || 1;
    // TODO pull perPage from module configuration
    var perPage = 10;
    // var tag;
    // if(tagFilter) {
    //   console.log("tag: " + tagFilter)
    //   KeystoneHelper.getKeystone()
    //     .list('Tag').model
    //     .findOne({'name': tagFilter})
    //     .exec(function(err, result) {
    //       tag = result;
    //       next(err);
    //     });
    // }

    var execAsync = Promise.promisify(KeystoneHelper.getKeystone()
      .list('BlogPost')
      .paginate({
          page: page,
          perPage: perPage
      })
      .sort('-createdAt')
      .populate('tags')
      .exec);

    // if(tag) {
    //   query.where('tags').in([tag]);
    // }

    execAsync()
      .then(function(posts){
        if(render){
          req.postIndex = self._renderIndex(posts);
        } else {
          req.posts = posts;
        }
        next();
      });
  }

  show(req, res, next){
    Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .findOne({ 'slug' : slug })
      .populate('author')
      .exec())
      .then(function(post){
        if(render){
          req.postIndex = self._renderShow(post);
        } else {
          req.post = post;
        }
      });
  }

  _renderIndex(posts){
    var renderer = new Renderer();
    return renderer.render(posts, '/../templates/layouts/index.jade');
  }

  _renderShow(post){
    var renderer = new Renderer();
    return renderer.render(post, '/../templates/layouts/show.jade');
  }

}

module.exports = PostController;
