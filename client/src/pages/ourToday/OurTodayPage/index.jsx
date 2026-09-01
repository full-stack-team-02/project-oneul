import React from "react";
import styled from "styled-components";
import TabMenu from "../../../feature/post/ui/TabMenu/TabMenu";
import PostCard from "../../../feature/post/ui/PostCard/PostCard";
import CommentBS from "../../../feature/comment/ui/CommentBS";
import DeleteConfirmModal from "../../../feature/modal/ui/DeleteConfirmModal";
import { useSelector } from "react-redux";
import { useGetPostsQuery } from "../../../feature/post/api/postApi";

const OurToday = () => {
    const { tab } = useSelector((s) => s.post);
    const { currentUser } = useSelector((s) => s.login);

    const { data: posts = [], isLoading } = useGetPostsQuery({
        type: tab,
        email: currentUser.email,
    });

    if (isLoading) return <div>로딩중...</div>;
    console.log("posts 데이터:", posts);
    return (
        <>
            <TabMenu />
            <PostList>
                {posts.map((post) => (
                    <li key={post._id}>
                        <PostCard post={post} />
                    </li>
                ))}
            </PostList>
            <DeleteConfirmModal />
            <CommentBS />
        </>
    );
};

export default OurToday;

const PostList = styled.ul`
    list-style-type: none;
    padding: 1.4375rem 1.25rem 4.375rem;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
`;
