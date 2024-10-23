import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { authRoute } from './authRoute'

const Router = express.Router()

// Check api v1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API V1 is ready to use' })
})

// boards api v1
Router.use('/boards', boardRoute)

// columns api v1
Router.use('/columns', columnRoute)

// cards api v1
Router.use('/cards', cardRoute)

//auth api v1
Router.use('/auths', authRoute)

export const APIs_V1 = Router
