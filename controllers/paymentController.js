import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { instance } from "../server.js"
import crypto from "crypto";
import { Payment } from "../models/payment.js";


//Buy Suscription
export const buySubscription = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    
    //user jo hai admin hi hai , to use subscription khridne ki kya jrurat hai
    if (user.role === "admin")
        return next(new ErrorHandler("Admin can't buy subscription", 400));
    
    const plan_id = process.env.PLAN_ID || "plan_Ocrx33PQ4LxsHH";
    
    const subscription = await instance.subscriptions.create({
    plan_id ,
    customer_notify: 1,   //subscription start hote hi customer pe msg phuchega basically 
    total_count: 12,  
});

user.subscription = {
    id: subscription.id,
    status: subscription.status
};

// user.subscription.status = subscription.status ese bhi kr sakte hai or object bnake bhi kr sakte hai , same with an id case 

await user.save();

res.status(201).json({
    success: true,
    message: "Subscription purchased successfully",
    subscriptionId: subscription.id, //eske alawa subscription de rha hu mai abhi ke liye , normally hm id pass krenge subscription ki na ki pura subscription
});

});



//payment verification
export const paymentVerification = catchAsyncError(async (req, res, next) => {
    
    const {razorpay_payment_id, razorpay_subscription_id, razorpay_signature} = req.body;
    
    const user = await User.findById(req.user._id);

    const subscription_id = user.subscription.id;

    const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

    //so ab ye jo string bni hai genrated Signature wali ye equivalent hona chahiye es razor pay signature ke 
    const isAuthentic = generated_signature === razorpay_signature;

    //agr authentic hua to hm database mai save krenge , agr authentic nahi hua so again hm return krenge
    if(!isAuthentic) return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`) //ye payment fail hm front end mai bna denge payment ke naam se "/paymentfail", because in react app its fail not failed 


    //database comes here
    //so database mai add krenge agr authentic huaa 
    await Payment.create({  
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id,
    }) //enka kaam aayega refund krne ke time pe , create at hm check kr lenge agr 1 hafte ke andar hi kr rha hai cancel subscription  tab refund kr denge otherwise nahi , ye optional hai , agr nahi rkhna refund ka option to mt rkho 


    //so agr payment verification ho jati hai to user ka jo subscription.status hai usse kr denge active 
    user.subscription.status = "active";

    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`)
                                        //and jab frontend mai bnayenge to query mai se le lenge reference number and dikha denge hm reference number 
                                        //note:    *------------------------------*
});



//front end mai jrurat padti hai ye jo razor pay ka jo key hai uski , ye to frontend mai store kr lo otherwise mai yhaa bhi ek function bna dunga chhota sa jiss se hm send kr payenge razorpay ki id 

export const getRazorPayKey = catchAsyncError(async(req, res, next) => {

    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY,
    })
});


export const cancelSubscription = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    if(!user) return next(new ErrorHandler("'User not found", 404));

    if(!user.subscription || !user.subscription.id) return next(new ErrorHandler("Subscription ID is mandatory",400));

    const subscriptionId = user.subscription.id;
    let refund = false;//intially refund set to false 

    //so obviously phle cancel krte hai subscription 
    await instance.subscriptions.cancel(subscriptionId);

    //so now ab hmme payment model mai se payment find krne hai 
    const payment = await Payment.findOne({ //so eske help se hm dhudh lenge payment wala document basically 
        razorpay_subscription_id: subscriptionId,
    });

    const gap = Date.now() - payment.createdAt;
    // lets assums payment create hui thi 5 ko , ajj date ho rhi hai 7 , gap mil gya 2 din ka 

    const refundTime = process.env.REFUND_DAYS * 24 *60 * 60 * 1000; //TIME MIL GYa 7 din milli seconds mai
    
    // if(!payment.razorpay_payment_id) return next(new ErrorHandler("never got an payment id Yet!!! ", 400)); 

    if(refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id) //esme hmme basically id passs krne hoti hai payment_id
        refund = true; //refund Occured within the refund period 
    }

    // so ab refernce ke number ka mtlb nahi hai kuch usse remove kr dengee 
    await payment.deleteOne();
    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save(); //user ko save kr denge


    res.status(200).json({
        success: true,
        message: refund? "Subscription cancelled , You will receive full refund within 7 days." : "Subscription cancelled , No refund inititated as subscription was cancelled after 7 days."
    })
})
