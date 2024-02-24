import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_VIDEO_DIR, UPLOAD__IMAGE_TEMP_DIR, UPLOAD__VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD__IMAGE_TEMP_DIR))
    fs.mkdirSync(UPLOAD__IMAGE_TEMP_DIR, {
      recursive: true
    })

  if (!fs.existsSync(UPLOAD__VIDEO_TEMP_DIR))
    fs.mkdirSync(UPLOAD__VIDEO_TEMP_DIR, {
      recursive: true
    })
}

export const handleUploadImage = async (req: Request) => {
  // common to es module
  const formidable = (await import('formidable')).default

  const form = formidable({
    uploadDir: UPLOAD__IMAGE_TEMP_DIR,
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 40 * 1024 * 1024, // 40MB
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files?.image) return reject(new Error('File is empty'))

      resolve(files.image as unknown as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  // common to es module
  const formidable = (await import('formidable')).default

  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 40 * 1024 * 1024, // 40MB
    filter: function ({ name, originalFilename, mimetype }) {
      // const valid = name === 'image' && Boolean(mimetype?.includes('image/'))

      // if (!valid) {
      //   form.emit('error' as any, new Error('File type is not valid') as any)
      // }

      // return valid
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      if (!files?.video) return reject(new Error('File is empty'))

      const videos = files.video as File[]
      videos.forEach((video) => {
        const extension = '.' + getFileNameExtension(video.originalFilename as string)

        fs.renameSync(video.filepath, video.filepath + extension)

        video.newFilename += extension
      })

      resolve(files.video as unknown as File[])
    })
  })
}

export const getFileName = (fileName: string) => {
  const extensionIndex = fileName.lastIndexOf('.')
  const extension = fileName.substring(0, extensionIndex)

  return extension
}

export const getFileNameExtension = (fileName: string) => {
  const extensionIndex = fileName.lastIndexOf('.')
  const extension = fileName.slice(extensionIndex).substring(1)

  return extension
}
