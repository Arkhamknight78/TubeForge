import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app= express();
app.use(cors(
    {
        origin: "process.env.CORS_ORIGIN",
        credentials: true
    }
));
app.use(express.json({limit: "50mb"}));//json data limit. 50mb. json() is a middleware function that parses incoming requests with JSON payloads. Only the payloads of requests with the Content-Type header application/json will be parsed. A new body object containing the parsed data is populated on the request object after the middleware (i.e. req.body). This middleware is available in Express v4.16.0 onwards.
app.use(express.urlencoded({extended: true, limit: '16kb'})); "%20 for space in url encoded form data"

app.use(express.static("public"));
app.use(cookieParser());//crud on cookies

export default app;
