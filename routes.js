'use strict'
const express = require('express');
const SubscriptionController = require('./controllers/subscription.controller');

const api = express.Router();

api.get('/', (req, res) => res.send("Welcome to theyhave.it"));
api.get('/subscriptions', SubscriptionController.getAll);
api.post('/subscriptions', SubscriptionController.create);

module.exports = api;
