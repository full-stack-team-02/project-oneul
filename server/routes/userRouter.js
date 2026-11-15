import express from "express";
import passport from "passport";
import {
    authLocation,
    checkEmail,
    checkMobile,
    checkNickname,
    deleteUser,
    getUserProfile,
    isAuthenticated,
    loginUser,
    logoutUser,
    passportLogin,
    signupUser,
    updateUser,
    uploadProfileImg,
} from "../controller/user/user.js";
import multer from "multer";
import path from "path";

// Multer 설정
// 배포(CLOUDINARY_URL 있음): 메모리에 받아 컨트롤러에서 Cloudinary로 업로드 / 개발: images/profile에 저장
const storage = process.env.CLOUDINARY_URL ? multer.memoryStorage() : multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images/profile");
    },
    filename: (req, file, cb) => {
        // 한글/특수문자 원본 파일명을 아예 배제하고 확장자만 유지
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

// 메모리 저장 시 큰 파일로 서버 메모리가 터지지 않도록 크기 제한
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/protected-route", isAuthenticated, (req, res) => {
    res.send("This is a protected route");
});
userRouter.post("/checkEmail", checkEmail);
userRouter.post("/checkMobile", checkMobile);
userRouter.post("/checkNickname", checkNickname);
userRouter.post(
    "/uploadProfileImg",
    upload.single("profileImg"),
    uploadProfileImg,
);
userRouter.post("/signup", signupUser);
userRouter.put("/update", updateUser);
userRouter.delete(
    "/delete",
    passport.authenticate("jwt", { session: false }),
    deleteUser,
);

// passport 추가
userRouter.post("/passportLogin", passportLogin);

// 추가로 인증 후 접근해야하는 fetch마다 authenticateLocal()을 심는다.
userRouter.post(
    "/auth",
    passport.authenticate("jwt", { session: false }),
    authLocation,
);

userRouter.get("/getProfile/:email", getUserProfile);

export default userRouter;
