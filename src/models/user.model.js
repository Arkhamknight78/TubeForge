import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        
    },
    fullname:{
        type: String,
        required: true,
     
        lowercase: true,
        trim: true,
        
    },
    avatar:{
        type: String, //cloudinary Url
        required: true,
    },
    coverImage:{
        type: String, //cloudinary Url
        required: true,
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken:{
        type: String,
    }
},{
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) next();

    this.password = await bcrypt.hash(this.password, 10);
    next();

} )

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
    }, 
    process.env. ACCESS_TOKEN_SECRET, { 
        expiresIn:  ACCESS_TOKEN_EXPIRY });
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id
        
    }, 
    process.env.REFRESH_TOKEN_SECRET, { 
        expiresIn:  process.env.REFRESH_TOKEN_EXPIRY }); 
    }

export const User= mongoose.model("User", userSchema);
