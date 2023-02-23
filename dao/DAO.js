const mysql = require("mysql2/promise");
const bluebird = require('bluebird');
const User = require("../model/User");
const Command = require("../model/Command");

class DAO {
    constructor() {}

    getConnection(){
        return null
    }

    async getUsers() {
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT * FROM `users`', []);
        return rows;*/
        return {}
    }

    getUserDocById(id){
        return db.collection('users').doc(id);
    }

    async getUserById(id) {
        let docRef = this.getUserDocById(id)
        let doc = await docRef.get()
        if(!doc.exists) return null
        return doc.data()
    }

    async getCommandByIdAndCommand(id, command){
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT * FROM `commands` WHERE `command` LIKE ? AND `userid` LIKE ?'
            , [command, id]);
        return rows;*/

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
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT `command`,`result` FROM `commands` WHERE `commands`.`userid` LIKE ?'
            , [id]);
        return rows;*/
        let commandRef = db.collection("command")
        let query = await commandRef.where("userid", "==", id).get()
        let result = []
        query.forEach(doc => {
             result.push(doc.data())
        })
        return result
    }

    async createUser(user) {
        /*await (await this.getConnection()).execute(
            'INSERT INTO `users` (`id`,`username`,`email`,`access_token`,`refresh_token`,`id_token`) ' +
            'VALUES (?,?,?,?,?,?)'
            , [user.id, user.username, user.email, user.access_token, user.refresh_token, user.id_token]);*/
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
        /*await (await this.getConnection()).execute(
            'UPDATE `users` SET `username`=?, `email`=?, `access_token`=?, `refresh_token`=?, `id_token`=? ' +
            'WHERE `id`=?'
            , [user.username, user.email, user.access_token, user.refresh_token, user.id_token, user.id]);*/
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
        /*await (await this.getConnection()).execute(
            'INSERT INTO `commands` (`userid`,`command`,`result`) VALUES (?,?,?)'
            , [cmd.userid, cmd.command, cmd.result]);*/
        let commandRef = db.collection("command").doc()
        await commandRef.set({
            userid: cmd.userid,
            command: cmd.command,
            result: cmd.result
        })
    }

    async updateCommand(cmd) {
        /*await (await this.getConnection()).execute(
            'UPDATE  `commands` SET `result`=? WHERE `command`=? AND `userid`=?',
            [cmd.result, cmd.command, cmd.userid]);*/
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
        /*await (await this.getConnection()).execute(
            'DELETE FROM `commands` WHERE `command` LIKE ? AND `userid` LIKE ?',
            [cmd.command, cmd.userid]);*/
        let query = await db.collection("command").where("command","==",cmd.command).where("userid","==",cmd.userid).get()
        let commandRef;
        query.forEach(doc =>{
            commandRef = db.collection("command").doc(doc.id)
        })
        await commandRef.delete()
    }

    async deleteUserById(id) {
        /*await (await this.getConnection()).execute(
            'DELETE FROM `users` WHERE `id`=?', [id]);*/
    }

    async addRefreshToken(id, token) {
        /*await (await this.getConnection()).execute(
            'INSERT INTO `sessions` (`id`,`refresh_token`) VALUES (?,?)'
            , [id, token]
        )*/
    }

    async getRefreshTokenByToken(token) {
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT `id`,`refresh_token` FROM `sessions` WHERE `refresh_token` LIKE ?'
            , [token]);
        return rows;*/
        return {}
    }

    async getRefreshTokenById(id) {
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT `id`,`refresh_token` FROM `sessions` WHERE `id` LIKE ?'
            , [id]);
        return rows;*/
        return {}
    }

    async createAlertBox(userid, type, message, volume, duration, ttsvolume, imagefilename, audiofilename) {
        /*let result = await (await this.getConnection()).execute(
            'INSERT INTO `alertbox` (`userid`,`type`,`message`,`volume`,`duration`,`tssvolume`,`imagefilename`,`audiofilename`) VALUES (?,?,?,?,?,?,?,?)'
            , [userid, type, message, volume, duration, ttsvolume, imagefilename,audiofilename]
        )
        return result*/
        return {}
    }

    async updateAlertBox(userid, type, message, volume, duration, ttsvolume, imagefilename, audiofilename) {
        /*let result = await (await this.getConnection()).execute(
            'UPDATE `alertbox` SET `message`=?, `volume`=?, `duration`=?, `tssvolume`=?, `imagefilename`=?, `audiofilename`=? WHERE `userid` LIKE ? AND `type` LIKE ?'
            , [message, volume, duration, ttsvolume, imagefilename, audiofilename, userid, type]
        )
        return result*/
        return {}
    }

    async getAlertBox(userid, type) {
        /*let [rows, fields] = await (await this.getConnection()).execute(
            'SELECT `userid`,`type`,`message`, `volume`, `duration`, `tssvolume`, `imagefilename`, `audiofilename` FROM `alertbox` WHERE `userid` LIKE ? AND `type` LIKE ?'
            , [userid, type]);
        return rows;*/
        return {}
    }
}

module.exports = DAO;