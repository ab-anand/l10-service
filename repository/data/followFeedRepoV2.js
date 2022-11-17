class FollowFeedRepoV2 {

	/**
	 * Creates an instance of FollowFeedRepoV2
	 * @param {Object} dbDriverV2 dbDriverV2
	 * @param {Object} constants constants
	 */
	constructor(dbDriverV2, constants) {
		this.client = dbDriverV2.client;
		this.constants = constants;
	}

	/**
	 * @description add items to scylla DB
	 * @param {Array<Object>} items items
	 * @returns {Promise}
	 * @memberof FollowFeedRepoV2
	 */
	async addItems(items) {
		if (items.length === 0) {
			return [];
		}
		const pKeys = [];
		for (let item of items) {
			pKeys.push({
				insertSpecification: {
					user_id: item.userId.toString(),
					post_id: item.postId.toString(),
					added_on: item.score.toString()
				},
				ifNotExists: false
			});
		}

		const dbResponse = await this.client.batchInsert('follow_feed_v2', pKeys);
		return dbResponse || [];
	}

	/**
	 * @description fetch users' follow feed DB
	 * @param {string} userId userId
	 * @returns {Promise}
	 * @memberof FollowFeedRepoV2
	 */
	async fetchFeed(userId){
		const pKeys = [];
		pKeys.push([
			{
				name: 'user_id',
				value: userId
			},
		]);
		const dbResponse = await this.client.batchReadRow('follow_feed_v2', pKeys, [], {}, this.constants.FOLLOW_FEED_FETCH_LIMIT, false);
		const rows = dbResponse.rows || [];
		return rows;
	}

	/**
	 * @description Delete extra posts from feed
	 * @param {string} userId userId
	 * @param {int} addedOn addedOn
	 * @returns {Promise}
	 * @memberof FollowFeedRepoV2
	 */
	async deleteExtraPosts(userId, addedOn){
		const pKeys = [
			{
				name: 'user_id',
				value: userId
			},
			{
				name: 'added_on',
				value: addedOn.toString(),
				operator: "<="
			},
		];
		return await this.client.deleteRow('follow_feed_v2', pKeys, [], []);
	}

	/**
	 * @description Delete extra posts from feed
	 * @param {string} userId userId
	 * @param {string} postId postId
	 * @param {int} addedOn addedOn
	 * @returns {Promise}
	 * @memberof FollowFeedRepoV2
	 */
	async deleteInvalidPosts(userId, postId, addedOn){
		const pKeys = [
			{
				name: 'user_id',
				value: userId
			},
			{
				name: 'added_on',
				value: addedOn.toString(),
			},
			{
				name: 'post_id',
				value: postId
			}
		];
		return await this.client.deleteRow('follow_feed_v2', pKeys, [], []);
	}
}

module.exports = FollowFeedRepoV2;
