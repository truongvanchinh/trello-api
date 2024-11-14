import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, columnController.getDetails)
  .put(authMiddleware.isAuthorized, columnValidation.update, columnController.update) //update
  .delete(authMiddleware.isAuthorized, columnValidation.deleteItem, columnController.deleteItem) //delete
export const columnRoute = Router