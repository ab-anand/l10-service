module.exports = {
	activeEnv: 'PRODUCTION',
	EXPERIMENT_IDS: {
		followfeedpopulationV2: '89fc4e54-571c-43ba-b748-4cb01e06fb97'
	},
	redis: {
		sharechatWebRedis: {
			port: 17761,
			host: 'redis-17761.internal.c6806.asia-south1-mz.gcp.cloud.rlrcp.com',
			password: 'AdgtC69vmudGLBog8L58rDgEiIUBbbPM',
			db: 0
		},
		userPostSentRedis: {
			host: 'redis-16900.internal.c17155.asia-south1-mz.gcp.cloud.rlrcp.com',
			port: 16900,
			password: 'zSZ71fOe7BR0U9jC0hah74Ht7Yi07tOI'
		},
	},
	queueDriver: {
		followFeedQueue: 'new-follow-feed-queue'
	},
	postRenderingService: {
		endpoint: 'http://post-rendering-service.sharechat.internal/post-rendering-service'
	},
	followService: {
		endpoint: 'http://follow-service.sharechat.internal/follow-service'
	},
	userService: {
		endpoint: 'http://user-service.sharechat.internal/user-service'
	},
	feedRelevanceService: {
		endpoint: 'http://feed-relevance-service.sharechat.internal'
	},
	topPostService: {
		endpoint: 'http://top-post-service.sharechat.internal'
	},
	dbDriverV2: {
		useSharedLibrary: true,
		serviceName: 'follow-feed-service',
		projectName: 'SHARECHAT',
		environment: 'PRODUCTION',
		Username: process.env.SCYLLADB_USERNAME,
		Password: process.env.SCYLLADB_PASSWORD
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
