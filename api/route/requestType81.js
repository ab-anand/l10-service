const _ = require('lodash');

class RequestType81 {

	/**
	 *Creates an instance of RequestType81.
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
	 * @param {BigInt} number number
	 * @returns {BigInt}
	 */
	bigIntAbs(number) {
		return number >= BigInt(0) ? number : -number;
	}

	/**
	 * @swagger
	 * /../requestType81:
	 *   post:
	 *     deprecated: true
	 *     summary: Old api for fetching follow feed. No new experiments reflect in this api.
	 *     parameters:
	 *       - $ref: '#/components/parameters/X-AUTH-USERID'
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               message:
	 *                 type: object
	 *                 properties:
	 *                   o:
	 *                     type: integer
	 *                     description: Offset for feed. postedOn of last post in feed. Set to a large number for first fetch
	 *                     example: 9223372036854775808
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
	 * @param {Object} req request
	 * @param {Object} res response
	 * @returns {Object}
	 * @memberof RequestType81
	 */
	async handleRequest(req, res) {
		const event = req.body;
		const userId = req.get(this.constants.userAuthorizedHeaderKey);
		const payload = event.message;
		const offset = payload.o ? this.bigIntAbs(BigInt(payload.o)) >= BigInt(2) ** BigInt(60) ?
			null :
			{ score: Number(payload.o) === Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : Math.abs(Number(payload.o)) } : null;
		const limit = 10;
		try {
			const { feed, nextOffset, ord } = await this.fetchFollowFeedLogic.fetchFollowFeed(userId, limit, offset);

			if (feed.length !== 0) {
				const fakePost = _.cloneDeep(this.constants.FAKE_POST_DATA);
				fakePost.i = Date.now().toString();
				fakePost.o = nextOffset ? nextOffset.score : Number.MIN_SAFE_INTEGER;
				if (_.last(feed).ath) {
					fakePost.ath = _.last(feed).ath;
					fakePost.y = _.last(feed).ath.tu || fakePost.y;
					fakePost.a = fakePost.ath.i;
				}
				feed.push(fakePost);
				ord.push(-fakePost.o);
			}

			const response = {
				payload: {
					d: feed,
					ord: ord,
					f: 1,
					lt: 81
				}
			};

			if (offset === null) {
				response.payload.p = 'h';
			}

			return this.helper.writeResponse(null, response, res);
		} catch (err) {
			this.logHelper.error('Error while fetching follow Feed', { err: err, req: req });
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = RequestType81;
