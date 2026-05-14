import type {
  ApiResponse,
  PostCreateRequest,
  PostCreateResponse,
} from "@linksee/shared";

import apiClient from ".";

export const forumApi = {
  createPost: (data: PostCreateRequest) =>
    apiClient.post<ApiResponse<PostCreateResponse>>("/forum/post", data),
};
