import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const tweet = await Tweet.create({
        content: req.body.content,
        owner: req.user._id
    })

    const createdTweet = await Tweet.findById(tweet._id)

    // 9. Check for user creation
    if (!createdTweet) {
        throw new ApiError(500, "Tweet creation failed")
    }

    // 10. Return res
    return res.status(201).json(
        new ApiResponse(200, createdTweet, "Tweet Registered Successfully")
    );

})

const getUserTweets = asyncHandler(async (req, res) => {
    const {tweetId}= req.params

    // TODO: get user tweets
    const tweet= await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Retrieved Successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId, newContent } = req.body;

    const tweet= await Tweet.findByIdAndUpdate(tweetId, {
        $set:{
            content: newContent
        }
    })
    
    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Updated Successfully", tweet))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const { tweetId } = req.body;
    await Tweet.findByIdAndDelete(tweetId);

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Deleted Successfully"));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}