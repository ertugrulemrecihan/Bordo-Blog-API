const httpStatus = require("http-status");
const ApiError = require("../responses/error/apiError");

const authorization = (...roles) => (req, res, next) => {
    const userRole = req.user.roles.map((role) => role.name.toLowerCase());
    const isAdmin = userRole.some((role) => role.toLowerCase() === 'admin');

    if (isAdmin) {
        return next();
    }

    const acceptedRoles = roles.map((role) => role.toLowerCase());

    const isAuthorized = userRole.some((role) =>
        acceptedRoles.includes(role)
    );

    if (isAuthorized) {
        return next();
    } else {
        return next(new ApiError("Not Authorized", httpStatus.FORBIDDEN));
    }
};

module.exports = authorization;
