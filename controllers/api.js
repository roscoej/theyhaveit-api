require('dotenv').config()
const express = require('express')
const basicAuth = require('express-basic-auth')
const TwilioClient = require('../lib/twilio')
const twilioWebhook = require('twilio').webhook
const router = express.Router()
const Item = require('../models/item')

router.get('/signups',
  basicAuth({users: {[process.env.API_USERNAME]: process.env.API_PASSWORD}}),
  async (req, res) => {
    try {
      const items = await Item.find({})
      let numbers = [];
      for (const item of items) {
        numbers = numbers.concat(item.numbers);
      }
      numbers = [...new Set(numbers)] // unique values
      return res.status(200).json({numbers: numbers.length})
    } catch(e) {
      console.error(e)
      res.sendStatus(500)
    }
  }
)

router.post('/trigger-updates',
  basicAuth({users: {[process.env.API_USERNAME]: process.env.API_PASSWORD}}),
  async (req, res) => {
    try {
      const twilioClient = new TwilioClient()
      const items = await Item.find({})
      let numbers = []
      for (const item of items) {
        numbers = numbers.concat(item.numbers);
      }
      numbers = [...new Set(numbers)] // unique values
      let count = 0
      for (const number of numbers) {
        if (typeof number === "string") {
          count++
          await twilioClient.sendSms(number, "Hi! Jacob from theyhaveit.co. Please reply to this text with your zip code so we can accurately deliver your alerts. Thank you again for signing up.")
        }
      }
      return res.status(200).json({sent: count})
    } catch(e) {
      console.error(e)
      res.sendStatus(500)
    }
  }
);

router.post('/update-number', twilioWebhook(), async (req, res) => {
  try {
    const twilioClient = new TwilioClient();
    const { From, Body } = req.body
    if (!(/^-{0,1}\d+$/.test(Body))) {
      await twilioClient.sendSms(From, "Sorry, you entered a non valid zip code. Please try again, and send us your zip code.")
      return res.sendStatus(304)
    }
    if (Body.length > 5) {
      await twilioClient.sendSms(From, "Sorry, you entered a non valid zip code. Please try again with a valid zip code.")
      return res.sendStatus(304)
    }
    let updated = false
    const items = await Item.find({})
    for (const item of items) {
      let number = item.numbers.find(n => n === From)
      if (number) {
        let newNumber = {
          zip: Body,
          phone: number,
        }
        item.numbers = [
          ...item.numbers.filter(n => n !== number),
          newNumber,
        ]
        await item.save()
        updated = true
      }
    }
    if (!updated) {
      // Incoming number not found in any number
      return res.sendStatus(304)
    }
    await twilioClient.sendSms(From, "Your zip code has been added to theyhaveit.co, and we will use it to deliver more accurate results to you. Thank you!")
    res.sendStatus(200)
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
});

router.post('/signup', async(req, res) => {
  try {
    // The whole signup misses Twilio integration

    const { number, zip } = req.body

    const options = {

      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true

    }

    const items = await Item.find({})
    let isUpdated = false;
    for (let item of items) {
      if (typeof item.number === "string") {
        const index = item.numbers.indexOf(req.body.number)
        if (index > -1) {
          item.numbers.splice(index, 1)
          isUpdated = true;
        }
        await item.save()
      } else {
        isUpdated = item.numbers.find(n => n.phone === req.body.number)
        item.numbers = item.numbers.filter(n => n.phone !== req.body.number)
        await item.save()
      }
    }

    for (const item of req.body.items) {
      const filter = { name: item }
      let newItem = {phone: number, zip}
      // Searches Product with item like the req, if there isn't one, it creates it and sets the schema defaults. It also validates it following schema settings.
      await Item.findOneAndUpdate(filter, { $push: { numbers: newItem } }, options)
    }

    const twilioClient = new TwilioClient();
    const msg = isUpdated
      ? "🚨 Your alert notifications for theyhaveit.co have been modified."
      : "🚨 You're now on the theyhaveit.co alert list! In-stock alerts will be sent to you as soon as we process them. To change your alert settings, visit our website and enter your number."
    await twilioClient.sendSms(number, msg);
    res.status(200).json({
      isUpdated,
    })
  } catch (e) {
    console.error(e)
    res.sendStatus(500)
  }
})

module.exports = router
