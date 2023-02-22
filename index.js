const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const router = express.Router()

const Twitch = require("./events/twitch");
const DAO = require("./dao/dao");
const UserManagementController = require("./controller/UserManagementController");
const TwitchController = require("./controller/TwitchController");
const AlertboxController = require("./controller/AlertboxController");
const CommandsController = require("./controller/CommandsController");
require('dotenv').config()

//TODO: Make exceptions which sites can reach it
/*app.use(cors({
    origin: ['http://example.com', 'https://example.com']
}));*/


class Index{
    constructor() {
        global.app = express();
        global.router = router;
        this.port = process.env.PORT;
        app.use(fileUpload());
        app.use(cors({
            credentials: true,
            origin: ['http://localhost:8080','http://localhost:3000', process.env.REDIRECT_URI, process.env.BACKEND_URI],
            optionSuccessStatus:200,
        }));
        //(EVENTSUB) Need raw message body for signature verification
        app.use(express.raw({
            type: 'application/json'
        }))
        this.start();
        this.listen();
    }

    start(){
        new DAO().getUsers().then((rows) => {
            let userData = Object.values(JSON.parse(JSON.stringify(rows)));
            let result="";
            userData.forEach((object)=>{
               result+="#"+object["username"]+",";
            });
            result=result.slice(0,-1)
            console.log(result)
            global.twitch=new Twitch(result);
            this.setUpControllerClasses()
        });
    }

    listen(){
        app.listen(this.port, () => {
            console.log(`Example app listening at http://localhost:${this.port}`);
        })
    }

    setUpControllerClasses(){
        new UserManagementController();
        new TwitchController()
        new AlertboxController()
        new CommandsController()
    }

    //TODO: REGISTER USERS TO THE DATABASE
}

new Index();
