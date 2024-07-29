import express  from 'express';
import {
    addLecture,
    createCourse,
    deleteCourse,
    deleteLecture,
    getAllCourses,
    getCourseLectures
} from '../controllers/courseController.js';

import singleUpload from '../middlewares/multer.js';
import { authorizeAdmin, authorizeSubscribers, isAuthenticated } from '../middlewares/auth.js';
    
const router = express.Router();


//Get All Courses without lectures
router.route('/courses').get(getAllCourses);


//create a new Courses -  only admin
router.route('/createcourse').post(isAuthenticated, authorizeAdmin ,singleUpload, createCourse); 
//so now ab mai es wala method ke andar req.file se file access kr sakta hu , so jab bhi form ke through data bhjenge to 


//Add Lecture , Delete course , Get course lectures , get Course details jiski help se hmme lectures milengee 
                                //so we will make sure lecture vahi access kr paye jo subscribed user ho , admin ho 
router
.route("/course/:id")
.get(isAuthenticated, authorizeSubscribers, getCourseLectures) //getCourseLectures mai ek or chiz add krenge ki subscribers ko hi allowed hai lectures, vo bhi bnayenge middleware 
.post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)//es wala mai auhorize admin bhi aayega kyuki admin hi hai jo lectures add kr sakta hai 
.delete(isAuthenticated,authorizeAdmin, deleteCourse);



//Delete lecture 
router.route('/lecture').delete(isAuthenticated, authorizeAdmin , deleteLecture); 







export default router;
