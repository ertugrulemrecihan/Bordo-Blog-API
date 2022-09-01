const ApiError = require('../responses/error/apiError');
const httpStatus = require('http-status');
const moment = require('moment');

const queryOptions = (req, res, next) => {
    const sortField = req.query.sortField;
    const sortOrder = req.query.sortOrder || 1;

    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);

    // ? Tek satıra düşürülebilir
    if (limit && !page) {
        page = 1;
    }

    // ? Tek satıra düşürülebilir
    if (page && !limit) {
        limit = 10;
    }

    const blackList = ['limit', 'page', 'sortField', 'sortOrder'];

    let mongoQuery = {};
    const keys = Object.keys(req.query);

    for (const key of keys) {
        const queryValue = req.query[key];
        const splitedKey = key.split('.');

        if (splitedKey.length !== 2) {
            if (blackList.includes(key)) {
                continue;
            }
            splitedKey[1] = 'eq';
        }

        if (['gt', 'lt', 'lte', 'gte'].includes(splitedKey[1])) {
            const regex = new RegExp(
                /^([1-2]\d{3})\-([0]\d|[1][0-2])\-([0-2]\d|[3][0-1])(?:(?:T([0-1]\d|[2][0-3])\:([0-5]\d)(?::([0-5]\d)))?)$/
            );

            const isValidDateFormat = regex.test(queryValue);

            let newValue;

            if (isValidDateFormat) {
                const queryDate = new Date(queryValue);

                if (queryDate == 'Invalid Date') {
                    return next(
                        new ApiError(
                            'Invalid date format',
                            httpStatus.BAD_REQUEST
                        )
                    );
                }

                newValue = queryDate;
            } else {
                const intValue = parseInt(queryValue);
                if (!intValue) {
                    return next(
                        new ApiError(
                            'Invalid integer format',
                            httpStatus.BAD_REQUEST
                        )
                    );
                }

                newValue = intValue;
            }

            const queryObject = { [`$${splitedKey[1]}`]: newValue };
            mongoQuery[splitedKey[0]] = queryObject;
        } else if (['eqd'].includes(splitedKey[1])) {
            const dateEnum = {
                4: 'year',
                7: 'month',
                10: 'day',
                13: 'hour',
                16: 'minute',
                19: 'second',
            };

            const gtValue = moment(queryValue).format('YYYY-MM-DDTHH:mm:ss');

            const queryDate = new Date(gtValue);

            if (!dateEnum[queryValue.length] || queryDate == 'Invalid Date') {
                return next(
                    new ApiError('Invalid date format', httpStatus.BAD_REQUEST)
                );
            }

            const gtObject = {
                $gt: gtValue + '.000Z',
            };
            const ltObject = {
                $lt:
                    moment(queryValue)
                        .add(1, dateEnum[queryValue.length])
                        .format('YYYY-MM-DDTHH:mm:ss') + '.000Z',
            };
            mongoQuery[splitedKey[0]] = { ...gtObject, ...ltObject };
        } else if (['eq'].includes(splitedKey[1])) {
            mongoQuery[splitedKey[0]] = queryValue;
        } else if (['is'].includes(splitedKey[1])) {
            mongoQuery[splitedKey[0]] = queryValue ? true : false;
        } else if (['in'].includes(splitedKey[1])) {
            const values = queryValue.split(',');

            if (values.length > 0) {
                mongoQuery[splitedKey[0]] = { $in: values };
            }
        }
    }

    if (limit > 100) {
        limit = 100;
    } else if (limit < 1) {
        limit = 1;
    }

    if (page < 1) {
        page = 1;
    }

    const skip = page && limit ? (page - 1) * limit : null;

    req.queryOptions = {
        pagination: { limit, page, skip },
    };

    if ((sortOrder == -1 || sortOrder == 1) && sortField) {
        req.queryOptions.sorting = {
            sortQuery: { [sortField]: parseInt(sortOrder) },
        };
    }

    req.queryOptions.filtering = mongoQuery;

    next();
};

module.exports = queryOptions;
