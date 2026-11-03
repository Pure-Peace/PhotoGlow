import { TokenType } from '@photoglow/shared/types/token'

export class BaseToken {
  constructor(
    private readonly token: string,
    private readonly expiresIn: number,
    private readonly userId: string
  ) {}

  getType(): TokenType {
    throw new Error('must be implemented')
  }

  getToken(): string {
    return this.token
  }

  getExpiresIn(): number {
    return this.expiresIn
  }

  getUserId(): string {
    return this.userId
  }

  toJSON(): { token: string; expiresIn: number } {
    return {
      token: this.token,
      expiresIn: this.expiresIn,
    }
  }
}

export class AccessToken extends BaseToken {
  getType(): TokenType {
    return TokenType.ACCESS
  }
}

export class RefreshToken extends BaseToken {
  getType(): TokenType {
    return TokenType.REFRESH
  }
}
