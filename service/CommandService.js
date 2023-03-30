const DAO = require("../dao/DAO");
const fs = require('fs');
const Command = require("../model/Command");


class CommandService {

    constructor() {

    }

    async getCommands(id) {
        let result = await new DAO().getAllCommandsForUser(id)
        return result
    }

    async modifyCommand(userid, command, message){
        if(message === "" || command === ""){
            throw Error("Blank command or message")
        }

        if(message.length > 500 || command.length > 100){
            throw Error("Too long command or message")
        }
        let result = await new DAO().getCommandByUserIdAndCommand(userid,command)
        const cmd = new Command()
        cmd.command=command
        cmd.result=message
        cmd.userid=userid

        if(result===undefined){
            await this.createCommand(cmd)
        }else{

            await this.updateCommand(cmd)
        }
    }

    async deleteCommand(userid,command){
        const cmd = new Command()
        cmd.command=command
        cmd.result=""
        cmd.userid=userid
        await new DAO().deleteCommand(cmd)
    }


    async createCommand(cmd){
        await new DAO().createCommand(cmd)
    }

    async updateCommand(cmd){
        await new DAO().updateCommand(cmd)
    }


}

module.exports = CommandService;