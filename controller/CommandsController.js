const AlertboxService = require("../service/AlertboxService");
const CommandService = require("../service/CommandService");
const UserManagementService = require("../service/UserManagementService");

class CommandsController {



    constructor() {
        this.commandService = new CommandService()
        this.userManagementService = new UserManagementService()
        this.getCommands()
        this.deleteCommand()
        this.modifyCommand()
    }

    getCommands() {
        app.post('/commands', async (req, res) => {
            let data = JSON.parse(req.body.toString())

            let userid = data.userid || 0
            let result = await this.commandService.getCommands(userid)
            res.send( {status:200 ,data: result})
        })
    }

    deleteCommand(){
        app.post('/deleteCommand', async (req, res) => {
            let data = JSON.parse(req.body.toString())

            let userid = data.userid || 0
            let command = data.command || ""
            await this.commandService.deleteCommand(userid,command)
            res.send( {status:200 })
        })
    }

    modifyCommand(){
        app.post('/modifyCommand', async (req, res) => {
            let data = req.body
            let userid = data.userid
            let message = data.message
            let command = data.command
            try{
                await this.commandService.modifyCommand(userid,command,message)
                return res.send( {status:200})  
            } catch(err){
                return res.send({status: 400, message: err.message})
            }

        })
    }
}

module.exports = CommandsController;

//TODO: https://dev.twitch.tv/docs/eventsub