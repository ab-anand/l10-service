const _ = require("lodash");

class AddString {
    constructor(logHelper, constants, helper, stringsRepo, addStringLogic) {
        this.logHelper = logHelper;
        this.constants = constants;
        this.helper = helper;
        this.stringsRepo = stringsRepo;
        this.addStringLogic = addStringLogic;
    }

    async handleRequest(req, res) {
        const key = req.body.key;
        if (!key ) {
            return this.helper.writeResponse({ code: 400, msg: 'Missing key or label(s) in req' }, null, res);
        }
        const payload = req.body;
        console.log(payload);
        try {
            await this.addStringLogic.addString(payload);
            return this.helper.writeResponse(null, { msg: 'success' }, res);
        } catch (err) {
            console.log(err);
            return this.helper.writeResponse({ code: 500, msg: err.msg || 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = AddString;