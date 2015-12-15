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
    this._bind(['request', '_index', '_show']);
  }

  request(req, res, next) {
    var self = this;
    if(req.params.post) {
      self._show(req, res, next);
    } else {
      self._index(req, res, next);
    }
  }

  _index(req, res, next){
    var self = this;
    var render = self.render;
    var page = req.query.page || 1;

    // TODO pull perPage from module configuration
    var perPage = 10;

    var promise = Promise.resolve(false);
    if(req.query.tag) {
      var tag;
      var tagFilter = req.query.tag;
      promise = KeystoneHelper.getKeystone()
        .list('Tag').model
        .findOne({'slug': tagFilter})
        .exec(function(err, result) {
          tag = result;
        });
    }
    promise.then(function(result){
      var execAsync;
      if(result === false) {
        execAsync = Promise.promisify(KeystoneHelper.getKeystone()
          .list('BlogPost')
          .paginate({
              page: page,
              perPage: perPage
          })
          .sort('-createdAt')
          .populate('tags')
          .exec);
      } else {
        execAsync = Promise.promisify(KeystoneHelper.getKeystone()
          .list('BlogPost')
          .paginate({
              page: page,
              perPage: perPage
          })
          .sort('-createdAt')
          .populate('tags')
          .where('tags').in([result])
          .exec);
      }
      return execAsync;
    }).then(function(result){
      result()
        .then(function(posts){
          if(render){
            req.renderedTemplate = self._renderIndex(posts);
          } else {
            req.posts = posts;
          }
          next();
        });
    });
  }

  _show(req, res, next){
    var self = this;
    var render = self.render;
    Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .findOne({ 'slug' : req.params.post })
      .populate('tags')
      .exec())
      .then(function(post){
        if(render){
          req.renderedTemplate = self._renderShow(post);
        } else {
          req.post = post;
        }
        next();
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
