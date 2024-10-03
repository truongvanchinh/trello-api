import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    // console.log(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST from Validation: API create boards' })
  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}