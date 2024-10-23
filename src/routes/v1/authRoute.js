import express from 'express'
import { authValidation } from '~/validations/authValidation'
import { authController } from '~/controllers/authController'

const Router = express.Router()

Router.route('/register')
  .post(authValidation.signUp, authController.signUp)

Router.route('/login')
  .post(authValidation.signIn, authController.signIn)
export const authRoute = Router