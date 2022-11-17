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
        const entries = translations.results || [];
        let responseMap = new Map();
        for (const entry of entries) {
            if (responseMap.has(entry.key)){
                let obj = responseMap.get(entry.key);
                obj[entry.locale] = entry.translation;
            } else {
                const locale = entry.locale;
                const obj = {};
                obj[locale] = entry.translation;
                responseMap.set(entry.key, obj);
            }
        }

        let result = [];
        for (let [key, value] of responseMap) {
            let obj = {};
            obj[key] = value;
            result.push(obj);
        }

        return result;
    }
}

module.exports = GetTranslationsForLabelLogic;