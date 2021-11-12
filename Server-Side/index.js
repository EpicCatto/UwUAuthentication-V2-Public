//Import stuff
const express = require("express");
const path = require("path");

const AESEncryption = require('./security/encryption/AESEncryption');
const SHA512Encrtption = require('./security/encryption/SHA512Encrtption');

const database = require('./security/database/database');
const User = require('./security/database/Schemas/userSchema');
const Session = require('./security/database/Schemas/sessionSchema');
const Client = require('./security/database/Schemas/clientSchema');

const fetch = require('node-fetch');	//npm install node-fetch
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator')

var cloudflare = require('cloudflare-express');

/*//Make website stay open
var http = require("http");
setInterval(function () {
    http.get("http://notthatuwu-node-js.herokuapp.com/");
}, 290000); // every 5 minutes (300000)*/

//oauth2
const { AuthorizationCode } = require("simple-oauth2");
const e = require("express");
const config = {
    client: {
        id: "890240781720379422"
    },
    auth: {
        tokenHost: "https://discord.com",
        authorizePath: "/oauth2/authorize",
    }
}
const client = new AuthorizationCode(config)

//Port
const port = process.env.PORT || 5000;

//Express App
const app = express();

//Connect to db
database.init();

//UrlencodedParser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

//Static the html folder
app.use(express.static(__dirname + '/views/public'));
app.set('view engine', 'ejs');

//Reverse cloudflare ip
app.use(cloudflare.restore());
app.set('trust proxy', 'loopback' ); //trust localhost reverse proxy

/*
* Index
*/

app.get('', async (req, res) => {
    return res.render('index', { count: await getCount() });
});

/*
* Register Process
*/

app.get('/start-register', async (req, res) => {
    const url = client.authorizeURL({
        redirect_uri: "https://uwuprotection.notthatuwu.xyz/register",
        scope: "identify"
    })
    const token = req.body && req.body.token;
    return res.redirect(url)
});

app.get('/register', async (req, res) => {
    const data = new URLSearchParams({
        client_id: "890240781720379422",
        client_secret: "EF_T1Pm_teAeb1dLDxFDb7TzXebmL30I",
        code: req.query.code,
        redirect_uri: "https://uwuprotection.notthatuwu.xyz/register",
        grant_type: "authorization_code",
        scope: "identify"
    })

    const accessuser = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (accessuser.status !== 200) {
        return res.send("Error! please try again.")
    }
    const access_json = await accessuser.json()
    const getUser = await fetch("https://discord.com/api/users/@me", {
        headers: {
            "Authorization": `Bearer ${access_json.access_token}`
        }
    })
    const user = await getUser.json()

    //console.log(user);
    return res.render('register', {
        username: user.username,
        discordID: user.id,
        discordUser: user.username + "#" + user.discriminator
    });
});

app.post('/register', urlencodedParser, [
    check('username', 'This username cannot be use because it contain " "')
        .exists()
        .matches(/^((?!\s).)*$/), // <-- must be true
    check('username', 'This username cannot be use because it contain "-"')
        .exists()
        .matches(/^((?!\-).)*$/),
    check('username', 'This username cannot be use because it contain "."')
        .exists()
        .matches(/^((?!\.).)*$/),
    check('password', 'This password cannot be use because it contain " "')
        .exists()
        .matches(/^((?!\s).)*$/), // <-- must be true
    check('password', 'This password cannot be use because it contain "-"')
        .exists()
        .matches(/^((?!\-).)*$/),
    check('password', 'This password cannot be use because it contain "."')
        .exists()
        .matches(/^((?!\.).)*$/),
    check('password', 'Password must me 6-16 length.')
        .exists()
        .isLength({ min: 6, max: 16 })
    //password 1 = password 2 <- yes idk how
], async (req, res) => {
    const errors = validationResult(req)
    const password = await req.body.password;
    const password_C = await req.body.password_confirm;

    if ((password !== password_C)) {
        //return res.status(503).send({ status: 1, message: "Password != Confirm Password Please try again." });
        return res.render('info', {
            title: "Registering Failed.",
            header: "Error occur while trying to register.",
            description: "Confirm password need to be same as password."
        });
    }
    if (!errors.isEmpty()) {
        return res.render('info', {
            title: "Registering Failed.",
            header: "Error occur while trying to register.",
            description: JSON.stringify(errors.array())
        });
    }

    try {
        let alreadyRegisteredDiscordID = await User.findOne({
            discordID: await req.body.discord_id
        });

        if (alreadyRegisteredDiscordID) {
            return res.render('info', {
                title: "Registering Failed.",
                header: "Error occur while trying to register.",
                description: "You already have an account (Discord-ID)."
            });
        }

        let alreadyRegisteredUsername = await User.findOne({
            username: await req.body.username
        });

        if (alreadyRegisteredUsername) {
            return res.render('info', {
                title: "Registering Failed.",
                header: "Error occur while trying to register.",
                description: "You already have an account (Username)."
            });
        }

        let alreadyRegisteredDUsername = await User.findOne({
            discordUser: await req.body.discordUser
        });

        if (alreadyRegisteredDUsername) {
            return res.render('info', {
                title: "Registering Failed.",
                header: "Error occur while trying to register.",
                description: "You already have an account (D-Username)."
            });
        }

        const perUserKey = AESEncryption.getRandomBase64(32);
        const perUserIV = AESEncryption.getRandomBase64(16);

        newUser = new User({
            userType: {
                ClientDevelopers: false,
                Developers: false,
                Staff: false,
                Owner: false,
            },
            discordID: req.body.discord_id,
            discordUser: AESEncryption.encrypt(await req.body.discordUser, perUserKey, perUserIV).toString(),
            username: AESEncryption.encrypt(await req.body.username, perUserKey, perUserIV).toString(),
            password: AESEncryption.encrypt(SHA512Encrtption.encrypt(await req.body.password), perUserKey, perUserIV).toString(),
            hwid: AESEncryption.encrypt("NO", perUserKey, perUserIV).toString(),
            uid: await getUID(),
            dateRegister: Date.now(),
            lastLogin: Date.now(), perUserKey, perUserIV,
            clientOwned: [],
            amongusKey: perUserKey,
            amongusIV: perUserIV
        });
        await newUser.save();
    } catch (error) {
        console.log(error)
        return res.render('info', {
            title: "Registering Failed.",
            header: "Error occur while trying to register.",
            description: error
        });
        //return res.status(503).send({ status: 1, message: error });
    }
    return res.render('info', {
        title: "Register Sucsess.",
        header: "Sucsessfully register your account.",
        description: "You can login into your account now."
    });
    //return res.redirect("/login");

})

/*
* Login Process
*/

app.get('/start-login', async (req, res) => {
    const url = client.authorizeURL({
        redirect_uri: "https://uwuprotection.notthatuwu.xyz/login",
        scope: "identify"
    })
    const token = req.body && req.body.token;
    return res.redirect(url)
});

app.get('/login', async (req, res) => {
    const data = new URLSearchParams({
        client_id: "890240781720379422",
        client_secret: "EF_T1Pm_teAeb1dLDxFDb7TzXebmL30I",
        code: req.query.code,
        redirect_uri: "https://uwuprotection.notthatuwu.xyz/login",
        grant_type: "authorization_code",
        scope: "identify"
    })

    const accessuser = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    if (accessuser.status !== 200) {
        return res.send("Error! please try again.")
    }
    const access_json = await accessuser.json()
    const getUser = await fetch("https://discord.com/api/users/@me", {
        headers: {
            "Authorization": `Bearer ${access_json.access_token}`
        }
    })
    const user = await getUser.json()

    //console.log(user);
    return res.render('login', {
        username: user.username,
        discordID: user.id
    });
});

app.post('/login', urlencodedParser, async (req, res) => {
    try {
        let findUserKey = await User.findOne({
            discordID: await req.body.discord_id,
        });
        const perUserKey = findUserKey.amongusKey;
        const perUserIV = findUserKey.amongusIV;

        let findUser = await User.findOne({
            discordID: await req.body.discord_id,
            username: await AESEncryption.encrypt(req.body.username, perUserKey, perUserIV),
            password: await AESEncryption.encrypt(SHA512Encrtption.encrypt(await req.body.password), perUserKey, perUserIV)
        });
        if (findUser) {

            findUser.overwrite({
                userType: {
                    ClientDevelopers: findUser.userType.ClientDevelopers,
                    Developers: findUser.userType.Developers,
                    Staff: findUser.userType.Staff,
                    Owner: findUser.userType.Owner,
                },
                discordID: findUser.discordID,
                discordUser: findUser.discordUser,
                username: findUser.username,
                password: findUser.password,
                hwid: findUser.hwid,
                uid: findUser.uid,
                dateRegister: findUser.dateRegister,
                lastLogin: Date.now(),
                clientOwned: findUser.clientOwned,
                amongusKey: perUserKey,
                amongusIV: perUserIV
            })
            await findUser.save();

            let ip = req.headers['cf-connecting-ip'];

            let findOldSession = await Session.findOne({
                sessionUserDiscordID: await req.body.discord_id,
                sessionType: "user"
            });
            if (findOldSession)
                findOldSession.deleteOne();

            const sessionID = AESEncryption.getRandomString(100);

            newSession = new Session({
                sessionIP: SHA512Encrtption.encrypt(ip).toString(),
                sessionID: sessionID,
                sessionUserDiscordID: req.body.discord_id,
                sessionCreate: Date.now(),
                sessionExpired: Date.now() + (60000/* 1 minutes */ * 60),
                sessionType: "user"
            });

            await newSession.save();

            if (findUser.userType.ClientDevelopers) {
                let findOldDevSession = await Session.findOne({
                    sessionUserDiscordID: await req.body.discord_id,
                    sessionType: "clientdevelopers"
                });
                if (findOldDevSession)
                    findOldDevSession.deleteOne();

                newSessionDev = new Session({
                    sessionIP: SHA512Encrtption.encrypt(ip).toString(),
                    sessionID: sessionID,
                    sessionUserDiscordID: req.body.discord_id,
                    sessionCreate: Date.now(),
                    sessionExpired: Date.now() + (60000/* 1 minutes */ * 60),
                    sessionType: "clientdevelopers"
                });
                console.log("dev")
                await newSessionDev.save();
            }
            return await res.redirect("/userpanel/" + newSession.sessionID)
            /*return res.render('info', {
                title: "Login Sucsess.",
                header: "Sucsessfully logged in to your account.",
                description: "Login Sucsess"
            });*/
        } else {
            return res.render('info', {
                title: "Login Failed.",
                header: "Error occur while trying to login.",
                description: "Invald username or password"
            });
        }
    } catch (error) {
        console.log(error);
        return res.render('info', {
            title: "Login Failed.",
            header: "Error occur while trying to Login.",
            description: error
        });
    }
});

/*
* User Panel Process
*/

app.get('/userpanel/:sessionID', async (req, res) => {
    let ip = req.headers['cf-connecting-ip'];

    let findSession = await Session.findOne({
        sessionIP: SHA512Encrtption.encrypt(ip).toString(),
        sessionID: req.params.sessionID,
        sessionType: "user"
    });

    if (findSession) {
        if (findSession.sessionExpired < Date.now()) {
            findSession.deleteOne();
            return res.send("Session expired please login again.")
        }

        setTimeout(() => {
            findSession.deleteOne();
        }, findSession.sessionExpired - Date.now());

        let findUser = await User.findOne({
            discordID: await findSession.sessionUserDiscordID,
        });

        const perUserKey = findUser.amongusKey;
        const perUserIV = findUser.amongusIV;


        return res.render('userpanel', {
            username: AESEncryption.decrypt(findUser.username, perUserKey, perUserIV),
            sessionID: findSession.sessionID,
            sessionExp: timeToMinutes(new Date(findSession.sessionExpired - Date.now())),
            uid: findUser.uid,
            expTime: findSession.sessionExpired - Date.now() + 500,
            clients: findUser.clientOwned.toString()
        });

    } else return res.send("un amongus")
})

/*
* Developer Panel Process
*/

app.get('/developerpanel/:sessionID', async (req, res) => {
    let ip = req.headers['cf-connecting-ip'];
    
    let findSession = await Session.findOne({
        sessionIP: SHA512Encrtption.encrypt(ip).toString(),
        sessionID: req.params.sessionID,
        sessionType: "clientdevelopers"
    });

    if (findSession) {
        if (findSession.sessionExpired < Date.now()) {
            findSession.deleteOne();
            return res.send("Session expired please login again.")
        }

        setTimeout(() => {
            findSession.deleteOne();
        }, findSession.sessionExpired - Date.now());

        let findUserID = await User.findOne({
            discordID: await findSession.sessionUserDiscordID,
        });

        let findUser = await User.findOne({
            discordID: await findSession.sessionUserDiscordID,
            userType: {
                ClientDevelopers: true,
                Developers: findUserID.userType.Developers,
                Staff: findUserID.userType.Staff,
                Owner: findUserID.userType.Owner,
            }
        });

        if (findUser) {
            let findDevClient = await Client.findOne({
                clientDevelopersUID: findUser.uid
            });
            let usersOwn = await User.find({
                clientOwned: {$all : [findDevClient.clientName]}
            });

            if (!findDevClient) {
                newClient = new Client({
                    clientName: AESEncryption.decrypt(findUser.username, findUser.amongusKey, findUser.amongusIV) + "Client",
                    clientVersion: "dev",
                    clientDescription: findUserID.user + " Super dooper cool client",
                    clientJarDownload: "",
                    clientJsonDownload: "",
                    clientLastUpdate: Date.now(),
                    clientDevelopersUID: findUserID.uid
                });
                await newClient.save();
                return res.send("Creating new client please refresh page")
            }

            let reply = '';

            for (const uwu of usersOwn) {
                const { username ,uid, amongusKey, amongusIV } = uwu

                reply += `(Username: ${AESEncryption.decrypt(username, amongusKey, amongusIV)} | UID: ${uid}) `
            }
            
            return res.render('developerpanel', {
                clientname: findDevClient.clientName,
                clientversion: findDevClient.clientVersion,
                clientdescription: findDevClient.clientDescription,
                sessionID: req.params.sessionID,
                uid: findUser.uid,
                userUID: await reply,
                clientjar: findDevClient.clientJarDownload,
                clientjson: findDevClient.clientJsonDownload,
                sessionExp: timeToMinutes(new Date(findSession.sessionExpired - Date.now()))
            });

        } else return res.send("un amongus 2")
    } else return res.send("un amongus")
});

app.post('/developerpanel', urlencodedParser, [
    check('clientname', 'This clientname cannot be use because it contain " "')
        .exists()
        .matches(/^((?!\s).)*$/), // <-- must be true
    check('clientname', 'This clientname cannot be use because it contain "-"')
        .exists()
        .matches(/^((?!\-).)*$/),
    check('clientname', 'This clientname cannot be use because it contain "."')
        .exists()
        .matches(/^((?!\.).)*$/),
    check('clientversion', 'This clientversion cannot be use because it contain " "')
        .exists()
        .matches(/^((?!\s).)*$/), // <-- must be true
    check('clientversion', 'This clientversion cannot be use because it contain "-"')
        .exists()
        .matches(/^((?!\-).)*$/),
    check('clientversion', 'This clientversion cannot be use because it contain "."')
        .exists()
        .matches(/^((?!\.).)*$/),
    //password 1 = password 2 <- yes idk how
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('info', {
            title: "Update Failed.",
            header: "Error occur while trying to register.",
            description: JSON.stringify(errors.array())
        });
    }
    const uid = await req.body.uid;
    const sessionID = await req.body.sessionID;
    const clientname = await req.body.clientname;
    const clientversion = await req.body.clientversion;
    const clientdescription = await req.body.clientdescription;
    const clientjar = await req.body.clientjar;
    const clientjson = await req.body.clientjson;

    const adduser = await req.body.adduser;
    const removeuser = await req.body.removeuser;

    if(adduser != null){
        let findAdd = await User.find({
            uid: adduser
        });
        if(findAdd){
            await User.findOneAndUpdate({
                uid: adduser
            },
            {
                $push: {
                    clientOwned: clientname
                },
            },
            {
                
            });
        }
    }
    
    if(removeuser != null){
        let findRemove = await User.find({
            uid: removeuser
        });
    }

    let findDevClient = await Client.findOne({
        clientDevelopersUID: uid
    });

    if (findDevClient) {
        findDevClient.overwrite({
            clientName: clientname,
            clientVersion: clientversion,
            clientDescription: clientdescription,
            clientJarDownload: clientjar,
            clientJsonDownload: clientjson,
            clientLastUpdate: Date.now(),
            clientDevelopersUID: findDevClient.clientDevelopersUID
        });
        await findDevClient.save();
    } else {
        return res.send("sex");
    }

    return res.redirect("/developerpanel/" + sessionID)

});

/*
* Client API Process
*/

app.get('/api/session/:session/userinfo', async (req, res) => {
    let ip = req.headers['cf-connecting-ip'];
    
    let findSession = await Session.findOne({
        sessionID: req.params.session,
        sessionType: "user"
    });

    if (findSession) {
        if (findSession.sessionExpired < Date.now()) {
            findSession.deleteOne();
            return res.json({ status: "Error", reason: "Session expired please login again." });
        }

        let findUser = await User.findOne({
            discordID: findSession.sessionUserDiscordID
        });

        let findSessionIP = await Session.findOne({
            //sessionIP: SHA512Encrtption.encrypt(ip).toString(),
            sessionID: req.params.session,
            sessionType: "user"
        });

        if(AESEncryption.decrypt(findUser.username, findUser.amongusKey, findUser.amongusIV) == "MOS"){
            return res.json({ status: "Success", username: AESEncryption.decrypt(findUser.username, findUser.amongusKey, findUser.amongusIV), uid: findUser.uid, discordUser: AESEncryption.decrypt(findUser.discordUser, findUser.amongusKey, findUser.amongusIV), hwid: AESEncryption.decrypt(findUser.hwid, findUser.amongusKey, findUser.amongusIV), ownedClient: findUser.clientOwned });
        }else if (findSessionIP) {
            return res.json({ status: "Success", username: AESEncryption.decrypt(findUser.username, findUser.amongusKey, findUser.amongusIV), uid: findUser.uid, discordUser: AESEncryption.decrypt(findUser.discordUser, findUser.amongusKey, findUser.amongusIV), hwid: AESEncryption.decrypt(findUser.hwid, findUser.amongusKey, findUser.amongusIV), ownedClient: findUser.clientOwned });
        }else{
            return res.json({ status: "Error", reason: "Session expired or invalid please login again (IP).", dev: SHA512Encrtption.encrypt(ip).toString() });
        }
    } else {
        return res.json({ status: "Error", reason: "Session expired or invalid please login again.", dev: SHA512Encrtption.encrypt(ip).toString() });
    }
});

app.get('/api/session/:session/updatehwid/:newhwid', async (req, res) => {

    let findSession = await Session.findOne({
        sessionID: req.params.session,
        sessionType: "user"
    });

    if (findSession) {
        if (findSession.sessionExpired < Date.now()) {
            findSession.deleteOne();
            return res.json({ status: "Error", reason: "Session expired please login again." });
        }

        let findUser = await User.findOne({
            discordID: findSession.sessionUserDiscordID
        });
        const perUserKey = findUser.amongusKey;
        const perUserIV = findUser.amongusIV;

        findUser.overwrite({
            userType: {
                ClientDevelopers: findUser.userType.ClientDevelopers,
                Developers: findUser.userType.Developers,
                Staff: findUser.userType.Staff,
                Owner: findUser.userType.Owner,
            },
            discordID: findUser.discordID,
            discordUser: findUser.discordUser,
            username: findUser.username,
            password: findUser.password,
            hwid: AESEncryption.encrypt(req.params.newhwid, perUserKey, perUserIV),
            uid: findUser.uid,
            dateRegister: findUser.dateRegister,
            lastLogin: findUser.lastLogin,
            clientOwned: findUser.clientOwned,
            amongusKey: perUserKey,
            amongusIV: perUserIV
        })

        await findUser.save();

        return res.json({ status: "Success" });
    } else {
        return res.json({ status: "Error", reason: "Session expired or invalid please login again." });
    }
});

app.get('/api/storage/installer', async (req, res) => {
    return res.download('./storage/UwU_Protection_Installer.jar');
    /*fs.readFile('./storage/DefaultJson.json', 'utf8', function(err, data) {
        res.send(data)
    });*/
})

app.get('/api/storage/json/myth', async (req, res) => {
    return res.download('./storage/Myth.json');
    /*fs.readFile('./storage/DefaultJson.json', 'utf8', function(err, data) {
        res.send(data)
    });*/
})

app.get('/api/storage/client/:clientname', async (req, res) => {
    let findClient = await Client.findOne({
        clientName: req.params.clientname
    });

    if(findClient){
        return res.json({ status: "Success", clientname: findClient.clientName, clientversion: findClient.clientVersion, clientDescription: findClient.clientDescription, clientJarDownload: findClient.clientJarDownload, clientJsonDownload: findClient.clientJsonDownload, clientLastUpdate: findClient.clientLastUpdate })
    }else{
        return res.json({ status: "Error", error: "Client not found" })
    }

})

app.get('/api/storage/client/myth/haram/:sessionID', async (req, res) => {
    let ip = req.headers['cf-connecting-ip'];

    let findSession = await Session.findOne({
//        sessionIP: SHA512Encrtption.encrypt(ip).toString(),
        sessionID: req.params.sessionID,
        sessionType: "user"
    });
    if (findSession.sessionExpired < Date.now()) {
        findSession.deleteOne();
        return res.send("Session expired please login again.")
    }

    if(findSession){
        let usersOwn = await User.find({
            discordID: findSession.sessionUserDiscordID,
            clientOwned: ["Myth"]
        });
        if(usersOwn){
               return res.download('./storage/Myth.jar');
        }else return res.send("nice try");
         
    }else return res.send("nice try");
    /*fs.readFile('./storage/DefaultJson.json', 'utf8', function(err, data) {
        res.send(data)
    });*/
})

app.listen(port, () => {
    console.log(`Start Compleate ${port}`);
});

async function getUID() {
    const j = await User.find({});
    return j.length + 1;
}

async function getCount() {
    const j = await User.find({});
    return j.length;
}

function timeToMinutes(time) {
    var hours = (new Date(time)).getHours() * 60;
    var minutes = (new Date(time)).getMinutes();
    time = hours + minutes;
    return time;
}
