import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { StatusCodes } from 'http-status-codes'
import { ApiError } from '~/utils/ApiError'
import { cloneDeep } from 'lodash'

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
    return createColumn
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


export const columnService = {
  createNew,
  getDetails
}
