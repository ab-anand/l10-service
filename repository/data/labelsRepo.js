const { v4: uuidv4 } = require('uuid');
class LabelsRepo {

	/**
     *
     * @param {Object} spannerHelper spannerHelper
     */
	constructor(spannerHelper) {
		this.spannerHelper = spannerHelper;
		this.tableName = 'label_mapping';
	}

	/**
     *
     * @param {Object} labelsObj labelsObj
     * @memberOf LabelsRepo
     */
	async add(labelsObj) {
		//labelsObj.createdAt = Date.now()
		console.log({ labelsObj: labelsObj });
		const result = await this.getLabelByName(labelsObj.name);
		if (result && result.results.length) {
			throw { msg: 'Already exists' };
		}
		labelsObj.id = uuidv4();
		const query = {
			sql: `INSERT ${this.tableName} (${Object.keys(labelsObj).join(',')}) 
			VALUES (${Object.values(labelsObj).map(elem => JSON.stringify(elem)).join(',')})`
		};
		console.log(query);
		const res = await this.spannerHelper.write(this.tableName, { query: query });
		console.log(res);
		return res;
	}

	/**
     *
     * @param {String} name name
     * @memberOf LabelsRepo
     */
	async getLabelByName(name) {
		let query = {
			sql: `SELECT * FROM ${this.tableName} WHERE name = "${name}"`
		};
		const res = await this.spannerHelper.read(this.tableName, { query: query });
		console.log(res);
		return res;
	}

	/**
     *
     * @param {String} searchString searchString
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
		console.log(query);
		const res = await this.spannerHelper.read(this.tableName, { query: query });
		console.log(res);
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
