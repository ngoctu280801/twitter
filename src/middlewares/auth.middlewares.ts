import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (!user) {
              throw new Error(USER_MESSAGES.LOGIN_ERROR)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 16
          },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 100
          },
          errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_6_TO_100
        }
      },
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExist = await databaseService.users.findOne({ email: value })
            if (isExist) {
              throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTENT_ERROR)
            }
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            max: 16
          },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH
        },
        isStrongPassword: {
          options: {
            minLength: 6,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      },
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USER_MESSAGES.DOB_MUST_BE_ISO_STRING
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              const accessToken = (value || '').split(' ')[1]
              if (!accessToken) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const decode = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              req.decodeAuthorization = decode
            } catch (error) {
              throw new ErrorWithStatus({ message: USER_MESSAGES.UNAUTHORIZED, status: HTTP_STATUS.UNAUTHORIZED })
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              const [decodeRefreshToken, refreshToken] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshToken.findOne({ token: value })
              ])

              if (!decodeRefreshToken) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_NOT_VALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.REFRESH_TOKEN_NOT_VALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              req.decodeRefreshToken = decodeRefreshToken
            } catch (error) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_NOT_VALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value)
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })

            const decodeEmailVerifyToken = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
            })

            req.decodeEmailVerifyToken = decodeEmailVerifyToken

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USER_MESSAGES.EMAIL_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            })
            if (!user) {
              throw new Error(USER_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
