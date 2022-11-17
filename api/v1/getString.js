const _ = require("lodash");

class GetString {
    constructor(logHelper, helper, hacks, fetchStringLogic) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.fetchStringLogic = fetchStringLogic;
    }

    async handleRequest(req, res) {
        const offset = req.query.offset ? req.query.offset : null;
        const sentence = req.query.key;
        const limit = req.query.limit ? Number(req.query.limit): 10;
        // if (!sentence) {
        //     const err = { code: 400, msg: 'Missing key in query' };
        //     // this.logHelper.error('Missing user id in header', { err: err, req: req });
        //     return this.helper.writeResponse(err, null, res);
        // }
        try {
            const response = await this.fetchStringLogic.fetchString(sentence, limit, offset);
            // const data = await this.translationCategory.getStrings(sentence, limit);
            // const lastAddedOn = data.length >= limit ? data[limit - 1].added_on: null ;
            // const response = {
            //     postCount: count
            // };
            return this.helper.writeResponse(null, response, res);
        } catch (err) {
            this.logHelper.error('Error while fetching follow Feed status', { err: err, req: req });
            return this.helper.writeResponse({ code: 500, msg: 'Internal Server Error' }, null, res);
        }
    }
}

module.exports = GetString;