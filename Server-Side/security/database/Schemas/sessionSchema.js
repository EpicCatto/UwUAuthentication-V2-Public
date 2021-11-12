const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    sessionIP: String,
    sessionID: String,
    sessionUserDiscordID: String,
    sessionCreate: Number,
    sessionExpired: Number,
    sessionType: String
})

module.exports = new mongoose.model('Session', sessionSchema);
