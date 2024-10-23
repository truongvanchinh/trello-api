import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { APP_SECRET } from '~/config/environment'

const generateSalt = async () => {
  return await bcrypt.genSalt()
}

const generatePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt)
}

const validatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword
}

const generateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: '30d' })
  } catch (error) {
    console.log(error)
    return error
  }
}

const validateSignature = async (req) => {
  try {
    const signature = req.get('Authorization')
    console.log(signature)
    const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET)
    req.user = payload
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export const jwtToken = {
  generateSalt,
  generatePassword,
  validatePassword,
  generateSignature,
  validateSignature
}