const axiosDefault = require('axios');
const { Agent } = require('http');
const { constants: httpConstants } = require('http2');
const qs = require('qs');

class Http {

	/**
	 * Creates an instance of Http.
	 * @param {String} callerName callerName
	 */
	constructor(callerName) {
		this.callerName = callerName;
		this.axios = axiosDefault.create({
			timeout: 10000,
			paramsSerializer: qs.stringify,
			httpAgent: new Agent({
				keepAlive: true,
				keepAliveMsecs: 3000
			}),
			validateStatus: (status) => status === httpConstants.HTTP_STATUS_OK,
			headers: { 'X-SHARECHAT-CALLER': this.callerName }
		});
	}

	/**
	 *  Make request
	 * @param {object} requestOptions requestOptions
	 * @param {string} requestOptions.url url to hit
	 * @param {'POST'|'GET'|'PUT'|'DELETE'} requestOptions.method method to call request with
	 * @param {object} [requestOptions.headers] headers
	 * @param {object} [requestOptions.queryParams] query params
	 * @param {object} [requestOptions.body] body
	 * @returns {Promise<object>}
	 */
	async request({ url, method, headers, queryParams, body, agent, timeout } = {}) {
		const response = await this.axios({
			method: method || 'GET',
			url: url,
			headers: headers,
			params: queryParams,
			data: body,
			httpAgent: agent,
			timeout: timeout
		}).then(res => {
			return {
				host: (res.request || {}).host,
				statusCode: res.status,
				responseBody: res.data,
				responseHeaders: res.headers
			};
		}).catch(err => {
			const errorObj = typeof err.toJSON === 'function' ? err.toJSON() : err;
			if (errorObj && errorObj.config) {
				delete errorObj.config.httpAgent;
			}
			return Promise.reject(errorObj);
		});
		return response;
	}
}

module.exports = Http;
