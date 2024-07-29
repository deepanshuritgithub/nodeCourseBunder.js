import mongoose from "mongoose";

const schema = new mongoose.Schema({

    users:{
        type:Number,
        default:0,
    },
    
    subscription:{
        type:Number,
        default:0,
    }, 

    views:{
        type:Number,
        default:0,
    },

    createdAt: {
        type:Date,
        default: Date.now,
    }


}); 

// export const Stats = mongoose.model('Stats', schema); //model name is User  //old code to resolve the error message
// Check if the model already exists before defining it
export const Stats = mongoose.models.Stats || mongoose.model('Stats', schema);

