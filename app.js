import express from 'express';
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js"
import cookieParser from 'cookie-parser';
import cors from "cors"

config({
    path: "./config/config.env"
});

const app = express();


//using middlwares to handle json data and Url encoded form data 
app.use(express.json()); 
app.use(
    express.urlencoded({
        extended: true,  //to make req.body.name to be treated as string instead of object if it is not provided in the request body
    })
);

app.use(cookieParser());  //to use cookies in express app


//so yha pe hmme kuch chize dene hai otherwise hm cookies transfer nahi kr payengee , so credentials hmme mandatory hai jo hmme true krne hai 
app.use(
    cors({
    origin:process.env.FRONTEND_URL,
    credentials:true, //ye true rkhana hai otherwise nahi kr payenge send cookies ko 
    methods: ['GET', 'POST', 'PUT', 'DELETE']
})
);//Ye kis Liye hai agr ye hm na de to es server se 2sri website pe hm request hi nahi kr payengee , or ye jo hmne origin pass kiya hai frontend ka url bass isii website ko allow hai ye sari api use krne , otherwise koi nahi kr payegii

//default route set 
app.get("/", (req,res)=>{
    res.send(`<h1>Site is Working. click <a href=${process.env.FRONTEND_URL}>here</a> to visit frontend.</h1>`)
})




//Importing and using Routes 

import course from "./routes/courseRoutes.js"
import user from "./routes/userRoutes.js"  
import payment from "./routes/paymentRoutes.js"
import other from "./routes/otherRoutes.js"

app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1/", payment);
app.use("/api/v1/", other);


export default app;



app.use(ErrorMiddleware);