import { Request } from 'express'
import { getFileName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'
import { uploadFileToS3 } from '~/utils/s3'

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getFileName(file.newFilename) + '.jpeg'
        const filepath = (UPLOAD_IMAGE_DIR + '/' + newName) as string

        await sharp(file.filepath).jpeg({ quality: 50 }).toFile(filepath)

        const result = await uploadFileToS3({
          filename: newName,
          filepath: filepath,
          contentType: file.mimetype as string
        })

        await Promise.all([
          fs.unlink(file.filepath, (err) => {
            if (err) {
              console.error('Error deleting file:', err)
            }
          }),
          fs.unlink(filepath, (err) => {
            if (err) {
              console.error('Error deleting file:', err)
            }
          })
        ])

        return {
          url: result.Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename, mimetype } = files[0]
    const filepath = (UPLOAD_VIDEO_DIR + '/' + newFilename) as string

    const result = await uploadFileToS3({
      filename: newFilename,
      filepath: filepath,
      contentType: mimetype as string
    })
    fs.unlink(filepath, (err) => {
      if (err) {
        console.error('Error deleting file:', err)
      }
    })

    return {
      url: result.Location as string,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasServices()
export default mediasService
