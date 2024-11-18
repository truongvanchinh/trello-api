import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formater'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    //? Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!!!')
    //*-------------------------------------------------------------------

    //? Tạo data đề lưu vào Database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), //* tham số thứ 2 là độ phức tạp (càng cao băm càng lâu)
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    //*-------------------------------------------------------------------

    //? Thực hiện lưu thông tin vào Database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    //*-------------------------------------------------------------------

    //? Gửi email cho người dùng xác thực tài khoản (buổi sau...)
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello MERN Stack Advanced: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely, <br/> Truongchinhdev </h3>
    `
    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    //*-------------------------------------------------------------------

    //? return trả về dữ liệu cho phía Controller
    return pickUser(getNewUser)
    //*-------------------------------------------------------------------

  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    //? Kiểm tra xem tài khoản đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Accout Not Found!!!')

    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Account is already active!!!')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!!!')

    //* Nếu như mọi thứ ok thì chúng ta bắt đầu update lại thông tin của thằng user đề verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    //* Thực hiện update thông tin user
    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    //? Kiểm tra xem tài khoản đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Accout Not Found!!!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Account is not active, check your email!!!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!!!')
    }

    //** Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    //* Tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }

    //* Tạo ra 2 loại token, accessToken va refreshToken đề trà về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    //* Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15
      env.REFRESH_TOKEN_LIFE
    )

    //* Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // token hợp lệ thì trả ra payload ~ data
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    //** Nếu mọi thứ ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE
    //* Tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    //* Tạo ra accessToken đề trà về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    //* Trả về thông tin của user kèm theo 2 cái token vừa tạo ra
    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query kt cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Accout Not Found!!!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Account is already active!!!')

    //Khởi tạo kq update User là empty
    let updatedUser = {}

    // TH1: Change password
    if (reqBody.current_password && reqBody.new_password) {
      //Check password
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!!!')
      }
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // Trường hợp upload file lên Cloud Storage, cụ thể là Cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log('🚀 ~ file: userService.js:159 ~ update ~ uploadResult:', uploadResult)

      // Lưu lại URL (secure_url) của file ảnh vào trong DB
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    } else {
      // TH2: Change common info: display name,...
      updatedUser = await userModel.update(userId, reqBody)
    }
    return pickUser(updatedUser)
  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}