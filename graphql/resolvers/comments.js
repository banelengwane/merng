const { UserInputError, AuthenticationError } = require('apollo-server');
const Post = require('../../models/Post');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

module.exports = {
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const { username } = checkAuth(context);

            if(body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment must not be empty'
                    }
                })
            }

            const post = await Post.findById(postId);

            if(post){
                post.comments.unshift({
                    body: body,
                    username,
                    createdAt: new Date().toISOString()
                })

                await post.save()
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        },
        deleteComment: async(_, {postId, commentId}, context) => {
            const {username } = await checkAuth(context);
            
            // find a post 
            const post = await Post.findById(postId)
            
            if(post) {
                //find the comment in the array of comments
                const commentIndex = post.comments.findIndex(c => c.id === commentId);

                // stop other users from deleting comments that's not theirs
                if(post.comments[commentIndex].username === username ){
                    post.comments.splice(commentIndex, 1)
                    await post.save();
                    return post;
                    
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } else {
                throw new UserInputError('Post not found');
            }
        }
    }
}