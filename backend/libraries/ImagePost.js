const ImagePost = require('../models/ImagePost')

class ImagePostLibrary {
    findPostsByCreatorId = (creatorId, limit, skip, viewerId) => {
        return new Promise((resolve, reject) => {
            ImagePost.find({creatorId}).skip(skip).limit(limit).then(result => {
                const toResolve = result.map(item => {
                    const toReturn = {
                        ...item._doc,
                        liked: item.likes.includes(viewerId)
                    }
                    delete toReturn.likes
                    return toReturn
                })
                resolve(toResolve)
            }).catch(error => {
                reject(error)
            })
        })
    }

    likePost = (postId, userPublicId) => {
        return new Promise((resolve, reject) => {
            ImagePost.findOneAndUpdate({_id: postId}, {$push: {likes: userPublicId}})
            .then(() => resolve())
            .catch(error => reject(error))
        })
    }

    unlikePost = (postId, userPublicId) => {
        return new Promise((resolve, reject) => {
            ImagePost.findOneAndUpdate({_id: postId}, {$pull: {likes: userPublicId}})
            .then(() => resolve())
            .catch(error => reject(error))
        })
    }

    findPostById = async (id) => {
        try {
            return await ImagePost.findOne({_id: id})
        } catch (error) {
            return {error}
        }
    }

    checkIfUserIsPostOwner = async (userId, postId) => {
        try {
            const post = await this.findPostById(postId)
            if (post.error) return {error: post.error}
            return String(post.creatorId) === userId
        } catch (error) {
            return {error}
        }
    }

    deletePostById = (postId) => {
        return new Promise((resolve, reject) => {
            ImagePost.deleteOne({_id: postId}).then(() => resolve()).catch(error => reject(error))
        })
    }

    editImagePost = (newTitle, newBody, postObj) => {
        return new Promise(async (resolve, reject) => {
            const editedDate = Date.now() //Gets UTC milliseconds since Jan 1st 1970 at midnight.

            const additionalEditHistory = {
                title: postObj.title,
                body: postObj.body,
                dateMade: postObj.editHistory.length > 0 ? postObj.dateEdited : postObj.datePosted
            }

            ImagePost.findOneAndUpdate({_id: postObj._id}, {$push: {editHistory: additionalEditHistory}, dateEdited: editedDate, title: newTitle, body: newBody})
            .then(resolve)
            .catch(reject)
        })
    }
}

module.exports = ImagePostLibrary;