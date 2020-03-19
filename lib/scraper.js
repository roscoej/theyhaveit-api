const Item = require('../models/item')

const staplesScraper = require('./staplesScraper')

async function run () {
  const items = await Item.find({})

  for (const item of items) {
    const oldStatus = item.availability.status

    item.availability.stores = await staplesScraper(item.name)

    // HERE WE CAN ADD THE SCRAPING FOR OTHER WEBSITES. THEY WOULD ALL PUSH ONTO item.availability.stores

    if (item.availability.stores.length > 0) {
      item.availability.status = true
    } else {
      item.availability.status = false
    }

    item.save()

    if ((oldStatus === false) && (item.availability.status === true)) {
      // CALL TWILIO MESSAGING FUNCTION. YOU CAN PASS TO IT WHATEVER ITEM PROPERTY YOU WANT.
    }
  }
}

setInterval(() => run(), 300000)