import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();



const app= express();



app.use(cors(
    {
        origin: "process.env.CORS_ORIGIN",
        credentials: true
    }
));
app.use(express.json({limit: "50mb"}));//json data limit. 50mb. json() is a middleware function that parses incoming requests with JSON payloads. Only the payloads of requests with the Content-Type header application/json will be parsed. A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body). This middleware is available in Express v4.16.0 onwards.
app.use(express.urlencoded({extended: true, limit: '50mb'})); 
 //"%20 for space in url encoded form data"

app.use(express.static("public"));
app.use(cookieParser());//crud on cookies




app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is up and running!" });
});


import userRouter from "./routes/user.routes.js";


//routes declaration

app.use("/api/v1/users", userRouter);


export {app};
