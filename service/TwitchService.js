const constans = require("../Constants")
const crypto = require('crypto');
const {default: axios} = require("axios");
const DAO = require("../dao/DAO");
const User = require("../model/User");

class TwitchService {

    constructor() {
    }

    getSecret() {
        // TODO: Get secret from secure storage. This is the secret you pass
        // when you subscribed to the event.
        return process.env.SECRET_HMAC;
    }

    /*
    Build the message used to get the HMAC.
     */
    getHmacMessage(request) {
        return (request.headers[constans.TWITCH_MESSAGE_ID] +
            request.headers[constans.TWITCH_MESSAGE_TIMESTAMP] +
            request.body);
    }

    /*
    Get the HMAC  (hash-based message authentication code) .
     */
    getHmac(secret, message) {
        return crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex');
    }

    /*
    Verify whether our hash matches the hash that Twitch passed in the header.
     */
    verifyMessage(hmac, verifySignature) {
        console.log(Buffer.from(hmac) + "\n")
        console.log(Buffer.from(verifySignature) + "\n")
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
    }

    //Needed to sub: secret, callbackurl, user bearer, client id, userid

    subscribeToRequiredEvents(user) {
        for (let eventType of constans.EVENT_TYPES) {
            this.subscribeToTwitchEvent(user.id, user.access_token, eventType)
        }
    }

    subscribeToTwitchEvent(userID, bearer, eventType) {
        let body = {
            "type": `${eventType}`,
            "version": "1",
            "condition": {},
            "transport": {
                "method": "webhook",
                "callback": `${process.env.BACKEND_URI}/eventsub`,
                "secret": `${process.env.SECRET_HMAC}`
            }
        }

        switch (true) {
            case eventType.includes("raid"):
                body["condition"]["to_broadcaster_user_id"] = `${userID}`
                break
            case eventType.includes("revoke"):
                body["condition"]["client_id"] = `${process.env.CLIENT_ID}`
                break
            case eventType.includes("user"):
                body["condition"]["user_id"] = `${userID}`
                break
            case eventType.includes("channel"):
                body["condition"]["broadcaster_user_id"] = `${userID}`
                break
        }

        let header = {
            headers: {
                "authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
                "client-id": `${process.env.CLIENT_ID}`,
                "content-type": "application/json"
            }
        }

        axios.post('https://api.twitch.tv/helix/eventsub/subscriptions', body, header)
            .then((response) => {
                console.log("[TWITCHSERVICE]: " + response.toString())
            })
            .catch((err) => {
                throw Error("[TWITCHSERVICE]: " + err.toString())
            })
    }

    decideEventType(notification) {
        let type = notification.subscription.type
        let event = notification.event
        switch (type) {
            case constans.FOLLOW_EVENT_TYPE:
                this.followEventHandler(event)
                break
            case constans.SUBSCRIPTION_EVENT_TYPE:
                this.subscribeEventHandler(event)
                break
            case constans.RESUBSCRIPTION_MESSAGE_EVENT_TYPE:
                this.reSubscriptionEventHandler(event)
                break
            case constans.SUBSCRIPTION_GIFT_EVENT_TYPE:
                this.subscriptionGiftEventHandler(event)
                break
            case constans.CHANNEL_POINT_REDEMPTION_EVENT_TYPE:
                this.channelPointEventHandler(event)
                break
            case constans.RAID_EVENT_TYPE:
                this.raidEventHandler(event)
                break
            case constans.CHEER_EVENT_TYPE:
                this.cheerEventHandler(event)
                break
            case constans.USER_UPDATE_EVENT_TYPE:
                this.userUpdateEventHandler(event)
                break
            case constans.ACCESS_REVOKED_EVENT_TYPE:
                this.accessRevokeEventHandler(event)
                break
            default:
                console.log("[TWITCHSERVICE]: Unkown event type: " + type)
        }
    }

    followEventHandler(event) {
        console.log(`[FOLLOWEVENT]:`)
        global.alertWebSocket.sendEvent("follow",event)
    }

    subscribeEventHandler(event) {
        console.log(`[SUBSCRIBEEVENT]:`)
        if(event.is_gift) return
        global.alertWebSocket.sendEvent("subscription", event)
    }

    reSubscriptionEventHandler(event) {
        console.log(`[RESUBSCRIBEEVENT]:`)
        global.alertWebSocket.sendEvent("resub", event)
    }

    subscriptionGiftEventHandler(event) {
        console.log(`[SUBSCRIBEGIFTEVENT]:`)
        global.alertWebSocket.sendEvent("subgift", event)
    }

    channelPointEventHandler(event) {
        console.log(`[CHANNELPOINTEVENT]:`)
        if((event.reward?.title==="Read Message" || event.reward?.title==="Test Reward from CLI") && event.user_input!=="")
            global.alertWebSocket.sendChannelPointsEvent("channelPoints", event)
        //TODO: Create channel point event logic
    }

    raidEventHandler(event) {
        console.log(`[RAIDEVENT]:`)
        global.alertWebSocket.sendEvent("raid", event)
    }

    cheerEventHandler(event) {
        console.log(`[CHEEREVENT]:`)
        global.alertWebSocket.sendEvent("cheer", event)
    }

    userUpdateEventHandler(event) {
        new DAO().getUserById(event.user_id).then((data) => {
            if (data === undefined) {
                return
            }
            let user = new User(data.userid, event.user_login, data.email,
                data.access_token, data.refresh_token, data.id_token)
            new DAO().updateUser(user)
                .then(() => {
                    console.log("[TWITCHSERVICE]: User successfully updated by change in his profile")
                })
                .catch((err) => {
                    console.log("[TWITCHSERVICE]: " + err.message)
                })
        });
    }

    accessRevokeEventHandler(event) {
        new DAO().deleteUserById(event.user_id)
            .then(() => {
                console.log("[ACCESREVOKEEVENT]: User with user id successfully deleted: " + event.user_id);
            })
            .catch(() => {
                console.log("[ACCESREVOKEEVENT]: User with user id wasn't deleted: " + event.user_id);
                }
            )
    }

    //NOTE: Deletes all listeners, great for cleaning up after development
    deleteAllEventListener(){
        let header = {
            headers: {
                "authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
                "client-id": `${process.env.CLIENT_ID}`,
                "content-type": "application/json"
            }
        }
        axios.get("https://api.twitch.tv/helix/eventsub/subscriptions", header)
            .then((result)=>{
            for(let data of result.data.data){
                this.deleteEventListenerAfterRevoked(data.id)
            }
        }).catch((error)=>{
            console.log("[TWITCHSERVICE]: Error Getting Eventlistener Data: #"+error);
        });
    }

    deleteEventListenerAfterRevoked(id){
        let header = {
            headers: {
                "authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
                "client-id": `${process.env.CLIENT_ID}`,
                "content-type": "application/json"
            },
            params: {
                id: id
            }
        }

        axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions`, header)
            .then(() => {
                console.log("[TWITCHSERVICE]: Subsription successfully deleted with id: " + id)
            })
            .catch((err) => {
                console.log("[TWITCHSERVICE]: Subsription was not deleted with id: " + id + " - Error: "+ err)
            })
    }

    async getUserBearerToken(code){
        let client_id=process.env.CLIENT_ID;
        let client_secret=process.env.SECRET_ID;
        let grant_type="authorization_code";
        let redirect_uri=process.env.REDIRECT_URI+"/auth";
        return await axios.post('https://id.twitch.tv/oauth2/token', null,{
            params:{
                client_id,
                client_secret,
                code,
                grant_type,
                redirect_uri
            }
        })
    }

    async getUserInfo(access_token){
        return await axios.get("https://id.twitch.tv/oauth2/userinfo", {
            headers:{
                "Content-Type": "application/json",
                "Authorization": "Bearer "+access_token
            }
        })
    }
}

module.exports = TwitchService;

//TODO: https://dev.twitch.tv/docs/eventsub