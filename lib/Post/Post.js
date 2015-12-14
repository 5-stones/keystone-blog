'use strict';

var jade = require('jade');
var KeystoneHelper = require('../Keystone/KeystoneHelper');
var _ = require('lodash');

/**
 * The object representing a blog
 */
class Post {

  /**
   * Constructor for the Post object
   * @param {Post} post The blog post
   */
  constructor(post){
    var self = this;
    self.post = post;
  };

  /**
   * Render the post as a jade template
   * @param  {JSONObject} postAttributes    HTML attributes to apply to post div
   * @param  {JSONObject} titleAttributes   HTML attributes to apply to post title
   * @param  {JSONObject} dateAttributes    HTML attributes to apply to the createdAt date of post
   * @param  {JSONObject} linkAttributes    HTML attributes to apply to the author and tag links of post
   * @param  {JSONObject} buttonAttributes  HTML attributes to apply to the "View comments" button of post
   * @param  {JSONObject} commentAttributes HTML attributes to apply to the "Read more" button of post
   * @return {jade template}                A jade template of the blog post
   */
  render(postAttributes,
        titleAttributes,
        dateAttributes,
        linkAttributes,
        buttonAttributes,
        commentAttributes){

    var self = this;
    var post = self.post;

    var fn = jade.compileFile(__dirname + '/../../templates/layouts/post.jade');

    return fn({
      post: post,
      postAttributes: postAttributes,
      titleAttributes: titleAttributes,
      dateAttributes: dateAttributes,
      linkAttributes: linkAttributes,
      buttonAttributes: buttonAttributes,
      commentAttributes: commentAttributes
    });
  };

}

module.exports = Post;
