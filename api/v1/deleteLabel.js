const _ = require('lodash');

class DeleteLabel {
    constructor(logHelper, helper, labelsRepo, constants) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.constants = constants;
        this.labelsRepo = labelsRepo;
    }

    async handleRequest(req, res) {
        const labelId = req.params.labelId;

        try {
            await this.labelsRepo.deleteLabel(labelId)
            return this.helper.writeResponse(null, { msg: "success" }, res);
        } catch (err) {
            console.log(err)
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = DeleteLabel;