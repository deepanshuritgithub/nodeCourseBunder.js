import express  from 'express';
import { logout, register, getMyProfile, login, changePassword, updateProfile, updateProfilePicture, forgetPassword, resetPassword, addToPlaylist, removeFromPlaylist, getAllUsers , updateUserRole, deleteUser, deleteMyProfile } from '../controllers/userController.js';
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

//To register a new user , 
router.route("/register").post(singleUpload, register); 

//Login 
router.route("/login").post(login); 

//Logout
router.route("/logout").get(logout);  //get request hogi kyuki koi data will be send

//Get my profile
router.route("/me").get(isAuthenticated , getMyProfile);   

//delete my profile
router.route("/me").delete(isAuthenticated , deleteMyProfile);   


//change password
router.route("/changepassword").put(isAuthenticated , changePassword);   //put request because we are updating the password, or change password krte time bhi login hona chahiye user 


//update Profile
router.route("/updateprofile").put(isAuthenticated , updateProfile); 


//update Profile picture 
router.route("/updateprofilepicture").put(isAuthenticated,singleUpload , updateProfilePicture); 



//so eske liye hmme middleware bnana hai node mailer, so phle route hi bnata hai ikkata hi bnayengee kese kese
//forget password -> forget password se hme token milega reset krne ke liyee
router.route("/forgetpassword").post(forgetPassword); 

//reset password
router.route("/resetpassword/:token").put(resetPassword); 




//Add to playlist 
router.route("/addtoplaylist").post(isAuthenticated , addToPlaylist); 


//remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated , removeFromPlaylist); 


// get all users 
router.route("/admin/users").get(isAuthenticated, authorizeAdmin , getAllUsers); 


//update user role-> 
router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin , updateUserRole); //put request hogi kyuki update krna hai role ko 


//delete user

router.route("/admin/user/:id").delete(isAuthenticated, authorizeAdmin , deleteUser); 




export default router;
