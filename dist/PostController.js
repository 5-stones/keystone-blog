'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _KeystoneHelper = require('./Keystone/KeystoneHelper');

var _KeystoneHelper2 = _interopRequireDefault(_KeystoneHelper);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _Binder2 = require('./Binder');

var _Binder3 = _interopRequireDefault(_Binder2);

var _Renderer = require('./Renderer');

var _Renderer2 = _interopRequireDefault(_Renderer);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Controller for the BlogPost object
 */

var PostController = (function (_Binder) {
  _inherits(PostController, _Binder);

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

  function PostController(render, perPage, maxPages, dateFormat) {
    _classCallCheck(this, PostController);

    // TODO Figure out why this always gets overridden to true when it's a boolean. Using a
    // string is just plain offensive.

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PostController).call(this));

    _this.render = render || "true";
    _this.perPage = perPage || 10;
    _this.maxPages = maxPages || 5;
    _this.dateFormat = dateFormat || "llll";
    _this._bind(['index', 'show', 'author', '_renderIndex', '_renderShow', '_renderAuthor', '_buildIndexQuery']);
    return _this;
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

  _createClass(PostController, [{
    key: 'index',
    value: function index(req, res, next) {
      var _this2 = this;

      var render = this.render;
      var page = req.query.page || 1;
      var perPage = this.perPage;
      var maxPages = this.maxPages;
      // This is so users of this module can set up default tags
      if (req.params.tag) {
        req.tag = req.params.tag;
      }

      // If we are not filtering on tag
      var promise = _bluebird2.default.resolve(false);
      // If we are filtering on tag
      if (req.tag) {
        var tag;
        var tagFilter = req.tag;
        promise = _KeystoneHelper2.default.getKeystone().list('Tag').model.findOne({ 'slug': tagFilter }).exec(function (err, result) {
          tag = result;
        });
      }
      promise.then(function (result) {
        var query;
        // If we are not filtering on tag
        if (result === false) {
          // If we are sorting on popularity
          query = _this2._buildIndexQuery(page, req.query.sortBy);
        } else {
          // If we are filtering on tag
          query = _this2._buildIndexQuery(page, req.query.sortBy, result);
        }
        return _bluebird2.default.promisify(query.exec);
      }).then(function (result) {
        result().then(function (posts) {
          // Render a jade template and return it
          if (render == "true") {
            req.renderedTemplate = _this2._renderIndex(posts);
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

  }, {
    key: 'show',
    value: function show(req, res, next) {
      var _this3 = this;

      var render = this.render;
      var session = req.session;
      if (typeof session.postViews == 'undefined') {
        session.postViews = [];
      }
      _bluebird2.default.resolve(_KeystoneHelper2.default.getKeystone().list('BlogPost').model.findOne({ 'slug': req.params.post }).populate('tags').populate('author').exec()).then(function (post) {
        // Track pageviews of this blog post if the session has not already done so
        if (session.postViews.indexOf(post.slug) == -1) {
          _KeystoneHelper2.default.getKeystone().list('BlogPost').model.update({ slug: post.slug }, {
            views: post.views + 1
          }, function (err, affected, resp) {});
          session.postViews.push(post.slug);
        }

        if (render == "true") {
          req.renderedTemplate = _this3._renderShow(post);
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

  }, {
    key: 'popularPosts',
    value: function popularPosts(req, res, limit) {
      var query = _KeystoneHelper2.default.getKeystone().list('BlogPost').model.find({ 'active': true }).populate('tags').populate('author').sort('-views');
      if (typeof limit !== 'undefined') {
        query.limit(limit);
      }
      return query.exec(function (err, result) {});
    }
  }, {
    key: 'author',
    value: function author(req, res, next) {
      var _this4 = this;

      var render = this.render;
      var userModel = keystone.get("user model");
      _bluebird2.default.resolve(_KeystoneHelper2.default.getKeystone().list(userModel).model.findOne({ 'slug': req.params.author }).exec()).then(function (author) {
        if (render == "true") {
          req.renderedTemplate = _this4._renderAuthor(author);
        } else {
          req.author = author;
        }
        next();
      });
    }
  }, {
    key: '_popular',
    value: function _popular(req, res, next) {
      var _this5 = this;

      var page = req.query.page || 1;
      var perPage = this.perPage;
      var maxPages = this.maxPages;

      this.popularPosts(req, res).then(function (result) {
        req.renderedTemplate = _this5._renderIndex(result);
        // Allow the next in the chain
        next();
      });
    }

    /**
     * Render the jade template for post index
     * @param  {List[Post]} posts The post index
     * @return {Rendered jade tmeplate} The index partial
     */

  }, {
    key: '_renderIndex',
    value: function _renderIndex(posts) {
      var dateFormat = this.dateFormat;
      var renderer = new _Renderer2.default();
      return renderer.render(posts, '/../templates/layouts/index.jade', dateFormat);
    }

    /**
     * Render the jade template for post show
     * @param  {List[Post]} posts The post
     * @return {Rendered jade tmeplate} The show partial
     */

  }, {
    key: '_renderShow',
    value: function _renderShow(post) {
      var dateFormat = this.dateFormat;
      var renderer = new _Renderer2.default();
      return renderer.render(post, '/../templates/layouts/show.jade', dateFormat);
    }
  }, {
    key: '_renderAuthor',
    value: function _renderAuthor(author) {
      var dateFormat = this.dateFormat;
      var renderer = new _Renderer2.default();
      return renderer.render(author, '/../templates/layouts/author.jade', dateFormat);
    }
  }, {
    key: '_buildIndexQuery',
    value: function _buildIndexQuery(page, sortBy, tagObject) {
      var perPage = this.perPage;
      var maxPages = this.maxPages;

      var query = _KeystoneHelper2.default.getKeystone().list('BlogPost').paginate({
        page: page,
        perPage: perPage,
        maxPages: maxPages
      }).where('active', true).populate('tags').populate('author');

      if (sortBy == null) {
        query = query.sort('-createdAt');
      } else if (sortBy == 'popularity') {
        query = query.sort('-views');
      } else {
        query = query.sort(sortBy);
      }

      if (tagObject != null) {
        query = query.where('tags').in([tagObject]);
      }

      return query;
    }
  }]);

  return PostController;
})(_Binder3.default);

module.exports = PostController;
//# sourceMappingURL=PostController.js.map
