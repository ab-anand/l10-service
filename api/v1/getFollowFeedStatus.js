class GetFollowFeedStatus {

	/**
	 * @param {LogHelper} logHelper logHelper
	 * @param {Helper} helper helper
	 * @param {Object} constants constants
	 * @param {FollowFeedRepoV2} followFeedRepoV2 followFeedRepoV2 followFeedRepoV2
	 */
	constructor(logHelper, helper, constants, followFeedRepoV2) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.followFeedRepoV2 = followFeedRepoV2;
	}

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
		try {
			const feed = await this.followFeedRepoV2.fetchFeed(userId);
			const count = feed.length;
			const response = {
				postCount: count
			};
			return this.helper.writeResponse(null, response, res);
		} catch (err) {
			this.logHelper.error('Error while fetching follow Feed status', { err: err, req: req });
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = GetFollowFeedStatus;
