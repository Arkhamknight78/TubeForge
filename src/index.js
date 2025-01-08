// require('dotenv').config(path: '../.env');

import dotenv from "dotenv";
import {app} from "./app.js";

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectDB from "./db/indexdb.js";

// import {app} from "./app.js";

dotenv.config({
    path: "./.env"
});
// const app = express();

connectDB()
    .then(() => {
        app.on("error", (error) => { console.log("Error connecting to database from index.js") })

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port ${process.env.PORT || 8000}`)

        })
    })
    .catch((err) => {
        console.error("Error connecting to database from index.js", err);

    })







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