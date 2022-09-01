const redis = require('redis');
const Logger = require('./Logger');
const General = require('./General')
const logger = new Logger();
const generalLib = new General();

class RedisLibrary {
    constructor() {
        (async () => { //IIFE - Immediately Invoked Function Expression
            this.redisClient = redis.createClient();
          
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

    updateCache = (key, value) => {

    }
}

module.exports = RedisLibrary;