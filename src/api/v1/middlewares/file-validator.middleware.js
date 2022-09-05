/* eslint-disable max-len */
const httpStatus = require('http-status');
const ApiError = require('../scripts/responses/error/apiError');

const fileValidator = (rules) => (req, res, next) => {
    const uploadedFiles = req.files;
    const isLeastOneRequired = rules.some((rule) => rule?.required);

    if (!isLeastOneRequired) {
        return next();
    }

    if (isLeastOneRequired && !uploadedFiles) {
        const message = rules.map((d) => d.field).join(', ');
        return next(
            new ApiError(`${message} is required`, httpStatus.BAD_REQUEST)
        );
    }

    for (const rule of rules) {
        const fieldName = rule.field;
        const acceptedMimetype = rule.mimetypes;
        const maxFile = rule.max;

        const files = uploadedFiles[fieldName];

        if (!files) {
            return next(
                new ApiError(`${fieldName} is required`, httpStatus.BAD_REQUEST)
            );
        }

        if (Array.isArray(files)) {
            if (files.length > maxFile) {
                return next(
                    new ApiError(
                        `Maximum of ${maxFile} files`,
                        httpStatus.BAD_REQUEST
                    )
                );
            }
            for (const file of files) {
                if (!acceptedMimetype.includes(file.mimetype)) {
                    return next(
                        new ApiError(
                            'Please do not go beyond the preferred file formats. (.jpg, .png)',
                            httpStatus.BAD_REQUEST
                        )
                    );
                }

                if (file.size > 2097152) {
                    return next(
                        new ApiError(
                            'File size cannot be larger than 2 MB',
                            httpStatus.BAD_REQUEST
                        )
                    );
                }
            }
        } else {
            if (!acceptedMimetype.includes(files.mimetype)) {
                return next(
                    new ApiError(
                        'Please do not go beyond the preferred file formats. (.jpg, .png)',
                        httpStatus.BAD_REQUEST
                    )
                );
            }

            if (files.size > 2097152) {
                return next(
                    new ApiError(
                        'File size cannot be larger than 2 MB',
                        httpStatus.BAD_REQUEST
                    )
                );
            }
        }
    }

    next();
};

module.exports = fileValidator;
