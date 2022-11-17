const { v4: uuidv4 } = require('uuid');
class LabelsRepo {

    /**
     *
     * @param {Object} spannerHelper spannerHelper
     * @param {Object} constants constants
     */
    constructor(spannerHelper, constants) {
        this.spannerHelper = spannerHelper;
        this.tableName = 'label_mapping';
    }

    /**
     *
     * @param {Object} labelsObj labelsObj
     * @memberOf LabelsRepo
     */
    async createLabel(labelsObj) {
        labelsObj.id = uuidv4();
        //labelsObj.createdAt = Date.now()
        console.log({labelsObj});
        const insertObject = JSON.parse(JSON.stringify(labelsObj));
        const query = {
            sql: `INSERT ${this.tableName} (${Object.keys(labelsObj).join(',')}) VALUES (${Object.values(labelsObj).map(elem => JSON.stringify(elem)).join(',')})`
        };
        console.log(query)
        const res = await this.spannerHelper.write(this.tableName, { query });
        console.log(res)
        return res;
    }

    /**
     *
     * @param {String} labelId labelId
     * @memberOf LabelsRepo
     */
    async getLabel(labelId) {
        let query = {
            sql: `SELECT * FROM ${this.tableName} WHERE labelId = "${labelId}"`
        };
        const res = await this.spannerHelper.read(this.tableName, { query });
        console.log(res)
        return res;
    }

    /**
     *
     * @memberOf LabelsRepo
     */
    async getAllLabels(searchString) {
        let query;
        if (searchString) {
            query = {
                sql: `SELECT * FROM ${this.tableName} WHERE name like "%${searchString}%"`
            };
        } else {
            query = {
                sql: `SELECT * FROM ${this.tableName}`
            };
        }
        console.log(query)
        const res = await this.spannerHelper.read(this.tableName, { query });
        console.log(res)
        return res;
    }

    /**
     * @param {String} labelId labelId
     * @returns {Promise} Promise
     * @memberOf LabelsRepo
     */
    async deleteLabel(labelId) {
        const res = await this.spannerHelper.deleteRows(this.tableName, [ [ labelId ] ]);
        console.log(res);
        return res;
    }
}

module.exports = LabelsRepo;
