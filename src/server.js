/* eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
const START_SERVER = () => {

  const app = express()
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use('/v1', APIs_V1)
  app.get('/', (req, res) => {
    console.log(env.AUTHOR)
    res.end('<h1>Hello World!</h1><hr>')
  })

  //Middleware error handling
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`3. Hello Chinh, I am running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

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
