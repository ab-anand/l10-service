class GetFollowFeedV2 {

	/**
	 * @param {LogHelper} logHelper logHelper
	 * @param {Helper} helper helper
	 * @param {Object} constants constants
	 * @param {FetchFollowFeedLogic} fetchFollowFeedLogic fetchFollowFeedLogic
	 * @param {Object} config config
	 * @param {ShowD0PostsLogic} showD0PostsLogic showD0PostsLogic
	 * @param {Object} utility utility
	 */
	constructor(logHelper, helper, constants, fetchFollowFeedLogic, config, showD0PostsLogic, utility) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.fetchFollowFeedLogic = fetchFollowFeedLogic;
		this.config = config;
		this.showD0PostsLogic = showD0PostsLogic;
		this.utility = utility;
	}

	/**
	 * @swagger
	 * /v2.0.0/public/followFeed:
	 *   get:
	 *     summary: The api for fetching follow feed.
	 *     parameters:
	 *       - $ref: '#/components/parameters/X-AUTH-USERID'
	 *       - $ref: '#/components/parameters/limit'
	 *       - $ref: '#/components/parameters/offset'
	 *     responses:
	 *        400:
	 *          description: "Bad Request"
	 *        500:
	 *          description: "Internal server error"
	 *        200:
	 *          description: "Success"
	 *          content:
	 *            application/json:
	 *              schema:
	 *                $ref: '#/components/schemas/PostFeed'
	 */

	/**
	 *
	 * @param {e.Request} req req
	 * @param {e.Response} res res
	 * @returns {Promise}
	 */
	async handleRequest(req, res) {
		const userId = req.get(this.constants.userAuthorizedHeaderKey);
		const showD0Experience = req.query.showFollowSuggestion;
		const appVersion = req.get(this.constants.APP_VERSION) || req.body.appVersion || 0;
		const limit = Math.min(Number(req.query.limit || 10), 10);
		const offset = this.helper.getDecodedObject(req.query.offset || null);
		const userSkinLanguage = req.get(this.constants.userSkinLanguage) || req.query.language || req.query.lang;
		const language = req.get(this.constants.userLanguage) || req.query.language || req.query.lang;
		const followFeedExperimentsV1 = req.query.followfeedexperimentsV1 ? req.query.followfeedexperimentsV1 : 'control';

		if (showD0Experience === 'true') {
			let [err, d0Posts] = await this.utility.invoker(
				this.showD0PostsLogic.showD0Posts(userId, appVersion, userSkinLanguage, language)
			);
			if (err) {
				this.logHelper.error('Error while fetching D0 posts', {err: err, req: req});
				return this.helper.writeResponse({code: 500, msg: 'Internal Server Error'}, null, res);
			}
			return this.helper.writeResponse(null, {
				feed: d0Posts,
				offset: null,
			}, res);
		}

		try {
			if ([ 'variant-3', 'variant-4' ].includes(followFeedExperimentsV1)) {
					const { feed, nextOffset } = await this.fetchFollowFeedLogic.fetchFollowFeedV3(userId, followFeedExperimentsV1, limit, offset);
					return this.helper.writeResponse(null, {
						feed: feed,
						offset: this.helper.getEncodedObject(nextOffset)
					}, res);
			} else {
					const { feed, nextOffset } = await this.fetchFollowFeedLogic.fetchFollowFeed(userId, limit, offset);
					return this.helper.writeResponse(null, {
						feed: feed,
						offset: this.helper.getEncodedObject(nextOffset)
					}, res);
			}
		} catch (err) {
			this.logHelper.error('Error while fetching follow Feed', { err: err, req: req });
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = GetFollowFeedV2;
