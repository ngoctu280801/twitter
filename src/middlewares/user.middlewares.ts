import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import { validate } from '~/utils/validation'
import { dobSchema, nameSchema } from './auth.middlewares'

const imageSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_PATH_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 255
    },
    errorMessage: USER_MESSAGES.IMAGE_PATH_LENGTH
  }
}

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decodeAuthorization as TokenPayload

  if (verify !== UserVerifyStatus.Verified) {
    // next for error handler if async func, otherwise throw new error
    return next(new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN }))
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        ...nameSchema
      },
      date_of_birth: {
        optional: true,
        ...dobSchema
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.BIO_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: USER_MESSAGES.BIO_LENGTH
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.LOCATION_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: USER_MESSAGES.LOCATION_LENGTH
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: USER_MESSAGES.WEBSITE_LENGTH
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USER_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USER_MESSAGES.USERNAME_LENGTH
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)
