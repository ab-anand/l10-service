const _ = require('lodash');
const ioredis = require('ioredis');
const calculateSlot = require('cluster-key-slot');

class AddToFollowFeedLogic {

	/**
	 * Creates an instance of AddToFollowFeedLogic
	 * @param {LogHelper} logHelper logHelper
	 * @param {Utility} utility utility
	 * @param {SharechatWebCache} sharechatWebRedis sharechatWebRedis
	 * @param {FollowFeedRepoV2} followFeedRepoV2 followFeedRepoV2 followFeedRepoV2
	 * @param {Object} constants constants
	 */
	constructor(logHelper, utility, sharechatWebRedis, followFeedRepoV2, constants) {
		this.logHelper = logHelper;
		this.utility = utility;
		this.sharechatWebRedis = sharechatWebRedis;
		this.followFeedRepoV2 = followFeedRepoV2;
		this.constants = constants;
	}

	// /**
	//  * @param {Array<FollowFeedItem>} items items
	//  * @returns {Promise}
	//  */
	// addToOlderFeed(items) {
	// 	const maxSizeOfSet = 204;
	// 	const pipeLineCommands = [];
	// 	for (const item of items) {
	// 		const keyName = `user:feed_${item.userId}/3`;
	// 		pipeLineCommands.push([ 'zadd', keyName, item.score, item.postId ]);
	// 		pipeLineCommands.push([ 'zremrangebyrank', keyName, 0, -(maxSizeOfSet + 1) ]);
	// 	}
	// 	return this.userFeedRedis.pipeline(pipeLineCommands)
	// 		.then(value => {
	// 			if (Array.isArray(value) && value.some(elem => elem[0] !== null)) {
	// 				this.logHelper.info('Response from redis while writing follow feed', {
	// 					value: value,
	// 					pipeLineCommands: pipeLineCommands
	// 				});
	// 			}
	// 		}).catch(reason => {
	// 			this.logHelper.error('Error while adding feeds to user feed Redis', {
	// 				err: reason,
	// 				pipeLineCommands: pipeLineCommands
	// 			});
	// 		});
	// }

	/**
	 * @param {Array<FollowFeedItem>} items items
	 * @param {Map<string,string|null>} keysInMauMap keysInMauMap
	 * @returns {Array<Array>}
	 */
	preparePipelineCommands(items, keysInMauMap) {
		const maxSizeOfSet = 100;
		const userIds = new Set(items.map(value => value.userId));
		const pipeLineCommands = [];
		if (userIds.size === 1) {
			const userId = Array.from(userIds)[0];
			const keyName = `feed:${userId}`;
			const removeDuplicatePostsCommand = ['zrem', keyName, ...items.filter(value => value.remark !== this.constants.DEFAULT_REMARK).map(value => `${value.postId}_${this.constants.DEFAULT_REMARK}`)];
			if (removeDuplicatePostsCommand.length > 2) {
				pipeLineCommands.push(removeDuplicatePostsCommand);
			}
			const zAddCommand = ['zadd', keyName];
			for (const item of items) {
				zAddCommand.push(item.score);
				zAddCommand.push(`${item.postId}_${item.remark}`);
			}
			pipeLineCommands.push(zAddCommand);
			const ttlCheckKey = `MAU:${userId}`;
			const ttlForKey = keysInMauMap && keysInMauMap.get(ttlCheckKey) ? this.constants.MAU_USER_EXPIRY_TIME : this.constants.NORMAL_USER_EXPIRY_TIME;
			pipeLineCommands.push(['zremrangebyrank', keyName, 0, -(maxSizeOfSet + 1)], ['expire', keyName, ttlForKey]);
		} else {
			for (const item of items) {
				const keyName = `feed:${item.userId}`;
				const ttlCheckKey = `MAU:${item.userId}`;
				const ttlForKey = keysInMauMap && keysInMauMap.get(ttlCheckKey) ? this.constants.MAU_USER_EXPIRY_TIME : this.constants.NORMAL_USER_EXPIRY_TIME;

				if (item.remark !== this.constants.DEFAULT_REMARK) {
					pipeLineCommands.unshift(['zrem', keyName, `${item.postId}_${this.constants.DEFAULT_REMARK}`]);
				}
				pipeLineCommands.push(['zadd', keyName, item.score, `${item.postId}_${item.remark}`]);
				pipeLineCommands.push(['zremrangebyrank', keyName, 0, -(maxSizeOfSet + 1)]);
				pipeLineCommands.push(['expire', keyName, ttlForKey]);
			}
		}
		return pipeLineCommands;
	}

	/**
	 * @param {Array<FollowFeedItem>} items items
	 * @returns {Promise}
	 */
	async addToNewerFeedV2(items) {
		let updatedItems = items.map(item => {
			return {
				postId:`${item.postId}_${item.remark}`,
				userId: item.userId,
				score: item.score
		}})
		return this.followFeedRepoV2.addItems(updatedItems)
			.then(value => {
				if (Array.isArray(value) && value.length > 0) {
					this.logHelper.info('Response from scylla while writing follow feed', {
						value: value
					});
				}
			}).catch(reason => {
				this.logHelper.error('Error while adding feeds to user db', {
					err: reason,
				});
			});
	}

	/**
	 * @param {Array<FollowFeedItem>} items items
	 * @returns {Promise}
	 */
	addFeed(items) {
		return new Promise((resolve, reject) => {
			const userIds = new Set(items.map(value => value.userId));
			if (items.length > this.constants.MAX_BATCH_INSERT_SIZE && userIds.size > 1) {
				return reject(Error(`Max Number of operations at a time exceeded. Please send at max ${this.constants.MAX_BATCH_INSERT_SIZE} items`));
			}
			return Promise.all([this.addToNewerFeedV2(items)])
				.then(() => {
					return resolve();
				}).catch((reason) => {
					this.logHelper.error('This error shouldn\'t be logged', {err: reason, items: items});
					return resolve();
				});
		});
	}
}

module.exports = AddToFollowFeedLogic;
