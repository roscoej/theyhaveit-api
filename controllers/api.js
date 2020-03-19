const express = require('express')

const Twilio = require('../lib/twilio');

const router = express.Router()

const Item = require('../models/item')

router.get('/getAll', async (req, res) => {
  const items = await Item.find({})

  const ans = []

  for (const item of items) {
    ans.push({
      item: item.name,
      availability: {
        status: item.availability.status,
        stores: item.availability.stores
      }
    })
  }

  res.send(ans)
})

router.post('/signup', async(req, res) => {
  try {
    // The whole signup misses Twilio integration

    const number = req.body.number

    const options = {

      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true

    }

    const items = await Item.find({})
    let isUpdated = false;
    for (const item of items) {
      const index = item.numbers.indexOf(req.body.number)

      if (index > -1) {
        item.numbers.splice(index, 1)
        isUpdated = true;
      }

      item.save()
    }

    for (const item of req.body.items) {
      const filter = { name: item }

      // Searches Product with item like the req, if there isn't one, it creates it and sets the schema defaults. It also validates it following schema settings.
      await Item.findOneAndUpdate(filter, { $push: { numbers: number } }, options)
    }

    const twilio = new Twilio();
    const msg = isUpdated
      ? "🚨 Your alert notifications for theyhaveit.co have been modified."
      : "🚨 You're now on the theyhaveit.co alert list! In-stock alerts will be sent to you as soon as we process them. To change your alert settings, reply to us here."
    await twilio.sendSms(number, msg);
    res.sendStatus(200).json({
      isUpdated,
    })
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

module.exports = router
