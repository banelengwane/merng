const { AuthenticationError, UserInputError } = require('apollo-server');
const { transformSchema } = require('graphql-tools');
const Post = require('../../models/Post');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');
module.exports = {
    Query: {
        async getPosts(){
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts
            } catch (error) {
                throw new Error(error)
            }
        },
        async getPost(_, {postId }){
            try {
                const post = await Post.findById(postId);
                if(post){
                    return post;
                } else {
                    throw new Error('Post not found');
                }
            } catch (error) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context ){
            const user = checkAuth(context);

            // Make sure that the body is not empty
            if(body.trim() === '') {
                throw new Error('Post body must not be empty')
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save()

            context.pubsub.publish('NEW_POST', {
                newPost: post
            })

            return post;
        },
        async deletePost(_, { postId }, context ) {
            const user = checkAuth(context);

            //make sure the creator of the post deletes their own post
            try {
                const post = await Post.findById(postId)
                if(user.username === post.username) {
                    await post.delete()
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Post cannot be deleted')
                }
            } catch (error) {
                throw new Error(error)
            }
        },
        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);

            const post = await Post.findById(postId);

            if(post){
                if(post.likes.find(like => like.username == username)){
                    // post already liked, unlike it
                    post.likes = post.likes.filter(like => like.username !== username);
                    await post.save()
                } else {
                    // post not liked, like it
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save()
                return post;
            } else{
                throw new UserInputError('Post cannot be found');
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}