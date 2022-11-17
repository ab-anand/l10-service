const _ = require('lodash');

class FetchFollowFeedLogic {

	/**
	 * Creates an instance of FetchFollowFeedLogic
	 * @param {LogHelper} logHelper logHelper
	 * @param {Object} constants constants
	 * @param {PostRenderingService} postRenderingService postRenderingService
	 * @param {PostSentRedis} postSentRedis postSentRedis
	 * @param {Object} utility utility
	 * @param {FollowFeedRepoV2} followFeedRepoV2 followFeedRepoV2 followFeedRepoV2
	 */
	constructor(logHelper, constants, postRenderingService, postSentRedis, utility, followFeedRepoV2) {
		this.logHelper = logHelper;
		this.constants = constants;
		this.postRenderingService = postRenderingService;
		this.referrer = `${this.constants.FOLLOW_FEED_REFERRER}/fetch-follow-feed`;
		this.postSentRedis = postSentRedis;
		this.utility = utility;
		this.followFeedRepoV2 = followFeedRepoV2;
		this.engagementPostCount = 29;
	}

	/**
	 * @description Checks if the post should be autoplayed or not.
	 * @param {Object} postCard Post card object
	 * @returns {Object}
	 */
	shouldAutoplayPost(postCard) {
		const followFeedId = 1;
		return postCard.autoplayInFeed && postCard.autoplayInFeed.includes(followFeedId);
	}

	/**
	 * @param {Object} postCard postCard
	 * @param {FollowFeedItem} item item
	 * @returns {boolean}
	 */
	isPostValid(postCard, item) {
		// If post is returned empty from postRendering
		if (_.isNil(postCard)) {
			return false;
		}
		// Check if the post is visible
		if (!_.get(postCard, 'authorIdStatus', '_0').endsWith('_2')) {
			return false;
		}
		//Check if the user actually follows the post creator or not
		if (_.get(postCard, 'ath.f', '0') !== '1' && item.remark === this.constants.DEFAULT_REMARK) {
			return false;
		}
		return item.score.toString().length <= 13;
	}

	/**
	 * @param {string} userId userId
	 * @param {number} limit limit
	 * @param {Object} offset offset
	 * @returns {Promise<{followFeed: Array<FollowFeedItem>, nextOffset: (Object|null)}>}
	 */
	async feedFetcherWrapperV2(userId, limit, offset) {
		const allPosts = await this.followFeedRepoV2.fetchFeed(userId);

		let asyncTasks = [];
		let followFeedMap = new Map();
		// delete duplicate posts
		for (const item of allPosts) {
			let itemKey = item.post_id;
			if (followFeedMap.has(itemKey)) {
				asyncTasks.push(this.followFeedRepoV2.deleteInvalidPosts(item.user_id, item.post_id, item.added_on));
			} else {
				followFeedMap.set(itemKey, item);
			}
		}

		if (allPosts.length >= this.constants.FOLLOW_FEED_FETCH_LIMIT) {
			let lastPostAddedOn = _.get(allPosts[this.constants.FOLLOW_FEED_FETCH_LIMIT - 1], 'added_on', -1);
			asyncTasks.push(this.followFeedRepoV2.deleteExtraPosts(userId, lastPostAddedOn));
		}

		let firstFetch = !(offset && offset.hasOwnProperty('score'));
		const allUniquePosts = Array.from(followFeedMap.values());
		let finalFeed = [];
		for (const post of allUniquePosts) {
			if (firstFetch) {
				finalFeed.push(post);
			} else if (!firstFetch && post.added_on < offset.score) {
				finalFeed.push(post);
			}

			if (finalFeed.length >= limit) {
				break;
			}
		}
		let nextOffset;
		if (finalFeed.length < limit || finalFeed.length === 0) {
			nextOffset = null;
		} else if (finalFeed.length >= limit) {
			nextOffset = {score: finalFeed[limit - 1].added_on};
		}

		const [ err, result ] = await this.utility.invoker(Promise.all(asyncTasks));
		if (err || result.size === 0) {
			this.logHelper.error('Error while deleting invalid/duplicate posts',
				{ err: err, userId: userId }
			);
		}

		const followFeed = finalFeed.map(elem => ({
			score: elem.added_on,
			userId: userId,
			postId: elem.post_id.split('_')[0],
			remark: elem.post_id.split('_').slice(1).join('_')
		}));

		return { followFeed: followFeed, nextOffset: nextOffset };

	}

	async fetchFollowFeed(userId, limit, offset) {
		const feed = [], ord = [], asyncTasks = []; // ord array supports custom ordering in very old apps
		let currentOffset = offset;
		let currentLimit = limit;
		let finalOffset = null;
		do {
			// Fetch Follow Feed from db;
			const { followFeed, nextOffset } = await this.feedFetcherWrapperV2(userId, currentLimit, currentOffset);

			// Fetch post cards from post rendering service
			const postCardMap = await this.postRenderingService.getPostCards(userId, followFeed.map(value => value.postId), this.referrer);

			for (const item of followFeed) {
				finalOffset = item;
				const postCard = postCardMap.get(item.postId);
				if (this.isPostValid(postCard, item)) {
					const isVideoPost = postCard.t === 'video';
					if (isVideoPost) {
						postCard.shouldAutoplay = this.shouldAutoplayPost(postCard);
					}
					if (_.get(postCard, 'ath.f', '0').toString() !== '1' && item.remark !== this.constants.DEFAULT_REMARK) {
						postCard.likedByText = '<u><b>Suggested for you</b></u>';
					}

					delete postCard.autoplayInFeed;
					postCard.meta = item.remark;
					feed.push(postCard);
					ord.push(-item.score);
				} else {
					asyncTasks.push(this.followFeedRepoV2.deleteInvalidPosts(item.userId, `${item.postId}_${item.remark}`, item.score));
				}
				if (feed.length >= limit) {
					break;
				}
			}
			if (!nextOffset) {
				finalOffset = nextOffset;
				break;
			}

			if (followFeed.length !== 0 && _.last(followFeed).postId === finalOffset.postId) {
				finalOffset = nextOffset;
			} else if (finalOffset) {
				finalOffset = { score: finalOffset.score };
			}
			currentLimit = 20;
			currentOffset = nextOffset;
		} while (feed.length < limit && finalOffset !== null);

		const [ err, result ] = await this.utility.invoker(Promise.all(asyncTasks));
		if (err || result.size === 0) {
			this.logHelper.error('Error while deleting invalid posts',
				{ err: err, userId: userId }
			);
		}

		if (feed.length === 0) {
			this.logHelper.info('Follow Feed empty for user', { userId: userId });
		}

		return {
			feed: feed,
			ord: ord,
			nextOffset: finalOffset
		};
	}

	/**
	 * @param {[Object]} postCards postCards
	 * @param {number} limit limit
	 * @param {string} variant variant
	 * @returns {Promise<{Array}>}
	 */
	sortPostCards(postCards, limit, variant ) {
		if (variant === 'variant-3') {
			postCards.sort((x, y) => {
				const likeX = x.lc || 0;
				const shareX = x.usc || 0;
				const favX = x.favouriteCount || 0;
				const viewX = (x.l || 0) + 100;

				const likeY = y.lc || 0;
				const shareY = y.usc || 0;
				const favY = y.favouriteCount || 0;
				const viewY = (y.l || 0) + 100;

				return (likeY+shareY+favY)/viewY - (likeX+shareX+favX)/viewX;
			});
		} else if (variant === 'variant-4') {
			postCards.sort((x, y) => {
				const likeX = x.lc || 0;
				const viewX = (x.l || 0) + 100;

				const likeY = y.lc || 0;
				const viewY = (y.l || 0) + 100;

				return likeY/viewY - likeX/viewX;
			});
		}

		return postCards.slice(0, limit);
	}

	/**
	 * @param {string} userId userId
	 * @param {string} variant variant
	 * @param {number} limit limit
	 * @param {Object} offset offset
	 * @returns {Promise<{followFeed: Array<FollowFeedItem>, nextOffset: (Object|null)}>}
	 */
	async fetchFollowFeedV3(userId, variant, limit, offset) {
		let nextOffset = {};
		if (!offset) {
			await this.postSentRedis.takeSnapshotOfSentList(userId).catch((error) => {
				this.logHelper.error('failed to make copy of sent list', { error: error, userId: userId });
			});
		}
		let type = !offset ? 'unseen' : offset.type;
		let [ seenPostIds, seenPostIdsOnFirstFetch ] = await Promise.all([
			this.postSentRedis.fetchSentList(userId, false) || [],
			this.postSentRedis.fetchSentList(userId, true) || []
		]).catch((err) => {
			this.logHelper.error('error in fetching sent list from post sent redis', { err:err, userId:userId });
		});

		let allPosts = await this.followFeedRepoV2.fetchFeed(userId);

		const asyncTasks = [];
		let followFeedMap = new Map();
		// delete duplicate posts
		for (const item of allPosts) {
			let itemKey = item.post_id;
			if (followFeedMap.has(itemKey)) {
				asyncTasks.push(this.followFeedRepoV2.deleteInvalidPosts(item.user_id, item.post_id, item.added_on));
			} else {
				followFeedMap.set(itemKey, item);
			}
		}

		if (allPosts.length >= this.constants.FOLLOW_FEED_FETCH_LIMIT) {
			let lastPostAddedOn = _.get(allPosts[this.constants.FOLLOW_FEED_FETCH_LIMIT - 1], 'added_on', -1);
			asyncTasks.push(this.followFeedRepoV2.deleteExtraPosts(userId, lastPostAddedOn));
		}

		const allUniquePosts = Array.from(followFeedMap.values());
		let unseenPosts = allUniquePosts.filter(elem => !seenPostIds.includes(String(elem.post_id.split('_')[0])));
		let snapshotPosts = allUniquePosts.filter(elem => seenPostIdsOnFirstFetch.includes(String(elem.post_id.split('_')[0])));

		let followFeedPosts = [], validPostCards = [], validPostIds = [], ord = [];
		let count = 0;
		do {
			if (type === 'unseen') {
				followFeedPosts = unseenPosts.slice(0, this.engagementPostCount);
				unseenPosts.splice(0, limit);
				if (unseenPosts.length) {
					nextOffset.type = 'unseen';
				} else if (snapshotPosts.length) {
					nextOffset.type = 'seen';
					type = 'seen';
				} else {
					nextOffset = null;
				}
			} else if (type === 'seen') {
				followFeedPosts = snapshotPosts.slice(0, this.engagementPostCount);
				snapshotPosts.splice(0, limit);
				if (snapshotPosts.length) {
					nextOffset.type = 'seen';
				} else {
					nextOffset = null;
				}
			}

			const followFeedPostIds = followFeedPosts.map(elem => {
				return elem.post_id.split('_')[0];
			});
			let err, postCardMap;
			[ err, postCardMap ] = await this.utility.invoker(this.postRenderingService.getPostCards(userId, followFeedPostIds, this.referrer));
			if (err) {
				this.logHelper.error('error in getting post cards', { err: err, followFeedPostIds: followFeedPostIds, userId: userId });
				return Promise.reject(err);
			}
			if (!postCardMap) {
				this.logHelper.info('failed to get postCards', { followFeedPostIds: followFeedPostIds, userId: userId });
			}

			followFeedPosts = followFeedPosts.map(elem => ({
				score: elem.added_on,
				userId: userId,
				postId: elem.post_id.split('_')[0],
				remark: elem.post_id.split('_').slice(1).join('_')
			}));

			for (const item of followFeedPosts) {
				const postCard = postCardMap.get(item.postId);
				if (this.isPostValid(postCard, item)) {
					const isVideoPost = postCard.t === 'video';
					if (isVideoPost) {
						postCard.shouldAutoplay = this.shouldAutoplayPost(postCard);
					}
					if (_.get(postCard, 'ath.f', '0').toString() !== '1' && item.remark !== this.constants.DEFAULT_REMARK) {
						postCard.likedByText = '<u><b>Suggested for you</b></u>';
					}

					delete postCard.autoplayInFeed;
					validPostCards.push(postCard);
					validPostIds.push(item.postId);
					ord.push(-item.score);
				} else if (postCard) {
					asyncTasks.push(this.followFeedRepoV2.deleteInvalidPosts(item.userId, `${item.postId}_${item.remark}`, item.score));
				}
			}
			count++;
		} while (!validPostCards.length && nextOffset!==null && count<3);

		if (count === 3 && !validPostCards.length){
			nextOffset = null;
			this.logHelper.info('No valid post card Found', { userId: userId });
		}

		const sortedPostCards = this.sortPostCards(validPostCards, limit, variant);
		const sortedPostIds = sortedPostCards.map((ele) => {
			return ele.i;
		});

		for (let postCard of sortedPostCards){
			if (variant === 'variant-3') {
				postCard.meta = 'ebyv_followfeed';
			} else if (variant === 'variant-4') {
				postCard.meta = 'lbyv_followfeed';
			} else {
				postCard.meta = 'followFeed';
			}
		}
		seenPostIdsOnFirstFetch = (seenPostIdsOnFirstFetch || []).filter(id => {
			return !sortedPostIds.includes(String(id));
		});

		await this.postSentRedis.updateSentList(userId, sortedPostIds, [ ...new Set(seenPostIdsOnFirstFetch) ]).catch((error) => {
			this.logHelper.error(error, { userId: userId, postIds: sortedPostIds }, 'Failed to add post in sent list');
		});

		const [ err, result ] = await this.utility.invoker(Promise.all(asyncTasks));
		if (err || result.size === 0) {
			this.logHelper.error('Error while deleting invalid/duplicate posts',
				{ err: err, userId: userId }
			);
		}

		return {
			feed: sortedPostCards,
			ord: ord,
			nextOffset: nextOffset
		};
	}
}

module.exports = FetchFollowFeedLogic;
