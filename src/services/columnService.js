import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

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

export const columnService = {
  createNew
}
