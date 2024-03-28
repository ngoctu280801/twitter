import { S3 } from '@aws-sdk/client-s3'
import { config } from 'dotenv'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'

config()

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const file = fs.readFileSync(path.resolve('uploads/images/c513f0deb13d90c41869b7200.jpeg'))

const parallelUploads3 = new Upload({
  client: new S3({}),
  params: { Bucket: 'nt-twitter-clone-ap-southeast-1', Key: 'image2.jpeg', Body: file, ContentType: 'image/jpeg' },

  tags: [
    /*...*/
  ], // optional tags
  queueSize: 4, // optional concurrency configuration
  partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
  leavePartsOnError: false // optional manually handle dropped parts
})

parallelUploads3.on('httpUploadProgress', (progress) => {
  console.log(progress)
})

parallelUploads3.done().then((res) => console.log(res))
