const express = require('express');
const router = express.Router();

router.get('/followFeed', (req, res, next) => {
	req.container.resolve('getFollowFeedApi').handleRequest(req, res).catch(next);
});

router.get('/follow-feed/status', (req, res, next) => {
	req.container.resolve('getFollowFeedStatusApi').handleRequest(req, res).catch(next);
});

router.get('/lang-list', (req, res, next) => {
	req.container.resolve('getLangList').handleRequest(req, res).catch(next);
});

router.get('/', (req, res) => {
	res.send('Hello from Follow Feed Service');
});

module.exports = router;
