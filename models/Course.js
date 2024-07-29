import mongoose from "mongoose";

const schema = new mongoose.Schema({

    title:{
        type:String,
        required: [true, "Please enter a course title"],
        minLength:[4,"Title must be at least 4 characters"],
        maxLength:[80,"Title can't exceed 80 characters"],
    },
    description:{
        type:String,
        required: [true, "Please enter a course title"],
        minLength:[20 ,"Title must be at least 20 characters"],
        maxLength:[80,"Title can't exceed 80 characters"],
    },
    lectures: [ //lectures array , in which our lectures will be added 
    {
        title:{
            type: String,
            required : true,
        },

        description:{
            type: String,
            required : true,
        },

        video: {
            public_id: {
                type: String, 
                required: true,
            },
            url: {
                type: String, 
                required: true,
            } 
        },
    },
],

    poster: {
        public_id: {
            type: String, 
            required: true,
        } ,
        url: {
            type: String, 
            required: true,
        } 
        
    },

    views: {
        type: Number,
        default: 0, 
    },
    numOfVideos: {
        type: Number,
        default: 0, 
    },
    category: {
        type:String,
        required: true,
    },
    createdBy: { 
        type: String,
        required: [true,"Enter Course Creator Name"],
    },
    createdAt: {
        type:Date,
        default: Date.now,
    }


}); //here we will create our schema 

export const Course = mongoose.model('Course', schema); //model name is User 