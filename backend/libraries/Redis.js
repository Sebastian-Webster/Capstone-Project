const redis = require('redis');
const Logger = require('./Logger');
const General = require('./General')
const logger = new Logger();
const generalLib = new General();

class RedisLibrary {
    constructor() {
        (async () => { //IIFE - Immediately Invoked Function Expression
            this.redisClient = redis.createClient({url: process.env.REDIS_URL});
          
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
                    return cache.splice(skip, generalLib.calculateHowManyItemsToSend(cache.length, limit, skip))
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
                if (!Array.isArray(cache)) return resolve() //No need to throw an error because there is no cache to delete a post from
                const postIndex = cache.findIndex(post => post._id === postId)
                if (postIndex === -1) return resolve() //No need to throw an error because there is no post to remove from cache. It is weird that it is not in the cache but we don't need to throw an error.
                cache.splice(postIndex, 1)
                this.setCache(redisCacheKey, cache).then(resolve)
            } catch (error) {
                reject(error)
            }
        })
    }

    addTextPostToCache = (userId, postObj) => {
        return new Promise(async (resolve, reject) => {
            try {
                const redisCacheKey = `textposts-bycreatorid-${userId}`
                const cache = await this.getCache(redisCacheKey)
                if (!Array.isArray(cache)) return resolve() //No need to throw an error because there is no cache to add a post too. When someone visits the user's profile page the fresh data from the database will be put in the cache
                cache.push(postObj)
                this.setCache(redisCacheKey, cache).then(resolve)
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = RedisLibrary;