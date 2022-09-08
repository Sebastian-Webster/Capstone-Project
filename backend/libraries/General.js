const Logger = require('./Logger')
const logger = new Logger();

class General {
    calculateHowManyPostsToSend = (postArrayLength, limit, skip) => {
        if (typeof postArrayLength !== 'number') {
            logger.error('Provided postArrayLength: ' + postArrayLength)
            throw new Error('postArrayLength is supposed to be a number')
        }

        if (typeof limit !== 'number') {
            logger.error('Provided limit: ' + limit)
            throw new Error('limit is supposed to be a number')
        }

        if (typeof skip !== 'number') {
            logger.error('Provided skip: ' + skip)
            throw new Error('skip is supposed to be a number')
        }

        const itemsNotSkipped = postArrayLength - skip;
        return itemsNotSkipped > limit ? limit : itemsNotSkipped
    }

    returnPublicProfileInformation = (profile) => {
        let {profileImageKey, name, followers, following, publicId} = profile;
        followers = followers.length;
        following = following.length;
        return {profileImageKey, name, followers, following, publicId}
    }
}

module.exports = General;