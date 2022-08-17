module.exports.user = require('./userRoutes');
module.exports.post = require('./postRoutes');
module.exports.address = require('./addressRoutes');
module.exports.tag = require('./tagRoutes');
module.exports.plan = require('./planRoutes');

// Admin Routes
module.exports.adminTag = require('./admin/tagRoutes');
module.exports.adminRole = require('./admin/roleRoutes');
module.exports.adminPost = require('./admin/postRoutes');
module.exports.adminAddress = require('./admin/addressRoutes');
module.exports.adminUser = require('./admin/userRoutes');
module.exports.adminPlan = require('./admin/planRoutes');
