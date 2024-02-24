import { Response, Request, NextFunction } from 'express'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasService.handleUploadImage(req)
  return res.json({ result: data })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasService.handleUploadVideo(req)
  return res.json({ result: data })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) next(err)
  })
}

export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range

  if (!range) return res.status(HTTP_STATUS.BAD_REQUEST).send('Require range header')

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size
  const chunkSize = 10 ** 6 //1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1

  const contentType = path.extname(videoPath) === '.mp4' ? 'video/mp4' : 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Range': 'bytes',
    'Content-Length': contentLength,
    ContentType: contentType
  }

  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)

  const videoStreams = fs.createReadStream(videoPath, { start, end })
  videoStreams.pipe(res)
}
