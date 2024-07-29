import app from './app.js';  
import { connectDB } from './config/Database.js';
import cloudinary from 'cloudinary';
import RazorPay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from './models/stats.js';

connectDB();

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

//now we will create an instance of razorpay
export const instance = new RazorPay({
    
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET,
    
});



//node cron set 
// set a schedule to create a new stat each month 
nodeCron.schedule("0 0 0 1 * *", async()=> {//in every month this will run 
    try {
        await Stats.create({});
    } catch (error) {
        console.log(error);
    }
})

//only for check purpose data will be created or not 
// const temp = async() => {
//     await Stats.create({});
// }
// temp();

app.listen(process.env.PORT , () => {
    console.log(`Server is working on port: ${process.env.PORT}`);
})









//file import mai 
//note: -> remember agr mai esko save krta hu server chala ke to error aayega , to .js jrur lagana hai   