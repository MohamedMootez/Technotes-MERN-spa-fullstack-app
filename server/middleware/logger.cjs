const {format} = require ("date-fns")
const {v4:uuid}=require ("uuid")
const fs=require("fs")
const fsPromises =require("fs").promises
const path=require("path")

const logEvents=async(message, logFilenName)=>{
    const dateTime=(format(new Date(),"yyyyMMdd\tHH:mm:ss"))
    const logItem=`${dateTime}\t${uuid()}\t${message}\n`

    try{
        if(!fs.existsSync(path.join(__dirname,"..","logs"))){
            await fsPromises.mkdir(path.join(__dirname,"..","logs"))
        }
        await fsPromises.appendFile(path.join(__dirname,"..","logs",logFilenName),logItem)

    }catch(err){
        console.log("error while appending file",err)
    }

}
const logger=(req,res,next)=>{
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`,"req.log")
    console.log(`${req.method} ${req.path}`)
    next();
}
module.exports={logEvents,logger}