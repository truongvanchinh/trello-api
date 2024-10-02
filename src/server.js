/* eslint-disable no-console */
import express from 'express'
import { mapOrder } from '~/utils/sorts.js'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment'
const START_SERVER = () => {

  const app = express()

  app.get('/', async (req, res) => {
    console.log(env.AUTHOR)
    res.end('<h1>Hello World!</h1><hr>')
  })

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
