const _ = require('lodash');

class GetLabel {
	constructor(logHelper, helper, labelsRepo, constants) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.labelsRepo = labelsRepo;
	}

	async handleRequest(req, res) {
		const userHeaderKey = this.constants.userAuthorizedHeaderKey;
		const userId = req.get(userHeaderKey);

		if (!userId) {
			return this.helper.writeResponse({ code: 400, msg: 'Missing user id in header' }, null, res);
		}
		const searchString = req.query.q;

		try {
			const labels = await this.labelsRepo.getAllLabels(searchString);
			return this.helper.writeResponse(null, { entries: labels.results }, res);
		} catch (err) {
			console.log(err);
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = GetLabel;
