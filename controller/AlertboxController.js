const AlertboxService = require("../service/AlertboxService");
const UserManagementService = require("../service/UserManagementService");
const DAO = require("../dao/DAO");

class AlertboxController {


    constructor() {
        this.alertboxService = new AlertboxService()
        this.userManagementService = new UserManagementService()
        this.alertBoxFollowChange()
    }

    alertBoxFollowChange() {
        app.post('/editFollow', async (req, res) => {
            const image = req.files?.image
            const audio = req.files?.audio
            const type = req.body.type
            const id = req.body.id
            const message = req.body.message || ""
            const volume = req.body.volume
            const duration = req.body.duration
            const ttsvolume = req.body.tts || null
            try{
                await this.alertboxService.saveAlertBox(id, type, image, audio, message, volume, ttsvolume, duration)
            } catch (err){
                return res.send({status:400, message:err.message})
            }

        })
    }
}

module.exports = AlertboxController;

//TODO: https://dev.twitch.tv/docs/eventsub