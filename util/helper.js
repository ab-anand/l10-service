const Hashids = require('hashids/cjs');

class Helper {

	constructor() {
		this.hashids = new Hashids('(YoBro-CoolBro)/640.12f=NoBro');
	}

	/**
	 * Sleeps for `sleepFor` milliseconds
	 * @param {number} sleepFor sleepFor
	 * @returns {Promise}
	 */
	sleep(sleepFor) {
		return new Promise(resolve => {
			setTimeout(resolve, sleepFor);
		});
	}

	/**
	 * Decodes the given hashed object
	 * @param {String} input the string to be decoded
	 * @returns {Object} the decoded object
	 * @memberof Helper
	 */
	getDecodedObject(input) {
		if (!input) {
			return null;
		}
		const decodedHex = this.hashids.decodeHex(input);
		if (typeof decodedHex !== 'string') {
			return null;
		}
		const decodedValue = Buffer.from(decodedHex, 'hex').toString('utf8');
		return JSON.parse(decodedValue);
	}

	/**
	 * Encodes the given object value
	 * @param {Object} input the object to be encoded
	 * @returns {String} the encoded value
	 * @memberof Helper
	 */
	getEncodedObject(input) {
		if (!input) {
			return null;
		}
		const inputValue = JSON.stringify(input);
		const hexInputValue = Buffer.from(inputValue).toString('hex');
		return this.hashids.encodeHex(hexInputValue);
	}

	/**
	 *
	 * @param {Object} err Error object in case any
	 * @param {Object} data data to be sent in response
	 * @param {Object} res response object
	 * @returns {Object}
	 * @memberof GetUsers
	 */
	writeResponse(err, data, res) {
		if (err) {
			res.status(err.code ? err.code : 400);
			return res.send(err.msg ? { errMessage: err.msg } : err);
		}
		res.status(200);
		return res.json(data);
	}

	/**
	 * @description Parses request and returns required information
	 * @param {Request} req Request Object
	 * @returns {{url:string, headers:Object, body:Object, params:Object, query:Object}}
	 * @memberof Helper
	 */
	getRequestInfo(req) {
		return {
			url: req.route && req.baseUrl + req.route.path || req.originalUrl,
			headers: req.headers,
			body: req.body,
			params: req.params,
			query: req.query
		};
	}
}

module.exports = Helper;
