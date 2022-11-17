class RedisRepo {

	/**
	 * Creates an instance of RedisRepo.
	 * @param {LogHelper} logHelper logHelper
	 * @param {IORedis.Redis|IORedis.Cluster} redisClient redisClient
	 */
	constructor(logHelper, redisClient) {
		this.logHelper = logHelper;
		this.redisClient = redisClient;
	}

	getFollowFeedRedisKey(userId) {
		return `feed:${userId}`;
	}

	pipeline(commands) {
		// const startTime = Date.now();
		return new Promise((resolve, reject) => {
			this.redisClient.pipeline(commands).exec((err, data) => {
				// const endTime = Date.now();
				// this.logHelper.info('Redis Latency', {
				// 	pipelineLatencyInMS: endTime - startTime,
				// 	command: [ 'pipeline', ...commands ]
				// });
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});
	}

	/**
	 * @param {string} keyName keyName
	 * @param {Object|null} exclusiveStartFrom exclusiveStartFrom
	 * @param {number} limit limit
	 * @returns {Promise<{items: Array<{value:string,score:number}>, nextOffset: (Object | null)}>}
	 */
	fetchReverseSortedSetByScore(keyName, exclusiveStartFrom, limit) {
		// const startTime = Date.now();
		return new Promise((resolve, reject) => {
			const maxScore =
				exclusiveStartFrom && exclusiveStartFrom.hasOwnProperty('score')
					? `(${exclusiveStartFrom.score}`
					: '+inf';
			this.redisClient.zrevrangebyscore(keyName, maxScore, '-inf', 'WITHSCORES', 'LIMIT', 0, limit, (err, data) => {
				// const endTime = Date.now();
				// this.logHelper.info('Redis Latency', {
				// 	zrevrangebyscoreLatencyInMS: endTime - startTime,
				// 	command: [ 'zrevrangebyscore', keyName, maxScore, '-inf', 'WITHSCORES', 'LIMIT', 0, limit ]
				// });
				if (err) {
					return reject(err);
				}
				if (!Array.isArray(data) || data.length % 2 !== 0) {
					return reject(Error(`Incorrect format of data: ${JSON.stringify(data)}`));
				}
				const value = [];
				for (let i = 0; i < data.length; i += 2) {
					value.push({ value: data[i], score: Number(data[i + 1]) });
				}
				if (value.length < limit || value.length === 0) {
					return resolve({ items: value, nextOffset: null });
				}
				return resolve({ items: value, nextOffset: { score: value[limit - 1].score } });
			});
		});
	}
	/**
	 * @param {string} keyName keyName
	 * @returns {Promise<{items: Array<{value:string,score:number}>}>}
	 */
	fetchReverseSortedSetByScoreV2(keyName) {
		const dataPromise = new Promise((resolve, reject) => {
			this.redisClient.zrevrangebyscore(keyName, '+inf', '-inf', 'WITHSCORES', (err, data) => {
				if (err) {
					reject(err);
				}
				if (!Array.isArray(data) || data.length % 2 !== 0) {
					return reject(Error(`Incorrect format of data: ${JSON.stringify(data)}`));
				}
				const value = [];
				for (let i = 0; i < data.length; i += 2) {
					value.push({ value: data[i], score: Number(data[i + 1]) });
				}
				return resolve({ items: value });
			});
		});

		const timeoutPromise = new Promise((resolve, reject) => {
			setTimeout(reject, 200, new Error("redis timeout"))
		})

		return Promise.race([dataPromise, timeoutPromise]);
	}

	fetchNumberOfEntries(keyName) {
		const dataPromise = new Promise((resolve, reject) => {
			this.redisClient.zcount(keyName, '-inf', '+inf', (err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});

		const timeoutPromise = new Promise((resolve, reject) => {
			setTimeout(reject, 200, new Error("redis timeout"));
		});

		return Promise.race([dataPromise, timeoutPromise]);
	}

	removeFromSortedSet(keyName, members) {
		// const startTime = Date.now();
		return new Promise((resolve, reject) => {
			this.redisClient.zrem(keyName, members, (err, data) => {
				// const endTime = Date.now();
				// this.logHelper.info('Redis Latency', {
				// 	zremLatencyInMS: endTime - startTime,
				// 	command: [ 'zrem', keyName, members ]
				// });
				if (err) {
					return reject(err);
				}
				return resolve();
			});
		});
	}
}

module.exports = RedisRepo;
