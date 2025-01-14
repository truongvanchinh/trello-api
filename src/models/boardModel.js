import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//chỉ định ra những trường 0 cho phép update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBoard = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { bortEarly: false })
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBoard(data)

    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(String(userId))]
    }

    const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    return createBoard
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async (userId, boardId) => {
  try {
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(boardId) })
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: { $and: queryConditions }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          // ~ liên kết bảng
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          // ~ liên kết bảng
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          // ~ liên kết bảng
          localField: 'ownerIds',
          foreignField: '_id',
          as: 'owners', // -> trả về màng tên là owners
          // pipeline trong lookup là để xử lý 1 hoặc nhiều luồng cần thiết.
          // $project để chỉ định vào field 0 muốn lấy về bằng cách gán nó giá trị 0
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          // ~ liên kết bảng
          localField: 'memberIds',
          foreignField: '_id',
          as: 'members',
          pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
        }
      }
    ]).toArray()
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

//thêm 1 phần tử vào columnOrderIds
const pushToColumnOrderIds = async (column) => {
  try {
    const result = GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

//lấy 1 phần tử ra khỏi columnOrderIds
const pullToColumnOrderIds = async (column) => {
  try {
    const result = GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const update = async (boardId, updatedData) => {
  try {
    // lọc ra field 0 cho phép cập nhật linh tinh
    Object.keys(updatedData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updatedData[fieldName]
      }
    })

    if (updatedData.columnOrderIds) {
      updatedData.columnOrderIds = updatedData.columnOrderIds.map(columnId => (new ObjectId(columnId)))
    }

    const result = GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updatedData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemPerPage, queryFilter) => {
  try {
    const queryConditions = [
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(String(userId))] } },
        { memberIds: { $all: [new ObjectId(String(userId))] } }
      ] }
    ]

    // Xử lý quẻy filter cho từng trường hợp search board, ví dụ search board theo title
    if (queryFilter) {
      Object.keys(queryFilter).forEach( key => {
        // có phân biệt chữ hoa chữ thường
        // queryConditions.push({ [key]: { $regex: queryFilter[key] } })
        // ko phân biệt chữ hoa chữ thường
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilter[key], 'i') } })
      })
    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường (theo chuẩn bằng mã ASCII)
        { $sort: { title: 1 } },
        // $facet đề xử lý nhiều luồng trong một query
        { $facet: {
          // Luồng 01: Query boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemPerPage) },
            { $limit: itemPerPage }
          ],
          // Luồng 02: Query đềm tổng tất cả số lượng bản ghi boards trong DB và trả về.
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) { throw new Error(error) }
}

const pushMemberIds = async (boardId, userId) => {
  try {
    const result = GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushToColumnOrderIds,
  pullToColumnOrderIds,
  update,
  getBoards,
  pushMemberIds
}