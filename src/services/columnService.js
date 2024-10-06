import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createColumn = await columnModel.createNew(newColumn)
    return createColumn
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
