const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const { getIO } = require('../socket');


exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const itemsPerPage = 2;
  let totalItems
  try {
    totalItems = await Post.find().countDocuments()
    const posts = await Post.find().populate('creator').skip((currentPage - 1) * itemsPerPage).limit(itemsPerPage);
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace('\\', '/');
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.userId
  });

  try {
    await post.save()
    const user = await User.findById(req.userId)
    creator = user;
    user.posts.push(post);
    await user.save();
    getIO().emit('posts', { action: 'create', post: post });
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: creator._id, name: creator.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.imageUrl;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (post.imageUrl !== imageUrl) deleteImage(post.imageUrl);
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();
    getIO().emit('posts', { action: 'update', post: result });
    res.status(200).json({ message: 'Post updated!', post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (post.imageUrl) deleteImage(post.imageUrl);
    await Post.findByIdAndDelete(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    getIO().emit('posts', { action: 'delete', postId: postId });
    res.status(200).json({ message: 'Deleted post.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


const deleteImage = (imageUrl) => {
  const imagePath = imageUrl.split('images/')[1];
  let filePath = path.join(__dirname, '..', 'images', imagePath);
  fs.unlink(filePath, (err) => console.log(err));
};
