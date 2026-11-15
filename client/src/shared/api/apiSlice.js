import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const API_URL =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_API_URL
        : "http://localhost:8000";

// 프로필 이미지 주소의 앞부분. DB 값("images/profile/<파일명>") 앞에 붙여 쓴다
// 배포: Cloudinary에서 직접 받음 (값이 없으면 서버를 거쳐 Cloudinary로 리다이렉트) / 개발: server/images/profile
export const IMAGE_URL =
    process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_IMAGE_URL || API_URL
        : API_URL;

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
    }),
    tagTypes: ["Post", "Comment"],
    endpoints: () => ({}),
});
