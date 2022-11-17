class FetchStringLogic {
    constructor(logHelper, helper, hacks, stringsRepo) {
        this.logHelper = logHelper;
        this.helper = helper;
        this.hacks = hacks;
        this.stringsRepo = stringsRepo;
    }

    async fetchString(sentence, limit, offset) {
        const data = await this.stringsRepo.getAllStrings(sentence, offset);
        let responseMap = new Map();
        let keyMap = new Map();
        let labelArrMap = new Map();
        for (const row of data) {
            // var labelArr;
            if (!keyMap.has(row.key)) {
                var labelArr = [row.label];
                labelArrMap.set(row.key, labelArr);
                keyMap.set(row.key, labelArr);
            } else {
                labelArr = labelArrMap.get(row.key)
                labelArr.push(row.label);
                keyMap.set(row.key, labelArr);
            }

            responseMap.set(row.key, {
                key: row.key,
                sentence: row.sentence,
                labels: labelArr,
                screenshot_url: row.screenshot_url
            });
        }
        let entries = Array.from(responseMap.values());
        const response = {
            entries: entries,
            offset: data[data.length-1].added_on
        }
        return response;
        // return data;
    }
}

module.exports = FetchStringLogic;