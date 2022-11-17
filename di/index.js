const { createContainer, asValue, asClass, InjectionMode, Lifetime } = require('awilix');

/**
 *
 * @returns {Object} life time
 */
function getScope() {
	return { lifetime: Lifetime.SINGLETON };
}

const envConfig = require('../config/config');
const serverConfig = require('../config/server-config');
const middlewares = require('../driver');
const util = require('../util');

const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

container.register({

	//------------------ MIDDLEWARE --------------------
	// sqs
	queueDriver: asValue(middlewares.queueDriver),
	dbDriverV2: asValue(middlewares.dbDriverV2),
	// Database
	spannerHelper: asValue(middlewares.spanner.spannerHelper),
	// cache
	sharechatWebRedisClient: asValue(middlewares.redis.sharechatWebRedisClient),
	userPostSentRedisClient: asValue(middlewares.redis.userPostSentRedisClient),
	//--------------------------------------------------


	//------------------ CONFIG ------------------------
	config: asValue(envConfig),
	serverConfig: asValue(serverConfig),
	//--------------------------------------------------


	//------------------ UTILITY -----------------------
	constants: asValue(util.constants),
	hacks: asValue(util.hacks),
	logHelper: asClass(util.LogHelper, getScope()).inject(() => ({
		indexName: process.env.DEPLOYMENT_ID || util.constants.serviceName
	})),
	helper: asClass(util.Helper, getScope()),
	utility: asValue(util.utility),
	httpClient: asClass(util.HttpClient, getScope()).inject(() => ({ callerName: util.constants.serviceName })),
	//--------------------------------------------------
});

// -------------------- QUEUE -------------------------
container.register('followFeedQueue', asClass(require('../repository/queue/queueDriverRepo'), getScope()).inject(() => ({
	queueName: container.resolve('config').queueDriver.followFeedQueue
})));


//------------------ CACHE ----------------------
container.register('sharechatWebRedis', asClass(require('../repository/cache/sharechatWebRedisRepo'), getScope()).inject(() => ({
	redisClient: container.resolve('sharechatWebRedisClient')
})));
container.register('postSentRedis', asClass(require('../repository/cache/postSentRedis'), getScope()).inject(() => ({
	redisClient: container.resolve('userPostSentRedisClient')
})));
//-----------------------------------------------

// -------------------- REPO -------------------------
container.register('followFeedRepoV2', asClass(require('../repository/data/followFeedRepoV2'), getScope()));
container.register('labelsRepo', asClass(require('../repository/data/labelsRepo'), getScope()));
container.register('stringsRepo', asClass(require('../repository/data/stringsRepo'), getScope()));


//------------------ LOGIC ----------------------
container.register('fetchFollowFeedLogic', asClass(require('../logic/fetchFollowFeedLogic'), getScope()));
container.register('addToFollowFeedLogic', asClass(require('../logic/addToFollowFeedLogic'), getScope()));
container.register('showD0PostsLogic', asClass(require('../logic/show-d0-posts-logic'), getScope()));
container.register('fetchStringLogic', asClass(require('../logic/fetchStringLogic'), getScope()));
container.register('addStringLogic', asClass(require('../logic/addStringLogic'), getScope()));
container.register('updateStringLogic', asClass(require('../logic/updateStringLogic'), getScope()));
//-----------------------------------------------


//------------------ API -------------------------------
// Create API after everything

//labels APis
container.register('getLabelsApi', asClass(require('../api/v1/getLabel'), getScope()));
container.register('createLabelApi', asClass(require('../api/v1/createLabel'), getScope()));
container.register('deleteLabelApi', asClass(require('../api/v1/deleteLabel'), getScope()));

container.register('requestType81', asClass(require('../api/route/requestType81'), getScope()));

container.register('getFollowFeedApi', asClass(require('../api/v1/getFollowFeed'), getScope()));

container.register('getFollowFeedStatusApi', asClass(require('../api/v1/getFollowFeedStatus'), getScope()));

container.register('getLangList', asClass(require('../api/v1/getLangList'), getScope()));

container.register('getFollowFeedApiV2', asClass(require('../api/v2/getFollowFeed'), getScope()));

container.register('addPostsInFollowFeedApi', asClass(require('../api/v2/addPostsInFollowFeed'), getScope()));

container.register('addToFollowFeedAPI', asClass(require('../api/v2/addToFollowFeed'), getScope()));
container.register('getStringApi', asClass(require('../api/v1/getString'), getScope()));
container.register('addStringApi', asClass(require('../api/v1/addString'), getScope()));
container.register('deleteStringApi', asClass(require('../api/v1/deleteString'), getScope()));
container.register('updateStringApi', asClass(require('../api/v1/updateString'), getScope()));
//------------------------------------------------------

container.register('container', asValue(container));

module.exports = container;
