const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    region: 'auto',
    signatureVersion: 'v4',
});

const fs = require('fs');

s3.putObject({
    Bucket: process.env.R2_BUCKET,
    Key: 'test.txt',
    Body: fs.readFileSync('./test.txt'),
    ACL: 'public-read', // если нужен публичный доступ
}, (err, data) => {
    if (err) console.error(err);
    else console.log('File uploaded!', data);
});

