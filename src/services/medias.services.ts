import { Request } from 'express'
import { getFileName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Other'

class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getFileName(file.newFilename) + '.jpeg'
        const filename = (UPLOAD_IMAGE_DIR + '/' + newName) as string

        await sharp(file.filepath).jpeg({ quality: 50 }).toFile(filename)
        fs.unlink(file.filepath, (err) => {
          if (err) {
            console.error('Error deleting file:', err)
          }
        })

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const { newFilename } = files[0]

    return {
      url: isProduction
        ? `${process.env.HOST}/static/video/${newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
      type: MediaType.Video
    }
  }
}

const mediasService = new MediasServices()
export default mediasService
