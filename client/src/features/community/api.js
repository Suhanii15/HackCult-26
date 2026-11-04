import { request } from '../../services/api';

/**
 * Fetch global community feed with server-side sorting, filtering, and pagination.
 * @param {Object} params
 * @param {'recent' | 'liked' | 'celebrated' | 'mine'} params.sort
 * @param {string} params.tag - Optional category tag filter (e.g. 'all', 'Energy', 'Transport', 'Waste', 'Water')
 * @param {number} params.page
 * @param {number} params.limit
 */
export const fetchCommunityPosts = async ({
  sort = 'recent',
  tag = 'all',
  page = 1,
  limit = 20,
} = {}) => {
  const queryParams = new URLSearchParams({
    sort,
    page: String(page),
    limit: String(limit),
  });
  if (tag && tag !== 'all') {
    queryParams.append('tag', tag);
  }

  const res = await request(`/community/posts?${queryParams.toString()}`, {
    method: 'GET',
  });
  return res;
};

/**
 * Fetch single community post by ID
 */
export const fetchCommunityPostById = async (postId) => {
  return await request(`/community/posts/${postId}`, {
    method: 'GET',
  });
};

/**
 * Create a new community post
 * @param {Object} postData
 * @param {string} postData.title
 * @param {string} postData.content
 * @param {string} postData.tag
 */
export const createCommunityPost = async ({ title, content, tag }) => {
  return await request('/community/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, tag }),
  });
};

/**
 * Edit own community post
 */
export const editCommunityPost = async (postId, { title, content, tag }) => {
  return await request(`/community/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content, tag }),
  });
};

/**
 * Delete own community post
 */
export const deleteCommunityPost = async (postId) => {
  return await request(`/community/posts/${postId}`, {
    method: 'DELETE',
  });
};

/**
 * Like a post
 */
export const likeCommunityPost = async (postId) => {
  return await request(`/community/posts/${postId}/like`, {
    method: 'POST',
  });
};

/**
 * Unlike a post
 */
export const unlikeCommunityPost = async (postId) => {
  return await request(`/community/posts/${postId}/like`, {
    method: 'DELETE',
  });
};

/**
 * Celebrate a post
 */
export const celebrateCommunityPost = async (postId) => {
  return await request(`/community/posts/${postId}/celebrate`, {
    method: 'POST',
  });
};

/**
 * Remove celebration from a post
 */
export const removeCelebrateCommunityPost = async (postId) => {
  return await request(`/community/posts/${postId}/celebrate`, {
    method: 'DELETE',
  });
};
