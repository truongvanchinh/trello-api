/* eslint-disable no-useless-catch */
// import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formater'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
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

const getDetails = async (boardId) => {
  try {

    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    return board
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails
}