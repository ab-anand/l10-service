const { v4: uuidv4 } = require('uuid');
class TranslationsRepo {

    /**
     *
     * @param {Object} spannerHelper spannerHelper
     * @param {Object} constants constants
     */
    constructor(spannerHelper, constants) {
        this.spannerHelper = spannerHelper;
        this.tableName = 'translations_mapping';
    }

    /**
     *
     * @param {Object} addObj addObj
     * @memberOf TranslationsRepo
     */
    async add(addObj) {
        console.log({addObj});
        const result = await this.get(addObj.key, addObj.locale);
        if (result && result.results.length > 0) {
            throw {msg: "Already exists"}
        }
        const insertObject = JSON.parse(JSON.stringify(addObj));
        const query = {
            sql: `INSERT ${this.tableName} (${Object.keys(insertObject).join(',')}) VALUES (${Object.values(insertObject).map(elem => JSON.stringify(elem)).join(',')})`
        };
        console.log(query)
        const res = await this.spannerHelper.write(this.tableName, { query });
        console.log(res)
        return res;
    }

    async update(payload) {
        const query = {
            sql: `UPDATE ${this.tableName} SET translation = "${payload.translation}"  WHERE key = "${payload.key}" AND locale = "${payload.locale}"`
        };
        console.log(query)
        const res = await this.spannerHelper.write(this.tableName, { query });
        console.log(res)
        return res;
    }

    /**
     *
     * @param {String} key key
     * @param {String} locale locale
     * @memberOf TranslationsRepo
     */
    async get(key, locale) {
        let query;
        if (locale) {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE key = "${key}" AND locale = "${locale}"`
            };
        } else {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE key = "${key}"`
            };
        }
        console.log(query)
        const res = await this.spannerHelper.read(this.tableName, { query });
        console.log(res)
        return res;
    }

    /**
     *
     * @param {String} key key
     * @param {String} locale locale
     * @memberOf TranslationsRepo
     */
    async delete(key, locale) {
        const res = await this.spannerHelper.deleteRows(this.tableName, [ [ key, locale ] ]);
        console.log(res);
        return res;
    }
}

module.exports = TranslationsRepo;
