const express = require('express');
const router = express.Router();

//--------- PUBLIC API -------------
router.get('/public/followFeed', (req, res, next) => {
	req.container.resolve('getFollowFeedApiV2').handleRequest(req, res).catch(next);
});

// ----------- PRIVATE API --------------
router.post('/addOnFollow', (req, res, next) => {
	req.container.resolve('addPostsInFollowFeedApi').handleRequest(req, res).catch(next);
});

router.post('/:userId/feed', (req, res, next) => {
	req.container.resolve('addToFollowFeedAPI').handleRequest(req, res).catch(next);
});

module.exports = router;
