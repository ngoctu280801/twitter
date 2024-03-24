import { checkSchema } from 'express-validator'
import { MediaTypeQuery } from '~/constants/enum'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: true
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        }
      },
      follow_people: {
        optional: true,
        isIn: {
          options: ['true', 'false'],
          errorMessage: 'Must be boolean'
        }
      }
    },
    ['query']
  )
)
