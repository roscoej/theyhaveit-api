const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: String,
  availability: {
    stores: [
      {
        name: String,
        link: String,
        image: String,
        available: Boolean,
      }
    ]
  },
  numbers: [{
    type: String,
    minlength: 10
  }]
})

const Item = mongoose.model('Item', itemSchema)

module.exports = Item
