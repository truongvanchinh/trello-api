import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/authService'

const signUp = async (req, res, next) => {
  try {
    const result = await authService.signUp(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

const signIn = async (req, res, next) => {
  try {
    const result = await authService.signIn(req.body)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error) { next(error) }
}

// const getDetails = async (req, res, next) => {
//   try {
//     const authId = req.params.id

//     const auth = await authService.getDetails(authId)
//     res.status(StatusCodes.OK).json(auth)
//   } catch (error) { next(error) }
// }

export const authController = {
  signUp,
  signIn
}