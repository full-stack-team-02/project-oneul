import User from "../../models/userSchema.js";
import session from "express-session"
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const loginUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        // 사용자가 잘못된 인증을 요청한 401코드
        return res.status(401).json({
            loginSuccess: false,
            message: "존재하지 않는 이메일입니다.",
        });
    } else {
        // 비밀번호가 맞는지 확인
        const passwordMatch = req.body.password === user.password;
        if (!passwordMatch) {
            return res.status(401).json({
                loginSuccess: false,
                message: "비밀번호를 확인해주세요.",
            });
        }

        req.session.userId = user._id;
        const token = jwt.sign({ id: user._id }, jwtOptions.secretOrKey, { expiresIn: '24h' });
        const { ...userDatas } = user;
        const { password, ...others } = userDatas._doc;
        console.log(others);

        return res.status(200).json({
            user: others, // 최초 로그인시 유저정보
            loginSuccess: true, // 상태
            message: "로그인 성공!", // 메세지
            userId: user._id,
            token : token,
        },)
    }
};

const logoutUser = async (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Failed to destroy session:', err);
            res.status(500).send('Failed to logout');
            return next(err);
          } else {
            res.clearCookie('connect.sid'); // 세션 쿠키 삭제
            res.send('Logout successful');
          }
        });
      } else {
        res.status(400).send('No active session');
      }
};

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: "로그인이 필요합니다." });
    }
};

const checkEmail = async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(200).json({
            message: "이미 사용중인 이메일입니다",
            duplicate: true,
        });
    }
    return res.status(200).json({
        message: "사용가능한 이메일입니다",
        duplicate: false,
    });
};

const checkMobile = async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({ mobile: req.body.mobile });
    if (user) {
        return res.status(200).json({
            message: "이미 사용중인 전화번호입니다",
            duplicate: true,
        });
    }
    return res.status(200).json({
        message: "사용가능한 전화번호입니다",
        duplicate: false,
    });
};

const checkNickname = async (req, res) => {
    console.log(req.body);
    const user = await User.findOne({ nickname: req.body.nickname });
    if (user) {
        return res.status(200).json({
            message: "이미 사용중인 닉네임입니다",
            duplicate: true,
        });
    }
    return res.status(200).json({
        message: "사용가능한 닉네임입니다",
        duplicate: false,
    });
};

// 이미지 업로드 라우트
const uploadProfileImg = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: "파일 업로드에 실패했습니다",
        });
    }
    const profileImgPath = `images/profile/${req.file.filename}`;
    return res.status(200).json({ profileImg: profileImgPath });
};

const signupUser = async (req, res) => {
    console.log(req.body);
    {
        // 유저를 파싱
        let register = {
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            mobile: req.body.mobile,
            nickname: req.body.nickname,
            profileImg: req.body.profileImg,
            origin: req.body.origin,
            token: req.body.token,
            statusMessage: req.body.statusMessage,
        };
        // 유저를 등록
        await User.create(register);
        return res.status(200).json({
            registerSuccess: true,
            message: "회원가입이 완료 되었습니다",
        });
    }
};

const updateUser = async (req, res) => {
    console.log("프로필 이미지 수정", req.body)
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                updateSuccess: false,
                message: "User not found.",
            });
        }
     
        // Update user information
        const updates = {
            password: req.body.password,
            mobile: req.body.mobile,
            name: req.body.name,
            nickname: req.body.nickname,
            profileImg: req.body.profileImg,
            statusMessage: req.body.statusMessage,
        };
        // Check if there is a new profile image
        if (req.file) {
            updates.profileImg = req.file.path; // Assuming you store file paths
        }
        
        // Update the user's information in the database
        const update = await User.updateOne({ email: req.body.email },{ $set: updates });
        console.log(update);
        // Find the updated user data to send back (excluding password).select('password')
        const updatedUser = await User.findOne({ email: req.body.email });
        console.log(updatedUser)
        return res.status(200).json({
            updateSuccess: true,
            message: "User information updated successfully.",
            user: updatedUser,
        });
        console.log(req.body);

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            updateSuccess: false,
            message: "An error occurred while updating user information.",
        });
    }
};

// JWT 회원탈퇴
const deleteUser = async (req, res) => {
    const authenticateUser = req.user;
    console.log(authenticateUser);
    await User.deleteOne(authenticateUser);
    res.status(200).json({
        message : "회원 탈퇴가 완료되었습니다."
    })
};


// JWT Strategy : HTTP Authorization 헤더에서 JWT를 추출하여 
const configureJwtStrategy = () => {
    return new Promise((resolve, reject) => {
      const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: SECRET_KEY,
      };
  
      const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
          const user = await User.findById(jwtPayload.sub);
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (err) {
          return done(err, false);
        }
      });
  
      passport.use(strategy);
      resolve();
    });
  };

// Passport 초기화 및 JWT Strategy 설정
const initializePassport = async () => {
    await configureJwtStrategy();
    app.use(passport.initialize());
  };

// passport Login
const passportLogin = async (req, res, next) => {
    try {
        passport.authenticate("local", (error, user, info) => {
            if (error) {
                return res.status(500).json({ message: '서버 오류 발생' });
            }
            if (!user) {
                return res.status(400).json({ message: info ? info.reason : '로그인에 실패했습니다.' });
            }
            req.login(user, { session: false }, async (loginError) => {
                if (loginError) {
                    return res.status(401).send(loginError);
                }
                // 검증된 회원에게 jwt토큰 생성 후 전달
                const token = jwt.sign(
                    {
                        id: user._id,  // id를 포함하는 것이 더 일반적임
                        email: user.email,
                        issuer: "michael",
                    },
                    SECRET_KEY,
                    {
                        expiresIn: "24h", // 유효시간 24시간
                    }
                );

                // 검증 (선택) 안해도 무관
                const loginUser = await User.findById(user._id).lean();
                console.log(loginUser);

                // 민감한 정보를 제거 후
                // 유저와 토큰을 발급해서 화면으로 보낸다
                const { password, ...others } = loginUser;
                res.status(200).json({
                    user: others,
                    token: token,
                });
            });
        })(req, res, next);
    } catch (error) {
        console.error('로그인 처리 오류:', error);
        next(error);
    }
};


// 토큰을 이용해서 인증받은 라우팅
const authLocation = async (req, res) => {
    try {
        // 인가가 완료된 유저는 req.user에 담긴다
        console.log("authLocation", req.user);
        const { password, ...others } = req.user;
        res.status(200).json({
            message: "자동 로그인 성공",
            ...others._doc,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getUserProfile = async (req, res) => {
    const email = req.params.email;
    const baseUrl = process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:8000";

    try {
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            profileImg: `${baseUrl}/${user.profileImg}`,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export { loginUser, logoutUser, checkEmail, checkMobile, checkNickname, uploadProfileImg, signupUser, updateUser, deleteUser, passportLogin, authLocation, getUserProfile, isAuthenticated, configureJwtStrategy,initializePassport};
