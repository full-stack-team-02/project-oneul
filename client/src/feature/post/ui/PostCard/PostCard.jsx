import React, { useMemo } from "react";
import styled from "styled-components";
import PostHeader from "./PostHeader";
import { PostContent } from "./PostContent";
import PostAction from "./PostAction";
import { IMAGE_URL } from "../../../../shared/api/apiSlice";
import { useSelector } from "react-redux";

const reactionTypes = ["heart", "like", "smile", "sad", "angry"];

const PostCard = ({ post, keyword }) => {
    const currentUser = useSelector((state) => state.login.currentUser);
    const currentUserEmail = currentUser?.email;
    const profileImg = useMemo(
        () => `${IMAGE_URL}/${post.userProfileImg}`,
        [post.userProfileImg],
    );

    return (
        <PostContainer>
            <PostHeader
                profileImg={profileImg}
                nickname={post.userNickname}
                isMine={post.isMine}
                postId={post._id}
                content={post.content}
            />
            <PostContent keyword={keyword}>{post.content}</PostContent>
            <PostAction
                postId={post._id}
                reactions={post.reactions}
                commentCnt={post.commentCount}
                email={currentUserEmail}
            />
        </PostContainer>
    );
};

export default React.memo(PostCard, (prev, next) => {
    const prevPost = prev.post;
    const nextPost = next.post;

    return (
        prevPost._id === nextPost._id &&
        prevPost.content === nextPost.content &&
        prevPost.commentCount === nextPost.commentCount &&
        reactionTypes.every(
            (type) =>
                prevPost.reactions?.[type]?.count ===
                    nextPost.reactions?.[type]?.count &&
                prevPost.reactions?.[type]?.reacted ===
                    nextPost.reactions?.[type]?.reacted,
        )
    );
});

const PostContainer = styled.div`
    width: 20rem;
    min-height: 20rem;
    background-color: #ffffff;
    border-radius: 1.25rem;
    box-shadow: 0px 4px 7px rgba(0, 0, 0, 0.25);
`;
