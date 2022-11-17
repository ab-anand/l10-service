const express = require('express');
const router = express.Router();


//labels APIs
router.get('/labels', (req, res, next) => {
	req.container.resolve('getLabelsApi').handleRequest(req, res).catch(next);
});

router.post('/label', (req, res, next) => {
	req.container.resolve('createLabelApi').handleRequest(req, res).catch(next);
});

router.delete('/label/:labelId', (req, res, next) => {
	req.container.resolve('deleteLabelApi').handleRequest(req, res).catch(next);
});

router.get('/followFeed', (req, res, next) => {
	req.container.resolve('getFollowFeedApi').handleRequest(req, res).catch(next);
});

router.get('/follow-feed/status', (req, res, next) => {
	req.container.resolve('getFollowFeedStatusApi').handleRequest(req, res).catch(next);
});

router.get('/lang-list', (req, res, next) => {
	req.container.resolve('getLangListApi').handleRequest(req, res).catch(next);
});

router.get('/get-string', (req, res, next) => {
	req.container.resolve('getStringApi').handleRequest(req, res).catch(next);
});

router.post('/add-string', (req, res, next) => {
	req.container.resolve('addStringApi').handleRequest(req, res).catch(next);
});

router.delete('/string/:key', (req, res, next) => {
	req.container.resolve('deleteStringApi').handleRequest(req, res).catch(next);
});

router.put('/string', (req, res, next) => {
	req.container.resolve('updateStringApi').handleRequest(req, res).catch(next);
});

router.get('/', (req, res) => {
	res.send('Hello from Follow Feed Service');
});

module.exports = router;
