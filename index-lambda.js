require('dotenv').config()
const serverless = require('serverless-http')
const mongoose = require('mongoose')
const app = require('./app')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
module.exports.handler = serverless(app)
