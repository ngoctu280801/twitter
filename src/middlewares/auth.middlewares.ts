import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import userService from '~/services/users.services'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email = '', password = '' } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      errorMessage: 'Invalid  schema name provided in request body',
      notEmpty: true,
      isLength: {
        options: {
          min: 6,
          max: 100
        }
      }
    },
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const isExist = await userService.getUserByEmail(value)
          if (!isExist) {
            throw new Error('Existed email')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          max: 16
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1,
          minUppercase: 1
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      }
    }
  })
)
