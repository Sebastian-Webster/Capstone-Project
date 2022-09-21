const Logger = require('./Logger')
const logger = new Logger();

class General {
    calculateHowManyItemsToSend = (arrayLength, limit, skip) => {
        if (typeof arrayLength !== 'number') {
            logger.error('Provided arrayLength: ' + arrayLength)
            throw new Error('arrayLength is supposed to be a number')
        }

        if (typeof limit !== 'number') {
            logger.error('Provided limit: ' + limit)
            throw new Error('limit is supposed to be a number')
        }

        if (typeof skip !== 'number') {
            logger.error('Provided skip: ' + skip)
            throw new Error('skip is supposed to be a number')
        }

        const itemsNotSkipped = arrayLength - skip;
        return itemsNotSkipped > limit ? limit : itemsNotSkipped < 0 ? 0 : itemsNotSkipped
    }

    returnPublicProfileInformation = (profile) => {
        let {profileImageKey, name, followers, following, publicId, hideFollowing} = profile;
        followers = followers.length;
        following = following.length;
        return {profileImageKey, name, followers, following, publicId, hideFollowing}
    }
}

module.exports = General;