import * as authEndpoints from './endpoints/auth'
import * as chatEndpoints from './endpoints/chat'
import * as commentsEndpoints from './endpoints/comments'
import * as interactionsEndpoints from './endpoints/interactions'
import * as mediaEndpoints from './endpoints/media'
import * as mentionsEndpoints from './endpoints/mentions'
import * as moderationEndpoints from './endpoints/moderation'
import * as notificationsEndpoints from './endpoints/notifications'
import * as postsEndpoints from './endpoints/posts'
import * as searchEndpoints from './endpoints/search'
import * as settingsEndpoints from './endpoints/settings'
import * as socialEndpoints from './endpoints/social'
import * as topicsEndpoints from './endpoints/topics'
import * as userEndpoints from './endpoints/user'

export const api = {
  ...authEndpoints,
  ...chatEndpoints,
  ...commentsEndpoints,
  ...interactionsEndpoints,
  ...mediaEndpoints,
  ...mentionsEndpoints,
  ...moderationEndpoints,
  ...notificationsEndpoints,
  ...postsEndpoints,
  ...searchEndpoints,
  ...settingsEndpoints,
  ...socialEndpoints,
  ...topicsEndpoints,
  ...userEndpoints,
}

export {
  authEndpoints,
  chatEndpoints,
  commentsEndpoints,
  interactionsEndpoints,
  mediaEndpoints,
  mentionsEndpoints,
  moderationEndpoints,
  notificationsEndpoints,
  postsEndpoints,
  searchEndpoints,
  settingsEndpoints,
  socialEndpoints,
  topicsEndpoints,
  userEndpoints,
}
