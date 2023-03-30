const WebSocket = require('ws');
const DAO = require("../dao/DAO");


class AlertWebSocket{

    constructor() {
        this.server = new WebSocket.Server({ port: 8000 });
        this.connectedUsers = {}

        this.initServer()
    }

    initServer(){
        this.server.on('connection', (socket) => {
            console.log('Client connected');

            socket.on('message', (data) => {
                let message = data.toString()
                console.log(`Received message: ${message}`);
                if(message.includes("Connect")){
                    this.connectedUsers[message.split(":")[1].trim()]=socket
                }
            });

            socket.on('close', () => {
                console.log('Client disconnected');
                let userid = ""
                for(let id in this.connectedUsers){
                    if(socket === this.connectedUsers[id]) {
                        userid = id
                        break
                    }
                }
                delete this.connectedUsers[userid]
                console.log(this.connectedUsers)
            });
        });

    }

    async sendChannelPointsEvent(eventType, event){
        let data = await new DAO().getAlertBox(event.broadcaster_user_id, eventType)
        if (data === undefined) {
            data = await new DAO().getAlertBox("default", eventType)
            data.userid=event.broadcaster_user_id
        }
        let mergedData = {
            data, event
        }

        for(let userid in this.connectedUsers){
            if(userid === event.broadcaster_user_id) {
                this.connectedUsers[userid].send(`${JSON.stringify(mergedData)}`)
            }
        }
    }

    async sendEvent(eventType, event){
        let broadcasterID = event.broadcaster_user_id || event.to_broadcaster_user_id
        let data = await new DAO().getAlertBox(broadcasterID, eventType)
        if (data === undefined) {
            data = await new DAO().getAlertBox("default", eventType)
            data.userid=event.broadcaster_user_id
        }
        if(data.audioFileName.indexOf("default")!==-1){
            data["audioUrl"] = await new DAO().getFileUrlFromStorage("audio",`default`,`mp3`)
        }else{
            data["audioUrl"] = await new DAO().getFileUrlFromStorage("audio",`${event.broadcaster_user_id}_${eventType}`,`mp3`)
        }

        if(data.imageFileName.indexOf("default")!==-1){
            data["imageUrl"] = await new DAO().getFileUrlFromStorage("image",`default`,`gif`)
        }else{
            data["imageUrl"] = await new DAO().getFileUrlFromStorage("image",`${event.broadcaster_user_id}_${eventType}`,`gif`)
        }
        let mergedData = {
            data, event
        }

        for(let userid in this.connectedUsers){
            if(userid === broadcasterID) {
                this.connectedUsers[userid].send(`${JSON.stringify(mergedData)}`)
            }
        }
    }
}
module.exports = AlertWebSocket