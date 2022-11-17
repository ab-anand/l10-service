class GetTranslationsForLabel {
    constructor(logHelper, helper, getTranslationsForLabelLogic, constants) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.constants = constants;
        this.getTranslationsForLabelLogic = getTranslationsForLabelLogic;
    }

    async handleRequest(req, res) {
        const labelId = req.params.labelId;
        if (!labelId) {
            return this.helper.writeResponse({ code: 400, msg: 'Missing labelId in param' }, null, res);
        }
        try {
            const resp = await this.getTranslationsForLabelLogic.getTranslationsForLabel(labelId);
            return this.helper.writeResponse(null, { entries: resp }, res);
        } catch (err) {
            console.log(err);
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = GetTranslationsForLabel;