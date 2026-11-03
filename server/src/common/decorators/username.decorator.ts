import {
  registerDecorator,
  type ValidationOptions,
  type ValidationArguments,
} from 'class-validator'

import { usernameRegex, displayNameRegex } from '@photoglow/shared/regex'

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && usernameRegex.test(value)
        },
        defaultMessage(args: ValidationArguments) {
          return 'Username must be 2-20 characters long, start and end with a letter or number, and can contain dots and underscores (but not consecutively)'
        },
      },
    })
  }
}

export function IsValidDisplayName(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDisplayName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && displayNameRegex.test(value)
        },
        defaultMessage(args: ValidationArguments) {
          return 'Display name must be 2-30 characters long, can contain letters, numbers, Chinese characters, spaces, dots, underscores and hyphens'
        },
      },
    })
  }
}
