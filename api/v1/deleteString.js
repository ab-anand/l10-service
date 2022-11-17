const _ = require('lodash');

class DeleteString {
    constructor(logHelper, helper, stringsRepo, constants) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.constants = constants;
        this.stringsRepo = stringsRepo;
    }

    async handleRequest(req, res) {
        const stringKey = req.params.key;
        if (!stringKey) {
            return this.helper.writeResponse({ code: 400, msg: 'Missing key in param' }, null, res);
        }
        const label = req.query.label ? req.query.label : null;
        try {
            await this.stringsRepo.deleteString(stringKey, label)
            return this.helper.writeResponse(null, { msg: "success" }, res);
        } catch (err) {
            console.log(err)
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = DeleteString;