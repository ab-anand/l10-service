const config = require('../config/config.js');

const Redis = require('ioredis');
let sharechatWebRedisClient, userPostSentRedisClient;
sharechatWebRedisClient = new Redis(config.redis.sharechatWebRedis);
userPostSentRedisClient = new Redis(config.redis.userPostSentRedis);

module.exports = {
	sharechatWebRedisClient: sharechatWebRedisClient,
	userPostSentRedisClient: userPostSentRedisClient
};
