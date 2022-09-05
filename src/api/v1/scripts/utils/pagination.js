const httpStatus = require('http-status');

const isValidSortField = (fieldName, fields) => {
    const isExistField = fields.some(
        (f) =>
            f.toLowerCase() == fieldName.toLowerCase() ||
            `-${f.toLowerCase()}` == fieldName.toLowerCase()
    );

    return isExistField;
};

const getPaginationInfo = (totalItemCount, pageSize, pageNumber) => {
    let error = null;

    let totalPageCount = 0;

    if (totalItemCount % pageSize > 0) {
        totalPageCount = parseInt(totalItemCount / pageSize) + 1;
    } else {
        totalPageCount = parseInt(totalItemCount / pageSize);
    }

    if (pageNumber > totalPageCount && totalItemCount > 0) {
        error = {
            // eslint-disable-next-line max-len
            message: `Page number cannot be greater than the total number of pages(${pageNumber}/${totalPageCount}).`,
            code: httpStatus.BAD_REQUEST,
        };
    }

    return {
        data: {
            pageSize,
            totalItemCount,
            pageNumber,
            totalPageCount,
        },
        error: error,
    };
};

module.exports = {
    isValidSortField,
    getPaginationInfo,
};
