const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
    init: () => {
        mongoose.connect("", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('Conected to the database.');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Disconnected to the database.');
        });

        mongoose.connection.on('err', (err) => {
            console.log('DATABASE ERROR: ' + err);
        });

    }
};
