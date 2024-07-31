import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { User } from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from 'crypto';
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/stats.js";

//register
export const register = catchAsyncError(async(req, res, next) => {
    
    const { name , email, password } = req.body;

    //ye hoga avatar, ye milega req.file se  

    if(!name || !email || !password )
        return next(new ErrorHandler("Please enter all fields", 400));
    
    let user = await User.findOne({email}) //or esme hm email pass kr denge jo upar se aayi hai uss se hmme ye pta lag jayega user phle se exist krta hai ye nahi 
    
    if(user) return next(new ErrorHandler("User already exists", 409));    //error aa jayega agr user phle se exist krta hua to 
    
    //upload file on cloudinary ;
    const file = req.file; 

    if (!file) {
        return next(new ErrorHandler("Please upload a file", 400));
    }
    // Assuming you have a function getDataUri to convert the file to a URI
    const fileUri = getDataUri(file);
    
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    
    //ye hm tab kr rha hai jab user exist nahi krta huaa, jab hme new user bnana hai
    user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: mycloud.public_id, //cloudinary se milegi 2no chize jab vo add krengee 
            url: mycloud.secure_url,
        }
    })

    // res.status(201).cookie("token", )//so esko mai kai function mai use krna waala hu so instead of writing again and again , hm new func banyenge , jiska naam hai send Token
    sendToken(res, user ,"Registered Successfully", 201);

});


//Login
export const login = catchAsyncError(async (req, res, next) => {

    const {email, password } = req.body;

    if(!email || !password) return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findOne({email}).select("+password"); //or esme hm email pass kr denge jo upar se aayi hai uss se hmme ye pta lag jayega user phle se exist krta hai ye nahi 

    if(!user) return next(new ErrorHandler("Incorrect Email or Password", 401));    //error aa jayega agr user phle se exist krta hua to    
    
    //upload file on cloudinary ;
    
    //so now password comparing'
                //so user hme specifically choose krna hai document na ki pure collection pe hi pure model pe hi apply krna hai 
    const isMatch = await user.comparePassword(password);//ye variable hai jo true or false hogaa, so yha pe esa hm assume kr rha hai ki ek func hai so uss se hme pta lag jayega password match krta ya nahi 
    
    if(!isMatch) return next(new ErrorHandler("Incorrect Email or Password", 401));    //error aa jayega agr user phle se exist krta hua to 


    sendToken(res, user ,`Welcome back ${user.name}`, 200);

});


//Logout
export const logout = catchAsyncError(async(req, res, next) => {
    //hme bss cookie ko empty krna hai basically so 
    res.status(200).cookie('token', null, {
        expires: new Date(Date.now()), //SO Jaise abhi ki date de hai to abhi delete ho jayegaa direct 
        httpOnly: true,
        secure : true,
        samesite:"none",
        
    }).json({ 
        success: true,
        message: "Logged out Successfully",
    })
})


//Get My Profile
export const getMyProfile = catchAsyncError(async (req, res, next) => {
                                        //so req.user mai user ki sari property hai,._id krke hme id mil jayegi hmme , ye ye req mai aaeygi kha se , jaise hi koi bhi login hogaa, uss waqt yee aa chuki hogi usme
    const user = await User.findById(req.user._id);
    //so hmme kuch bhi krna hai lekin ye route vhi access kr sakta hai jo login ho rkhaa hai , so jaise hi hm "/me" pe jaye to id mil jaye hmme manually type na krni pade, so uske liye hmme ek middleware bnana hai isAuthenticated

    res
    .status(200)
    .json({ 
        success: true,
        user,
    })
})


//Change Password 
export const changePassword = catchAsyncError(async (req, res, next) => {
    
    const { oldPassword , newPassword } = req.body;

    if(!oldPassword || !newPassword) 
        return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findById(req.user._id).select("+password"); //so jab logged in hoga user tabhi access kr payega route 

    const isMatch = await user.comparePassword(oldPassword); //jo user ne dala hai  , so ye jo func hai ye kya kregaa ye wala password or jo feed hai db mai usko compare kregaa 

    //agr vo match nahi krta hai to vo error de degaa, so jab purana wala password match nahi krega tab tak hmme aage nahi badna hai change krne ke liye 
    if(!isMatch) 
        return next(new ErrorHandler("Incorrect Old password", 400));
    //Otherwise password bhi sahi hai to simply 
    user.password = newPassword;
    //so ab hmme password ko dobara hash nahi krna hai, kyu jab jab user save hogaa vo  , so hmmne pre save kr rkha hai , password agr modify ho , so password hash ho jayega khud ba khud

    await user.save();

    res.status(200).json({ 
        success: true,
        message: "Password Changed Successfully",
        // user,
    })

})


//update Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {

    const {name, email} = req.body;

    // if (!name || !email) {
    //     return next(new ErrorHandler("Please enter all fields", 400));
    // } //ye krne se 2no filed dena padega check krte waqt 

    // Find the user by ID (assuming the user is logged in and the user ID is in req.user._id)
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Update user information
    if(name) user.name = name;
    if(email) user.email = email;

    await user.save();

    res.status(200).json({ 
        success: true,
        message: "Profile Updated Successfully",
    })

})


//update Profile Picture
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {

   //cloudinary : Todo 
    const file = req.file; 
    
    if (!file) {
        return next(new ErrorHandler("Please upload a file", 400));
    }

    const user = await User.findById(req.user._id);

    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Assuming you have a function getDataUri to convert the file to a URI
    const fileUri = getDataUri(file);
    
    //upload the file to cloudinary or we can say url or our content ,or esme mai se hm apna url nikal lenge or public id 
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);//content represent the actual content or path of the file that you want to upload , it could be url or a base64 encoded string, or a path to a file on your local filesystem.

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
     //phle wala jo avatar hai vo delete krna hai phle then apna jo new avatar hogaa vo upload krna hai

    //update the avatar 
    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    }

    await user.save();

    res.status(200).json({ 
        success: true,
        message: "Profile Picture Updated Successfully",
    
    })

})


//Forget Password
export const forgetPassword = catchAsyncError(async (req, res, next) => {

    const {email} = req.body;
    //so user dhund lengee 
    const user = await User.findOne({ email });

    if(!user) return next(new ErrorHandler("User not found", 400));

    //but agr user hai to hm simply token generate krenge reset token

    const resetToken = user.getResetToken();
    // so the address it http://localhost:3000/resetpassword/dskdokdowkdiwjfiwkdwodwjfiwkdpwdwkowdowkpwkpkowdDbc

    await user.save();

    const url= `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message =`Click on the link to reset your password, ${url}. If you have not request then please ignore.`;
    //sent token via email , eskee liye hmme function bnana padega send email 
    //jo reset wala mai kya hoga jb hm bnayenge reset wala function , uss token ko hm email se receive krenge,jo email mai bhja hai token ,  vo receive krenge req.body se, ya params se , suppoese kese bhi hmmne token receive kr liya ye wala jo email pe bhja hai 

    await sendEmail(user.email , "CourseBundler Reset Password", message)


    res.status(200).json({ 
        success: true,
        message: `Reset token has been set to ${user.email}`,
    
    })

})


//Reset password
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;//remember jo vha naam hona chahiye route mai colon(:) ke baad vhi hmme destrucutre krna hai  

    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            //so yha pe condition laga denge greater than hona chahiye  or hmmne yha pe time bhi manage kr diya ki abhi ki jo date hai uss se bada hona chahiyee jo bach rha hai b
            $gt: Date.now(),//so mongo db ke operator ke liye $ sign lagana padta hai
        },
    })
    
    if(!user) return next(new ErrorHandler("Token is invalid or has been expired", 401));
    
    user.password = req.body.password; //so jaise hi password hm change kr de , to hmme token ko bhi undefined krna hai or uska expiring time ko bhi   

    user.resetPasswordToken = undefined; 
    user.resetPasswordExpire = undefined; 

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully.",
    });
});


//add to playlist 
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
    //first we will find a user 
    const user = await User.findById(req.user._id); //user mil jayega definately login hoga to 


    //req.body contains the data sent by the client in the body of the request, In this case, it is assumed that the client has sent a JSON object with an id field.
    const course = await Course.findById(req.body.id);//req.body extracts the value of the id field from the json object, which should be the unique identifier of the course document you want to achieve , in by my personal choice req.body se mera mtlb hai { jo bhi eske andar likha hua hai }

    //so agr course nahi mila mtlb incorrect id pass kre hai 
    if(!course) return next(new ErrorHandler("Invaid Course Id", 404));

    //so kya hai jab hm add to playlist krenge to vo playlist mai dobara add ho jayegaa so vo nai chahta mai , so mujhe kya krna padega ki condition lagani padegi , agr already hai course playlist mai to dobara add mt kro 
    const itemExist = user.playlist.find((item) => {
        if(item.course.toString() === course._id.toString()) return true; //so agr id phle se hi array mai exist krte hai to hm kr denge true return item exists  , or fir error de denge otherwise jo abhi tak kaam ho raha tha vhi hota rhega does not matter

    });
    if(itemExist) return next(new ErrorHandler("Item Already Exists", 409));


    user.playlist.push({
        course: course._id,
        //so ye jo poster show ho rha hai ye avatar ka poster hai mere hisab se to kyuki usi mai hai apkaa public id or url , or public id to dene nahi hai sirf url hi dena hai 
        poster: course.poster.url,

    });

    //then we saves the user 
    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist",
    }); 

})


//remove from playlist 
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
     //first we will find a user 
    const user = await User.findById(req.user._id); //user mil jayega definately login hoga to 


    //req.body contains the data sent by the client in the body of the request, In this case, it is assumed that the client has sent a JSON object with an id field.
    const course = await Course.findById(req.query.id);//req.body extracts the value of the id field from the json object, which should be the unique identifier of the course document you want to achieve , in by my personal choice req.body se mera mtlb hai { jo bhi eske andar likha hua hai }

    //so agr course nahi mila mtlb incorrect id pass kre hai 
    if(!course) return next(new ErrorHandler("Invaid Course Id", 404));

    //filter the user's playlist to remove the course 
    const newPlaylist = user.playlist.filter(item => {
        //so ye array return krta hai ye
        if(item.course.toString() !== course._id.toString()) return item; //return krenge vo jo 
    })

    //esme vo saraa item honge jo match nahi krte hai 
    //  mtlb esme vo sare item honge jo hmme  chahiye jo hmme delete nahi krna hai vo sare


    //and then saves the update user component 
    user.playlist = newPlaylist;  //esme vo add kr do jo jo match krte hai baaki ko delete kr do , mtlb us playlist se hi hta diya 
    //then we saves the user 
    await user.save();      

    res.status(200).json({
        success: true,
        message: "Removed From Playlist",
    }); 

})


//Admin Controllers
export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find({ })
    //sare ka sare users find kr do , jo bnda authenticated hogaa or vo jo user admin bhi hogaa usii ko hm ye show krengee 


    res.status(200).json({
        success: true,
        users

    }); 

})



// updateUserRole
export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id) //id hm url mai se lenge , url se lene ke liye hmme chiye hota hai params 

    if(!user) return next(new ErrorHandler("User not found", 404));

    if(user.role==="user") user.role = "admin";
    else user.role = "user";

    await user.save();

    res.status(200).json({
        success: true,
        message: "Role updated ",

    }); 

})



// deleteUser
export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) return next(new ErrorHandler("User not found", 404));

    //Delete the user's avatar from cloudinary if it exists 
    if(user.avatar && user.avatar.public_id){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);//v2 version add krna mandatory hai vrna shyad kaam nahi kregaa 
    }


    //Cancel Subscription



    //Delete the user from the database  
    await user.deleteOne();

    res.status(200).json({
        success: true,
        message : "User Deleted Successfully"
    }); 

})



//Delete My Profile
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
   
    //Delete the user's avatar from cloudinary if it exists 
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    //v2 version add krna mandatory hai vrna shyad kaam nahi kregaa 


    //Cancel Subscription



    //Delete the user from the database  
    await user.deleteOne();
                        //profile jab khtm kr hi rha hai to cookies bhi khtm kr dengee 
    res.status(200).cookie("token", null,{
        expires: new Date(Date.now()),
        
    }).json({
        success: true,
        message : "User Deleted Successfully"
    }); 

})





//hmme update krna padega ese mongo db stats values) jaise hi koi new user create ho us type se , so uske liye hm kya krengee  

//so ab yha pe hm voucher create krengee, mongo db ke website pe jake padd sakte ho , vo real time data check kregaa jaise update ho vo func call ho jayega

            //user ke collection mai kuch bhi change ho , to ye func call hogaa
User.watch().on("change", async() =>{ //ye func call hogaa, agr kuch bhi change hota hai collection mai 

    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1); //mujhe bs ek hi chahiye last wala 
    //subscription se dhund lengee kitne users ese hai jinka subsciption active hai , so uss se hmme pta lag jayega kitne logo ne subscribe kra hua hai
    const Subscription = await User.find({"subscription.status":"active"})

    //remember stats ke model mai subscription failed hai usse kr denge equal kiske jo bhi uski length hogi uske 
    // Updating the Subscription Count in the Latest Stats Document

    stats[0].users =  await User.countDocuments();  
    stats[0].subscription = Subscription.length;
    stats[0].createdAt = new Date(Date.now());
    
    await stats[0].save();
})
//so jaise hi user ke collection mai kuch bhi change hogaa , so esme manage ho jayegaa eske baad 













// 409 status code: the request could not be processed because of conflict in the request
//401 status code: the requess , when user does not exist 
//400 bad request 
//404 age vo nahi hai jo chiz mang rha hai to uss case mai 404 aata hai agr nahi mila hmme to 