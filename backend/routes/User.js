const express = require('express')
const router = express.Router();
const { 
    login, 
    signup, 
    uploadTextPost, 
    getTextPostsByUserName, 
    uploadImagePost, 
    getImagePostsByUserName,
    updateProfileImage,
    likeImagePost,
    unlikeImagePost,
    likeTextPost,
    unlikeTextPost,
    deleteTextPost,
    deleteImagePost,
    findProfilesByName,
    getPublicProfileInformation,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    editTextPost,
    editImagePost,
    refreshUserFollowers
} = require('../controllers/User')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads')
    },
    filename: (req, file, callback) => {
        let extname = path.extname(file.originalname)
        const allowedExtensions = ['.jpeg', '.jpg']
        if (allowedExtensions.includes(extname)) {
            const uuidFileName = uuidv4()
            callback(null, uuidFileName + extname)
        } else {
            //Error
            callback("Invalid file format.")
        }
    }
})

const upload = multer({ storage: storage })

router.post('/login', (req, res) => {
    login(req, res)
})

router.post('/signup', (req, res) => {
    signup(req, res)
})

router.post('/textPost', (req, res) => {
    uploadTextPost(req, res)
})

router.get('/textPostsByUserName', (req, res) => {
    getTextPostsByUserName(req, res)
})

router.post('/imagePost', upload.single('image'), async (req, res) => {
    uploadImagePost(req, res)
})

router.get('/imagePostsByUserName', (req, res) => {
    getImagePostsByUserName(req, res)
})

router.post('/updateProfileImage', upload.single('image'), async (req, res) => {
    updateProfileImage(req, res)
})

router.post('/likeImagePost', (req, res) => {
    likeImagePost(req, res)
})

router.post('/unlikeImagePost', (req, res) => {
    unlikeImagePost(req, res)
})

router.post('/likeTextPost', (req, res) => {
    likeTextPost(req, res)
})

router.post('/unlikeTextPost', (req, res) => {
    unlikeTextPost(req, res)
})

router.delete('/textPost', (req, res) => {
    deleteTextPost(req, res)
})

router.delete('/imagePost', (req, res) => {
    deleteImagePost(req, res)
})

router.get('/searchProfilesByName/:name', (req, res) => {
    findProfilesByName(req, res)
})

router.get('/publicProfileInformation/:publicId/:userPublicId', getPublicProfileInformation)

router.post('/followUser', followUser)

router.post('/unfollowUser', unfollowUser)

router.post('/getUserFollowers', getUserFollowers)

router.post('/getUserFollowing', getUserFollowing)

router.put('/textpost', editTextPost)

router.put('/imagepost', editImagePost)

router.post('/refreshuserfollowers', refreshUserFollowers)

module.exports = router;