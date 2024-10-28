import JWT from 'jsonwebtoken'

/**
 * Function tạo mới một taken Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn định kèm vào token
 * secretSignature: Chữ kỳ bí mật (dạng một chuỗi string ngẫu nhiên) trên dọcs thì đề tên là privateKey tùy đều được
 * tokenLife: Thời gian sống của toker
 */

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //Hàm (sign) của thư viện JWT - Thuật toán mặc định là H5256 nhé, cử cho vào code đề dễ nhìn
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) { throw error }
}

/**
 * Function kiềm tra một token có hợp lệ hay không
 * Hợp lệ ở đây hiều đơn giản là cái token được tạo ra có đúng với cái chữ ký bị một secretSignature trong dự án hay không
 */

const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của thư viện JWT
    return JWT.verify(token, secretSignature)
  } catch (error) { throw error }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}