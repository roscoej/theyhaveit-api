const twilio = require("twilio");

function Twilio() {
    this.sid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.phone = process.env.TWILIO_PHONE_NUMBER;
    this.client = new twilio(this.sid, this.authToken);
};

Twilio.prototype.sendSms = function(to, body) {
    return new Promise((resolve, reject) => {
        this.client.messages.create({
            body,
            to,
            from: this.phone,
        })
        .then(message => resolve(message))
        .catch(error => reject(error))
    });
};

module.exports = Twilio;