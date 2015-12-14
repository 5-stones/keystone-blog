'use strict';
var Blog = require('./Blog');
var KeystoneHelper = require('../Keystone/KeystoneHelper');
var Promise = require('bluebird');

/**
 * A builder class used to builder an instance of Blog from the MongoDB
 */
class BlogBuilder {

  // TODO Get this paginating
  /**
   * Get and initialize a Blog instance based on a given page
   * @param  {Integer} page    The current page of posts
   * @param  {Integer} perPage The number of posts to display on each page
   * @return {Blog}            The blog object representing the current page
   */
  build(page, perPage){
    // get and create blog instance
    return Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .find()
      .sort('-createdAt')
      .populate('tags')
      .exec())
      .then(function(posts){
        var blog =  new Blog(posts);

        return blog;
      });
  }

}

module.exports = BlogBuilder;
