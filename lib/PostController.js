'use strict';
import KeystoneHelper from './Keystone/KeystoneHelper';
import Promise from 'bluebird';
import Binder from './Binder';
import Renderer from './Renderer';
import _ from 'lodash';

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
   * @param  {Integer} perPage The number of blog posts to show on a single index page.
   *                          Defaults to 10.
   * @param  {Integer} maxPages The number of pages to show in the pagination navigation.
   *                          Defaults to 5.
   * @param  {String} dateFormat The format to show the blog date. Defaults to "llll". See
   *                          http://momentjs.com/#format-dates
   */
  constructor(render, perPage, maxPages, dateFormat){
    super();
    // TODO Figure out why this always gets overridden to true when it's a boolean. Using a
    // string is just plain offensive.
    this.render = render || "true";
    this.perPage = perPage || 10;
    this.maxPages = maxPages || 5;
    this.dateFormat = dateFormat || "llll";
    this._bind(['index', 'show', 'author', '_renderIndex', '_renderShow', '_renderAuthor', '_buildIndexQuery']);
  }

  /**
   * Get the index of posts. If render is true, a rendered jade template will be returned.
   * Else, a list of Posts will be.
   * Also, if the post slug has a value equivalent to "popular", the index will be sorted on
   * popularity
   * @param  {HttpRequest}   req
   * @param  {HttpResponse}  res
   * @param  {Function}      next
   * @return {JadeTemplate or List[Post]} The configured return format for an index of posts
   */
  index(req, res, next){
    var render = this.render;
    var page = req.query.page || 1;
    var perPage = this.perPage;
    var maxPages = this.maxPages;
    // This is so users of this module can set up default tags
    if(req.params.tag) {
      req.tag = req.params.tag;
    }

    // If we are not filtering on tag
    var promise = Promise.resolve(false);
    // If we are filtering on tag
    if(req.tag) {
      var tag;
      var tagFilter = req.tag;
      promise = KeystoneHelper.getKeystone()
        .list('Tag').model
        .findOne({'slug': tagFilter})
        .exec(function(err, result) {
          tag = result;
        });
    }
    promise.then((result) => {
      var query;
      // If we are not filtering on tag
      if(result === false) {
        // If we are sorting on popularity
        query = this._buildIndexQuery(page, req.query.sortBy);
      } else {
        // If we are filtering on tag
        query = this._buildIndexQuery(page, req.query.sortBy, result);
      }
      return Promise.promisify(query.exec);
    }).then((result) => {
      result()
        .then((posts) => {
          // Render a jade template and return it
          if(render == "true"){
            req.renderedTemplate = this._renderIndex(posts);
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
   * Get all posts. If render is true, a rendered jade template will be returned.
   * Else, a Post instance will be.
   * @param  {HttpRequest}   req
   * @param  {HttpResponse}  res
   * @param  {Function}      next
   * @return {JadeTemplate or Post} The configured return format for a post
   */
  show(req, res, next){
    var render = this.render;
    var session = req.session;
    if (typeof session.postViews == 'undefined') {
      session.postViews = [];
    }
    Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .findOne({ 'slug' : req.params.post })
      .populate('tags')
      .populate('author')
      .exec())
      .then((post) => {
        // Track pageviews of this blog post if the session has not already done so
        if(session.postViews.indexOf(post.slug) == -1) {
          KeystoneHelper.getKeystone()
            .list('BlogPost').model
            .update({slug: post.slug}, {
              views: post.views + 1
            }, function(err, affected, resp){});
          session.postViews.push(post.slug);
        }

        if(render == "true"){
          req.renderedTemplate = this._renderShow(post);
        } else {
          req.post = post;
        }
        next();
      });
  }

  // TODO Sort similarly to reddit's hot sort algorithm so createdAt date is factored into the
  // sorting
  /**
   * Get a list of most popular posts
   * @param  {HttpRequest}  req  [description]
   * @param  {HttpResponse} res  [description]
   * @return {List[Post]}   The posts, sorted by popularity
   */
  popularPosts(req, res, limit){
    var query = KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .find({'active' : true})
      .populate('tags')
      .populate('author')
      .sort('-views');
    if(typeof limit !== 'undefined') {
      query.limit(limit);
    }
    return query.exec(function(err, result) {});
  }

  author(req, res, next) {
    var render = this.render;
    var userModel = keystone.get("user model");
    Promise.resolve(KeystoneHelper.getKeystone()
      .list(userModel).model
      .findOne({ 'slug' : req.params.author })
      .exec())
      .then((author) => {
        if(render == "true") {
          req.renderedTemplate = this._renderAuthor(author);
        } else {
          req.author = author;
        }
        next();
      });
  }

  _popular(req, res, next) {
    var page = req.query.page || 1;
    var perPage = this.perPage;
    var maxPages = this.maxPages;

    this.popularPosts(req, res)
      .then((result) => {
        req.renderedTemplate = this._renderIndex(result);
        // Allow the next in the chain
        next();
      });
  }

  /**
   * Render the jade template for post index
   * @param  {List[Post]} posts The post index
   * @return {Rendered jade tmeplate} The index partial
   */
  _renderIndex(posts){
    var dateFormat = this.dateFormat;
    var renderer = new Renderer();
    return renderer.render(posts, '/../templates/layouts/index.jade', dateFormat);
  }

  /**
   * Render the jade template for post show
   * @param  {List[Post]} posts The post
   * @return {Rendered jade tmeplate} The show partial
   */
  _renderShow(post){
    var dateFormat = this.dateFormat;
    var renderer = new Renderer();
    return renderer.render(post, '/../templates/layouts/show.jade', dateFormat);
  }

  _renderAuthor(author) {
    var dateFormat = this.dateFormat;
    var renderer = new Renderer();
    return renderer.render(author, '/../templates/layouts/author.jade', dateFormat);
  }

  _buildIndexQuery(page, sortBy, tagObject){
    var perPage = this.perPage;
    var maxPages = this.maxPages;

    var query = KeystoneHelper.getKeystone()
      .list('BlogPost')
      .paginate({
          page: page,
          perPage: perPage,
          maxPages: maxPages
      })
      .where('active', true)
      .populate('tags')
      .populate('author');

    if(sortBy == null) {
      query = query.sort('-createdAt');
    } else if(sortBy == 'popularity') {
      query = query.sort('-views');
    } else {
      query = query.sort(sortBy);
    }

    if(tagObject != null) {
      query = query.where('tags').in([tagObject]);
    }

    return query;
  }

}

module.exports = PostController;
