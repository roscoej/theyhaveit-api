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
    type: mongoose.Schema.Types.Mixed,
    minlength: 10
  }]
})

const Item = mongoose.model('Item', itemSchema)

module.exports = Item
