const SpannerHelper = require('@db-helper/spanner');
const spannerHelper = new SpannerHelper('follow-service');

module.exports = { spannerHelper: spannerHelper };
