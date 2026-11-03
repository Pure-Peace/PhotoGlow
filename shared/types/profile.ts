import type { User } from './user'

export interface ProfileData {
  user: User
  stats: {
    followers: number
    following: number
    posts: number
  }
}
