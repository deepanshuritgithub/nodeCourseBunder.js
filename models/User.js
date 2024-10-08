import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from 'crypto'; 

const schema = new mongoose.Schema({

    name: {
        type:String,
        required: [true, "Please enter your name"],   
    },
    email:{
        type:String,
        required: [true , "Please enter your email"],
        unique: true,
        validator: validator.isEmail,  
    },
    password: {
        type:String,
        required: [true , "Please enter your password"],
        minLength: [6, "Password must be at least 6 characters"],
        select: false,  
    },
    role:{
        type:String,
        enum: ["admin", "user" ], //enum mtlb basically ye 2 option hi ho sakte hai
        default: "user" 
    },
    subscription: {
        id: String,
        status: String, 
    },
    avatar: {
        public_id: {
            type: String, 
            required: true,

        } ,
        url: {
            type: String, 
            required: true,

        } 
        
    },

    playlist: [
    {
        course:{
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course',
        },
        poster: String,   
    },
],

    createdAt: {
        type: Date,
        default: Date.now,
        
    },
    resetPasswordToken: String,

    resetPasswordExpire: String,
 


}); //here we will create our schema 


schema.pre("save", async function (next){
    const rounds = 10;
    if(!this.isModified("password")) return next(); 
    const hashPassword = await bcrypt.hash(this.password,rounds); 
    this.password = hashPassword;
    next();
    // short cut:
    //   this.password = await bcrypt.hash(this.password, )

})



schema.methods.getJWTToken = function () {
    return jwt.sign({
        _id:this._id,  
        // 2nd thing we have to give here is as secret 
    }, process.env.JWT_SECRET ,{
        expiresIn: '15d',
    }

)
}



schema.methods.comparePassword = async function (password) {
    // console.log(this.password);
    return await bcrypt.compare(password, this.password); 
}

// console.log(crypto.randomBytes(20).toString('hex')); //so ye jo token hai ye hm return kra denge, email pe phuchana hai token
schema.methods.getResetToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    this.resetPasswordExpire = Date.now()+ 15*60*1000; //abhi jo time ho rha hai uske next 15 minutes ka expire time hai 
    
    return resetToken;

}


export const User = mongoose.model('User', schema); 