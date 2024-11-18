import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ đẫm nhiệm việc quan trọng: Xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies gia client with Credentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken

  // Nêu như cái clientAccessToken không tồn tại thì trà về lỗi luôn
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found!)'))
    return
  }
  try {
    // Bước 01: Thực hiện giải mã token xem nó có hợp lệ hay là không
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    // Bước 02: Quan trọng: Nều như cái token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vào cái req. jwtDecoded, dễ sử dụng cho các tầng cần xử lý ở phía sau
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho phép cái request đi tiếp
    next()
  } catch (error) {
    // Nếu cái accessTollen nó bị hết han (expired) thì mình cần trà về một cái mã lỗi GONE - 410 cho phía FE biết để gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError (StatusCodes.GONE, 'Need to refresh token.'))
      return
    }
    // Nều như cái accessToken nó không lợp lệ do bất kỳ điều gì khác vụ hết hạn thì chúng ta có thằng tay trà về mã 401 cho phía FE gọi api sign out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = { isAuthorized }