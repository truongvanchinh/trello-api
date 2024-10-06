import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

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

export const cardService = {
  createNew
}
