import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createCard.insertedId)
    if (getNewCard) {
      getNewCard.cards = []
      await columnModel.pushToCardOrderIds(getNewCard)
    }
    return createCard
  } catch (error) {
    throw error
  }
}

const getDetails = async (cardId) => {
  try {
    const card = await cardModel.getDetails(cardId)
    if (!card) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    }
    return card
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  getDetails
}
