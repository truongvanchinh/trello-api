/* eslint-disable no-useless-catch */
// import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formater'
import { boardModel } from '~/models/boardModel'
const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    const createBoard = await boardModel.createNew(newBoard)
    // console.log(createBoard)
    // const getNewBoard = await boardModel.findOneById(createBoard.insertedId)
    // console.log(getNewBoard)
    //Trong Service luôn phải có return
    return createBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}