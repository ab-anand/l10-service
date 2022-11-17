// require('newrelic');
process.on('uncaughtException', (err) => {
	console.error('Unhandled Exception', err);
});
process.on('uncaughtRejection', (err) => {
	console.error('Unhandled Rejection', err);
});
const container = require('./di');
const server = require('./server');

server(container).then((app) => {
	const { port, keepAliveTimeout } = container.resolve('serverConfig');
	if (!port) {
		console.log('Port not found, Please check server-config.js');
		return;
	}
	const finalApp = app.listen(port, () => {
		finalApp.keepAliveTimeout = keepAliveTimeout;
		finalApp.on('close', () => {
			// Do something like close db connection
		});
		console.log(`Server started successfully, running on port: ${container.cradle.serverConfig.port}.`);
	});
});
