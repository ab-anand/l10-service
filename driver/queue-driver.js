const queueDriver = require('queue-driver');
const consumer = queueDriver.consume('follow-feed-service');

module.exports = {
	consumer: consumer
};
