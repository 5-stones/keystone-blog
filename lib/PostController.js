'use strict';
var KeystoneHelper = require('./Keystone/KeystoneHelper');
var Promise = require('bluebird');
var Binder = require('./Binder');
var Renderer = require('./Renderer');
var _ = require('lodash');

/**
 * Controller for the BlogPost object
 */
class PostController extends Binder {

  /**
   * Constructor for the PostController object
   * @param  {Boolean} render Whether the keystone-blog module should render jade templates.
   *                          If true, a rendered template is returned.
   *                          If false, index methods will return a list of Post instances and
   *                          show methods will return Post instances.
   */
  constructor(render){
    super();
    this.render = render || true;
    this._bind(['request', '_index', '_show']);
  }

  /**
   * A request is made. This is called as a middleware function in the parent application's routes.
   * If a post slug is attached to the request parameters, the show function will be called next,
   * otherwise the index function will.
   * @param  {HttpRequest}   req
   * @param  {HttpResponse}  res
   * @param  {Function}      next
   */
  request(req, res, next) {
    var self = this;
    if(req.params.post) {
      self._show(req, res, next);
    } else {
      self._index(req, res, next);
    }
  }

  /**
   * Get the index of posts. If render is true, a rendered jade template will be returned.
   * Else, a list of Posts will be.
   * @param  {HttpRequest}   req
   * @param  {HttpResponse}  res
   * @param  {Function}      next
   * @return {JadeTemplate or List[Post]} The configured return format for an index of posts
   */
  _index(req, res, next){
    var self = this;
    var render = self.render;
    var page = req.query.page || 1;

    var perPage = req.perPage || 4;
    var maxPages = req.maxPages || 4;

    // If we are not filtering on tag
    var promise = Promise.resolve(false);
    // If we are filtering on tag
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
      // If we are not filtering on tag
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
        // If we are filtering on tag
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
          // Render a jade template and return it
          if(render){
            req.renderedTemplate = self._renderIndex(posts);
          } else {
            // Return the result set of posts
            req.posts = posts;
          }
          // Allow the next in the chain
          next();
        });
    });
  }

  /**
   * Get a posts. If render is true, a rendered jade template will be returned.
   * Else, a Post instance will be.
   * @param  {HttpRequest}   req
   * @param  {HttpResponse}  res
   * @param  {Function}      next
   * @return {JadeTemplate or Post} The configured return format for a post
   */
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

  // TODO Sort similarly to reddit's hot sort algorithm so createdAt date is factored into the sorting
  /**
   * Get a list of most popular posts
   * @param  {HttpRequest}  req  [description]
   * @param  {HttpResponse} res  [description]
   * @param  {Function}     next [description]
   * @return {List[Post]}   The posts, sorted by popularity
   */
  _popularPosts(req, res, next){
    var self = this;
    var render = self.render;
    var session = req.session;
    Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .find()
      .populate('tags')
      .sort(['-views'])
      .exec())
      .then(function(posts){
        req.popularPosts = posts;
        next();
      });
  }

  /**
   * Render the jade template for post index
   * @param  {List[Post]} posts The post index
   * @return {Rendered jade tmeplate} The index partial
   */
  _renderIndex(posts){
    var renderer = new Renderer();
    return renderer.render(posts, '/../templates/layouts/index.jade');
  }

  /**
   * Render the jade template for post show
   * @param  {List[Post]} posts The post
   * @return {Rendered jade tmeplate} The show partial
   */
  _renderShow(post){
    var renderer = new Renderer();
    return renderer.render(post, '/../templates/layouts/show.jade');
  }

}

module.exports = PostController;
