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

//translations APIs
router.get('/translations/:key', (req, res, next) => {
	req.container.resolve('getTranslationsApi').handleRequest(req, res).catch(next);
});

router.post('/translation', (req, res, next) => {
	req.container.resolve('createTranslationApi').handleRequest(req, res).catch(next);
});

router.put('/translation', (req, res, next) => {
	req.container.resolve('updateTranslationApi').handleRequest(req, res).catch(next);
});

router.delete('/translations/:key/:locale', (req, res, next) => {
	req.container.resolve('deleteTranslationApi').handleRequest(req, res).catch(next);
});

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
