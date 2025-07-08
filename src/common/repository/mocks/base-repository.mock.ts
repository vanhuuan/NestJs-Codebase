import { BaseRepositoryPort } from '../base-repository.port';
export class MockBaseRepository<T> implements BaseRepositoryPort<T> {
  create = jest.fn();
  findById = jest.fn();
  update = jest.fn();
  updateOne = jest.fn();
  updateByCondition = jest.fn();
  delete = jest.fn();
}