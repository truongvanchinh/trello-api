/* eslint-disable no-useless-catch */
// import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formater'
const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    //Trong Service luôn phải có return
    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}