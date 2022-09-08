const redis = require('redis');
const Logger = require('./Logger');
const General = require('./General')
const logger = new Logger();
const generalLib = new General();

class RedisLibrary {
    constructor() {
        (async () => { //IIFE - Immediately Invoked Function Expression
            this.redisClient = redis.createClient({url: 'redis://redis:6379'});
          
            this.redisClient.on("error", logger.error);
          
            await this.redisClient.connect();
        })();
    }

    setCache = (key, value) => {
        return new Promise((resolve, reject) => {
            this.redisClient.set(key, JSON.stringify(value))
            .then(() => resolve())
            .catch(reject)
        })
    }

    getCache = async (key, skip, limit) => {
        try {
            let cache = await this.redisClient.get(key)
            cache = JSON.parse(cache)
            if (cache) {
                if (typeof skip === 'number' && typeof limit === 'number') {
                    return cache.splice(skip, generalLib.calculateHowManyPostsToSend(cache.length, limit, skip))
                } else return cache
            } else return cache
        } catch (error) {
            logger.error(error)
            return undefined
        }
    }

    removeTextPostFromCache = (userId, postId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const redisCacheKey = `textposts-bycreatorid-${userId}`
                const cache = await this.getCache(redisCacheKey)
                const postIndex = cache.findIndex(post => post._id === postId)
                if (postIndex === -1) throw new Error('Post was not found in cache.')
                cache.splice(postIndex, 1)
                this.setCache(redisCacheKey, cache).then(resolve)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = RedisLibrary;