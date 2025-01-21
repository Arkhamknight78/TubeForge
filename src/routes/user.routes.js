import Router from "express";
import {
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
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 2,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logOut);

router.route("/refresh-token").post(refreshAcessToken);
router.route("/changePass").post(verifyJWT, changeCurrPassword);
//secured routes
//verifyJWT is a middleware that will check if the user has a valid JWT token in the Authorization header
//if the token is valid, it will add the user object to the req object


router.route("/current-user").get(verifyJWT, getCurrUser);

router.route("/updateAcc").patch(verifyJWT, updateAccDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
//avatar is the name of the field in the form
//upload.single("avatar") is a middleware that will parse the form data and save the file in the specified destination
//and add the file object to the req object
//the file object will have the file path in the file.path property

router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImg"), updateCoverImg); //coverImg is the name of the field in the form
//upload.single("coverImg") is a middleware that will parse the form data and save the file in the specified destination
//and add the file object to the req object

router.route("/channel/:username").get(getUserChannelProfile);
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;
