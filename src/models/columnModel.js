import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { cardModel } from './cardModel'

const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  cardOrderIds: Joi.array().items(Joi.string()).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateColumn = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, { bortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateColumn(data)
    // fix bug ObjectId
    const newData = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId))
    }
    const createColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newData)
    return createColumn
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const pushToCardOrderIds = async (card) => {
  try {
    const result = GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(card.columnId) },
      { $push: { cardOrderIds: new ObjectId(card._id) } },
      { returnDocument: 'after' }
    )
    return result.value
  } catch (error) { throw new Error(error) }
}

const getDetails = async (columnId) => {
  try {
    // const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({ _id: new ObjectId(columnId) })
    const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(columnId),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          // ~ liên kết bảng
          localField: '_id',
          foreignField: 'columnId',
          as: 'cards'
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushToCardOrderIds,
  getDetails
}