import { FindOneOptions, FindOptionsWhere, UpdateResult } from 'typeorm';

export interface BaseRepositoryPort<T> {
  create(createDto: Partial<T>): Promise<T>;
  findById(id: string, options?: FindOneOptions<T>): Promise<T | null>;
  update(id: string, updateDto: Partial<T>): Promise<T>;
  updateOne(condition: FindOptionsWhere<T>, updateDto: Partial<T>): Promise<T>;
  updateByCondition(condition: FindOptionsWhere<T>, updateDto: Partial<T>): Promise<UpdateResult>;
  delete(id: string): Promise<void>;
}
