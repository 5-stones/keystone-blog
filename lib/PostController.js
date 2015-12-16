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

    var perPage = req.perPage || 4;
    var maxPages = req.maxPages || 4;

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
              perPage: perPage,
              maxPages: maxPages
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
    var session = req.session;
    if (typeof session.postViews == 'undefined') {
      session.postViews = [];
    }
    Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .findOne({ 'slug' : req.params.post })
      .populate('tags')
      .exec())
      .then(function(post){
        // Track pageviews of this blog post if the session has not already done so
        if(session.postViews.indexOf(post.slug) == -1) {
          KeystoneHelper.getKeystone()
            .list('BlogPost').model
            .update({slug: post.slug}, {
              views: post.views + 1
            }, function(err, affected, resp) {
              console.log(resp);
            });
          session.postViews.push(post.slug);
        }

        if(render){
          req.renderedTemplate = self._renderShow(post);
        } else {
          req.post = post;
        }
        next();
      });
  }

  _popularPosts(req, res, next){

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
