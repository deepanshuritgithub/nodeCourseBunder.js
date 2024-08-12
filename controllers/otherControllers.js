import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {sendEmail} from "../utils/sendEmail.js";
import { Stats } from "../models/stats.js"; 



export const contact = catchAsyncError(async(req, res, next) => {

    const { name, email, message } = req.body;

    if(!name || !email || !message) 
        return next(new ErrorHandler("All fields are mandatory",400));

    //chahe to isko database mai save krayee pr hm email kr denge to ko 
    const to = process.env.MY_MAIL
    const subject = "Contact from CourseBunder";
    const text = `I am ${name} and my Email is ${email}. \n ${message} `;

    await sendEmail(to, subject, text)

    res.status(200).json({
        success: true,
        message: "Your contact has been sent.",
    })
});


export const courseRequest = catchAsyncError(async(req, res, next) => {

    const {name, email , course }= req.body;
    if(!name || !email || !message)
        return next(new ErrorHandler("All fields are mandatory",400));
    const to = process.env.MY_MAIL
    const subject = "Request for a course on CourseBunder";
    const text = `I am ${name} and my Email is ${email}. \n ${course} `;

    await sendEmail(to, subject, text)

    res.status(200).json({
        success: true,
        message: "Your request has been sent.",
    })
    res.status(200).json({
        success: true,
        message: "Contact form submitted successfully",
    })
});



export const getDashboardStats = catchAsyncError(async(req, res, next) => {

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(12); //so hm le lenge puri array stats ki 

    //abhi to database mai kya hai ki ek hi data hai , so esme kya krenge hme array tab bhi 12 ki bhjni hai , hmme har mhine ka dena hai data 

    const statsData = [];
    //pta lagayange kitna chahiye , 12 hmme chahiye 
    
    for(let i = 0 ; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }
    
    const requiredSize = 12 - stats.length; 
    //so mtlb 11 chahiye hmme or esme add krne ke liye statsData mai add krne ke liye


    for(let i = 0 ; i < requiredSize; i++) { //bache hue 11 , 11 baar loop chlaegaa, 11jo bache hue 2sre element honge usme 0 ho jayenge by default users , subscription , views 

        statsData.unshift({ //so push krne se end mai add hota hai , hmme starting mai add krna hai , so we use unshift
            users: 0,
            subscription: 0,
            views : 0,
        });
    }
                        //stats data ka jo last element hoga , mtlb 11 , 0 se start hota hai 
    const usersCount = statsData[11].users; //last element mai users wala jo field hai vo chahhiyee..
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[11].views;

    let usersPercentage = 0,
    viewsPercentage = 0, 
    subscriptionPercentage = 0;

    //profit ka hua ya nahi kese pta lagegaa , so abhi ke liye assume kr lete hai 
    let usersProfit = true,
    viewsProfit = true, 
    subscriptionProfit = true
    
    //SUPPOSE abhi hai 20 user , last mahine the 15 user , so base kise banaoge, obviouse se baat hai last month wala ko banaogee 
    // 20-15/15 *100

    //suppose jaise 11 chl rha hai july , july se phhle wala , jiss se hm compare krengee , kyuki percentage nikalna hai  
    if(statsData[10].users === 0) usersPercentage = usersCount * 100;
    //ye kya kiya maine suppose es mahine 20 user aaye hai , pichle mai 0 the , to eska mtlb mai divide ku krke dekhu , agr mai krta hu to obvious se baat hai divide glt ho jayega or kya hoga ki vo infinite ho jayega, so vo mai nahi chahhta esa , so es lia mai compare bhi nahi krunga, agr last mahie ke user 0 hai to mai direct multiply kra dungaa , ki kitne percent growth aayi hai , so vahi kiya hai , 20 * 100  , yahi to hoga vese bhi 
    if(statsData[10].views === 0) viewsPercentage = viewsCount * 100;
    if(statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount * 100;
    
    else {
        //maai phle to ek object bnaongaa 
        const difference = {
            //esme 3no ka difference hoga 20 - 15 wala case jo smjhaya tha 
            users: statsData[11].users - statsData[10].users,
            views: statsData[11].views - statsData[10].views,
            subscription: statsData[11].subscription - statsData[10].subscription,

        };

        usersPercentage = difference.users / statsData[10].users * 100;
        viewsPercentage = difference.views / statsData[10].views * 100;
        subscriptionPercentage = difference.subscription / statsData[10].subscription * 100;

        if(usersPercentage < 0 ) usersProfit = false;
        if(viewsPercentage < 0 ) viewsProfit = false;
        if(subscriptionPercentage < 0 ) subscriptionProfit = false;

    } 


    res.status(200).json({
        success: true,
        stats: statsData,//so ye pure saal ka 
        usersCount, //or ye specially last mahine ke count  kyuki hmne usse unshift kra hai starting mai sare 0 wala honge or 0 se start hota hai , 
        subscriptionCount,
        viewsCount,
        subscriptionPercentage,
        viewsPercentage, 
        usersPercentage,
        subscriptionProfit, 
        viewsProfit,
        usersProfit,
    })
});


