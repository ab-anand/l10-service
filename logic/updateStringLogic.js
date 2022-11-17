class UpdateStringLogic {
    constructor(logHelper, helper, stringsRepo) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.stringsRepo = stringsRepo;
    }

    async updateString(payload) {
        await this.stringsRepo.update(payload);
    }
}

module.exports = UpdateStringLogic;