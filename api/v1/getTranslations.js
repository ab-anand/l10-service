const _ = require('lodash');

class GetTranslations {
	constructor(logHelper, helper, translationsRepo, constants) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.constants = constants;
		this.translationsRepo = translationsRepo;
	}

	async handleRequest(req, res) {
		const userHeaderKey = this.constants.userAuthorizedHeaderKey;
		const userId = req.get(userHeaderKey);

		if (!userId) {
			return this.helper.writeResponse({ code: 400, msg: 'Missing user id in header' }, null, res);
		}

		const { key } = req.params;
		const { locale } = req.query;

		if (!key) {
			return this.helper.writeResponse({ code: 400, msg: 'Missing key-id in request' }, null, res);
		}
		try {
			const resp = await this.translationsRepo.get(key, locale);
			const translations = [];
			for (let key of Object.keys(resp.results)) {
				let obj = resp.results[key];
				delete obj.key;
				delete obj.createdAt;
				obj.translation = Array(obj.translation);
				translations.push(obj);
			}
			return this.helper.writeResponse(null, { translations: translations }, res);
		} catch (err) {
			console.log(err);
			return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
		}
	}
}

module.exports = GetTranslations;
