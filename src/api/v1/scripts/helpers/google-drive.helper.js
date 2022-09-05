const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const drive = require('../google-apis/google-drive');
const stream = require('stream');

const uploadFile = async (file, folder) => {
    const extension = mime.extension(file.mimetype);
    const newFileName = `${uuidv4()}.${extension}`;

    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.data);

    return new Promise(function (resolve, reject) {
        drive.files
            .create({
                requestBody: {
                    parents: [folder],
                    name: newFileName,
                    mimeType: file.mimetype,
                },
                media: {
                    mimeType: file.mimetype,
                    body: bufferStream,
                },
            })
            .then(async (res) => {
                const fileId = res.data.id;

                await drive.permissions.create({
                    fileId: fileId,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });

                const fileResponse = await drive.files.get({
                    fileId: fileId,
                    fields: 'webViewLink, webContentLink',
                });

                const imageUrl =
                    fileResponse.data.webContentLink.split(
                        '&export=download'
                    )[0];

                const resolveObject = {
                    ...res.data,
                    imageUrl,
                };

                resolve(resolveObject);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const deleteFile = (fileId) => {
    return drive.files.delete({
        fileId: fileId,
    });
};

module.exports = {
    uploadFile,
    deleteFile,
};
