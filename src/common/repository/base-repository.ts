import { Repository, FindOptionsWhere, UpdateResult } from 'typeorm';
import { BaseRepositoryPort } from './base-repository.port';
import { FindOneOptions } from 'typeorm';

export abstract class BaseRepository<T extends { id: string }>
  implements BaseRepositoryPort<T> {

  constructor(protected readonly repository: Repository<T>) { }

  async create(createDto: Partial<T>): Promise<T> {
    const entity = this.repository.create(createDto as T);
    return this.repository.save(entity);
  }

  async findById(id: string, options?: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T>, ...options });
  }

  async update(id: string, updateDto: Partial<T>): Promise<T> {
    await this.repository.update(id, updateDto as any);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return updated;
  }

  async updateOne(condition: FindOptionsWhere<T>, updateDto: Partial<T>): Promise<T> {
    const entity = await this.repository.findOne({ where: condition });
    if (!entity) {
      throw new Error('Entity not found');
    }
    Object.assign(entity, updateDto);
    return this.repository.save(entity);
  }

  async updateByCondition(condition: FindOptionsWhere<T>, updateDto: Partial<T>): Promise<UpdateResult> {
    return this.repository.update(condition, updateDto as any);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}