import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";

import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }
  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  const userId = req.user._id;
  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: userId,
    });
    if (!playlist) {
      throw new ApiError(500, "Failed to Create Playlist");
    }

    return res.status(201).json(ApiResponse(201, playlist, "Playlist Created"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }

  //TODO: get user playlists
  const playList = await Playlist.find({
    $match: {
      owner: userId,
    },
  });
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playList = await Playlist.findById(playlistId);
  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const video = await Video.findById(videoId);

  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: [...playList.videos, videoId],
      },
    },
    {
      new: true,
    }
  );

  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playList, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const video = await Video.findById(videoId);
  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId, //remove video from playlist
        //  videos: { $in: [videoId] }
        // videos: { $ne: videoId }
        // videos: { $nin: [videoId] }
        //  videos: { $not: { $eq: videoId } }
      },
    },
    {
      new: true,
    }
  );

  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playList, "Video removed from playlist successfully")
    );

  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  Playlist.findByIdAndDelete(playlistId);

  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!playList) {
    throw new ApiError(404, "Playlist not found");
  }
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
