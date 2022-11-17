const _ = require('lodash');

class AddTranslations {
	constructor(logHelper, helper, translationsRepo, constants) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.translationsRepo = translationsRepo;
	}

	async handleRequest(req, res) {
		const userHeaderKey = this.constants.userAuthorizedHeaderKey;
		const userId = req.get(userHeaderKey);

		const payload = req.body;
		console.log(payload);
		try {
			await this.translationsRepo.add(payload);
			return this.helper.writeResponse(null, { msg: 'success' }, res);
		} catch (err) {
			console.log(err);
			return this.helper.writeResponse({ code: 500, msg: err.msg || 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = AddTranslations;
