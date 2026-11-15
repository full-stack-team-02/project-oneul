import React, { useState, useEffect } from "react";
import S from "./style";
import { Link, useNavigate } from "react-router-dom";
import OneulInput from "../../components/input/OneulInput";
import OneulButton from "../../components/button/OneulButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlus, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
    updateSignUpData,
    resetSignUpData,
} from "../../feature/signup/signUpSlice";
import useInput from "../../hooks/useInput";
import { API_URL } from "../../shared/api/apiSlice";

const MypageEditModify = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.login.currentUser);

    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { isSubmitting, error },
        setValue,
    } = useForm({ mode: "onChange" });

    const defaultProfileImg = `${process.env.PUBLIC_URL}/global/images/default.png`;

    const [password, setPassword, handlePasswordChange] = useInput(
        currentUser.password,
    );
    const [passwordCheck, setPasswordCheck, handlePasswordCheckChange] =
        useInput("");
    const [name, setName, handleNameChange] = useInput(currentUser.name);
    const [mobile, setMobile] = useInput(currentUser.mobile);
    const [nickname, setNickname, handleNicknameChange] = useInput(
        currentUser.nickname,
    );

    const [profileImg, setProfileImg] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordCheckError, setPasswordCheckError] = useState("");
    const [nameError, setNameError] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [nicknameError, setNicknameError] = useState("");

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[!@#])[\da-zA-Z!@#]{8,}$/;

    useEffect(() => {
        // if (currentUser.profileImg) {
        //     setProfileImg(currentUser.profileImg);
        // }
        const fetchUserProfileImage = async () => {
            if (currentUser && currentUser.email) {
                try {
                    const response = await fetch(
                        `${API_URL}/user/getProfile/${currentUser.email}`,
                    );
                    const data = await response.json();
                    setProfileImg(data.profileImg);
                    console.log(data.profileImg);
                } catch (error) {
                    console.error("Failed to fetch user profile image", error);
                }
            }
        };
        fetchUserProfileImage();
    }, []);

    useEffect(() => {
        changeProfileImgPath();
    }, [profileImg]);

    const handleImageChange = async (e) => {
        // const file = e.target.files[0];
        // console.log(file);

        // if (file) {
        //     const reader = new FileReader();
        //     reader.onloadend = () => {
        //         setProfileImg(reader.result);
        //     };
        //     reader.readAsDataURL(file);
        // } else {
        //     // 파일을 올리지 않았을 때 초기화
        //     setProfileImg(defaultProfileImg);
        // }

        const file = e.target.files[0];

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImg(imageUrl);

            const formData = new FormData();
            formData.append("profileImg", file);

            try {
                const response = await fetch(
                    `${API_URL}/user/uploadProfileImg`,
                    {
                        method: "POST",
                        body: formData,
                    },
                );

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || "Upload failed");
                }

                const data = await response.json();
                setProfileImg(data.profileImg); // 서버로부터 받은 이미지 경로 설정
            } catch (error) {
                console.error("Image upload failed:", error);
            } finally {
                // memory leak 방지
                URL.revokeObjectURL(imageUrl);
            }
        } else {
            // 파일을 올리지 않았을 때 초기화
            setProfileImg(defaultProfileImg);
        }
    };

    // 프로필이미지를 받아 서버에 업로드한 후 경로를 리턴하는 함수
    const uploadProfileImg = async (profileImgPath) => {
        const blob = await fetch(profileImgPath).then((res) => res.blob());
        const formData = new FormData();
        formData.append("profileImg", blob, "profileImg.png");

        const response = await fetch(
            `${API_URL}/user/uploadProfileImg`,
            {
                method: "POST",
                body: formData,
            },
        );

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "Upload failed");
        }

        const data = await response.json();
        return data.profileImg;
    };

    const changeProfileImgPath = async () => {
        let profileImgPath = "";
        if (profileImg && profileImg.startsWith("data:image")) {
            profileImgPath = await uploadProfileImg(profileImg);
            setProfileImg(profileImgPath);
        }
    };

    // useEffect(() => {
    //     const fetchUserProfileImage = async () => {
    //         if (currentUser && currentUser.email) {
    //             try {
    //                 const response = await fetch(`http://localhost:8000/user/getProfile/${currentUser.email}`);
    //                 const data = await response.json();
    //                 setProfileImg(data.profileImg);
    //                 console.log(data);
    //             } catch (error) {
    //                 console.error("Failed to fetch user profile image", error);
    //             }
    //         }
    //     };
    //     fetchUserProfileImage();
    // }, [currentUser.email]);

    const validatePassword = () => {
        const pwd = password || "";
        if (!pwd.match(passwordRegex) && password === currentUser.password) {
            setPasswordError("pattern");
            return false;
        }
        if (pwd === "") {
            setPasswordError("required");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const validatePasswordCheck = () => {
        if (password !== passwordCheck) {
            setPasswordCheckError("mismatch");
            return false;
        }
        if (passwordCheck === "") {
            setPasswordCheckError("required");
            return false;
        }
        setPasswordCheckError("");
        return true;
    };

    const validateName = () => {
        if (name === "") {
            setNameError("required");
            return false;
        }
        setNameError("");
        return true;
    };

    const checkMobileDuplicate = async (mobile) => {
        try {
            const response = await fetch(
                `${API_URL}/user/checkMobile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ mobile }),
                },
            );
            const result = await response.json();
            return result.duplicate;
        } catch (error) {
            console.error("Error checking mobile:", error);
            return false;
        }
    };

    const validateMobile = async () => {
        const mobilePattern = /^010\d{8}$/;
        if (mobile === "") {
            setMobileError("required");
            return false;
        }
        if (!mobilePattern.test(mobile)) {
            setMobileError("invalid");
            return false;
        }
        const isDuplicate = await checkMobileDuplicate(mobile);
        if (isDuplicate && mobile !== currentUser.mobile) {
            setMobileError("duplicate");
            return false;
        }
        setMobileError("");
        return true;
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 11) {
            setMobile(value);
        }
    };

    const checkNicknameDuplicate = async (nickname) => {
        try {
            const response = await fetch(
                `${API_URL}/user/checkNickname`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ nickname }),
                },
            );
            const result = await response.json();
            return result.duplicate;
        } catch (error) {
            console.error("Error checking nickname:", error);
            return false;
        }
    };

    const validateNickname = async () => {
        if (nickname === "") {
            setNicknameError("required");
            return false;
        }
        const isDuplicate = await checkNicknameDuplicate(nickname);
        if (isDuplicate && nickname !== currentUser.nickname) {
            setNicknameError("duplicate");
            return false;
        }
        setNicknameError("");
        return true;
    };

    const onSubmit = async (data) => {
        console.log("data 출력 : ", data);
        const isPasswordValid = validatePassword();
        const isPasswordCheckValid = validatePasswordCheck();
        const isNameValid = validateName();
        const isMobileValid = await validateMobile();
        const isNicknameValid = await validateNickname();
        // default이미지가 아니면 uploadProfileImg실행
        if (profileImg && profileImg.startsWith("data:image")) {
            await uploadProfileImg(profileImg);
            console.log("changeProfileImg 확인: ", profileImg);
        }
        if (
            isPasswordValid &&
            isPasswordCheckValid &&
            isNameValid &&
            isMobileValid &&
            isNicknameValid
        ) {
            try {
                console.log(data);
                const response = await fetch(
                    `${API_URL}/user/update`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: currentUser.email,
                            password: data.password,
                            mobile: data.mobile,
                            name: data.name,
                            nickname: data.nickname,
                            profileImg: profileImg,
                            statusMessage: data.statusMessage,
                        }),
                    },
                );
                console.log(response, "response data");

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || "modifying failed");
                }
                // window.location.replace("/mypage");
                navigate("/mypage");
            } catch (error) {
                console.error("Error during edting a profile:", error);
            }
        }
    };

    return (
        <S.Form action="/user/update" onSubmit={handleSubmit(onSubmit)}>
            <S.PageTitle>
                <h2>프로필 변경</h2>
            </S.PageTitle>
            <S.ProfilePictureWrapper htmlFor="profile-img">
                <label htmlFor="profile">
                    <S.ProfileWrapper>
                        <S.ProfileImgWrapper>
                            <img
                                src={
                                    profileImg ||
                                    `${process.env.PUBLIC_URL}/global/images/default.png`
                                }
                                alt="profile-img"
                            />
                        </S.ProfileImgWrapper>
                        <FontAwesomeIcon icon={faCirclePlus} className="icon" />
                    </S.ProfileWrapper>
                </label>
                <input
                    type="file"
                    id="profile"
                    style={{ display: "none" }}
                    accept=".jpg, .jpeg, .png, .svg"
                    onChange={handleImageChange}
                />
            </S.ProfilePictureWrapper>
            <S.InputContainer>
                <S.InputWrapper>
                    <S.Label>
                        <p>이메일</p>
                        <OneulInput
                            name="email"
                            value={currentUser.email}
                            readOnly
                        />
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper>
                    <S.Label htmlFor="currentPassword">
                        <p>비밀번호을 변경해주세요</p>
                        <OneulInput
                            id="currentPassword"
                            type="password"
                            name="currentPassword"
                            defaultValue={currentUser.password}
                            {...register("password")}
                            onBlur={(e) => {
                                setValue("password", e.target.value);
                                setPassword(e.target.value);
                            }}
                        />
                        <S.ConfirmMessageWrapper>
                            {passwordError === "pattern" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    최소 8자, 하나의 숫자와 특수문자가
                                    필요합니다.
                                </S.ConfirmMessage>
                            )}
                            {passwordError === "required" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    비밀번호를 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                        </S.ConfirmMessageWrapper>
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper htmlFor="passwordCheck">
                    <S.Label htmlFor="passwordCheck">
                        <p>비밀번호을 확인해주세요</p>
                        <OneulInput
                            id="passwordCheck"
                            type="password"
                            name="passwordCheck"
                            {...register("password")}
                            onBlur={(e) => {
                                setPasswordCheck(e.target.value);
                            }}
                        />
                        <S.ConfirmMessageWrapper>
                            {passwordCheckError === "mismatch" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    비밀번호가 일치하지 않습니다.
                                </S.ConfirmMessage>
                            )}
                            {passwordCheckError === "required" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    비밀번호 확인을 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                        </S.ConfirmMessageWrapper>
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper>
                    <S.Label htmlFor="name">
                        <p>이름을 변경해주세요</p>
                        <OneulInput
                            id="name"
                            name="name"
                            defaultValue={currentUser.name}
                            {...register("name")}
                            onBlur={(e) => setValue("name", e.target.value)}
                        />
                        <S.ConfirmMessageWrapper>
                            {nameError === "required" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    이름을 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                        </S.ConfirmMessageWrapper>
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper>
                    <S.Label htmlFor="mobile">
                        <p>전화번호를 변경해주세요</p>
                        <OneulInput
                            id="mobile"
                            type="tel"
                            name="mobile"
                            defaultValue={currentUser.mobile}
                            {...register("mobile")}
                            maxLength={11}
                            onBlur={handleMobileChange}
                        />
                        <S.ConfirmMessageWrapper>
                            {mobileError === "required" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    전화번호를 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                            {mobileError === "invalid" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    올바른 전화번호를 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                            {mobileError === "duplicate" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    중복된 전화번호입니다.
                                </S.ConfirmMessage>
                            )}
                        </S.ConfirmMessageWrapper>
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper>
                    <S.Label htmlFor="nickname">
                        <p>닉네임을 변경해주세요</p>
                        <OneulInput
                            id="nickname"
                            name="nickname"
                            defaultValue={currentUser.nickname}
                            {...register("nickname")}
                            onBlur={(e) => setValue("nickname", e.target.value)}
                        />
                        <S.ConfirmMessageWrapper>
                            {nicknameError === "required" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    닉네임을 입력해주세요.
                                </S.ConfirmMessage>
                            )}
                            {nicknameError === "duplicate" && (
                                <S.ConfirmMessage>
                                    <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className="icon"
                                    />
                                    중복된 닉네임입니다.
                                </S.ConfirmMessage>
                            )}
                        </S.ConfirmMessageWrapper>
                    </S.Label>
                </S.InputWrapper>
                <S.InputWrapper>
                    <S.Label htmlFor="statusMessage">
                        <p>상태메세지를 변경해주세요</p>
                        <OneulInput
                            id="statusMessage"
                            name="statusMessage"
                            defaultValue={currentUser.statusMessage}
                            {...register("statusMessage")}
                            onBlur={(e) =>
                                setValue("statusMessage", e.target.value)
                            }
                        />
                    </S.Label>
                </S.InputWrapper>
            </S.InputContainer>
            <S.buttonWrapper>
                <OneulButton
                    type="submit"
                    variant="indigo"
                    color="white"
                    size="large"
                    border="default"
                    disabled={isSubmitting}
                >
                    수정 완료
                </OneulButton>
            </S.buttonWrapper>
        </S.Form>
    );
};

export default MypageEditModify;
