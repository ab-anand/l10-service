class UpdateString {
    constructor(logHelper, helper, updateStringLogic, constants) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.constants = constants;
        this.updateStringLogic = updateStringLogic;
    }

    async handleRequest(req, res) {
        const stringKey = req.body.key;
        if (!stringKey) {
            return this.helper.writeResponse({ code: 400, msg: 'Missing key in body' }, null, res);
        }
        const payload = req.body;
        console.log(payload);
        try {
            await this.updateStringLogic.updateString(payload);
            return this.helper.writeResponse(null, { msg: 'success' }, res);
        } catch (err) {
            console.log(err);
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = UpdateString;