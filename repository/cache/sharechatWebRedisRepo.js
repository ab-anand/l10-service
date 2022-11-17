class SharechatWebCache {
	constructor(container) {
		this.sharechatWebRedisClient = container.resolve('sharechatWebRedisClient');
	}

	/**
	 * Fetches values of keys from single slot
	 * @param {Array<string>} keys Keys to fetch
	 * @returns {Promise<Array<string>>}
	 */
	fetchValuesFromKeys(keys) {
		return new Promise((resolve, reject) => {
			this.sharechatWebRedisClient.mget(keys, (err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(new Map(keys.map((key, index) => [ key, data[index] ])));
			});
		});
	}

	/**
	 *
	 * @param {Array<Array>} commands Array consisting of commands
	 * @returns {Promise<Array<string>>}
	 */
	pipeline(commands) {
		return new Promise((resolve, reject) => {
			this.sharechatWebRedisClient.pipeline(commands).exec((err, data) => {
				if (err) {
					return reject(err);
				}
				return resolve(data);
			});
		});
	}

}

module.exports = SharechatWebCache;
