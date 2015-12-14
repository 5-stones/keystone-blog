'use strict';

var jade = require('jade');
var KeystoneHelper = require('../Keystone/KeystoneHelper');
var _ = require('lodash');
var Moment = require('moment');

/**
 * The object representing a blog
 */
class Blog {

  /**
   * Constructor for the Blog object
   * @param {List[BlogPost]} posts A list of posts to be attached to the blog object
   */
  constructor(posts){
    var self = this;
    self.posts = posts;
  };

  /**
   * Render the index as a jade template
   * @param  {String}     dateFormat       Format to display post date in. See http://momentjs.com/#format-dates for options
   * @param  {JSONObject} postAttributes   HTML attributes to apply to each post div
   * @param  {JSONObject} headerAttributes  HTML attributes to apply to each post title
   * @param  {JSONObject} subHeaderAttributes   HTML attributes to apply to the createdAt date each post
   * @param  {JSONObject} previewAttributes   HTML attributes to apply to the author and tag links of each post
   * @param  {JSONObject} buttonAttributes HTML attributes to apply to the "Read more" button of each post
   * @return {jade template}               A jade template of the current page of the blog index
   */
  render(dateFormat, postAttributes, headerAttributes, subHeaderAttributes, previewAttributes, buttonAttributes){
    var self = this;
    var posts = self.posts;

    var fn = jade.compileFile(__dirname + '/../../templates/layouts/index.jade');

    return fn({
      moment: Moment,
      dateFormat: dateFormat,
      posts: posts,
      postAttributes: postAttributes,
      headerAttributes: headerAttributes,
      subHeaderAttributes: subHeaderAttributes,
      previewAttributes: previewAttributes,
      buttonAttributes: buttonAttributes
    });
  };

}

module.exports = Blog;
