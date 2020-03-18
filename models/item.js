const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: String,
  availability: {
    status: {
      type: Boolean,
      default: true
    },
    stores: [
      {
        name: String,
        link: String,
        image: String
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
