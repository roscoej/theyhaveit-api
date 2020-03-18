require('dotenv').config()
const mongoose = require('mongoose')
const app = require('./app')
const port = process.env.PORT || 3000

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`>>> Server listening to port ${port}`)
    })
  })
  .catch(err => console.error(err))
