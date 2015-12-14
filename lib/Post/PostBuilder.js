'use strict';
var Post = require('./Post');
var KeystoneHelper = require('../Keystone/KeystoneHelper');
var Promise = require('bluebird');

/**
 * A builder class used to builder an instance of Post from the MongoDB
 */
class PostBuilder {

  /**
   * Get and initialize a Post instance based of a given name
   * @param  {String} slug The key to find a post by. ex. "lorem-ipsum"
   * @return {Post}        The post object that maps to that key
   */
  build(slug){
    // get and create post instance
    return Promise.resolve(KeystoneHelper.getKeystone()
      .list('BlogPost').model
      .findOne({ 'slug' : slug })
      .populate('author')
      .exec())
      .then(function(post){
        var postObject = new Post(post);

        return postObject;
      });
  }

}

module.exports = PostBuilder;
