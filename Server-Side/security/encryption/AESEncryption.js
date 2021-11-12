const crypto = require("crypto");
module.exports = {
    getAlgorithm(keyBase64) {

        var key = Buffer.from(keyBase64, 'base64');
        switch (key.length) {
            case 16:
                return 'aes-128-cbc';
            case 32:
                return 'aes-256-cbc';
    
        }
    
        throw new Error('Invalid key length: ' + key.length);
    },
    
    encrypt(plainText, keyBase64, ivBase64) {
    
        var key = Buffer.from(keyBase64, 'base64');
        var iv = Buffer.from(ivBase64, 'base64');
    
        var cipher = crypto.createCipheriv(getAlgorithm(keyBase64), key, iv);
        let cip = cipher.update(plainText, 'utf8', 'base64')
        cip += cipher.final('base64');
        return cip;
    },
    
    
    decrypt(messagebase64, keyBase64, ivBase64) {
    
        var key = Buffer.from(keyBase64, 'base64');
        var iv = Buffer.from(ivBase64, 'base64');
    
        var decipher = crypto.createDecipheriv(getAlgorithm(keyBase64), key, iv);
        let dec = decipher.update(messagebase64, 'base64');
        dec += decipher.final();
        return dec;
    },
    
    
    getRandomBase64(length) {
        return crypto.randomBytes(length).toString('base64');
    },
    
    getRandomString(length) {
        var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (var i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }    
};

function getAlgorithm(keyBase64) {

    var key = Buffer.from(keyBase64, 'base64');
    switch (key.length) {
        case 16:
            return 'aes-128-cbc';
        case 32:
            return 'aes-256-cbc';

    }

    throw new Error('Invalid key length: ' + key.length);
}