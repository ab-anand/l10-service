module.exports = {
	activeEnv: 'STAGING',
	EXPERIMENT_IDS: {
		followfeedpopulationV2: 'aeed129f-f9d2-427a-9a97-0cc943f803e8'
	},
	redis: {
		sharechatWebRedis: {
			host: 'redis-10641.internal.c6804.asia-south1-1.gcp.cloud.rlrcp.com',
			port: 10641,
			password: 'E7ItWVuwQCWbXdZWBwVCMeXdTNm6Hj9e',
			db: 0
		},
		userPostSentRedis: {
			host: 'redis-10641.internal.c6804.asia-south1-1.gcp.cloud.rlrcp.com',
			port: 10641,
			password: 'E7ItWVuwQCWbXdZWBwVCMeXdTNm6Hj9e',
			db: 0
		},
	},
	queueDriver: {
		followFeedQueue: 'new-follow-feed-queue'
	},
	postRenderingService: {
		endpoint: 'http://post-rendering-service.staging.sharechat.internal/post-rendering-service'
	},
	followService: {
		endpoint: 'http://follow-service.staging.sharechat.internal/follow-service'
	},
	userService: {
		endpoint: 'http://user-service.staging.sharechat.internal/user-service'
	},
	feedRelevanceService: {
		endpoint: 'http://feed-relevance-service.staging.sharechat.internal'
	},
	topPostService: {
		endpoint: 'http://top-post-service.staging.sharechat.internal'
	},
	dbDriverV2: {
		useSharedLibrary: true,
		serviceName: 'follow-feed-service',
		projectName: 'SHARECHAT',
		environment: 'STAGING',
	},
	MAX_FETCH_LIMIT: 10000,
	whitelistUrl: [
		'https://sharechat.com',
		'http://sharechat.com',
		'https://staging.sharechat.com',
		'http://staging.sharechat.com',
		'http://localhost:8085',
		'http://www.sharechat.com',
		'https://www.sharechat.com',
		'https://dashboard.sharechat.com',
		'https://temp-master.sharechat.com',
		'https://booth.sharechat.com',
		'http://tv-feed.sharechat.com',
		'https://master.sharechat.com',
		'http://localhost:8080',
		'http://polls.sharechat.com',
		'https://polls.sharechat.com',
		'https://dev.sharechat.com'
	]
};
