class StringsRepo {

    /**
     *
     * @param {Object} spannerHelper spannerHelper
     * @param {Object} constants constants
     */
    constructor(spannerHelper, constants) {
        this.spannerHelper = spannerHelper;
        this.tableName = 'translation_category';
    }

    async add(addObj) {
        console.log({ addObj: addObj });
        const result = await this.get(addObj.key, addObj.label);
        if (result && result.results.length) {
            throw { msg: 'Already exists' };
        }
        const insertObject = JSON.parse(JSON.stringify(addObj));
        const query = {
            sql: `INSERT ${this.tableName} (${Object.keys(insertObject).join(',')}) 
			VALUES (${Object.values(insertObject).map(elem => JSON.stringify(elem)).join(',')})`
        };
        console.log(query);
        const res = await this.spannerHelper.write(this.tableName, { query: query });
        console.log(res);
        return res;
    }

    async get(key, label) {
        let query;
        if (label) {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE key = "${key}" AND label = "${label}"`
            };
        } else {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE key = "${key}"`
            };
        }
        console.log(query);
        const res = await this.spannerHelper.read(this.tableName, { query: query });
        console.log(res);
        return res;
    }

    async getStringsByLabel(label) {
        const query = {
            sql: `SELECT * FROM ${this.tableName} WHERE label ="${label}"`
        };

        const res = await this.spannerHelper.read(this.tableName, { query: query });
        console.log(res);
        return res.results || [];
    }

    async getAllStrings(searchString, offset) {
        let query;
        const offsetQuery = offset === null ? '' : 'AND added_on < ${offset}'
        if (searchString) {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE sentence like "%${searchString}%" ${offsetQuery} ORDER BY added_on DESC`
            };
        } else {
            query = {
                sql: `SELECT * FROM ${this.tableName} ORDER BY added_on DESC`
            };
        }
        console.log(query);
        const res = await this.spannerHelper.read(this.tableName, { query });
        console.log(res);
        return res.results || [];
    }

    async deleteString(key, label) {
        const res = await this.spannerHelper.deleteRows(this.tableName, [ [key.toString(), label] ]);
        console.log(res);
        return res;
    }

    async update(payload) {
        let screenshotQuery = '';
        let sentenceQuery = '';
        if (payload.screenshot_url) {
            screenshotQuery = `screenshot_url = "${payload.screenshot_url}"`
        }
        if (payload.sentence) {
            if (screenshotQuery) {
                sentenceQuery = `, sentence = "${payload.sentence}"`
            }
        }
        const query = {
            sql: `UPDATE ${this.tableName} SET ${screenshotQuery} ${sentenceQuery}
			WHERE key = "${payload.key}"`
        };
        console.log(query);
        const res = await this.spannerHelper.write(this.tableName, { query: query });
        console.log(res);
        return res;
    }
}

module.exports = StringsRepo;