const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config()

const Twitch = require("./events/Twitch");
const DAO = require("./dao/DAO");
const UserManagementController = require("./controller/UserManagementController");
const TwitchController = require("./controller/TwitchController");
const AlertboxController = require("./controller/AlertboxController");
const CommandsController = require("./controller/CommandsController");
const AlertWebSocket = require("./socket/AlertWebSocket")

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./config/serviceAccountKey.json');
const TwitchService = require("./service/TwitchService");




class Index{
    constructor() {
        this.port = process.env.PORT;
        this.initExpress()
        this.initFirebase()
        this.start();
        this.listen();
    }

    initExpress(){
        //new TwitchService().deleteAllEventListener()
        global.app = express();
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
    }

    initFirebase(){
        initializeApp({
            credential: cert(serviceAccount),
            storageBucket: "gs://chatbot-for-twitch.appspot.com"
        })
        global.db = getFirestore()
        global.storage = getStorage().bucket()
    }

    start(){
        new DAO().getUsers().then((data) => {
            let result="";
            data.forEach((object)=>{
               result+="#"+object.username+",";
            });
            result=result.slice(0,-1)
            console.log(result)
            global.twitch=new Twitch(result);
            this.setUpControllerClasses()
            this.setUpAlertWebSocket()
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

    setUpAlertWebSocket(){
        global.alertWebSocket = new AlertWebSocket()
    }
}

new Index();
