import { env } from '~/config/environment'
// domain được truy cập tới tài nguyên của server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  // domain khác sau khi deploys
  'https://trello-web-blush-nine.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev' ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION)

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12
