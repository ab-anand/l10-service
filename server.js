const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./api/router');
const promScripts = require('prom-scripts');

const server = (container) => {
	// Start Express app server
	return new Promise((resolve, reject) => {
		const app = express();

		app.use(morgan('dev'));
		app.use(cors());
		app.use(helmet());
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json({
			limit: '10mb',
			strict: false
		}));
		app.use(promScripts.promMid({ customLabels: { group: 'l10-service' } }));

		app.use((req, res, next) => {
			req.container = container.createScope();
			next();
		});


		app.get('/health', (req, res) => {
			return res.send('Hello World from l10 Service');
		});

		// Deprecated routes
		app.use('/', router);

		// API routes
		app.use('/l10-service', router);


		// Log Unhandled exceptions
		app.use((err, req, res, next) => {
			container.resolve('logHelper').error('Unhandled Exception', { error: err, req: req });
			return res.status(500).send('Something went wrong!');
		});

		return resolve(app);
	});
};

module.exports = server;
