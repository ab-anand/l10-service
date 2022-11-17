const { logger } = require('tracer-client');
const { AppError } = require('./customErrors');
const http = require('http');
const _ = require('lodash');

/** */
class LogHelper {

	/**
	 * Creates an instance of LogHelper.
	 * @param {String} indexName index name
	 */
	constructor(indexName) {
		this.indexName = indexName;
		this.logger = logger;
	}

	static parseRequest(req) {
		if (!req) {
			return {};
		}
		return _.omitBy({
			path: `${req.method} ${!_.isNil(req.baseUrl) && req.route && !_.isNil(req.route.path) && req.baseUrl + req.route.path || req.path}`,
			headers: req.headers || undefined,
			params: req.params || undefined,
			body: req.body || undefined,
			query: req.query || undefined
		}, _.isNil);
	}

	/**
	 * @param {Object} meta meta
	 * @returns {object}
	 */
	static formatMeta(meta={}) {
		const newMeta = {};
		for (const key in meta) {
			if (meta.hasOwnProperty(key)) {
				try {
					const elem = meta[key];
					if (key === 'reqInfo' && elem.url) {
						// newMeta.path = elem.url;
					} else if (elem instanceof AppError) {
						newMeta[key] = LogHelper.formatMeta({
							message: elem.message,
							cause: elem.cause,
							context: elem.context,
							stack: elem.stack
						});
					} else if (elem instanceof http.IncomingMessage) {
						newMeta[key] = LogHelper.parseRequest(elem);
					} else if (elem instanceof Error) {
						newMeta[key] = `${elem}\nStack: ${elem.stack}`;
					} else if (Array.isArray(elem)) {
						newMeta[key] = JSON.stringify(elem);
					} else if (typeof elem === 'string' || typeof elem === 'number') {
						newMeta[key] = elem;
					} else {
						newMeta[key] = JSON.stringify(elem, null, '\t');
					}
				} catch (e) {
					console.error('Error: ', e);
				}
			}
		}
		const date = new Date();
		Object.assign(newMeta, {
			datetime: date.getTime(),
			deploymentId: this.indexName,
			date: date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
			source: Error().stack.split('\n').filter((value, index) => index > 2).join('\n')
		});
		return newMeta;
	}

	/**
	 * Log Message with level `INFO`
	 * @param {string} message message
	 * @param {object} meta meta
	 */
	info(message, meta) {
		this.logger.info(message, LogHelper.formatMeta(meta));
	}

	/**
	 * Log Message with level `ERROR`
	 * @param {string} message message
	 * @param {object} meta meta
	 */
	error(message, meta) {
		this.logger.error(message, LogHelper.formatMeta(meta));
	}

	/**
	 * Log Message with level `WARN`
	 * @param {string} message message
	 * @param {object} meta meta
	 */
	warn(message, meta) {
		this.logger.warn(message, LogHelper.formatMeta(meta));
	}

	/**
	 * Log Message with level `DEBUG`
	 * @param {string} message message
	 * @param {object} meta meta
	 */
	debug(message, meta) {
		this.logger.debug(message, LogHelper.formatMeta(meta));
	}
}

module.exports = LogHelper;
