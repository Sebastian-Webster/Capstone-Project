const User = require('../models/User')
const TextPost = require('../models/TextPost');
const bcrypt = require('bcrypt');
const ImagePost = require('../models/ImagePost');

class UserLibrary {
    login = async (email) => {
        try {
            return await User.findOne({email})
        } catch (error) {
            return {error}
        } 
    }

    hashPassword = async (password) => {
        const saltRounds = 16;

        try {
            return await bcrypt.hash(password, saltRounds)
        } catch (error) {
            return {error}
        }
    }

    createAccount = async (accountObj) => {
        const newUser = new User(accountObj)

        try {
            return newUser.save()
        } catch (error) {
            return {error}
        }
    }

    findUserByEmail = async (email) => {
        try {
            return await User.findOne({email})
        } catch (error) {
            return {error}
        }
    }

    findUserByName = async (name) => {
        try {
            return await User.findOne({name})
        } catch (error) {
            return {error}
        }
    }

    findUserByPublicId = async (publicId) => {
        try {
            return await User.findOne({publicId})
        } catch (error) {
            return {error}
        }
    }

    findUserById = async (id) => {
        try {
            return await User.findOne({_id: id})
        } catch(error) {
            return {error}
        }
    }

    uploadTextPost = (postObj) => {
        const newTextPost = new TextPost(postObj)

        return new Promise((resolve, reject) => {
            newTextPost.save()
            .then(result => resolve(result))
            .catch(error => reject(error))
        })
    }

    uploadImagePost = (postObj) => {
        const newImagePost = new ImagePost(postObj)

        return new Promise((resolve, reject) => {
            newImagePost.save()
            .then(result => resolve(result))
            .catch(error => reject(error))
        })
    }

    updateProfileImage = (userId, filename) => {
        return new Promise((resolve, reject) => {
            User.findOneAndUpdate({_id: userId}, {profileImageKey: filename})
            .then(() => resolve(filename))
            .catch(error => reject(error))
        })
    }

    checkIfUserLikedPost = (likes, publicId) => {
        try {
            return likes.includes(publicId)
        } catch (error) {
            return {error}
        }
    }

    findUsersByNameBeginningWithString = (string) => {
        return new Promise((resolve, reject) => {
            User.find({name: {$regex: `^${string}`, $options: 'i'}}).then(resolve).catch(reject)
        })
    }

    followUser = (followerPublicId, userToFollowPublicId) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                User.findOneAndUpdate({publicId: followerPublicId}, {$push: {following: userToFollowPublicId}}),
                User.findOneAndUpdate({publicId: userToFollowPublicId}, {$push: {followers: followerPublicId}})
            ]).then(resolve).catch(reject)
        })
    }

    unfollowUser = (followerPublicId, userToUnfollowPublicId) => {
        return new Promise((resolve, reject) => {
            Promise.all([
                User.findOneAndUpdate({publicId: followerPublicId}, {$pull: {following: userToUnfollowPublicId}}),
                User.findOneAndUpdate({publicId: userToUnfollowPublicId}, {$pull: {followers: followerPublicId}})
            ]).then(resolve).catch(reject)
        })
    }

    getFollowersFromUserById = (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userFoundById = await this.findUserById(userId)
                resolve(userFoundById.followers)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = UserLibrary