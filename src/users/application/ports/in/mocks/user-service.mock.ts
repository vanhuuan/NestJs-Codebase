import { UserServicePort } from '../../in/user-service.port';

export class MockUserService implements UserServicePort {
  createUser = jest.fn();
  findAllUsers = jest.fn();
  findUserById = jest.fn();
  updateUser = jest.fn();
  deleteUser = jest.fn();
}