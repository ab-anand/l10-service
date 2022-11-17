const redis = require('./redis');
const queueDriver = require('./queue-driver');
const spanner = require('./spanner');

module.exports = {
	redis: redis,
	queueDriver: queueDriver,
	spanner: spanner,
};
