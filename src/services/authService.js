import { authModel } from '~/models/authModel'
import { jwtToken } from '~/utils/jwt'
import { FormateData } from '~/utils/formater'

const signUp = async (reqBody) => {
  try {
    const { name, email, password } = reqBody
    let salt = await jwtToken.generateSalt()
    let userPassword = await jwtToken.generatePassword(password, salt)

    const createAuth = await authModel.signUp({ name, email, password: userPassword, salt })
    const token = await jwtToken.generateSignature({ email: email, _id: createAuth._id })
    // const getNewAuth = await authModel.findOneById(createAuth.insertedId)
    return FormateData({ id: createAuth._id, token })
  } catch (error) {
    throw error
  }
}

const signIn = async (reqBody) => {
  try {
    const { email, password } = reqBody
    const existingAuth = await authModel.findAuthByEmail(email)
    if (existingAuth) {
      const validPassword = await jwtToken.validatePassword(password, existingAuth.password, existingAuth.salt)
      if (validPassword) {
        const token = await jwtToken.generateSignature({ email: existingAuth.email, _id: existingAuth._id })
        return FormateData({ id: existingAuth._id, token })
      }
    }
    return FormateData(null)
  } catch (error) {
    throw error
  }
}


// const getDetails = async (authId) => {
//   try {
//     const auth = await authModel.getDetails(authId)
//     if (!auth) {
//       throw new ApiError(StatusCodes.NOT_FOUND, 'Auth not found!')
//     }
//     return auth
//   } catch (error) {
//     throw error
//   }
// }

export const authService = {
  signUp,
  signIn
}
