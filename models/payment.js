import mongoose from "mongoose";

const schema = new mongoose.Schema({

    razorpay_signature:{
        type:String,
        required:true,
    },
    
    razorpay_payment_id:{
        type:String,
        required:true,
    }, 

    razorpay_subscription_id:{
        type:String,
        required:true,
    },

    createdAt: {
        type:Date,
        default: Date.now,
    }


}); //here we will create our schema 

export const Payment = mongoose.model('Payment', schema); //model name is User 