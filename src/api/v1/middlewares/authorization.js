const httpStatus = require("http-status");
const ApiError = require("../responses/error/apiError");

const authorization =
    (...roles) =>
        (req, res, next) => {
            console.log('req.user.roles', req.user.roles)
            const userRole = req.user.roles.map((role) => role.name.toLowerCase());
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
