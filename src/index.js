// require('dotenv').config(path: '../.env');

import dotenv from "dotenv";

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDB from "./db/indexdb.js";

dotenv.config({
    path: "./.env"
});

connectDB();







// const app = express();

// IFFY

// ;( async ()=>{
//     try{
//         // await mongoose.connect(`${URI} / ${DB ka NAME} `)
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME} `)
//         app.on("error",(error)=>{
//             console.log("Error connecting to database")
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("Error:", error)
//         throw err
//     }
// })()