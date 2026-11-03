import { describe, expect, test } from 'bun:test'

import { usernameRegex, displayNameRegex } from '@photoglow/shared/regex'

describe('Username Regex', () => {
  const validUsernames = [
    'user123',
    'john_doe',
    'test.user',
    'a1b2c3',
    'user_name_123',
  ]

  const invalidUsernames = [
    '', // empty
    'a', // too short
    'user__name', // consecutive special characters
    'user..name', // consecutive special characters
    'user@name', // invalid special character
    '_username', // starts with special character
    'username_', // ends with special character
    'verylongusernameexceeding20', // too long
    'user name', // contains space
    'user#name', // invalid special character
  ]

  validUsernames.forEach((username: string) => {
    test(`should accept valid username: ${username}`, () => {
      expect(usernameRegex.test(username)).toBe(true)
    })
  })

  invalidUsernames.forEach((username: string) => {
    test(`should reject invalid username: ${username}`, () => {
      expect(usernameRegex.test(username)).toBe(false)
    })
  })
})

describe('Display Name Regex', () => {
  const validDisplayNames = [
    'John Doe',
    'User123',
    'Test-User',
    '张三',
    'John张三',
    'User_Name',
    'User.Name',
    '用户名Test123',
  ]

  const invalidDisplayNames = [
    '', // empty
    '_john', // starts with special character
    'john_', // ends with special character
    '@user', // invalid special character
    'very long display name that exceeds the maximum length limit', // too long
    '#invalid', // invalid special character
    '!user', // invalid special character
  ]

  validDisplayNames.forEach((name: string) => {
    test(`should accept valid display name: ${name}`, () => {
      expect(displayNameRegex.test(name)).toBe(true)
    })
  })

  invalidDisplayNames.forEach((name: string) => {
    test(`should reject invalid display name: ${name}`, () => {
      expect(displayNameRegex.test(name)).toBe(false)
    })
  })
})
