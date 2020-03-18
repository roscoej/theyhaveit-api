const express = require('express')

const router = express.Router()

router.use('/api', require('./api'))

router.get('*', (req, res) => {
  res.redirect('/')
})

module.exports = router
