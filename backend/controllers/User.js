const isValidObjectId = require('mongoose').isValidObjectId;
const UserLibrary = require('../libraries/User');
const HTTPHandler = require('../libraries/HTTPHandler');
const LoggerLibrary = require('../libraries/Logger');
const TextPostLibrary = require('../libraries/TextPost');
const ImagePostLibrary = require('../libraries/ImagePost');
const RedisLibrary = require('../libraries/Redis');
const GeneralLibrary = require('../libraries/General');
const FilesystemLibrary = require('../libraries/Filesystem')
const ErrorCheckLibrary = require('../libraries/ErrorCheck')
const {v4: uuidv4} = require('uuid');
const user = new UserLibrary();
const http = new HTTPHandler();
const logger = new LoggerLibrary();
const TextPost = new TextPostLibrary();
const ImagePost = new ImagePostLibrary();
const redis = new RedisLibrary();
const generalLib = new GeneralLibrary();
const filesystem = new FilesystemLibrary();
const errorCheck = new ErrorCheckLibrary();
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
                followers: LoginResponse.followers.length,
                following: LoginResponse.following.length,
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
        http.BadInput(res, 'Password must be 8 or more characters long')
        return
    }

    if (password.length > 18) {
        http.BadInput(res, 'Password must be 18 or less characters long')
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
        followers: newUserResponse.followers.length,
        following: newUserResponse.following.length,
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

    ImagePost.findPostsByCreatorId(foundUserByName._id, limit, skip).then(result => {
        //Get rid of object IDs
        const cleanedResult = ImagePost.prepareDataToSendToUserSync(result, false, publicId)
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
        http.ServerError(res, 'An error occured while updating profile image. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    if (typeof userFoundById.profileImageKey === 'string' && userFoundById.profileImageKey.trim().length > 0) {
        filesystem.deleteFileAsync(`uploads/${userFoundById.profileImageKey}`)
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

    Promise.all([
        TextPost.likePost(postId, userPublicId),
        redis.AddLikeToTextPostInCache(userPublicId, PostFoundWithId)
    ])
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

    Promise.all([
        TextPost.unlikePost(postId, userPublicId),
        redis.RemoveLikeFromTextPostInCache(userPublicId, PostFoundWithId)
    ])
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
        filesystem.deleteFileAsync(`uploads/${imagePost.imageKey}`)
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
    const userId = req?.body?.userId //The id of the user that is requesting the information
    const publicId = req?.body?.publicId //The publicId of the user to get the information of

    if (!publicId) {
        http.BadInput(res, 'You must provide a publicId')
        return
    }

    if (typeof publicId !== 'string') {
        http.BadInput(res, 'publicId must be a string')
        return
    }

    if (!userId) {
        http.BadInput(res, 'You must provide a userId')
        return
    }

    if (typeof userId !== 'string') {
        http.BadInput(res, 'userId must be a string')
        return
    }

    if (!isValidObjectId(userId)) {
        return http.BadInput(res, 'userId must be a valid objectId')
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

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        return http.NotFound(res, 'Cannot find user by id')
    }

    if (userFoundById.error) {
        return http.ServerError(res, 'An error occured while retrieving public profile information. Please try again later.')
    }

    const cleanedResult = generalLib.returnPublicProfileInformation(userFound)
    cleanedResult.isFollowing = userFound.followers.includes(userFoundById.publicId)
    cleanedResult.isFollower = userFound.following.includes(userFoundById.publicId)
    if (userFound.hideFollowing) {
        cleanedResult.followingDisabled = userId !== String(userFound._id)
    }
    if (userFound.hideFollowers) {
        cleanedResult.followersDisabled = userId !== String(userFound._id)
    }

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
    const profilePublicId = req?.body?.profilePublicId
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

    if (typeof skip !== 'number') {
        http.BadInput(res, 'skip must be a number')
        return
    }

    if (typeof profilePublicId !== 'string') {
        http.BadInput(res, 'profilePublicId must be a string')
        return
    }

    const userFound = await user.findUserByPublicId(profilePublicId)

    if (userFound === null) {
        http.NotFound(res, 'User with ID could not be found')
        return
    }

    if (userFound.error) {
        http.ServerError(res, 'An error occured while finding followers. Please try again later.')
        return
    }

    if (userFound.hideFollowers && userId !== String(userFound._id)) {
        return http.NotAuthorized(res, `You are not authorized to see who follows ${userFound.name}`)
    }

    try {
        const followersToSend = userFound.followers.splice(skip, generalLib.calculateHowManyItemsToSend(userFound.followers.length, limit, skip))
        http.OK(res, 'Successfully found followers', followersToSend)
    } catch (error) {
        http.ServerError(res, 'An error occured while finding followers. Please try again later.')
    }
}

const getUserFollowing = async (req, res) => {
    const userId = req?.body?.userId;
    const profilePublicId = req?.body?.profilePublicId
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

    if (typeof skip !== 'number') {
        http.BadInput(res, 'skip must be a number')
        return
    }

    if (typeof profilePublicId !== 'string') {
        http.BadInput(res, 'profilePublicId must be a string')
        return
    }

    const userFound = await user.findUserByPublicId(profilePublicId)

    if (userFound === null) {
        http.NotFound(res, 'User with ID could not be found')
        return
    }

    if (userFound.error) {
        http.ServerError(res, 'An error occured while finding following. Please try again later.')
        return
    }

    if (userFound.hideFollowing === true && userId !== String(userFound._id)) {
        return http.NotAuthorized(res, `You are not authorized to see who ${userFound.name} is following`)
    }

    try {
        const followingToSend = userFound.following.splice(skip, generalLib.calculateHowManyItemsToSend(userFound.following.length, limit, skip))
        console.log(followingToSend)
        http.OK(res, 'Successfully found following', followingToSend)
    } catch (error) {
        http.ServerError(res, 'An error occured while finding following. Please try again later.')
    }
}

const editTextPost = async (req, res) => {
    const userId = req?.body?.userId;
    const postId = req?.body?.postId;
    let newTitle = req?.body?.newTitle;
    let newBody = req?.body?.newBody;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('userId', userId),
        errorCheck.checkIfValueIsValidObjectId('postId', postId),
        errorCheck.checkIfValueIsNotEmptyString('newTitle', newTitle),
        errorCheck.checkIfValueIsNotEmptyString('newBody', newBody)
    ]

    for (const error of errorChecks) {
        if (error) {
            http.BadInput(res, error)
            return
        }
    }

    newTitle = newTitle.trim()
    newBody = newBody.trim()

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        http.NotFound(res, 'Could not find user with id.')
        return
    }

    if (userFoundById.error) {
        http.ServerError(res, 'An error occured while editing text post. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    const postFoundById = await TextPost.findPostById(postId);

    if (postFoundById === null) {
        http.NotFound(res, 'Could not find post with id.')
        return
    }

    if (postFoundById.error) {
        http.ServerError(res, 'An error occured while editing text post. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    if (postFoundById.editHistory.length > 19) {
        return http.Forbidden(res, 'Post has been edited too many times')
    }

    const isOwner = await TextPost.checkIfUserIsPostOwner(userId, postId)

    if (isOwner.error) {
        http.ServerError(res, 'An error occured while editing text post. Please try again later.')
        logger.error(isOwner.error)
        return
    }

    if (isOwner !== true) {
        http.NotAuthorized(res, 'You do not have authorizarion to edit this text post.')
        return
    }

    if (newTitle === postFoundById.title && newBody === postFoundById.body) {
        console.log('Not saving edit as title and body are same as original')
        http.BadInput(res, 'The new title and body cannot be the same as the old title and body.')
        return
    }

    let newDocument;

    try {
        newDocument = await TextPost.editTextPost(newTitle, newBody, postFoundById);
        http.OK(res, 'Successfully edited text post')
    } catch (error) {
        logger.error(error)
        http.ServerError(res, 'An error occured while editing text post. Please try again later')
    }

    if (newDocument) {
        redis.EditTextPostInCache(newDocument).then(() => {
            logger.log('Successfully saved edited post in redis cache')
        }).catch(error => {
            logger.error('Error occured while saving edited post to redis cache:')
            logger.error(error)
        })
    } else {
        logger.error('newDocument is undefined')
    }
}

const editImagePost = async (req, res) => {
    const userId = req?.body?.userId;
    const postId = req?.body?.postId;
    let newTitle = req?.body?.newTitle;
    let newBody = req?.body?.newBody;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('userId', userId),
        errorCheck.checkIfValueIsValidObjectId('postId', postId),
        errorCheck.checkIfValueIsNotEmptyString('newTitle', newTitle),
        errorCheck.checkIfValueIsNotEmptyString('newBody', newBody)
    ]

    for (const error of errorChecks) {
        if (error) {
            http.BadInput(res, error)
            return
        }
    }

    newTitle = newTitle.trim()
    newBody = newBody.trim()

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        http.NotFound(res, 'Could not find user with id.')
        return
    }

    if (userFoundById.error) {
        http.ServerError(res, 'An error occured while editing image post. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    const postFoundById = await ImagePost.findPostById(postId);

    if (postFoundById === null) {
        http.NotFound(res, 'Could not find post with id.')
        return
    }

    if (postFoundById.error) {
        http.ServerError(res, 'An error occured while editing image post. Please try again later.')
        logger.error(userFoundById.error)
        return
    }

    if (postFoundById.editHistory.length > 19) {
        return http.Forbidden(res, 'Post has been edited too many times')
    }

    const isOwner = await ImagePost.checkIfUserIsPostOwner(userId, postId)

    if (isOwner.error) {
        http.ServerError(res, 'An error occured while editing image post. Please try again later.')
        logger.error(isOwner.error)
        return
    }

    if (isOwner !== true) {
        http.NotAuthorized(res, 'You do not have authorizarion to edit this image post.')
        return
    }

    if (newTitle === postFoundById.title && newBody === postFoundById.body) {
        console.log('Not saving edit as title and body are same as original')
        http.BadInput(res, 'The new title and body cannot be the same as the old title and body.')
        return
    }

    ImagePost.editImagePost(newTitle, newBody, postFoundById).then(() => {
        http.OK(res, 'Successfully edited image post')
    }).catch(error => {
        logger.error(error)
    http.ServerError(res, 'An error occured while editing image post. Please try again later')
    })
}

const refreshUserFollowers = (req, res) => {
    const userId = req?.body?.userId

    const error = errorCheck.checkIfValueIsValidObjectId('userId', userId)
    if (error) {
        return http.BadInput(res, error)
    }

    user.getFollowersFromUserById(userId).then(followers => {
        http.OK(res, 'Successfully retrieved followers', followers.length)
    }).catch(error => {
        http.ServerError(res, 'An error occured while retrieving followers. Please try again later.')
        logger.error(error)
    })
}

const loadHomeFeed = async (req, res) => {
    const userId = req?.body?.userId;
    const skip = req?.body?.skip || 0;
    const limit = 20;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('userId', userId),
        errorCheck.checkIfValueIsInt('skip', skip)
    ]

    for (const error of errorChecks) {
        if (error) return http.BadInput(res, error)
    }

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        return http.NotFound(res, 'User with userId cannot be found')
    }

    if (userFoundById.error) {
        logger.error(userFoundById.error)
        return http.ServerError(res, 'An error occured while finding user with id. Please try again later.')
    }

    const userPublicId = userFoundById.publicId

    user.getFollowingFromUserById(userId).then(following => {
        user.getUserIdArrayFromUserPublicIdArray(following).then(userIds => {
            //Create a new set of userIds (get the unique ids) and then convert it to an array
            const uniqueIds = Array.from(new Set(userIds.map(id => String(id))))
            console.log(uniqueIds)
            const userData = {}
            Promise.all(
                uniqueIds.map(id => {
                    return new Promise(async (resolve, reject) => {
                        const userFoundById = await user.findUserById(id)

                        if (userFoundById === null) return reject('User not found with id: ' + id)

                        if (userFoundById.error) return reject(userFoundById.error)

                        resolve([userFoundById.name, userFoundById.profileImageKey])
                    })
                })
            ).then(userDataArray => {
                uniqueIds.forEach((id, index) => {
                    userData[id] = {
                        name: userDataArray[index][0],
                        profileImageKey: userDataArray[index][1] || ''
                    }
                })

                console.log(userData)

                Promise.all([
                    TextPost.getTextPostsFromUserIdArray(userIds),
                    ImagePost.getImagePostsFromUserIdArray(userIds)
                ]).then(async ([textPosts, imagePosts]) => {
                    textPosts = textPosts.map(post => {
                        post = post._doc
                        post = {...post, ...userData[post.creatorId]}
                        return post
                    })
                    imagePosts = imagePosts.map(post => {
                        post = post._doc
                        post = {...post, ...userData[post.creatorId]}
                        return post
                    })
                    textPosts = TextPost.prepareDataToSendToUserSync(textPosts, false, userPublicId)
                    imagePosts = ImagePost.prepareDataToSendToUserSync(imagePosts, false, userPublicId)
                    const postsArray = textPosts.concat(imagePosts)
                    //This sort prioritizes showing posts that have recently been uploaded, and then 2nd priority is to show posts that have recently been edited, and then last priority is everything else
                    //If both posts have not been edited, compare them by their post dates
                    //If post a has not been edited, but post b has, compare the posts by b's edit date and a's post date
                    //If post b has not been edited, but post a has, compare the posts by b's post date and a's edit date
                    //If both posts have been edited, compare them by their edit dates
                    postsArray.sort((a, b) => !a.dateEdited && !b.dateEdited ? b.datePosted - a.datePosted : !a.dateEdited ? b.dateEdited - a.datePosted : !b.dateEdited ? b.datePosted - a.dateEdited : b.dateEdited - a.dateEdited)
                    const toSend = postsArray.splice(skip, generalLib.calculateHowManyItemsToSend(postsArray.length, limit, skip))
                    http.OK(res, 'Successfully loaded home feed', toSend)
                }).catch(error => {
                    http.ServerError(res, 'An error occured while loading home feed. Please try again later.')
                    logger.error(error)
                })
            }).catch(error => {
                http.ServerError(res, 'An error occured while loading home feed. Please try again later.')
                logger.error(error)
            })
        })
    }).catch(error => {
        http.ServerError(res, 'An error occured while loading home feed. Please try again later.')
        logger.error(error)
    })
}

const changeEmail = async (req, res) => {
    let newEmail = req?.body?.newEmail;
    const password = req?.body?.password;
    const userId = req?.body?.userId;

    if (typeof newEmail !== 'string') {
        return http.BadInput(res, 'newEmail must be a string')
    }

    if (typeof password !== 'string') {
        return http.BadInput(res, 'password must be a string')
    }

    newEmail = newEmail.trim()

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newEmail)) {
        return http.BadInput(res, 'Email is invalid')
    }

    const userFoundByEmail = await user.findUserByEmail(newEmail)

    if (typeof userFoundByEmail === 'object' && userFoundByEmail !== null && userFoundByEmail.error) {
        logger.error(userFoundByEmail.error)
        return http.ServerError(res, 'An error occured while changing email. Please try again later.')
    }

    if (userFoundByEmail !== null) {
        return http.BadInput(res, 'User with that email already exists.')
    }

    const userIdError = errorCheck.checkIfValueIsValidObjectId('userId', userId)
    if (userIdError) return http.BadInput(res, userIdError)

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        return http.NotFound(res, 'User with id cannot be found')
    }

    if (userFoundById.error) {
        logger.error(userFoundById.error)
        return http.ServerError(res, 'An error occured while changing email. Please try again later.')
    }

    bcrypt.compare(password, userFoundById.password).then(result => {
        if (result) {
            user.changeEmail(userId, newEmail).then(() => {
                http.OK(res, 'Successfully changed email.')
            }).catch(error => {
                logger.error(error)
                http.ServerError(res, 'An error occured while changing email. Please try again later.')
            })
        } else {
            http.NotAuthorized(res, 'Wrong password.')
        }
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while changing email. Please try again later.')
    })
}

const changePassword = async (req, res) => {
    const userId = req?.body?.userId;
    const oldPassword = req?.body?.oldPassword;
    const newPassword = req?.body?.newPassword;
    const confirmPassword = req?.body?.confirmPassword;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('userId', userId),
        errorCheck.checkIfValueIsNotEmptyString('oldPassword', oldPassword),
        errorCheck.checkIfValueIsNotEmptyString('newPassword', newPassword),
        errorCheck.checkIfValueIsNotEmptyString('confirmPassword', confirmPassword)
    ]

    for (const error of errorChecks) {
        if (error) return http.BadInput(res, error)
    }

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) return http.NotFound(res, 'User with id not found.')

    if (userFoundById.error) {
        logger.error(userFoundById.error)
        return http.ServerError(res, 'An error occured while changing password. Please try again later.')
    }

    if (newPassword !== confirmPassword) return http.BadInput(res, 'Passwords do not match.')

    if (newPassword.length < 8) http.BadInput(res, 'New password must be 8 or more characters long.')

    bcrypt.compare(oldPassword, userFoundById.password).then(async result => {
        if (result) {
            const hashedPassword = await user.hashPassword(newPassword)
            if (typeof hashedPassword === 'object' && hashedPassword !== 'null' && hashedPassword.error) {
                logger.error(hashedPassword.error)
                http.ServerError(res, 'An error occured while changing password. Please try again later.')
            } else {
                user.changePassword(userId, hashedPassword).then(() => {
                    http.OK(res, 'Successfully changed password.')
                }).catch(error => {
                    logger.error(error)
                    http.ServerError(res, 'An error occured while changing password. Please try again later.')
                })
            }
        } else {
            http.NotAuthorized(res, 'Wrong password.')
        }
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while changing password. Please try again later.')
    })
}

const resetProfilePicture = async (req, res) => {
    const userId = req?.body?.userId;

    const error = errorCheck.checkIfValueIsValidObjectId('userId', userId)
    if (error) return http.BadInput(res, error)

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) return http.NotFound(res, 'User with id could not be found.')

    if (userFoundById.error) {
        logger.error(userFoundById.error)
        return http.ServerError(res, 'An error occured while resetting profile picture. Please try again later.')
    }

    user.resetProfilePicture(userId).then(() => {
        http.OK(res, 'Successfully reset profile picture')
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occur4ed while resetting profile picture. Please try again later.')
    })
}

const getPostLikes = async (req, res) => {
    let {postType, postId, skip = 0} = req.query;
    const limit = 20;

    skip = parseInt(skip)

    if (skip === NaN) return http.BadInput(res, 'Skip must be a number or not specified')

    const postIdErrorCheck = errorCheck.checkIfValueIsValidObjectId('postId', postId)
    if (postIdErrorCheck) return http.BadInput(res, postIdErrorCheck)

    if (postType === 'image') {
        const postFound = await ImagePost.findPostById(postId)

        if (postFound === null) return http.NotFound(res, 'Post with Id could not be found')

        if (postFound.error) {
            logger.error(postFound.error)
            http.ServerError(res, 'An error occured while getting post like count. Please try again later.')
        }

        http.OK(res, 'Successfully found post likes', postFound.likes.splice(skip, generalLib.calculateHowManyItemsToSend(postFound.likes.length, limit, skip)))
    } else if (postType === 'text') {
        const postFound = await TextPost.findPostById(postId)

        if (postFound === null) return http.NotFound(res, 'Post with Id could not be found')

        if (postFound.error) {
            logger.error(postFound.error)
            http.ServerError(res, 'An error occured while getting post like count. Please try again later.')
        }

        http.OK(res, 'Successfully found post likes', postFound.likes.splice(skip, generalLib.calculateHowManyItemsToSend(postFound.likes.length, limit, skip)))
    } else {
        http.BadInput(res, 'postType must either be image or text')
    }
}

const getPostHistory = async (req, res) => {
    const {postId, postType, publicId} = req.query;
    console.log(req.query)

    const postIdErrorCheck = errorCheck.checkIfValueIsValidObjectId('postId', postId)
    if (postIdErrorCheck) return http.BadInput(res, postIdErrorCheck)

    var post;

    if (postType === 'image') {
        post = await ImagePost.findPostById(postId)
    } else if (postType === 'text') {
        post = await TextPost.findPostById(postId)
    } else {
        return http.BadInput(res, 'postType must be either image or text')
    }

    if (post === null) return http.NotFound(res, 'Post with id cannot be found')

    if (post.error) {
        logger.error(post.error)
        return http.ServerError(res, 'An error occured while retrieving post history. Please try again later.')
    }

    const userFoundByPostCreatorId = await user.findUserById(post.creatorId)

    if (userFoundByPostCreatorId === null) {
        return hhtp.NotFound(res, 'User that created post could not be found')
    }

    if (userFoundByPostCreatorId.error) {
        logger.error(userFoundByPostCreatorId.error)
        http.ServerError(res, 'An error occured while retrieving post history. Please try again later.')
    }

    const publicProfileInformation = generalLib.returnPublicProfileInformation(userFoundByPostCreatorId)

    var publicPostInformation;

    if (postType === 'image') {
        publicPostInformation = ImagePost.prepareDataToSendToUserSync([post._doc], false, publicId)[0]
    } else {
        publicPostInformation = TextPost.prepareDataToSendToUserSync([post._doc], false, publicId)[0]
    }

    console.log(publicPostInformation)

    http.OK(res, 'Successfully retrieved post history', {profileData: publicProfileInformation, editHistory: post.editHistory, currentPost: publicPostInformation})
}

const getPrivacySettings = async (req, res) => {
    const userId = req?.body?.userId

    const userIdErrorCheck = errorCheck.checkIfValueIsValidObjectId('userId', userId)
    if (userIdErrorCheck) return http.BadInput(res, userIdErrorCheck)

    const userFoundById = await user.findUserById(userId)

    if (userFoundById === null) {
        return http.NotFound(res, 'User could not be found by id')
    }

    if (userFoundById.error) {
        logger.error(userFoundById.error)
        return http.ServerError(res, 'An error occured while getting privacy settings. Please try again later.')
    }

    const settings = {
        hideFollowing: userFoundById.hideFollowing,
        hideFollowers: userFoundById.hideFollowers
    }

    http.OK(res, 'Successfully found privacy settings', settings)
}

const changePrivacySettings = (req, res) => {
    const newPrivacySettings = req?.body?.newPrivacySettings;
    const userId = req?.body?.userId;
    const settingsToChange = {}
    const acceptableKeys = ['hideFollowing', 'hideFollowers']

    if (typeof newPrivacySettings !== 'object' && newPrivacySettings === null && Array.isArray(newPrivacySettings)) {
        return http.BadInput(res, 'newPrivacySettings must be an object')
    }

    if (Object.keys(newPrivacySettings).length === 0) {
        return http.NotModified(res, 'No new settings were provided in the newPrivacySettings object. No data was modified.')
    }

    for (const [key, value] of Object.entries(newPrivacySettings)) {
        if (acceptableKeys.includes(key)) {
            if (value === false || value === true) {
                settingsToChange[key] = value
            } else {
                return http.BadInput(res, `Value for key ${key} must be a Boolean`)
            }
        } else {
            return http.BadInput(res, `${key} is not a valid privacy setting`)
        }
    }

    user.updatePrivacySettings(userId, settingsToChange).then((newUserDocument) => {
        const toSend = {}
        acceptableKeys.forEach(key => {
            toSend[key] = newUserDocument[key]
        })
        http.OK(res, 'Successfully updated user privacy settings', toSend)
    }).catch(error => {
        logger.error(error)
        http.ServerError(res, 'An error occured while changing privacy settings. Please try again later.')
    })
}

const loadIndividualTextPost = async (req, res) => {
    const postId = req?.body?.postId;
    const userId = req?.body?.userId;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('postId', postId),
        errorCheck.checkIfValueIsValidObjectId('userId', userId)
    ]

    for (const error of errorChecks) {
        if (error) return http.BadInput(res, error)
    }

    const postFound = await TextPost.findPostById(postId)

    if (postFound === null) {
        return http.NotFound(res, 'Post with id could not be found')
    }

    if (postFound.error) {
        logger.error(postFound.error)
        return http.ServerError(res, 'An error occured while retrieving the text post. Please try again later.')
    }

    const userFound = await user.findUserById(userId)

    if (userFound === null) {
        return http.BadInput(res, 'User could not be found with id')
    }

    if (userFound.error) {
        logger.error(userFound.error)
        return http.ServerError(res, 'An error occured while retrieving the text post. Please try again later.')
    }

    const preparedData = TextPost.prepareDataToSendToUserSync([postFound._doc], false, userFound.publicId)[0]

    const postCreatorFound = await user.findUserById(String(postFound.creatorId))

    if (postCreatorFound === null) {
        logger.error(`User with ID ${postFound.creatorId} owns post with id ${postId} even though the user does not exist`)
        http.NotFound(res, 'Post creator could not be found')
    }

    if (postCreatorFound.error) {
        logger.error(postCreatorFound.error)
        return http.ServerError(res, 'An error occured while retrieving text post. Please try again later.')
    }

    preparedData.profileName = postCreatorFound.name
    preparedData.profileImageKey = postCreatorFound.profileImageKey

    http.OK(res, 'Successfully found text post', preparedData)
}

const loadIndividualImagePost = async (req, res) => {
    const postId = req?.body?.postId;
    const userId = req?.body?.userId;

    const errorChecks = [
        errorCheck.checkIfValueIsValidObjectId('postId', postId),
        errorCheck.checkIfValueIsValidObjectId('userId', userId)
    ]

    for (const error of errorChecks) {
        if (error) return http.BadInput(res, error)
    }

    const postFound = await ImagePost.findPostById(postId)

    if (postFound === null) {
        return http.NotFound(res, 'Post with id could not be found')
    }

    if (postFound.error) {
        logger.error(postFound.error)
        return http.ServerError(res, 'An error occured while retrieving the image post. Please try again later.')
    }

    const userFound = await user.findUserById(userId)

    if (userFound === null) {
        return http.BadInput(res, 'User could not be found with id')
    }

    if (userFound.error) {
        logger.error(userFound.error)
        return http.ServerError(res, 'An error occured while retrieving the image post. Please try again later.')
    }

    const preparedData = ImagePost.prepareDataToSendToUserSync([postFound._doc], false, userFound.publicId)[0]

    const postCreatorFound = await user.findUserById(String(postFound.creatorId))

    if (postCreatorFound === null) {
        logger.error(`User with ID ${postFound.creatorId} owns post with id ${postId} even though the user does not exist`)
        http.NotFound(res, 'Post creator could not be found')
    }

    if (postCreatorFound.error) {
        logger.error(postCreatorFound.error)
        return http.ServerError(res, 'An error occured while retrieving image post. Please try again later.')
    }

    preparedData.profileName = postCreatorFound.name
    preparedData.profileImageKey = postCreatorFound.profileImageKey

    http.OK(res, 'Successfully found image post', preparedData)
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
    getUserFollowers,
    getUserFollowing,
    editTextPost,
    editImagePost,
    refreshUserFollowers,
    loadHomeFeed,
    changeEmail,
    changePassword,
    resetProfilePicture,
    getPostLikes,
    getPostHistory,
    getPrivacySettings,
    changePrivacySettings,
    loadIndividualTextPost,
    loadIndividualImagePost
}