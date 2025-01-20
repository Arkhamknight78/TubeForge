import { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,//one whom is being subscribed to
        ref: "User"
    }

},{timestamps: true})


export const Subscription= mongoose.model("Subscription", subscriptionSchema);
// Path: src/models/video.model.js
// Compare this snippet from src/controllers/video.controller.js:
