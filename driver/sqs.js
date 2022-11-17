const AWS = require('aws-sdk');
const https = require('https');
AWS.config.update({
	httpOptions: {
		agent: new https.Agent({ maxSockets: Infinity, keepAlive: true })
	}
});
const config = require('../config/config.js');

const connection = new AWS.SQS({ region: config.sqs.region });

module.exports = connection;
