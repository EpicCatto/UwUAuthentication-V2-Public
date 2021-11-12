const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    userType: {
        ClientDevelopers: Boolean,
        Developers: Boolean,
        Staff: Boolean,
        Owner: Boolean,
    },
    discordID: String,
    discordUser: String,
    username: String,
    password: String,
    hwid: String,
    uid: Number,
    dateRegister: Number,
    lastLogin: Number,
    clientOwned: Array,
    amongusKey: String,
    amongusIV: String,
})

module.exports = new mongoose.model('User', userSchema);
