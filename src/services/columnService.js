import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { cardModel } from '~/models/cardModel'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createColumn.insertedId)
    if (getNewColumn) {
      getNewColumn.columns = []
      await boardModel.pushToColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const getDetails = async (columnId) => {
  try {
    const column = await columnModel.getDetails(columnId)
    if (!column) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    }

    return column
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updatedData)

    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    // console.log('🚀 ~ file: columnService.js:54 ~ deleteItem ~ targetColumn:', targetColumn)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }
    // Xoa Column
    await columnModel.deleteOneById(columnId)
    // Xoa toan bo card
    await cardModel.deleteManyByColumnId(columnId)
    //Xóa columnId trong columnOrderIds của board
    await boardModel.pullToColumnOrderIds(targetColumn)
    return { deleteResult: 'Column and Cards deleted successfully!' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  getDetails,
  update,
  deleteItem
}
