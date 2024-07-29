import express from 'express';
import { config } from "dotenv";
import ErrorMiddleware from "./middlewares/Error.js"
import cookieParser from 'cookie-parser';

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



app.get("/", (req,res)=>{
    res.send("Nice working")
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