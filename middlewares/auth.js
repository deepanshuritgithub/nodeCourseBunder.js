import jwt from "jsonwebtoken";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";


export const isAuthenticated = catchAsyncError(async(req, res, next) =>{
    ////firstly we have to access the token from the cookies 
    const {token} = req.cookies;
    
    if (!token) 
        return next(new ErrorHandler("Not Logged In", 401));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);
    
    next(); 
})




    //for admin protected only 
export const authorizeAdmin = (req, res, next) => {
    if(req.user.role !== 'admin') 
        return next(
        new ErrorHandler(
            `${req.user.role} is not allowed to access this resource`,
            403
        )
    );
    next();

}


export const authorizeSubscribers = (req, res, next) => {
    if(req.user.subscription.status !== "active" && req.user.role !== "admin")
        return next(new ErrorHandler("Only Subscribers can access this resource",403));
}
    




//so jitne bhi models hote hai unpe hi unke operations lagte hai jaise findById or else 
//401 : unauthorized user or we can say does not exist
//403 : not allowed to access this resource