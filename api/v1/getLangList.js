const _ = require('lodash');

class GetLangList {
	constructor(logHelper, helper, hacks) {
		this.logHelper = logHelper;
		this.helper = helper;
		this.hacks = hacks;
	}

	async handleRequest(req, res) {
		const response = {
			languages: _.cloneDeep(this.hacks.languages)
		};
		return this.helper.writeResponse(null, response, res);
	}
}

module.exports = GetLangList;
