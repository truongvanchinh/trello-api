const express = require('express')

const app = express()

const hostname = 'localhost'
const port = 8017

app.get('/', (req, res) => {
  res.send('<h4>Hello Word</h4>')
})

app.listen(port, hostname, () => {
  console.log(`Hello Chinh, I'm running server http://${hostname}:${port}/`)
})