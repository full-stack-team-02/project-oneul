import React, { useEffect } from "react";
import S from "./style";
import { Link, useNavigate } from "react-router-dom";
import OneulButton from "../../components/button/OneulButton";
import { useSelector } from "react-redux";

const SignUpSuccess = () => {
    const navigate = useNavigate();

    const signUpData = useSelector((state) => state.signup);

    useEffect(() => {
        console.log("SignUpStep5 signUpData:", signUpData);
    }, [signUpData]);

    const handleOnClickLogin = () => {
        navigate("/logIn");
    };

    return (
        <S.Background>
            <S.Wrapper>
                <S.LogoWrapper>
                    <Link to={"/logIn"} onClick={handleOnClickLogin}>
                        <img src={`${process.env.PUBLIC_URL}/global/images/logo.png`} alt="logo" />
                    </Link>
                </S.LogoWrapper>
                <S.ContentContainer>
                    <S.ImgWrapper>
                        <img src={`${process.env.PUBLIC_URL}/global/images/heart.png`} alt="heart" />
                        <S.H3>회원가입 성공!</S.H3>
                    </S.ImgWrapper>
                </S.ContentContainer>
                <S.ButtonContainer>
                    <OneulButton variant={"indigo"} border={"default"} size={"large"} color={"white"} onClick={handleOnClickLogin}>
                        로그인으로 이동
                    </OneulButton>
                </S.ButtonContainer>
            </S.Wrapper>
        </S.Background>
    );
};

export default SignUpSuccess;
