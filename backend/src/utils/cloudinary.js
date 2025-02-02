import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadFilePath= async (localPath)=>{
    try{
        if(!localPath) return null
        const result = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto"
        }); 

        // console.log("file upload sucess", result.url)
        fs.unlinkSync(localPath) //remove the locally saved file as upload is successful
        return result;
    }//file has been uploaded to cloudinary

    catch(error){
        fs.unlinkSync(localPath) //remove the locally saved file as upload fails
        //if there is an error, return null
        console.log("file upload error", error)
        return null;
    }
}






export {uploadFilePath};