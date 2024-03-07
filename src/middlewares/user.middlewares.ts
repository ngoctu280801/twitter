import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { UserVerifyStatus } from '~/constants/enum'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import { validate } from '~/utils/validation'
import { dobSchema, nameSchema, passwordSchema } from './auth.middlewares'
import { REGEX_USERNAME } from '~/constants/regex'
import databaseService from '~/services/database.services'
import { ObjectId } from 'mongodb'
import { hashPassword } from '~/utils/crypto'

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
        custom: {
          options: async (value: string, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new ErrorWithStatus({ message: USER_MESSAGES.USERNAME_INVALID, status: HTTP_STATUS.BAD_REQUEST })
            }

            const user = await databaseService.users.findOne({ username: value })
            if (user) {
              throw new ErrorWithStatus({ message: USER_MESSAGES.USERNAME_EXISTED, status: HTTP_STATUS.BAD_REQUEST })
            }
          }
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decodeAuthorization
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

            if (!user)
              throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED })

            const isMatch = user.password === hashPassword(value)
            if (!isMatch)
              throw new ErrorWithStatus({ message: USER_MESSAGES.WRONG_PASSWORD, status: HTTP_STATUS.BAD_REQUEST })
          }
        }
      },
      new_password: passwordSchema
    },
    ['body']
  )
)

export const followUserValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            const { user_id } = req.decodeAuthorization

            if (!user)
              throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED })

            // check followed before
            const res = await databaseService.followers.findOne({
              user_id: new ObjectId(user_id),
              followed_user_id: new ObjectId(value)
            })
            if (res) throw new ErrorWithStatus({ message: USER_MESSAGES.FOLLOWED, status: HTTP_STATUS.BAD_REQUEST })
          }
        }
      }
    },
    ['body']
  )
)

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      middleware(req, res, next)
    }
    next()
  }
}
