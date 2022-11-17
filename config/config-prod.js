module.exports = {
	activeEnv: 'PRODUCTION',
	redis: {
		sharechatWebRedis: {
			endPoint:  'sharechatweb.8dojdt.0001.aps1.cache.amazonaws.com',
			port: 6379
		}
	},
	queueDriver: {
		followFeedQueue: 'new-follow-feed-queue'
	},
	postRenderingService: {
		endpoint: 'http://post-rendering-service.sharechat.com/post-rendering-service'
	},
	followService: {
		endpoint: 'http://follow-service.sharechat.com/follow-service'
	},
	userService: {
		endpoint: 'http://user-service.sharechat.com/user-service'
	},
	MAX_FETCH_LIMIT: 10000,
	whitelistUrl: [
		'https://sharechat.com',
		'http://sharechat.com',
		'https://staging.sharechat.com',
		'http://staging.sharechat.com',
		'http://www.sharechat.com',
		'https://www.sharechat.com',
		'https://dashboard.sharechat.com',
		'https://temp-master.sharechat.com',
		'https://booth.sharechat.com',
		'http://tv-feed.sharechat.com',
		'https://master.sharechat.com',
		'http://polls.sharechat.com',
		'https://polls.sharechat.com',
		'https://dev.sharechat.com'
	]
};
