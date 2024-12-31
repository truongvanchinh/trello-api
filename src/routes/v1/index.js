import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'

const Router = express.Router()

// Check APIs v1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'API V1 is ready to use' })
})

// boards APIs v1
Router.use('/boards', boardRoute)

// columns APIs v1
Router.use('/columns', columnRoute)

// cards APIs v1
Router.use('/cards', cardRoute)

//user APIs v1
Router.use('/users', userRoute)

//user APIs v1
Router.use('/invitations', invitationRoute)

export const APIs_V1 = Router
