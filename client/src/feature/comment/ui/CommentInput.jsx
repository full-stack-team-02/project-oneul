import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Avatar from "../../../shared/ui/Avatar";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { IMAGE_URL } from "../../../shared/api/apiSlice";
import { useCreateCommentMutation } from "../api/commentApi";

const CommentInput = () => {
    const [text, setText] = useState("");
    const [createComment] = useCreateCommentMutation();
    const { postId } = useSelector((s) => s.commentUI);
    const currentUser = useSelector((state) => state.login.currentUser);
    const profileImgSrc = currentUser
        ? `${IMAGE_URL}/${currentUser.profileImg}`
        : "";

    const handleSend = async () => {
        if (!text.trim()) return;

        await createComment({
            postId: postId,
            commentText: text,
            commentUser: currentUser.email,
            commentProfileImg: currentUser.profileImg,
            commentUserNickName: currentUser.nickname,
        });

        setText("");
    };

    return (
        <InputRow>
            <Avatar src={profileImgSrc} alt="profile-img" />
            <InputWrap>
                <StyledInput
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="따뜻한 댓글을 남겨보세요"
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <SendBtn onClick={handleSend}>
                    <FontAwesomeIcon icon={faPaperPlane} className="icon" />
                </SendBtn>
            </InputWrap>
        </InputRow>
    );
};

export default CommentInput;

const InputRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0 1rem 0.875rem;
`;

const InputWrap = styled.div`
    flex: 1;
    background: #f5f5f5;
    border-radius: 1.25rem;
    padding: 9px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const StyledInput = styled.input`
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    font-size: 13px;
    color: #333;
    &::placeholder {
        color: #bbb;
    }
`;

const SendBtn = styled.button`
    height: auto;
    background: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;

    & .icon {
        color: #5b5ea6;
    }
`;
