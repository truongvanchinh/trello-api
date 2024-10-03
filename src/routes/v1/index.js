import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'

const Router = express.Router()

// Check api v1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API V1 is ready to use' })
})

// boards api v1
Router.use('/boards', boardRoute)

export const APIs_V1 = Router
