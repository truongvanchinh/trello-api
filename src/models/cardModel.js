import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateCard = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { bortEarly: false })
}

//chỉ định ra những trường 0 cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const createNew = async (data) => {
  try {
    const validData = await validateCard(data)
    const newData = {
      ...validData,
      boardId: new ObjectId(String(validData.boardId)),
      columnId: new ObjectId(String(validData.columnId))
    }
    const createCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newData)
    return createCard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (cardId) => {
  try {
    // const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({ _id: new ObjectId(cardId) })
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(cardId),
          _destroy: false
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

const update = async (cardId, updatedData) => {
  try {
    // lọc ra field 0 cho phép cập nhật linh tinh
    Object.keys(updatedData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updatedData[fieldName]
      }
    })

    if (updatedData.columnId) updatedData.columnId = new ObjectId(updatedData.columnId)

    const result = GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(cardId)) },
      { $set: updatedData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  update
}