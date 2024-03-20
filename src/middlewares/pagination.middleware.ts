import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value || 10)
            if (num > 100 && num < 1) {
              throw new Error('Maximum limit 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value || 0)
            if (num < 0) {
              throw new Error('miN page is 0')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
