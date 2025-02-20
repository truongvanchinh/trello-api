/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import cookieParser from 'cookie-parser'

// Xử lý socket.io real time
import http from 'http'
import socketIo from 'socket.io'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = () => {
  const app = express()

  // fix cache from disk
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  //Cấu hình Cookie Parser
  app.use(cookieParser())

  // Xử lý CORS
  app.use(cors(corsOptions))

  //Enable req.body json data
  app.use(express.json())

  // use APIs v1
  app.use('/v1', APIs_V1)

  //Middleware error handling
  app.use(errorHandlingMiddleware)

  //Tạo 1 server mới bọc app của express để làm real-time với socket.io
  const server = http.createServer(app)

  //Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  // io.on('connection', (socket) => {
  //   inviteUserToBoardSocket(socket)
  // })
  io.on('connection', (socket) => inviteUserToBoardSocket(socket, io))

  if (env.BUILD_MODE === 'production') {
    // moi truong production
    server.listen(process.env.PORT, () => {
      console.log(`3. Production: Hello Chinh, I am running at ${process.env.PORT}`)
    })
  } else {
    //moi truong dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Hello Chinh, I am running at http://${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  exitHook(() => {
    console.log('exiting: ')
    CLOSE_DB()
  })
}

(async () => {
  try {
    console.log('1. Connecting DB.........')
    await CONNECT_DB()
    console.log('2. Connected DB')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
