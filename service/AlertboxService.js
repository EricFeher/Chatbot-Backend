const DAO = require("../dao/DAO");
const fs = require('fs');


class AlertboxService {

    constructor() {}

    async saveAlertBox(id, type, image, audio, message, volume, ttsvolume, duration) {
        let result = await new DAO().getAlertBox(id, type)
        let imageName = image?.name || result?.imageFileName || "default.gif"
        let audioName = audio?.name || result?.audioFileName || "default.mp3"

        if(message.length>300){
            throw Error("Message size is too big max 300 character")
        }
        if(imageName.length>1000){
            throw Error("Image Name size is too big max 1000 character")
        }
        if(audioName.length>1000){
            throw Error("AudioName size is too big max 1000 character")
        }

        if (image !== undefined) {
            let result = await this.saveFile(image, id, type, "gif")
            if (!result) throw Error("File size was too big or file type was bad")
        }
        if (audio !== undefined) {
            let result = await this.saveFile(audio, id, type, "mp3")
            if (!result) throw Error("File size was too big or file type was bad")
        }


        if (result === undefined) {
            await new DAO().createAlertBox(id, type, message, volume, duration, ttsvolume, imageName, audioName)
        } else {
            await new DAO().updateAlertBox(id, type, message, volume, duration, ttsvolume, imageName, audioName)
        }
    }

    async saveChannelPoint(id, type, ttsvolume) {
        let result = await new DAO().getAlertBox(id, type)

        if (result === undefined) {
            await new DAO().createChannelPoint(id, type, ttsvolume)
        } else {
            await new DAO().updateChannelPoint(id, type, ttsvolume)
        }
    }

    async saveFile(file, id, alertType, fileType) {
        if (file.name.split(".").pop().toLowerCase() !== fileType) return false
        if (file.size > 2000000) return false

        const directory = fileType === "mp3" ? "audio" : "image"
        const filename = `${id}_${alertType}.${fileType}`
        await new DAO().uploadFileToStorage(directory,filename, file.data)
        await fs.writeFile(`./public/uploads/${directory}/${id}_${alertType}.${fileType}`, file.data, (error) => {
            if (error) {
                console.log(error);
            } else return true;
        });
        return true;
    }
}

module.exports = AlertboxService;