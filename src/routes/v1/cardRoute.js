import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'

const Router = express.Router()

Router.route('/')
  .post(cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .get(cardController.getDetails)
export const cardRoute = Router