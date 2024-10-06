import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createCard = await cardModel.createNew(newCard)
    return createCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew
}
