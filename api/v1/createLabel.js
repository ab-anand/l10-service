const _ = require('lodash');

class CreateLabel {
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

		const payload = req.body;
		const entries = payload.entries;
		console.log(entries);
		try {
			await this.labelsRepo.add(entries[0]);
			return this.helper.writeResponse(null, { msg: 'success' }, res);
		} catch (err) {
			console.log(err);
			return this.helper.writeResponse({ code: 500, msg: err.msg || 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = CreateLabel;
