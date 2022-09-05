module.exports.user = require('./user.routes');
module.exports.post = require('./post.routes');
module.exports.address = require('./address.routes');
module.exports.tag = require('./tag.routes');
module.exports.plan = require('./plan.routes');

// Admin Routes
module.exports.adminTag = require('./admin/tag.routes');
module.exports.adminPost = require('./admin/post.routes');
module.exports.adminUser = require('./admin/user.routes');
module.exports.adminPlan = require('./admin/plan.routes');
