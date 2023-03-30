class DAO {
    constructor() {}

    async getUsers() {
        let query = await db.collection('user').get()
        let users = [];
        await query.forEach(doc=>{
            users.push(doc.data())
        })
        return users
    }

    async getUserById(id) {
        let docRef = db.collection('user').doc(id);
        let doc = await docRef.get()
        if(!doc.exists) return null
        return doc.data()
    }

    async getCommandByUserIdAndCommand(id, command){
        let commandRef = db.collection("command")
        let queryRef = await commandRef.where("userid", "==", id).where("command", "==", command)
        let query = await queryRef.get()
        let data;
        await query.forEach(doc => {
            data = doc.data()
        })
        return data

    }

    async getAllCommandsForUser(id) {
        let commandRef = db.collection("command")
        let query = await commandRef.where("userid", "==", id).get()
        let result = []
        query.forEach(doc => {
             result.push(doc.data())
        })
        return result
    }

    async createUser(user) {
        let checkIfExist = await this.getUserById(user.id)
        if(checkIfExist!==null) throw Error("Already existing user in database")
        let userRef = db.collection("user").doc(user.id)
        await userRef.set({
            userid: user.id,
            username: user.username,
            email: user.email,
            access_token: user.access_token,
            refresh_token: user.refresh_token,
            id_token: user.id_token
        })
    }

    async updateUser(user) {
        let userRef = db.collection("user").doc(user.id)
        await userRef.set({
            userid: user.id,
            username: user.username,
            email: user.email,
            access_token: user.access_token,
            refresh_token: user.refresh_token,
            id_token: user.id_token
        })
    }

    async createCommand(cmd) {
        let checkIfExist = await this.getCommandByUserIdAndCommand(cmd.userid,cmd.command)
        if(checkIfExist!==undefined) return
        let commandRef = db.collection("command").doc()
        await commandRef.set({
            userid: cmd.userid,
            command: cmd.command,
            result: cmd.result
        })
    }

    async updateCommand(cmd) {
        let query = await db.collection("command").where("command","==",cmd.command).where("userid","==",cmd.userid).get()
        let commandRef;
        query.forEach(doc =>{
            commandRef = db.collection("command").doc(doc.id)
        })
        await commandRef.update({
            result: cmd.result
        })
    }

    async deleteCommand(cmd) {
        let query = await db.collection("command").where("command","==",cmd.command).where("userid","==",cmd.userid).get()
        let commandRef;
        query.forEach(doc =>{
            commandRef = db.collection("command").doc(doc.id)
        })
        await commandRef.delete()
    }

    async deleteUserById(id) {
        await db.collection("user").doc(id).delete()
    }

    async addRefreshToken(id, token) {
        let sessionRef = db.collection("session").doc(id)
        await sessionRef.set({
            refresh_token: token
        })
    }

    async getRefreshTokenByToken(token) {
        let query = await db.collection("session").where("refresh_token","==",token).get()
        let tokenData;
        query.forEach(doc =>{
            tokenData = doc.data()
        })
        return tokenData
    }

    async getRefreshTokenById(id) {
        let tokenDoc = await db.collection("session").doc(id).get()
        return tokenDoc.data()
    }

    async createAlertBox(userid, type, message, volume, duration, ttsVolume, imageFileName, audioFileName) {
        let checkIfExist = await this.getAlertBox(userid,type)
        if(checkIfExist!==undefined) return
        let alertBoxRef = db.collection("alertbox").doc()
        await alertBoxRef.set({
            userid, type, message, volume, duration, ttsVolume, imageFileName, audioFileName
        })
    }

    async createChannelPoint(userid, type, ttsVolume) {
        let checkIfExist = await this.getAlertBox(userid,type)
        if(checkIfExist!==undefined) return
        let alertBoxRef = db.collection("alertbox").doc()
        await alertBoxRef.set({
            userid, type, ttsVolume
        })
    }

    async updateAlertBox(userid, type, message, volume, duration, ttsVolume, imageFileName, audioFileName) {
        let query = await db.collection("alertbox").where("userid","==",userid).where("type","==", type).get()
        let alertBoxRef;
        query.forEach(doc => {
            alertBoxRef = db.collection("alertbox").doc(doc.id)
        })
        await alertBoxRef.update({
            userid, type, message, volume, duration, ttsVolume, imageFileName, audioFileName
        })
    }

    async updateChannelPoint(userid, type, ttsVolume) {
        let query = await db.collection("alertbox").where("userid","==",userid).where("type","==", type).get()
        let alertBoxRef;
        query.forEach(doc => {
            alertBoxRef = db.collection("alertbox").doc(doc.id)
        })
        await alertBoxRef.update({
            userid, type, ttsVolume
        })
    }

    async getAlertBox(userid, type) {
        let query = await db.collection("alertbox").where("userid","==",userid).where("type","==", type).get()
        let alertBoxData;
        query.forEach(doc => {
            alertBoxData = doc.data()
        })
        return alertBoxData
    }

    async getFileFromStorage(directory,filename){
        let result = await storage.file(`uploads/${directory}/${filename}`).download()
        return result[0]
    }

    async uploadFileToStorage(directory,filename,file){
        await storage.file(`uploads/${directory}/${filename}`).save(file)
    }

    async removeFileFromStorage(directory,filename){
        await storage.file(`uploads/${directory}/${filename}`).delete()
    }

    async getFileUrlFromStorage(directory,filename,filetype){
        let result = await storage.file(`uploads/${directory}/${filename}.${filetype}`).getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        })
        return result[0]
    }
}

module.exports = DAO;