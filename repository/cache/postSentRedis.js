class PostSentRedis {

	/**
	 * Creates an instance of PostSentCache.
	 * @param {Object} postSentRedis postSentRedis
	 * @param {Object} utility utility
	 * @param {Object} constants constants
	 */

	constructor(container) {
		this.redisClient = container.resolve('userPostSentRedisClient');
		this.utility = container.resolve('utility');
		this.constants = container.resolve('constants');
		this.sentListSize = 250;
		this.viewListSize = 1000;
		this.sentExpire = 15 * 60; // 15 minutes
		this.sentExpireForSnapshot = 10 * 60; // 15 minutes
	}

	/**
	 *
	 * @param {String} key key
	 * @param {List} list list
	 * @param {Number} size size
	 * @returns {Promise}
	 * @memberof PostSentCache
	 */
	setList(key, list, size) {
		return new Promise(async (resolve, reject) => {
			try {
				await this.redisClient.pipeline()
					.del(key)
					.rpush(key, list)
					.ltrim(key, -size, -1)
					.expire(key, this.sentExpireForSnapshot)
					.exec();
				return resolve();
			} catch (err) {
				return reject(err);
			}
		});
	}

	/**
	 *
	 * @param {Number} userId userId
	 * @returns {Promise}
	 * @memberof PostSentCache
	 */
	takeSnapshotOfSentList(userId) {
		// take the snap shot of seen posts so far
		return this.runPromiseWithTimeout(
			new Promise(async (resolve, reject) => {
				const sentListName = `userPostSentQueue/${userId}`; // seen posts
				const viewListName = `lastViewed/${userId}`; // what is it used for??
				try {
					const [ sentList, viewList ] = await Promise.all([
						this.redisClient.lrange(`${sentListName}`, 0, -1),
						this.redisClient.lrange(`${viewListName}`, 0, -1)
					]);

					await Promise.all([
						this.setList(`${sentListName}:snapshot`, sentList || [], this.sentListSize),
						this.setList(`${viewListName}:snapshot`, viewList || [], this.viewListSize)
					]);
					return resolve();
				} catch (err) {
					return reject(err);
				}
			}), 100);
	}

	/**
	 *
	 * @param {Number|string} userId userId
	 * @param {Boolean} fromSnapshot returns snapshot (previous state) of list
	 * @param {Boolean} viewList viewList
	 * @returns {Promise<Array>}
	 * @memberof PostSentCache
	 */
	fetchSentList (userId, fromSnapshot, viewList = true) {
		return this.runPromiseWithTimeout(
			new Promise(async (resolve, reject) => {
				const sentListName = `userPostSentQueue/${userId}${fromSnapshot ? ':snapshot' : '' }`;
				const viewListName = `lastViewed/${userId}${fromSnapshot ? ':snapshot' : '' }`;
				if (!viewList) {
					try {
						const sentList = await this.redisClient.lrange(sentListName, 0, -1);
						return resolve(sentList);
					} catch (reason) {
						return reject(reason);
					}
				}
				try {
					const [ sentList, viewList ] = await Promise.all([
						this.redisClient.lrange(sentListName, 0, -1),
						this.redisClient.lrange(viewListName, 0, -1),
					]);
					return resolve([ ... new Set((sentList || []).concat(viewList || [])) ]);
				} catch (err) {
					return reject(err);
				}
			}), 200);
	}

	/**
	 * Adds to the sent list in redis.
	 * @param {String} userId userId
	 * @param {List} postIds postIds
	 * @param {List} seenPostIdsOnFirstFetch seenPostIdsOnFirstFetch
	 * @param {Boolean} viewList viewList
	 * @returns {Promise}
	 * @memberof PostSentCache
	 */
	updateSentList (userId, postIds, seenPostIdsOnFirstFetch, viewList = true) {
		return this.runPromiseWithTimeout(
			new Promise(async (resolve, reject) => { // main promise
				const sentListName = `userPostSentQueue/${userId}`;
				const viewListName = `lastViewed/${userId}`;
				try {
					const pipeline = this.redisClient.pipeline();
					pipeline.rpush(sentListName, postIds);
					pipeline.ltrim(sentListName, -this.sentListSize, -1);
					pipeline.expire(sentListName, this.sentExpire);
					await pipeline.exec();
					if (seenPostIdsOnFirstFetch.length > 0) {
						let promises = [ this.setList(`${sentListName}:snapshot`, seenPostIdsOnFirstFetch, this.sentListSize) ];
						if (viewList) {
							promises.push(this.setList(`${viewListName}:snapshot`, seenPostIdsOnFirstFetch, this.viewListSize));
						}
						await Promise.all(promises);
					}
				} catch (err) {
					return reject(err);
				}
				return resolve();
			}), 300);
	}

	/**
	 *
	 * @param {Promise} promise promise function
	 * @param {Number} timeout timeout
	 * @returns {Promise}
	 * @memberof PostSentCache
	 */
	runPromiseWithTimeout(promise, timeout) {
		return new Promise((mainResolve, mainReject) => {
			Promise.race([
				promise,
				new Promise((resolve) => {
					setTimeout(resolve, timeout);
				})
			])
				.then((response) => {
					return mainResolve(response || []);
				})
				.catch((err) => {
					return mainReject(err);
				});
		});
	}
}

module.exports = PostSentRedis;
