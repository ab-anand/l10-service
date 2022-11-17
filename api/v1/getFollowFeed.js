class GetFollowFeed {
	/**
	 * @param {LogHelper} logHelper logHelper
	 * @param {Helper} helper helper
	 * @param {Object} constants constants
	 * @param {FetchFollowFeedLogic} fetchFollowFeedLogic fetchFollowFeedLogic
	 */
	constructor(logHelper, helper, constants, fetchFollowFeedLogic) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.fetchFollowFeedLogic = fetchFollowFeedLogic;
	}

	/**
	 * @swagger
	 * /v1.0.0/followFeed:
	 *   get:
	 *     deprecated: true
	 *     summary: Another old api for fetching follow feed. Only used for ux-service now.
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
	 *                type: object
	 *                properties:
	 *                  d:
	 *                    type: array
	 *                    items:
	 *                      $ref: '#/components/schemas/PostCard'
	 */

	/**
	 *
	 * @param {Request} req req
	 * @param {Response} res res
	 * @returns {Promise}
	 */
	async handleRequest(req, res) {
		const userId = req.get(this.constants.userAuthorizedHeaderKey);
		const limit = Math.min(Number(req.query.limit || 10), 10);
		const offset = req.query.offset ? (req.query.offset === (2 ** 60).toString() ? null : { score: Number(req.query.offset) * 1000 }) : null;

		try {
			const { feed, nextOffset } = await this.fetchFollowFeedLogic.fetchFollowFeed(userId, limit, offset);
			return this.helper.writeResponse(null, {
				d: feed
			}, res);
		} catch (err) {
			this.logHelper.error('Error while fetching follow Feed', { err: err, req: req });
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = GetFollowFeed;
