class AddToFollowFeed {

	/**
	 * @param {LogHelper} logHelper logHelper
	 * @param {Helper} helper helper
	 * @param {Object} constants constants
	 * @param {AddToFollowFeedLogic} addToFollowFeedLogic addToFollowFeedLogic
	 */
	constructor(logHelper, helper, constants, addToFollowFeedLogic) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.addToFollowFeedLogic = addToFollowFeedLogic;
	}

	static isItemCorrect(item) {
		// Sample Item { "postId": "1234", "score": 132123, "remark": "blahblah" }
		return item.hasOwnProperty('postId') && item.hasOwnProperty('score') && item.hasOwnProperty('remark');
	}

	/**
	 * @swagger
	 * /v2.0.0/{userId}/feed:
	 *   post:
	 *     summary: Add posts to follow feed of user.
	 *     parameters:
	 *       - $ref: '#/components/parameters/userId'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               feed:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     postId:
	 *                       type: string
	 *                     score:
	 *                       type: integer
	 *                     remark:
	 *                       type: string
	 *             required:
	 *               - feed
	 *     responses:
	 *        400:
	 *          description: "Bad Request"
	 *        500:
	 *          description: "Internal server error"
	 *        200:
	 *          description: "Success"
	 */

	/**
	 * @param {Request} req req
	 * @param {Response} res res
	 * @returns {Promise}
	 */
	async handleRequest(req, res) {
		const userId = req.params.userId;

		const items = Array.isArray(req.body.feed) && req.body.feed.filter(AddToFollowFeed.isItemCorrect) || [];

		if (items.length === 0) {
			this.helper.writeResponse(null, {}, res);
		}

		const itemsToInsert = items.map(value => ({
			userId: userId,
			postId: String(value.postId),
			score: value.score,
			remark: value.remark
		}));

		await this.addToFollowFeedLogic.addToNewerFeed(itemsToInsert).catch(reason => {
			this.logHelper.error('Error while adding feeds to user feed', {
				err: reason,
				itemsToInsert: itemsToInsert,
				req: req
			});
		});

		return this.helper.writeResponse(null, {}, res);
	}
}

module.exports = AddToFollowFeed;
