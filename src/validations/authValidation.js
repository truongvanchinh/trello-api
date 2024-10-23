import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const signUp = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().min(3).max(50).trim().strict(),
    password: Joi.string().required().min(6).max(50).trim().strict(),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email no empty~~~~~',
      'string.email': 'Email invalid~~~~~'
    })

  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const signIn = async (req, res, next) => {
  const correctCondition = Joi.object({
    password: Joi.string().required().min(6).max(50).trim().strict(),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email no empty~~~~~',
      'string.email': 'Email invalid~~~~~'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const authValidation = {
  signIn,
  signUp
}