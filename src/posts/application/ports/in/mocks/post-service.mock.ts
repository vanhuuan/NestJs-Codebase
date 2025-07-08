import { PostServicePort } from '../../in/post-service.port';

export class MockPostService implements PostServicePort {
  createPost = jest.fn();
  findAllPosts = jest.fn();
  findPostById = jest.fn();
  updatePost = jest.fn();
  deletePost = jest.fn();
  findPostsByUserId = jest.fn();
  publishPost = jest.fn();
  unpublishPost = jest.fn();
}