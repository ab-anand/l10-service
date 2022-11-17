const SpannerHelper = require('@db-helper/spanner');
const spannerHelper = new SpannerHelper('follow-service');
const { Spanner } = require('@google-cloud/spanner');

const config = require('../config/config.js');
/*let spanner5DbConnection;
if (process.env.ACTIVE_ENV!=="TEST") {
    const sp = new Spanner({ projectId: config.gcpProjectId });
    if (process.env.ACTIVE_ENV === 'PRODUCTION') {
        spanner5DbConnection = sp.instance(config.spannerConfig.spanner5DB.instance).database(config.spannerConfig.spanner5DB.dbId);
    } else {
        spanner5DbConnection = sp.instance(config.spannerConfig.spannerStagingDB.instance).database(config.spannerConfig.spannerStagingDB.dbId);
    }
}*/


module.exports = { spannerHelper };
