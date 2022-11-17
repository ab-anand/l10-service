class ShowD0PostsLogic {

	/**
	 *
	 * @param {UserService} userService userService
	 * @param {Utility} utility utility
	 * @param {FollowFeedRepoV2} followFeedRepoV2 followFeedRepoV2 followFeedRepoV2
	 * @param {FeedRelevanceService} feedRelevanceService feedRelevanceService
	 * @param {constants} constants constants
	 * @param {PostRenderingService} postRenderingService postRenderingService
	 * @param {TopPostService} topPostService topPostService
	 * @param {LogHelper} logHelper logHelper
	 * @param {PostSentRedis} postSentRedis Redis to keep track of posts already seen by user
	 */
	constructor(userService, utility, followFeedRepoV2, feedRelevanceService,
		constants, postRenderingService, topPostService, logHelper,
		postSentRedis) {
		this.userService = userService;
		this.utility = utility;
		this.followFeedRepoV2 = followFeedRepoV2;
		this.feedRelevanceService = feedRelevanceService;
		this.constants = constants;
		this.postRenderingService = postRenderingService;
		this.topPostService = topPostService;
		this.logHelper = logHelper;
		this.postSentRedis = postSentRedis;
	}


	/**
	 * Returns user's followee count
	 * @param {String} userId user's ID
	 * @returns {Number} followee count
	 */
	async fetchUserFolloweeCount(userId) {
		const dateTime = Date.now();
		const [ userMetaError, userMeta ] = await this.utility.invoker(
			this.userService.batchGetUserMeta([ userId ], 'following')
		);
		if (userMetaError || userMeta.size === 0) {
			this.logHelper.error('Error while fetching user Data',
				{ err: userMetaError, datetime: dateTime, userId: userId }
			);
			const errorObject = {
				msg: 'Error while fetching user Data',
				err: userMetaError,
			};
			throw errorObject;
		}
		return userMeta.get(userId).following
	}

	/**
	 * Returns number of posts in follow feed
	 * @param {String} userId user's ID
	 * @returns {Number} post count in follow feed
	 */
	async fetchNumberOfPostsInFollowFeed(userId) {
		const dateTime = Date.now();
		const [ countError, feed ] = await this.utility.invoker(this.followFeedRepoV2.fetchFeed(userId));
		if (countError) {
			this.logHelper.error('Error while fetching count of posts to be shown in the feed',
				{ err: countError, datetime: dateTime, userId: userId }
			);
			const errorObject = {
				msg: 'Error while fetching count of posts to be shown in the feed',
				err: countError
			};
			throw errorObject;
		}
		return feed.length;
	}

	/**
	 * Returns if user is eligible for D0 experience.
	 * @param {String} userId user's ID
	 * @param {String} appVersion client's app version
	 * @returns {Boolean} true if user is eligible for D0 experience
	 */
	async eligibleForD0Experience(userId, appVersion) {
		if (appVersion < this.constants.suggestedPosts.APP_VERSION) {
			return false;
		}
		const followeeCount = await this.fetchUserFolloweeCount(userId);
		if (followeeCount <= this.constants.suggestedPosts.MAX_FOLLOWING_COUNT_TO_ALWAYS_SHOW_D0_EXPERIENCE) {
			return true;
		}
		if (followeeCount > this.constants.suggestedPosts.D0_EXPERIENCE_FOLLOWING_COUNT_LIMIT) {
			return false;
		}
		const count = await this.fetchNumberOfPostsInFollowFeed(userId);
		return count === 0;
	}

	/**
	 * Returns list of post IDs from feed-relevance and top-post-service after filtering seen posts.
	 * @param {String} userId user's ID
	 * @param {String} language language
	 * @returns {String[]} list of postIds
	 */
	async fetchPostIdsToRender(userId, language) {
		const dateTime = Date.now();
		const [ feedRelevanceServiceError, feedRelevanceServiceResponse ] = await this.utility.invoker(
			this.feedRelevanceService.fetchUserAffinityPosts(userId, language)
		);
		if (feedRelevanceServiceError) {
			this.logHelper.error('Error when calling Feed-Relevance-Service',
				{ err: feedRelevanceServiceError, datetime: dateTime, userId: userId, language: language }
			);
			// Handle 404 not found cases as not all languages have routes in feed-relevance-service.
			// eslint-disable-next-line
			// https://github.com/ShareChat/feed-relevance/blob/master/feed-relevance-service/deployment/manifests/production/deploy.yaml#L2300
			if (feedRelevanceServiceError.status !== this.constants.HTTP_NOT_FOUND_STATUS_CODE) {
				const errorObject = {
					msg: 'Error when calling Feed-Relevance-Service',
					err: feedRelevanceServiceError
				};
				throw errorObject;
			}
		}
		let seenPostMap = await this.getSeenPostsMap(userId);
		const postIds = [];
		if (feedRelevanceServiceResponse &&
			feedRelevanceServiceResponse[this.constants.POPULAR_CREATORS]) {
			for (let item of feedRelevanceServiceResponse[this.constants.POPULAR_CREATORS]) {
				if (!item.postId) {
					continue;
				}
				if (!seenPostMap[item.postId]) {
					postIds.push(item.postId);
				}
			}
		}
		let topPostServiceError = null, topPostServiceResponse = [];
		if (postIds.length === 0){

			[ topPostServiceError, topPostServiceResponse ] = await this.utility.invoker(
				this.topPostService.getTrendingPosts(language, this.constants.suggestedPosts.LIMIT)
			);
			if (topPostServiceError) {
				this.logHelper.error('Error when calling Top-Post-Service',
					{ err: topPostServiceError, datetime: dateTime, userId: userId }
				);
				const errorObject = {
					msg: 'Error when calling Top-Post-Service',
					err: topPostServiceError
				};
				throw errorObject;
			}
		}
		
		for (let item of topPostServiceResponse) {
			if (!item.postId) {
				continue;
			}
			if (!seenPostMap[item.postId]) {
				postIds.push(item.postId);
			}
		}
		return postIds;
	}

	/**
	 * Adds trendingMeta in postcard.
	 * @param {Object} post post card
	 * @param {String} userSkinLanguage user's app skin language
	 * @param {Boolean} isFirstSuggestedPost is first suggested post in feed
	 */
	addKeysToPostcard(post, userSkinLanguage, isFirstSuggestedPost) {
		post.meta = 'suggested-posts';
		if (!isFirstSuggestedPost) {
			return;
		}
		post.trendingMeta = {
			leftIcon: this.constants.suggestedPosts.LEFT_ICON,
			heading: this.constants.suggestedPosts.HEADING[userSkinLanguage] || this.constants.suggestedPosts.HEADING.English,
		};
	}

	/**
	 * Call post-rendering-service to fetch post card and filters followees' posts.
	 * @param {String} userId user's ID
	 * @param {String[]} postIds list of post Ids
	 * @param {String} userSkinLanguage client's app skin language
	 * @returns {Object[]} list of post cards.
	 */
	async getPostCards(userId, postIds, userSkinLanguage) {
		// Only fetch `suggestedPosts.LIMIT` * 2 posts as we'll be sending `suggestedPosts.LIMIT` as response
		const postIdsToFetch = postIds.slice(0, this.constants.suggestedPosts.LIMIT * 2);
		const [ postRenderingServiceError, postRenderingServiceResponse ] = await this.utility.invoker(
			this.postRenderingService.getPostCards(userId, postIdsToFetch)
		);
		if (postRenderingServiceError) {
			this.logHelper.error('Error when making post cards for given PostIds using Post-Rendering-Service',
				{ err: postRenderingServiceError, datetime: Date.now(), userId: userId, postIds: postIdsToFetch }
			);
			throw postRenderingServiceError;
		}
		const verifiedPosts = [];
		let isFirstSuggestedPost = true;
		for (let [ key, postCard ] of postRenderingServiceResponse) {
			if (verifiedPosts.length === this.constants.suggestedPosts.LIMIT) {
				break;
			}
			if (!postCard.hasOwnProperty('ath') || !postCard.ath.hasOwnProperty('f') || postCard.ath.f === '1') {
				continue;
			}
			if (postCard.hasOwnProperty('authorIdStatus') && postCard.authorIdStatus.slice(-1) === '2') {
				this.addKeysToPostcard(postCard, userSkinLanguage, isFirstSuggestedPost);
				verifiedPosts.push(postCard);
				isFirstSuggestedPost = false;
			}
		}
		return verifiedPosts;
	}

	/**
	 * Checks if we need to show D0 experience and returns post cards if true.
	 * @param {String} userId user's ID
	 * @param {String} appVersion app version
	 * @param {String} userSkinLanguage app's skin language
	 * @param {String} language user's language
	 * @returns 
	 */
	async showD0Posts(userId, appVersion, userSkinLanguage, language) {
		if (!await this.eligibleForD0Experience(userId, appVersion)) {
			return [];
		}
		const postIds = await this.fetchPostIdsToRender(userId, language);
		const posts = await this.getPostCards(userId, postIds, userSkinLanguage);
		let sentPostIds = [];
		for (let sentPost of posts){
			sentPostIds.push(sentPost.i);
		}
		await this.postSentRedis.updateSentList(userId, sentPostIds, []);
		return posts;
	}

	async getSeenPostsMap(userId) {
		let seenPostIds = await this.postSentRedis.fetchSentList(userId, false, true);
		let seenPostMap = {};
		for (let postId of seenPostIds) {
			seenPostMap[postId] = true;
		}
		return seenPostMap;
	}
}

module.exports = ShowD0PostsLogic;
