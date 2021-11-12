const crypto = require("crypto");
module.exports = {
    encrypt(string){
        return crypto.createHash('sha512').update(string).digest('hex');        
    }
}