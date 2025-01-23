import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFilePath, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const pipeline = [];

  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"], //search in title and description
        },
      },
    });
  }

  if (userId) {
    pipeline.push({
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    });
  }
  //
  const matchStage = {
    $match: { isPublished: true },
  };

  pipeline.push(matchStage);

  if(sortBy && sortType){
    const sortStage ={
        $sort:{
            [sortBy]: sortType === "asc" ?1:-1
        }
    }

    pipeline.push(sortStage)
  }
  else{
    pipeline.push({$sort: {createdAt: -1}})
  }

  const lookupStage = 
  {
    
    $lookup:{
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as :"owner",
        pipeline:[
            {
                $project:{
                    username: 1,
                    "avatar":1
                }
            }
        ]

    },

    {
        $unwind: "$owner"
    }



    const videoAggregate= Video.aggregate(pipeline);

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res
    .status(200)
    .json(new ApiResponse(200, "Videos Retrieved Successfully", videos));
  

  //TODO: get all videos based on query, sort, pagination
});


const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  let vidLocalPath;
  if (
    req.file &&
    Array.isArray(req.file.video) &&
    req.file.video.length() > 0
  ) {
    vidLocalPath = await req.file.video[0].path;
  }

  const video = await uploadFilePath(vidLocalPath);

  if (!video) {
    throw new ApiError(400, "Video Upload Failed");
  }

  const VideoFile = Video.create({
    videoFile: video.url,
    thumbnail: video.thumbnail,
    title,
    description,
    duration: video.duration,
    owner: req.user._id, // user id from token
    //
  });

  const uploadedVideo = await Video.findById(VideoFile._id);

  if (!uploadedVideo) {
    throw new ApiError(400, "Video Upload Failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Uploaded Successfully", uploadedVideo));
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoId, "Video Retrieved Successfully"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId, newTitle, newDescription, thumbnail } = req.body;

  const videoFile = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: newTitle,
        description: newDescription,
        thumbnail,
      },
    },

    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Updated Successfully", videoFile));
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully"));

  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
