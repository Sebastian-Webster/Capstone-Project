const isValidObjectId = require('mongoose').isValidObjectId;
const UserLibrary = require('../libraries/User');
const HTTPHandler = require('../libraries/HTTPHandler');
const LoggerLibrary = require('../libraries/Logger');
const TextPostLibrary = require('../libraries/TextPost');
const ImagePostLibrary = require('../libraries/ImagePost');
const RedisLibrary = require('../libraries/Redis');
const GeneralLibrary = require('../libraries/General');
const FilesystemLibrary = require('../libraries/Filesystem')
const {v4: uuidv4} = require('uuid');
const user = new UserLibrary();
const http = new HTTPHandler();
const logger = new LoggerLibrary();
const TextPost = new TextPostLibrary();
const ImagePost = new ImagePostLibrary();
const redis = new RedisLibrary();
const generalLib = new GeneralLibrary();
const filesystem = new FilesystemLibrary();
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    let email, password;
    email = req?.body?.email;
    password = req?.body?.password;

    if (typeof email !== 'string') {
        http.BadInput(res, "Email must be a string")
        return
    }

    if (typeof password !== 'string') {
        http.BadInput(res, 'Password must be a string')
        return
    }

    email = email.trim()

    if (email.length < 1) {
        http.BadInput(res, 'Email cannot be an empty string')
        return
    }

    const LoginResponse = await user.login(email)

    if (LoginResponse === null) {
        http.BadInput(res, 'No account with this email found.')
        return
    }

    if (typeof LoginResponse === 'object' && LoginResponse.error) {
        http.ServerError(res, 'An error occured while finding user. Please try again later.')
        logger.error(LoginResponse.error)
        return
    }

    bcrypt.compare(password, LoginResponse.password).then(result => {
        if (result) {
            http.OK(res, 'Successfully logged in', {
                email: LoginResponse.email,
                name: LoginResponse.name,
                followers: LoginResponse.followers,
                following: LoginResponse.following,
                _id: LoginResponse._id,
                profileImageKey: LoginResponse.profileImageKey,
                publicId: LoginResponse.publicId
            })
        } else {
            http.BadInput(res, 'Wrong password.')
        }
    }).catch(error => {
        http.ServerError(res, 'An error occured while verifying password. Please try again later.')
        logger.error(error)
    })
}

const signup = async (req, res) => {
    let email, password, name;
    email = req?.body?.email;
    password = req?.body?.password;
    name = req?.body?.name;

    if (typeof email !== 'string') {
        http.BadInput(res, 'Email must be a string')
        return
    }

    if (typeof password !== 'string') {
        http.BadInput(res, 'Password must be a string')
        return
    }

    if (typeof name !== 'string') {
        http.BadInput(res, 'Name must be a string')
        return
    }

    email = email.trim();
    name = name.trim();

    if (email.length < 1) {
        http.BadInput(res, 'Email cannot be an empty string')
        return
    }

    if (password.length < 8) {
        http.BadInput(res, 'Password must be more than 8 characters long')
        return
    }

    if (name.length < 1) {
        http.BadInput('Name cannot be an empty string')
        return
    }

    if (name.length > 20) {
        http.BadInput(res, 'Name cannot be more than 20 characters long')
        return
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        http.BadInput(res, 'Email is invalid')
        return
    }

    if (!/^[a-zA-Z0-9]*$/.test(name)) {
        http.BadInput(res, 'Name can only contain letters and numbers')
        return
    }

    const foundUserWithEmail = await user.findUserByEmail(email)
    const foundUserWithName = await user.findUserByName(name)

    if (foundUserWithEmail !== null) {
        if (foundUserWithEmail.error) {
            http.ServerError(res, 'An error occured while creating your account. Please try again later.')
            logger.error(foundUserWithEmail.error)
        } else {
            http.BadInput(res, 'User with that email already exists.')
        }
        return
    }

    if (foundUserWithName !== null) {
        if (foundUserWithName.error) {
            http.ServerError(res, 'An error occured while creating your account. Please try again later.')
            logger.error(foundUserWithName.error)
        } else {
            http.BadInput(res, 'User with that name already exists.')
        }
        return
    }

    const hashedPassword = await user.hashPassword(password);

    if (typeof hashedPassword === 'object' && hashedPassword !== null && hashedPassword.error) {
        http.ServerError(res, 'An error occured while creating your account. Please try again later.')
        logger.error(hashedPassword.error)
        return
    }

    const newUserObject = {
        name,
        password: hashedPassword,
        email: email,
        followers: [],
        following: [],
        publicId: uuidv4()
    }

    const newUserResponse = await user.createAccount(newUserObject)

    if (typeof newUserObject !== 'object' || !newUserObject) {
        http.ServerError(res, 'An error occured while creating your account. Please try again later.')
        logger.error('FOR SOME REASON NEW USER RESPONSE IS NOT AN OBJECT OR IS A FALSEY VALUE')
        return
    }

    if (newUserObject.error) {
        http.ServerError(res, 'An error occured while creating your account. Please try again later.')
        logger.error(newUserObject.error)
        return
    }

    const toSend = {
        name: newUserResponse.name,
        email: newUserResponse.email,
        followers: newUserResponse.followers,
        following: newUserResponse.following,
        _id: newUserResponse._id,
        publicId: newUserResponse.publicId
    }

    http.OK(res, 'Successfully created an account.', toSend)
}

const uploadTextPost = (req, res) => {
    let title, body, userId;
    title = req?.body?.title;
    body = req?.body?.body
    userId = req?.body?.userId

    if (!isValidObjectId(userId)) {
        http.BadInput(res, 'userId is not a valid objectId')
        return
    }

    if (typeof title !== 'string') {
        http.BadInput(res, 'Title must be a string')
        return
    }

    if (typeof body !== 'string') {
        http.BadInput(res, 'Body must be a string')
        return
    }

    title = title.trim()
    body = body.trim()

    if (title.length < 1) {
        http.BadInput(res, 'Title cannot be an empty string')
        return
    }

    if (body.length < 1) {
        http.BadInput(res, 'Body cannot be an empty string')
        return
    }

    const postObj = {
        title,
        body,
        creatorId: userId,
        datePosted: Date.now()
    }

    user.uploadTextPost(postObj)
    .then(result => {
        http.OK(res, 'Post successfully uploaded')
        redis.addTextPostToCache(userId, result).then(() => {
            logger.log(`Successfully added post with ID: ${result._id} to database and redis cache.`)
        }).catch(error => {
            logger.error(`Successfully added post with ID: ${result._id} to database but failed to add to redis cache because of error: ${error}`)
        })
    })
    .catch(error => {
        http.ServerError(res, 'An error occured while uploading text post. Please try again later.')
        logger.error(error)
    })
}

const getTextPostsByUserName = async (req, res) => {
    const limit = 20;
    let {username, skip = 0, publicId} = req.query;

    if (typeof username !== 'string') {
        http.BadInput(res, 'Username must be a string')
        return
    }

    if (typeof publicId !== 'string') {
        http.BadInput(res, 'publicId must be a string')
        return
    }

    skip = parseInt(skip)

    if (skip === NaN) {
        http.BadInput(res, 'Skip must be a number or not specified')
        return
    }

    const foundUserByName = await user.findUserByName(username);
    const foundUserByPublicId = await user.findUserByPublicId(publicId)

    if (foundUserByName === null) {
        http.BadInput(res, 'User not found.')
        return
    }

    if (foundUserByPublicId === null) {
        http.BadInput(res, 'User not found.')
        return
    }

    if (foundUserByName.error) {
        http.ServerError(res, 'An error occured while fetching text posts. Please try again later.')
        logger.error(foundUserByName.error)
        return
    }

    if (foundUserByPublicId.error) {
        http.ServerError(res, 'An error occured while fetching text posts. Please try again later.')
        logger.error(foundUserByPublicId.error)
        return
    }

    const redisCacheKey = `textposts-bycreatorid-${foundUserByName._id}`

    const cachedItems = await redis.getCache(redisCacheKey, skip, limit);

    if (cachedItems) {
        TextPost.prepareDataToSendToUser(cachedItems, true, publicId).then(postsToSend => {
            http.OK(res, 'Successfully found posts from cache', postsToSend)
            logger.log('Sent user cached text posts')
        }).catch(error => {
            http.ServerError(res, 'An error occured while finding cached text posts.')
            logger.error(error)
        })
    } else {
        TextPost.findPostsByCreatorId(foundUserByName._id).then(result => {
            try {
                redis.setCache(redisCacheKey, result)
            } catch (error) {
                logger.error('An error occured while setting cache of text posts for user with ID: ' + foundUserByName._id)
                logger.error(error)
            }
            let postsToSend = result.splice(skip, generalLib.calculateHowManyItemsToSend(result.length, limit, skip))
            postsToSend = postsToSend.map(post => {
                const {_doc, ...otherNotWantedStuff} = post
                return _doc
            })
            TextPost.prepareDataToSendToUser(postsToSend, false, publicId).then(postsToSend => {
                http.OK(res, 'Successfully found posts', postsToSend)
                logger.log('Sent user non-cached text posts')
            }).catch(error => {
                logger.error(error)
                http.ServerError(res, 'An error occured while fetching text posts. Please try again later.')
            })
        }).catch(error => {
            http.ServerError(res, 'An error occured while fetching text posts. Please try again later.')
            logger.error(error)
        })
    }
}

const uploadImagePost = async (req, res) => {
    if (!req.file) {
        http.BadInput(res, 'No file received.')
        return
    }

    let title, body, userId;
    title = req?.body?.title;
    body = req?.body?.body
    userId = req?.body?.userId

    if (!isValidObjectId(userId)) {
        http.BadInput(res, 'userId is not a valid objectId')
        return
    }

    if (typeof title !== 'string') {
        http.BadInput(res, 'Title must be a string')
        return
    }

    if (typeof body !== 'string') {
        http.BadInput(res, 'Body must be a string')
        return
    }

    title = title.trim()
    body = body.trim()

    if (title.length < 1) {
        http.BadInput(res, 'Title cannot be an empty string')
        return
    }

    if (body.length < 1) {
        http.BadInput(res, 'Body cannot be an empty string')
        return
    }

    const postObj = {
        title,
        body,
        creatorId: userId,
        datePosted: Date.now(),
        imageKey: req.file.filename
    }

    user.uploadImagePost(postObj)
    .then(() => {
        http.OK(res, 'Post successfully uploaded')
    })
    .catch(error => {
        http.ServerError(res, 'An error occured while uploading image post. Please try again later.')
        logger.error(error)
    })
}

const getImagePostsByUserName = async (req, res) => {
    const limit = 20;
    let {username, skip = 0, publicId} = req.query;

    if (typeof username !== 'string') {
        http.BadInput(res, 'Username must be a string')
        return
    }

    if (typeof publicId !== 'string') {
        http.BadInput(res, 'publicId must be a string')
        return
    }

    skip = parseInt(skip)

    if (skip === NaN) {
        http.BadInput(res, 'Skip must be a number or not specified')
        return
    }

    const foundUserByName = await user.findUserByName(username);
    const foundUserByPublicId = await user.findUserByPublicId(publicId)

    if (foundUserByName === null) {
        http.BadInput(res, 'User not found.')
        return
    }

    if (foundUserByPublicId === null) {
        http.BadInput(res, 'User not found.')
        return
    }

    if (foundUserByName.error) {
        http.ServerError(res, 'An error occured while fetching image posts. Please try again later.')
        logger.error(foundUserByName.error)
        return
    }

    if (foundUserByPublicId.error) {
        http.ServerError(res, 'An error ocucred while fetching image posts. Please try again later.')
        logger.error(foundUserByPublicId.error)
        return
    }

    ImagePost.findPostsByCreatorId(foundUserByName._id, limit, skip, publicId).then(result => {
        //Get rid of object IDs
        const cleanedResult = result.map(post => ({title: post.title, body: post.body, datePosted: post.datePosted, imageKey: post.imageKey, liked: post.liked, postId: post._id}))
        http.OK(res, 'Successfully found posts', cleanedResult)
    }).catch(error => {
        http.ServerError(res, 'An error occured while fetching image posts. Please try again later.')
        logger.error(error)
    })
}

const updateProfileImage = async (req, res) => {
    const userId = req.body._id;
    if (!req.file) {
        http.BadInput(res, 'No file received.')
        return
    }

    if (!isValidObjectId(userId)) {
        http.BadInput(res, '_id is not a valid user ID.')
        return
    }

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        http.BadInput(res, 'Could not find user with id.')
        return
    }

    if (userFoundById.error) {
        res.ServerError(res, 'An error occured while updating profile image. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    if (typeof userFoundById.profileImageKey === 'string' && userFoundById.profileImageKey.trim().length > 0) {
        filesystem.deleteFileSync(`/uploads/${userFoundById.profileImageKey}`)
    }

    user.updateProfileImage(userId, req.file.filename)
    .then(() => {
        http.OK(res, 'Successfully updated profile image.', req.file.filename)
    })
    .catch(error => {
        http.ServerError(res, 'An error occured while updating profile image. Please try again later.')
        logger.error(error)
    })
}

const likeImagePost = async (req, res) => {
    const userPublicId = req?.body?.publicId
    const postId = req?.body?.postId

    if (typeof userPublicId !== 'string') {
        http.BadInput(res, 'userPublicId must be a string')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const UserFoundByPublicId = await user.findUserByPublicId(userPublicId)

    if (UserFoundByPublicId === null) {
        http.BadInput(res, 'User was not found with provided public id.')
        return
    }

    if (UserFoundByPublicId.error) {
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
        logger.error(error)
        return
    }

    const PostFoundWithId = await ImagePost.findPostById(postId)

    if (PostFoundWithId === null) {
        http.BadInput(res, 'Image post was not found with provided postId')
        return
    }

    if (PostFoundWithId.error) {
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
        return
    }

    ImagePost.likePost(postId, userPublicId)
    .then(() => {
        http.OK(res, 'Post has successfully been liked.')
    })
    .catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
    })
}

const unlikeImagePost = async (req, res) => {
    const userPublicId = req?.body?.publicId
    const postId = req?.body?.postId

    if (typeof userPublicId !== 'string') {
        http.BadInput(res, 'userPublicId must be a string')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const UserFoundByPublicId = await user.findUserByPublicId(userPublicId)

    if (UserFoundByPublicId === null) {
        http.BadInput(res, 'User was not found with provided public id.')
        return
    }

    if (UserFoundByPublicId.error) {
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
        logger.error(error)
        return
    }

    const PostFoundWithId = await ImagePost.findPostById(postId)

    if (PostFoundWithId === null) {
        http.BadInput(res, 'Image post was not found with provided postId')
        return
    }

    if (PostFoundWithId.error) {
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
    }

    ImagePost.unlikePost(postId, userPublicId)
    .then(() => {
        http.OK(res, 'Post has successfully been unliked.')
    })
    .catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
    })
}

const likeTextPost = async (req, res) => {
    const userPublicId = req?.body?.publicId
    const postId = req?.body?.postId

    if (typeof userPublicId !== 'string') {
        http.BadInput(res, 'userPublicId must be a string')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const UserFoundByPublicId = await user.findUserByPublicId(userPublicId)

    if (UserFoundByPublicId === null) {
        http.BadInput(res, 'User was not found with provided public id.')
        return
    }

    if (UserFoundByPublicId.error) {
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
        logger.error(error)
        return
    }

    const PostFoundWithId = await TextPost.findPostById(postId)

    if (PostFoundWithId === null) {
        http.BadInput(res, 'Text post was not found with provided postId')
        return
    }

    if (PostFoundWithId.error) {
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
    }

    TextPost.likePost(postId, userPublicId)
    .then(() => {
        http.OK(res, 'Post has successfully been liked.')
    })
    .catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while liking the post. Please try again later.')
    })
}

const unlikeTextPost = async (req, res) => {
    const userPublicId = req?.body?.publicId
    const postId = req?.body?.postId

    if (typeof userPublicId !== 'string') {
        http.BadInput(res, 'userPublicId must be a string')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const UserFoundByPublicId = await user.findUserByPublicId(userPublicId)

    if (UserFoundByPublicId === null) {
        http.BadInput(res, 'User was not found with provided public id.')
        return
    }

    if (UserFoundByPublicId.error) {
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
        logger.error(error)
        return
    }

    const PostFoundWithId = await TextPost.findPostById(postId)

    if (PostFoundWithId === null) {
        http.BadInput(res, 'Text post was not found with provided postId')
        return
    }

    if (PostFoundWithId.error) {
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
    }

    TextPost.unlikePost(postId, userPublicId)
    .then(() => {
        http.OK(res, 'Post has successfully been unliked.')
    })
    .catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while unliking the post. Please try again later.')
    })
}

const deleteImagePost = async (req, res) => {
    const {userId, postId} = req.body;

    if (!isValidObjectId(userId)) {
        http.BadInput(res, 'userId must be a valid ObjectId')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const imagePost = await ImagePost.findPostById(postId);

    if (imagePost === null) {
        http.NotFound(res, 'Image post not found.')
        return
    }

    if (imagePost.error) {
        http.ServerError(res, 'An error occured while deleting image post. Please try again later.')
        return
    }

    const isOwner = await ImagePost.checkIfUserIsPostOwner(userId, postId)

    if (typeof isOwner === 'object' && isOwner.error) {
        logger.error(isOwner.error)
        http.ServerError(res, 'An error occured while deleting image post. Please try again later.')
        return
    }

    if (!isOwner) {
        http.NotAuthorized(res, 'You are not authorized to delete this image post.')
        return
    }

    Promise.all([
        ImagePost.deletePostById(postId),
        filesystem.deleteFileAsync(`/uploads/${imagePost.imageKey}`)
    ]).then(() => {
        http.OK(res, 'Post successfully deleted.')
    }).catch(error => {
        http.ServerError(res, 'An error occured while deleting image post. Please try again later.')
        logger.error(error)
    })
}

const deleteTextPost = async (req, res) => {
    const {userId, postId} = req.body;
    logger.log('Deleting text post with ID: ' + postId + ' by user with ID: ' + userId)

    if (!isValidObjectId(userId)) {
        http.BadInput(res, 'userId must be a valid ObjectId')
        return
    }

    if (!isValidObjectId(postId)) {
        http.BadInput(res, 'postId must be a valid ObjectId')
        return
    }

    const isOwner = await TextPost.checkIfUserIsPostOwner(userId, postId)

    if (typeof isOwner === 'object' && isOwner.error) {
        logger.error(isOwner.error)
        http.ServerError(res, 'An error occured while deleting the text post. Please try again later.')
        return
    }

    if (typeof isOwner === 'object' && isOwner.postNotFound) {
        http.BadInput(res, 'Post cannot be found')
        return
    }

    if (!isOwner) {
        http.NotAuthorized(res, 'You are not authorized to delete this text post.')
        return
    }

    Promise.all([
        TextPost.deletePostById(postId),
        redis.removeTextPostFromCache(userId, postId)
    ]).then(() => {
        http.OK(res, 'Post successfully deleted.')
    }).catch(error => {
        http.ServerError(res, 'An error occured while deleting the text post. Please try again later.')
        logger.error(error)
    })
}

const findProfilesByName = (req, res) => {
    const profileName = req?.params?.name

    if (!profileName) {
        http.BadInput(res, 'profileName was not provided')
        return
    }

    if (typeof profileName !== 'string') {
        http.BadInput(res, 'profileName must be a string')
        return
    }

    user.findUsersByNameBeginningWithString(profileName).then(result => {
        const cleanedResult = result.map(generalLib.returnPublicProfileInformation)
        http.OK(res, 'Successfully found profiles.', cleanedResult)
    }).catch(error => {
        http.ServerError(res, 'An error occured while fetching profiles. Please try again later.')
        logger.error(error)
    })
}

const getPublicProfileInformation = async (req, res) => {
    const userPublicId = req?.params?.userPublicId //The publicId of the user that is requesting the information
    const publicId = req?.params?.publicId //The publicId of the user to get the information of

    if (!publicId) {
        http.BadInput(res, 'You must provide a publicId')
        return
    }

    if (typeof publicId !== 'string') {
        http.BadInput(res, 'publicId must be a string')
        return
    }

    if (!userPublicId) {
        http.BadInput(res, 'You must provide a userPublicId')
        return
    }

    if (typeof userPublicId !== 'string') {
        http.BadInput(res, 'userPublicId must be a string')
        return
    }

    const userFound = await user.findUserByPublicId(publicId)

    if (typeof userFound === 'object' && userFound.error) {
        http.ServerError(res, 'An error occured while retrieving public profile information. Please try again later.')
        logger.error(userFound.error)
        return
    }

    if (!userFound) {
        http.NotFound(res, 'User with publicId was not found.')
        return
    }

    const cleanedResult = generalLib.returnPublicProfileInformation(userFound)
    cleanedResult.isFollowing = userFound.followers.includes(userPublicId)
    cleanedResult.isFollower = userFound.following.includes(userPublicId)

    http.OK(res, 'Successfully retreived public profile information', cleanedResult)
}

const followUser = async (req, res) => {
    const followerId = req?.body?.followerId
    const userToFollowPublicId = req?.body?.userToFollowPublicId

    if (!followerId) {
        http.BadInput(res, 'followerId must be supplied')
        return
    }

    if (typeof followerId !== 'string') {
        http.BadInput(res, 'followerId must be a string')
        return
    }

    if (!isValidObjectId(followerId)) {
        http.BadInput(res, 'followerId must be a valid objectId')
        return
    }

    if (!userToFollowPublicId) {
        http.BadInput(res, 'userToFollowPublicId must be supplied')
        return
    }

    if (typeof userToFollowPublicId !== 'string') {
        http.BadInput(res, 'userToFollowPublicId must be a string')
        return
    }

    const followingUser = await user.findUserById(followerId);

    if (followingUser === null) {
        http.NotFound(res, 'User with followerId was not found')
        return
    }

    if (followingUser.error) {
        http.ServerError(res, 'An error occured while following the user. Please try again later.')
        logger.error(followingUser.error)
        return
    }

    if (typeof followingUser.publicId !== 'string') {
        http.ServerError(res, 'An error occured while following the user. Please try again later.')
        logger.error('followingUser.publicId WAS NOT A STRING. followingUser.publicId is actually: ' + followingUser.publicId)
        return
    }

    if (followingUser.publicId === userToFollowPublicId) {
        http.NotAuthorized(res, 'You cannot follow yourself.')
        return
    }

    const userToFollow = await user.findUserByPublicId(userToFollowPublicId)

    if (userToFollow === null) {
        http.NotFound(res, 'User to follow was not found.')
        return
    }

    if (userToFollow.error) {
        http.ServerError(res, 'An error occured while following the user. Please try again later.')
        return
    }

    if (userToFollow.followers.includes(followingUser.publicId)) {
        http.NotAuthorized(res, 'You cannot follow someone more than once.')
        return
    }

    user.followUser(followingUser.publicId, userToFollowPublicId).then(() => {
        http.OK(res, 'Successfully followed the user.')
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while following the user. Please try again later.')
    })
}

const unfollowUser = async (req, res) => {
    const followerId = req?.body?.followerId
    const userToUnfollowPublicId = req?.body?.userToUnfollowPublicId

    if (!followerId) {
        http.BadInput(res, 'followerId must be supplied')
        return
    }

    if (typeof followerId !== 'string') {
        http.BadInput(res, 'followerId must be a string')
        return
    }

    if (!isValidObjectId(followerId)) {
        http.BadInput(res, 'followerId must be a valid objectId')
        return
    }

    if (!userToUnfollowPublicId) {
        http,BadInput(res, 'userToUnfollowPublicId must be supplied')
        return
    }

    if (typeof userToUnfollowPublicId !== 'string') {
        http.BadInput(res, 'userToUnfollowPublicId must be a string')
        return
    }

    const followingUser = await user.findUserById(followerId);

    if (followingUser === null) {
        http.NotFound(res, 'User with followerId was not found')
        return
    }

    if (followingUser.error) {
        http.ServerError(res, 'An error occured while unfollowing the user. Please try again later.')
        logger.error(followingUser.error)
        return
    }

    if (typeof followingUser.publicId !== 'string') {
        http.ServerError(res, 'An error occured while unfollowing the user. Please try again later.')
        logger.error('followingUser.publicId WAS NOT A STRING. followingUser.publicId is actually: ' + followingUser.publicId)
        return
    }

    if (followingUser.publicId === userToUnfollowPublicId) {
        http.NotAuthorized(res, 'You cannot unfollow yourself.')
        return
    }

    const userToUnfollow = await user.findUserByPublicId(userToUnfollowPublicId)

    if (userToUnfollow === null) {
        http.NotFound(res, 'User to unfollow was not found.')
        return
    }

    if (userToUnfollow.error) {
        http.ServerError(res, 'An error occured while unfollowing the user. Please try again later.')
        return
    }

    user.unfollowUser(followingUser.publicId, userToUnfollowPublicId).then(() => {
        http.OK(res, 'Successfully unfollowed the user.')
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while unfollowing the user. Please try again later.')
    })
}

const getUserFollowers = async (req, res) => {
    const userId = req?.body?.userId;
    const limit = 20;
    let skip = req?.body?.skip

    if (!userId) {
        http.BadInput(res, 'userId must be provided')
        return
    }

    if (typeof userId !== 'string') {
        http.BadInput(res, 'userId must be a string')
        return
    }

    if (!isValidObjectId(userId)) {
        http.BadInput(res, 'userId must be a valid objectId')
        return
    }

    if (!skip) {
        http.BadInput(res, 'skip must be supplied')
        return
    }

    if (typeof skip !== 'number') {
        http.BadInput(res, 'skip must be a number')
        return
    }

    const userFound = await user.findUserById(userId)

    if (userFound === null) {
        http.NotFound(res, 'User with ID could not be found')
        return
    }

    if (userFound.error) {
        http.ServerError(res, 'An error occured while finding followers. Please try again later.')
        return
    }

    try {
        const followersToSend = userFound.followers.splice(skip, generalLib.calculateHowManyItemsToSend(userFound.followers.length, limit, skip))
        http.OK(res, 'Successfully found followers', followersToSend)
    } catch (error) {
        http.ServerError(res, 'An error occured while finding followers. Please try again later.')
    }
}

module.exports = {
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
    deleteImagePost,
    deleteTextPost,
    findProfilesByName,
    getPublicProfileInformation,
    followUser,
    unfollowUser,
    getUserFollowers
}