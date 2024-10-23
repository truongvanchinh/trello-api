import Joi from 'joi'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const AUTH_COLLECTION_NAME = 'auths'
const AUTH_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required().trim().strict(),
  name: Joi.string().required().min(3).max(50).trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateAuth = async (data) => {
  return await AUTH_COLLECTION_SCHEMA.validateAsync(data, { bortEarly: false })
}

//chỉ định ra những trường 0 cho phép update
// const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const signUp = async (data) => {
  try {
    const validData = await validateAuth(data)
    const createAuth = await GET_DB().collection(AUTH_COLLECTION_NAME).insertOne(validData)
    return createAuth
  } catch (error) { throw new Error(error) }
}

const findAuthByEmail = async (email) => {
  try {
    const existingCustomer = await GET_DB().collection(AUTH_COLLECTION_NAME).findOne({ email: email })
    return existingCustomer
  } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(AUTH_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}


export const authModel = {
  AUTH_COLLECTION_NAME,
  AUTH_COLLECTION_SCHEMA,
  signUp,
  findAuthByEmail,
  findOneById
  // getDetails,
  // update,
  // deleteManyByColumnId
}