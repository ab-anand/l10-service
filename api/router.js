const express = require('express');
const router = express.Router();

const routerVersion1 = require('./v1/router.js');
const routerVersion2 = require('./v2/router.js');

const cors = require('cors');

router.use('/v1.[0-9]+.[0-9]+', (req, res, next ) => {
	let apiUrls = req.baseUrl.split('/');
	req.sharechatUrlVersion = apiUrls[2];
	next();
}, routerVersion1);

router.use('/v2.[0-9]+.[0-9]+', (req, res, next ) => {
	let apiUrls = req.baseUrl.split('/');
	req.sharechatUrlVersion = apiUrls[2];
	next();
}, routerVersion2);

const corsException = (req, cb) => {
	let corsOptions;
	const config = req.container.resolve('config');
	const whitelist = config.whitelistUrl;
	if (whitelist.includes(req.header('Origin'))) {
		corsOptions = { origin: true, maxAge: 600 };
	} else {
		corsOptions = { origin: false };
	}
	cb(null, corsOptions);
};

router.post('/requestType81', cors(corsException), (req, res, next) => {
	req.container.resolve('requestType81').handleRequest(req, res).catch(next);
});

module.exports = router;
