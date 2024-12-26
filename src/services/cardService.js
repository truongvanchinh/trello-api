import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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
    return getNewCard
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

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, { cover: uploadResult.secure_url })
    } else {
      updatedCard = await cardModel.update(cardId, updatedData)
    }

    return updatedCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  getDetails,
  update
}
