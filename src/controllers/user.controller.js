import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import {uploadFilePath} from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => 
{

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
    console.log("email:", email)

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
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // 6. Upload to cloudinary
    const avatar = await uploadFilePath(avatarLocalPath);//{gives url as the response}
    const coverImage = await uploadFilePath(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(500, "Avatar upload failed");

    }


    
    // 7. Create user object - create entry in db
    // (Assuming this is done later in the code)
    const freshUser = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    // 8. Remove password and refresh token field
    const createdUser = await User.findbyId(freshUser._id).select(
        "-password -refreshToken"
    )

    // 9. Check for user creation
    if(!createdUser){
        throw new ApiError(500, "User creation failed")
    }

    // 10. Return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );


})





export { registerUser }
