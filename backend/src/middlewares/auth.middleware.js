import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";


export  const verifyJWT = asyncHandler(async(req, res, next)=>{
   try{const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

   if(!token){
    throw new ApiError(401, "unauthorized req")
   }

   const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ) 

   const user= await User.findById(decodedToken?._id).select("-password -refreshToken")

   if(!user){
    throw new ApiError(401, "Invalid Access Token")
   }

   req.user = user
   next() // next middleware
   }
   catch(err){
    throw new ApiError(401, err?.message || "Invalid Access Token")
   }    

})


