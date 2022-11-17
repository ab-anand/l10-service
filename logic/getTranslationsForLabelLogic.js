class GetTranslationsForLabelLogic {
    constructor(logHelper, helper, stringsRepo, translationsRepo) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.stringsRepo = stringsRepo;
        this.translationsRepo = translationsRepo;
    }

    async getTranslationsForLabel(labelId) {
        const data = await this.stringsRepo.getStringsByLabel(labelId);
        let keys = new Set();
        for (const d of data) {
            keys.add(d.key);
        }

        const translations = await this.translationsRepo.batchGetKeys(Array.from(keys));
        return translations.results || [];
    }
}

module.exports = GetTranslationsForLabelLogic;