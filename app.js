const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const controllers = require('./controllers/')

// const scraper = require('./lib/scraper')

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.use(controllers)

module.exports = app
