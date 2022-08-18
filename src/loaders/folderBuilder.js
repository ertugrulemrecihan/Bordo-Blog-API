const fs = require('fs');
const path = require('path');

const folderBuilder = () => {
    const uploadsPath = path.join(__dirname, '../../', 'public', 'uploads');

    const postPath = path.join(uploadsPath, 'post');
    createPathIfNotExists(postPath);

    const coverImagePath = path.join(postPath, 'cover_image');
    createPathIfNotExists(coverImagePath);
};

const createPathIfNotExists = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
};

module.exports = folderBuilder;
