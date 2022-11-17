class AddPostsInFollowFeed {

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

	/**
	 * @swagger
	 * /v2.0.0/addOnFollow:
	 *   post:
	 *     summary: Add posts to follow feed of user. The posts are added with Date.now() as timestamp
	 *     parameters:
	 *       - $ref: '#/components/parameters/X-AUTH-USERID'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               postIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *             required:
	 *               - postIds
	 *     responses:
	 *        400:
	 *          description: "Bad Request"
	 *        500:
	 *          description: "Internal server error"
	 *        200:
	 *          description: "Success"
	 */

	/**
	 *
	 * @param {Request} req req
	 * @param {Response} res res
	 * @returns {Promise}
	 */
	async handleRequest(req, res) {
		const userId = req.get(this.constants.userAuthorizedHeaderKey);
		if (!userId) {
			const err = { code: 400, msg: 'Missing user id in header' };
			// this.logHelper.error('Missing user id in header', { err: err, req: req });
			return this.helper.writeResponse(err, null, res);
		}
		const payload = req.body || {};
		const posts = payload.postIds || [];
		if (!posts.length) {
			const err = { code: 400, msg: 'Missing post ids in body' };
			// this.logHelper.error('Missing post ids in header', { err: err, req: req });
			return this.helper.writeResponse(err, null, res);
		}

		this.helper.writeResponse(null, { message: 'Follow feed addition triggered successfully' }, res);

		const itemsToInsert = posts.map(postItem => ({
			userId: userId,
			postId: String(postItem),
			score: Math.floor(Date.now()),
			remark: this.constants.DEFAULT_REMARK
		}));
		await this.addToFollowFeedLogic.addFeed(itemsToInsert).catch(reason => {
			this.logHelper.error('Error while adding feeds to user feed', {
				err: reason,
				itemsToInsert: itemsToInsert
			});
		});
		return null;
	}
}

module.exports = AddPostsInFollowFeed;
