import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {userId, channelId} = req.params

    if(!userId){
        throw new ApiError(404, "userID required")
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }

    const subscription= Subscription.findOne({subscriber: userId, channel: channelId})

    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)

        return res
        .status(200)
        .json(new ApiResponse(200, "Subscription removed successfully", null))
    }
    else{
        await Subscription.create({subscriber: userId, channel: channelId})
        return res
        .status(200)
        .json(new ApiResponse(200, "Subscription added successfully", null))
    }

    

    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers= Subscription.find({
        channel: channelId
    })
    if(!subscribers){
        throw new ApiError(404, "No subscribers found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const subscriptions= Subscription.find({
        subscriber: subscriberId
    })
    if(!subscriptions){
        throw new ApiError(404, "No subscriptions found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}