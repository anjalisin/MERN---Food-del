import mongoose from "mongoose";

export const connectDB= async () =>{
    await mongoose.connect('mongodb+srv://anjalisingh:Neha8532@cluster0.qowvzmy.mongodb.net/food-del').then(()=>console.log("DB connected")); 
}