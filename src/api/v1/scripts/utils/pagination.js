const isValidSortField = (fieldName, fields) => {
    const isExistField = fields.some(
        (f) =>
            f.toLowerCase() == fieldName.toLowerCase() ||
            `-${f.toLowerCase()}` == fieldName.toLowerCase()
    );

    return isExistField;
};

module.exports = {
    isValidSortField,
};
