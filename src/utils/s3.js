import AWS from 'aws-sdk'
import dotenv from 'dotenv'
dotenv.config()

const s3 = new AWS.S3({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    endpoint: process.env.R2_ENDPOINT,
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
})

export async function uploadPhotoToR2(buffer, fileName, mimeType) {
    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
    }

    const result = await s3.upload(params).promise()

    return {
        key: result.Key,
        location: result.Location,
        url: process.env.R2_PUBLIC_ENDPOINT + result.Key,
    }
}