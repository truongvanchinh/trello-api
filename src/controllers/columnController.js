import { StatusCodes } from 'http-status-codes'
import { columnService } from '~/services/columnService'

const createNew = async (req, res, next) => {
  try {
    const createNewColumn = await columnService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createNewColumn)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const columnId = req.params.id

    const column = await columnService.getDetails(columnId)
    res.status(StatusCodes.OK).json(column)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const columnId = req.params.id

    const updatedBoard = await columnService.update(columnId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

export const columnController = {
  createNew,
  getDetails,
  update
}