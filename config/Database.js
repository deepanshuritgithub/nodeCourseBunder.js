import mongoose from "mongoose";

export const connectDB = async() => {
    const connection = await mongoose.connect(process.env.MONGO_URI); //MONGO URI ME RHEGA APKA MONGO DB KA URL
    console.log(`MongoDB Connected with ${connection.connection.host}`); 
}