import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Course } from "../models/Course.js";
import getDataUri from "../utils/dataUri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/stats.js";



export const getAllCourses = catchAsyncError( async(req, res, next) => {

    const keyword = req.query.keyword || " ";
    const category = req.query.category || " ";
    //so as a query pass krunga mai keyword or category nahi hua to empty mann lenge 

    const courses = await Course.find({
        title : {
            $regex: keyword,
            $options: "i" //i means case insensitive
        },
        category: {
            $regex: category,
            $options: "i" //i means case insensitive
        }

    }).select("-lectures"); //ye puri array return kregaa sara find krke 
    res.status(200).json({
        success: true,
        courses,
    })
});



export const createCourse = catchAsyncError(async(req , res , next) => {
    
    // console.log('Body:', req.body);
    // console.log('File:', req.file);

    const { title , description , category , createdBy } = req.body; //hm req.body mai se tab tak chize access nahi kr paeyenge jab tak ki hm express.json or express.urlencoded middleware hm add nahi kr dete , so hme ye add krna hai oherwise hm req.body mai se access nahi kr payengee 

    //enme se agr kuch bhi na ho to hmme new array throw krna hai 
    if(!title || !description || !category || !createdBy) 
        return next(new ErrorHandler("Please add all fields", 400));
    

        
    const file = req.file;  //ye kha se aa gayii eske liye hmmne multer install kr chuke hai pr as a middleware abhi use nahi kiya hai , vo krenge or uski help se hme file mil jayegi , so vo hm use krengee
    
    if (!file) {
        return next(new ErrorHandler("Please upload a file", 400));
    }

    // console.log(file);
    
    // Assuming you have a function getDataUri to convert the file to a URI
    const fileUri = getDataUri(file);
    // console.log(fileUri.content); 
    
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await Course.create({
        title,
        description,
        category,
        createdBy,
        poster: { // poster mai object pass krenge kya kyaa , public id jo ki cloudinary se milegi or url
            public_id: mycloud.public_id, //placeholder for cloudinary public_id
            url: mycloud.secure_url,      //placeholder for cloudinary URL
        } 
    })


    res.status(201).json({
        success: true,
        message: "Course Created successfully, You can add lectures now.",
    })
    
});


export const getCourseLectures = catchAsyncError(async(req, res, next) => {
    
    //so ese hm phle course dhund lenge hm  
    const course = await Course.findById(req.params.id); 

    if(!course) return next(new ErrorHandler("Course not found", 404));
    
    //so agr course hai or course ko koi access kr raha hai to so course.views ko bada denge 1  
    course.views += 1;

    await course.save(); 

    res.status(200).json({
        success: true,   
        lectures: course.lectures ,//agr course mil jata hai then simply lectures bhj denge yha se 
    })
});



//condition -> max video size 100mb, because hm free wala use kr rha hai cloudinary ka , usme 100mb hi allowed hai bs  
//add Lectures
export const addLecture = catchAsyncError(async(req, res, next) => {
    const {id } = req.params;
    const {title, description} = req.body;

    // const file = req.file //so ye abhi hmmne multer add nahi kiya hai , or na hi cloudinary 

    //so ese hm phle course dhund lenge hm  
    // const course = await Course.findById(req.params.id); 
    const course = await Course.findById(id); 

    if(!course) return next(new ErrorHandler("Course not found", 404));

    //upload file here 
    const file = req.file;
    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content,{
        resource_type: "video",
    });

    course.lectures.push({
        title,
        description,
        video: { 
            public_id: mycloud.public_id, //placeholder for cloudinary public_id
            url: mycloud.secure_url,      //placeholder for cloudinary Url
        }  
    })//so lets suppose abhi 5 lectures ho gya hai 


    course.numOfVideos = course.lectures.length; //to yha pe 5 phle se hi aa jayegaa 

    await course.save(); 

    res.status(200).json({
        success: true,   
        message: "Lecture added in Course",
    
    })
});


export const deleteCourse = catchAsyncError(async(req , res , next) => {
    
    const { id } = req.params; 

    const course = await Course.findById(id); 

    if(!course) return next(new ErrorHandler("Course not found", 404));

    // jaise hi esme course delete krengee uss se phle jo uska poster hai vo delete krna hai 

    //poster delete method of the course
    // console.log(course.poster.public_id);
    await cloudinary.v2.uploader.destroy(course.poster.public_id); //uski help se poster delete krna hai , so id pass krne hai vo hm kr dengee 

    // The uploader object under cloudinary.v2 provides methods for handling media uploads and deletions. Here are some common methods used with cloudinary.v2.uploader: with destroy and upload , in sabke andar hmme access hota hai (publicId, options, callback )

    //single single lectures delete ho jayenge jitne bhi usme object hai loop laga hi diye hai 
    for(let i=0; i < course.lectures.length; i++){

        const singleLecture = course.lectures[i];

        await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
            resource_type: "video"  //it is important to mention that we are deleting a video here , otherwise video will not be deleted from here ,only image will be deleted always if you will not mention resource type
        });   
        console.log(singleLecture.video.public_id);
    }

    // await course.remove();//if it not works then use this below one 
       // Use deleteOne to remove the course from the database
    await Course.deleteOne({ 
        _id:id //now finally delete the course itself   
    });

    res.status(200).json({
        success: true,
        message: "Course Deleted Successfully.",
    })
    
});


// Delete Lecture Details
export const deleteLecture = catchAsyncError(async(req , res , next) => {
    
    const { courseId , lectureId } = req.query; 

    const course = await Course.findById(courseId); 

    if(!course) return next(new ErrorHandler("Course not found", 404));



    // //find the lecture which you want to delete from the course 
    // const lectureIndex = course.lectures.findIndex((lecture) => {
    //     return lecture.video.public_id

    // })
    // if (lectureIndex === -1) return next(new ErrorHandler("Lecture not found", 404));

    // const lecture = course.lectures[lectureIndex];




    //to delete from cloudinary 
    const lecture = course.lectures.find((item) => {
        if(item._id.toString() === lectureId.toString()) return item;
        //agr vo barabar hai vhi rkhenge hm es new array mai 
    })
    await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
        resource_type: "video",
    })
    
    //ye to hmara array se update ke liye hogya , lekin hme to cloudinary se bhi to delete krna hai vo lecture , or to delete from the array 
    course.lectures = course.lectures.filter((item) => {
        if(item._id.toString() !== lectureId.toString()) return item;
    })

    //length update 
    course.numOfVideos = course.lectures.length; 

    await course.save();  //save the updated course to the database
    
    res.status(200).json({
        success: true,
        message: "Lecture Deleted Successfully. ",
    })
    
});



Course.watch().on('change', async() => {
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1);
    const courses = await Course.find({});

    let totalViews = 0;

    for (let i = 0; i < courses.length; i++) {
        totalViews += courses[i].views;
    }
    //stats[0] mtlb jo present array hoga jo current document waala array ki aat ho rhi hai jaise bhi ek hi hai mongo db ke collection mai 
    stats[0].views = totalViews;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
})



















//status 200 is for successful got
//status 201 is for successfully created
//status code 400 is for bad request