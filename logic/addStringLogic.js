class AddStringLogic {
    constructor(logHelper, helper, stringsRepo) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.stringsRepo = stringsRepo;
    }

    async addString(payload) {
        const labels = payload.labels;
        if (labels && labels.length) {
            for (const label in labels) {
                let addObj = {
                    key: payload.key,
                    label: label,
                    sentence: payload.sentence,
                    added_on: Number(Date.now()/1000).toFixed(0)
                }
                try {
                    await this.stringsRepo.add(addObj);
                } catch(err) {
                    this.logHelper.error('Error while adding string ${key}-${label}', { err: err, addObj: addObj });
                }
            }
        } else {
            let addObj = {
                key: payload.key,
                sentence: payload.sentence,
                added_on: Number(Date.now()/1000).toFixed(0)
            }
            try {
                await this.stringsRepo.add(addObj);
            } catch(err) {
                this.logHelper.error('Error while adding string ${key}-${label}', { err: err, addObj: addObj });
            }
        }

        // return data;
    }
}

module.exports = AddStringLogic;