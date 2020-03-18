'use strict'
const mongoose =  require('mongoose');

const SubscriptionSchema = mongoose.Schema({
    phone: String,
    settings: Array,
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);