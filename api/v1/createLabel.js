const _ = require('lodash');

class CreateLabel {
    constructor(logHelper, helper, labelsRepo, constants) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.constants = constants;
        this.labelsRepo = labelsRepo;
    }

    async handleRequest(req, res) {
        const payload = req.body;
        const entries = payload.entries;
        console.log(entries)
        try {
            const labels = await this.labelsRepo.createLabel(entries[0]);
            return this.helper.writeResponse(null, { msg: "success" }, res);
        } catch (err) {
            console.log(err)
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = CreateLabel;