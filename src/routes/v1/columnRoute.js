import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

const Router = express.Router()

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)

Router.route('/:id')
  .get(columnController.getDetails)
  .put(columnValidation.update, columnController.update) //update
  .delete(columnValidation.deleteItem, columnController.deleteItem) //delete
export const columnRoute = Router