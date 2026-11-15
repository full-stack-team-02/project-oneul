import React, { useState } from "react";
import styled from "styled-components";
import Avatar from "../../../shared/ui/Avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { useDispatch } from "react-redux";
import { openModal } from "../../modal/model/modalSlice";
import CommentEdit from "./CommentEdit";
import { IMAGE_URL } from "../../../shared/api/apiSlice";
import { useUpdateCommentMutation } from "../api/commentApi";
import { formatTimeAgo } from "../../../shared/util/formatTimeAgo";

const CommentItem = ({ c }) => {
    const dispatch = useDispatch();
    const [updateComment] = useUpdateCommentMutation();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");
    console.log("comment :", c);
    // 댓글 작성 시간
    const commentTime = formatTimeAgo(c.time);

    const handleEditStart = () => {
        setIsEditing((prev) => !prev);
        setEditText(c.text);
    };

    const handleEditSave = async (id) => {
        if (!editText.trim()) return;

        try {
            await updateComment({
                id,
                commentText: editText.trim(),
            }).unwrap();

            setIsEditing(false);
            setEditText("");
        } catch (error) {
            console.error("댓글 수정 실패", error);
        }

        setIsEditing(false);
        setEditText("");
    };

    const handleEditCancel = () => {
        setIsEditing((prev) => !prev);
        setEditText("");
    };

    return (
        <CommentRow>
            <Avatar src={`${IMAGE_URL}/${c.profileImg}`} />
            <CommentBody>
                <CommentMeta>
                    <AuthorWrap>
                        <AuthorName>{c.author}</AuthorName>
                        {c.isMine && <MeBadge>나</MeBadge>}
                    </AuthorWrap>
                    <TimeAndActions>
                        <Time>{commentTime}</Time>
                        {c.isMine && (
                            <>
                                <IconBtn>
                                    <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        color="#aaa"
                                        onClick={handleEditStart}
                                    />
                                </IconBtn>
                                <IconBtn
                                    onClick={() =>
                                        dispatch(
                                            openModal({
                                                type: "deleteComment",
                                                targetId: c._id,
                                            }),
                                        )
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        color="#aaa"
                                    />
                                </IconBtn>
                            </>
                        )}
                    </TimeAndActions>
                </CommentMeta>
                {isEditing ? (
                    <CommentEdit
                        value={editText}
                        onChangeText={(text) => setEditText(text)} // e 없이 text만 받음
                        onSave={() => handleEditSave(c._id)}
                        onCancel={handleEditCancel}
                    />
                ) : (
                    <CommentText>{c.text}</CommentText>
                )}
            </CommentBody>
        </CommentRow>
    );
};

export default React.memo(CommentItem, (prev, next) => {
    return (
        prev.c._id === next.c._id &&
        prev.c.text === next.c.text &&
        prev.c.time === next.c.time
    );
});

const CommentRow = styled.div`
    display: flex;
    gap: 10px;
    align-items: flex-start;
`;

const CommentBody = styled.div`
    flex: 1;
`;

const CommentMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
`;

const AuthorWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
`;

const AuthorName = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #222;
`;

const MeBadge = styled.span`
    font-size: 10px;
    background: #eef0ff;
    color: #5b5ea6;
    border-radius: 20px;
    padding: 2px 7px;
`;

const TimeAndActions = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const Time = styled.span`
    font-size: 11px;
    color: #bbb;
`;

const IconBtn = styled.button`
    height: auto;
    background: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    cursor: pointer;
    padding: 0;
    display: flex;
    font-size: 0.8125rem;
`;

const CommentText = styled.p`
    font-size: 13px;
    color: #666;
    margin: 0 0 6px;
    line-height: 1.5;
`;
