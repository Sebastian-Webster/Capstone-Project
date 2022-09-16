const TextPost = require('../models/TextPost')
const User = require('./User')
const user = new User();

class TextPostLibrary {
    findPostsByCreatorId = (creatorId) => {
        return new Promise((resolve, reject) => {
            TextPost.find({creatorId}).then(resolve).catch(reject)
        })
    }

    prepareDataToSendToUser = (posts, cached, publicId) => {
        return new Promise((resolve, reject) => {
            const tempArray = []
            for (const item of posts) {
                const {_id, creatorId, likes, __v, editHistory, ...cleanResult} = item;
                cleanResult.liked = user.checkIfUserLikedPost(likes, publicId)
                if (typeof cleanResult.liked !== 'boolean') {
                    reject(cleanResult.liked) //Reject because cleanResult.liked is an error
                }
                cleanResult.cached = cached;
                cleanResult.postId = _id;
                cleanResult.edited = item.editHistory.length > 0;
                cleanResult.timesEdited = item.editHistory.length;
                tempArray.push(cleanResult)
            }
            resolve(tempArray)
        })
    }

    likePost = (postId, userPublicId) => {
        return new Promise((resolve, reject) => {
            TextPost.findOne({_id: postId}).then(postFound => {
                if (!postFound.likes.includes(userPublicId)) {
                    TextPost.findOneAndUpdate({_id: postId}, {$push: {likes: userPublicId}}).then(() => {
                        resolve()
                    }).catch(error => reject(error))
                } else reject('User with public id has already liked this post')
            }).catch(error => reject(error))
        })
    }

    unlikePost = (postId, userPublicId) => {
        return new Promise((resolve, reject) => {
            TextPost.findOneAndUpdate({_id: postId}, {$pull: {likes: userPublicId}})
            .then(() => resolve())
            .catch(error => reject(error))
        })
    }

    findPostById = async (id) => {
        try {
            return await TextPost.findOne({_id: id})
        } catch (error) {
            return {error}
        }
    }

    checkIfUserIsPostOwner = async (userId, postId) => {
        try {
            const post = await this.findPostById(postId)
            if (post === null) return {postNotFound: true}
            if (post.error) return {error: post.error}
            return String(post.creatorId) === userId
        } catch (error) {
            return {error}
        }
    }

    deletePostById = (postId) => {
        return new Promise((resolve, reject) => {
            TextPost.deleteOne({_id: postId}).then(() => resolve()).catch(error => reject(error))
        })
    }

    editTextPost = (newTitle, newBody, postObj) => {
        return new Promise(async (resolve, reject) => {
            try {
                const editedDate = Date.now() //Gets UTC milliseconds since Jan 1st 1970 at midnight.

                const additionalEditHistory = {
                    title: postObj.title,
                    body: postObj.body,
                    dateMade: postObj.editHistory.length > 0 ? postObj.dateEdited : postObj.datePosted
                }

                TextPost.findOneAndUpdate({_id: postObj._id}, {$push: {editHistory: additionalEditHistory}, dateEdited: editedDate, title: newTitle, body: newBody}, {returnDocument: 'after'})
                .then(resolve)
                .catch(reject)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = TextPostLibrary;