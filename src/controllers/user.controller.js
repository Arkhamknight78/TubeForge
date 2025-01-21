import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadFilePath } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "jsonwebtoken";
import { upload } from "../middlewares/multer.middleware.js";



const generateAccessAndRefreshToken = async (userId) => {
    console.log("Start generating tokens for userId:", userId);
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found");
            throw new ApiError(404, "User not found");
        }

        console.log("User found:", user);

        const accessToken = await user.generateAccessToken();
        console.log("Access Token generated");

        const refreshToken = await user.generateRefreshToken();
        console.log("Refresh Token generated");

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        console.log("User tokens updated");

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error while generating tokens:", error);
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token");
    }
};




const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details from frontend
    // 2. Take the fields added in user.models
    // 3. Validation
    // 4. Check if user already exists: username and email
    // 5. Check for images and check for avatars
    // 6. Upload to cloudinary
    // 7. Create user object - create entry in db
    // 8. Remove password and refresh token field
    // 9. Check for user creation
    // 10. Return res


    // 1. Get user details from frontend
    const { fullName, username, email, password } = req.body
    // console.log("email:", email)

    // 2. Take the fields added in user.models
    // (Assuming this is done in the User model definition)

    // 3. Validation
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 4. Check if user already exists: username and email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // 5. Check for images and check for avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;// GOING UNDEFINED INCASE OF NO COVERIMAGE UPLOAD
    //ALTERNATE LOGICS -
    //                 |
    //                 v
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = await req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // 6. Upload to cloudinary
    const avatar = await uploadFilePath(avatarLocalPath);//{gives url as the response}
    const coverImage = await uploadFilePath(coverImageLocalPath);



    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");

    }
    // 7. Create user object - create entry in db
    // (Assuming this is done later in the code)
    const freshUser = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // 8. Remove password and refresh token field
    const createdUser = await User.findById(freshUser._id).select(
        "-password -refreshToken"
    )

    // 9. Check for user creation
    if (!createdUser) {
        throw new ApiError(500, "User creation failed")
    }

    // 10. Return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );


})

const loginUser = asyncHandler(async (req, res) => {
    //req body data extraction
    //username or email
    //find the user
    //password check
    //access and refresh token
    // send cookies


    const { email, username, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "username or Email required")

    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User Not Found");
    }

    const isPassValid = await user.matchPassword(password)

    if (!isPassValid) {
        throw new ApiError(400, "Password Not Correct");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser, accessToken, refreshToken
                },
                "User Logged In"
            )
        )



})

const logOut = asyncHandler((req, res) => {
    User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"))

})


const refreshAcessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorised Request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken == user?.refreshToken) {
            throw new ApiError(401, "Expired Refresh Token")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access Token Refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")

    }

})

const changeCurrPassword = asyncHandler(async (req, res) => {
    const { oldPass, NewPass } = req.body;

    const user = await User.findById(req.user?._id)

    const isPassCorr = user.matchPassword(oldPass)

    if (isPassCorr) {
        user.password = NewPass;
        await user.save({ validateBeforeSave: false })
    }
    else {
        throw new ApiError(400, "Old Password is incorrect")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {},
            "Password Changed Successfully")
        )
})


const getCurrUser = asyncHandler(async (req, res) => {
    //we have the user object in req.user

    return res
        .status(200)
        .json(new ApiResponse(200, req.user,
            "Current User Details")

        )
})

const updateAccDetails = asyncHandler(async (req, res) => {
    //req.body data extraction
    //find the user
    //update the user
    //return the updated user

    const { fullName, username, email } = req.body;

    // const user= await User.findById(req.user._id)

    if (!fullName || !email) {
        throw new ApiError(400, "FullName and EMail are required")

    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                username,
                email: email
            }
        },
        {
            new: true
        })
        .select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Details Updated"))


})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar missing")
    }

    const avatar = await uploadFilePath(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(500, "Avatar Upload Failed")

    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            avatar: avatar.url
        }
    }).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated"))
})
const updateCoverImg = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image missing")
    }

    const coverImage = await uploadFilePath(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(500, "Cover Image Upload Failed")

    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage.url
        }
    }).select("-password")


    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image Updated"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: username?.toLowerCase()

        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount:
                    { $size: "$subscribers" },
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscriber.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1
            }
        }
    ])

    if (!channel?.length{
        throw new ApiError(404, "channel not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel Profile"))


})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                // _id: req.user._id not going directly as it is an object id

                _id: new mongoose.Types.ObjectId(req.user._id) //allows mongoose to directly convert the string to object id 


            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id", //video id in the video model
                as: "watchedVideos",
                pipeline:[//pipeline to filter the watched videos
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",//user id in the user model
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1 //only these fields are required
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{ //to get the first element of the owner array as the owner object itself 
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]

            }
        }


    ])

    return res
        .status(200)
        .json(new ApiResponse(200, user[0].watchedVideos, "Watch History"))
})


export {
    registerUser,
    loginUser,
    logOut,
    refreshAcessToken,
    changeCurrPassword,
    getCurrUser,
    updateAccDetails,
    updateAvatar,
    updateCoverImg,
    getUserChannelProfile,
    getWatchHistory
}
