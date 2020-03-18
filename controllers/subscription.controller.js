'use strict';

const Subscription = require("../models/subscription");
const Twilio = require("../lib/twilio");

module.exports = {
    // Get all subscriptions
    getAll: (req, res) => {
        Subscription.find({}, (err, subscriptions) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err });
            }
            return res.status(200).json({ subscriptions });
        });
    },

    // Create new subscription
    // Remember: only one phone allowed, and the subscription is only created when the confirmation SMS is successful
    create: (req, res) => {
        const { phone, settings } = req.body;
        if (!phone || !settings || Array(settings).length === 0) {
            return res.status(400).json({ error: "Incorrect input. Send both the settings and the phone number." });
        }
        Subscription.findOne({ phone }, (err, subscription) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: err });
            }
            if (subscription) {
                return res.status(400).json({ error: "This phone number is already subscribed. "});
            }
            const twilio = new Twilio();
            twilio.sendSms(phone, "🚨 You're now on the theyhaveit.co alert list! In-stock alerts will be sent to you as soon as we process them. To change your alert settings, reply to us here.").then(() => {
                subscription = new Subscription({
                    phone,
                    settings,
                });
                subscription.save();
                return res.status(200).json({ subscription });
            }).catch(error => {
                console.error(error);
                return res.status(500).json({ error });
            });
        });
    },

};
