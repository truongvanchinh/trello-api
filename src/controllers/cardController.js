import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createNewCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createNewCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew
}