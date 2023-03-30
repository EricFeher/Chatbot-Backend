const AlertboxService = require("../service/AlertboxService");
const gTTS = require('gtts');


class AlertboxController {


    constructor() {
        this.alertboxService = new AlertboxService()
        this.alertBoxFollowChange()
        this.alertBoxTTS()
    }

    alertBoxFollowChange() {
        app.post('/editFollow', async (req, res) => {
            const type = req.body.type
            const id = req.body.id
            const ttsvolume = req.body.tts || null

            if(type==="channelPoints"){
                try{
                    await this.alertboxService.saveChannelPoint(id,type,ttsvolume)
                } catch(err){
                    return res.send({status:400, message:err.message})
                }
                return
            }

            const image = req.files?.image
            const audio = req.files?.audio
            const message = req.body.message || ""
            const volume = req.body.volume
            const duration = req.body.duration

            try{
                await this.alertboxService.saveAlertBox(id, type, image, audio, message, volume, ttsvolume, duration)
            } catch (err){
                return res.send({status:400, message:err.message})
            }

        })
    }

    alertBoxTTS(){
        app.get('/alertBoxTts', async (req, res) => {
            const message = req.query.text;
            const gttsBuffer = await new Promise((resolve, reject) => {
                const gtts = new gTTS(message, 'en');
                const gttsStream = gtts.stream()
                const chunks = [];
                gttsStream.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                gttsStream.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
                gttsStream.on('error', (err) => {
                    reject(err);
                });
            });
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': gttsBuffer.length
            });
            res.send(gttsBuffer)
        })
    }
}

module.exports = AlertboxController;

//TODO: https://dev.twitch.tv/docs/eventsub