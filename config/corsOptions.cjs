const allowedOrigins=require("./allowedOrigins.cjs")
const corsOptions={

    origin:(origin,callback)=>{
        if(allowedOrigins.indexOf(origin)!==-1||!origin){
         callback(null,true)   
        }else{
            callback(new Error("not allowed by CORS"))
        }
    },
    credentials:true,
    OptionsSuccessStatus:200
}
module.exports=corsOptions