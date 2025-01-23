import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
   try {
     const {videoId} = req.params
     if(!isValidObjectId(videoId)){
         throw new ApiError(400, "Invalid video id")
     }
 
     const video= await Video.findById(videoId)
     if(!video){
         throw new ApiError(404, "Video not found")
     }
 
     const userId= req.user._id
     const isLiked= await Like.findOne({video: videoId, likedBy: userId})
     let videoLikedStat;
 
     if(isLiked){
         await isLiked.findByIdAndDelete(isLiked._id)
         videoLikedStat= false
     }else{
         await isLiked.create({
             video: videoId, 
             user: userId
         })
         videoLikedStat= true
         
     }
 
   } catch (error) {
       console.log(error)
       throw new ApiError(500, error.message)
    
   }


    //TODO: toggle like on video
})

// const toggleCommentLike = asyncHandler(async (req, res) => {
//     const {commentId} = req.params
//     //TODO: toggle like on comment

// })

// const toggleTweetLike = asyncHandler(async (req, res) => {
//     const {tweetId} = req.params
//     //TODO: toggle like on tweet
// }
// )

const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const {userId}= req.params
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid user id")
        }
        const likedVideos= await Like.aggregate([
            {
                $match:{
                    likedBy: mongoose.Types.ObjectId(userId)
                },
            },
            {
                $lookup:{
                    from: "videos",
                    localField:"video",
                    foreignField:"_id",
                    as: "video",
                   
                }
            }
        ])

        if(!likedVideos){
            throw new ApiError(404, "No liked videos found")
        }   
        res
        .status(200)
        .json(new ApiResponse(200, likedVideos))

        
    } catch (error) {
        console.log(error)
        throw new ApiError(500, error.message)
    }
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}