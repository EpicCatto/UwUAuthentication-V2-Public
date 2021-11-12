const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    clientName: String,
    clientVersion: String,
    clientDescription: String,
    clientJarDownload: String,
    clientJsonDownload: String,
    clientLastUpdate: Number,
    clientDevelopersUID: Number
})

module.exports = new mongoose.model('Client', clientSchema);
