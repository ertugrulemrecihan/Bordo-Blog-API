const httpStatus = require('http-status');
const ApiError = require('../scripts/responses/error/apiError');

const authorization = (...roles) => (req, res, next) => {
    const userRoles = req.user.roles.map((role) => role.name.toLowerCase());

    const isSuperAdmin = userRoles.some(
        (role) => role.toLowerCase() === 'superadmin'
    );

    if (isSuperAdmin) {
        return next();
    }

    const acceptedRoles = roles.map((role) => role.toLowerCase());

    const isAuthorized = userRoles.some((role) =>
        acceptedRoles.includes(role)
    );

    if (isAuthorized) {
        return next();
    } else {
        return next(new ApiError('Not Authorized', httpStatus.FORBIDDEN));
    }
};

module.exports = authorization;
