import { Repository, FindOneOptions, FindOptionsWhere, UpdateResult } from 'typeorm';
import { BaseRepository } from './base-repository';

interface TestEntity {
  id: string;
  name: string;
}

// Concrete implementation of BaseRepository for testing
class TestRepository extends BaseRepository<TestEntity> {
  constructor(repository: Repository<TestEntity>) {
    super(repository);
  }
}

describe('BaseRepository', () => {
  let repository: jest.Mocked<Repository<TestEntity>>;
  let testRepository: TestRepository;

  const mockEntity: TestEntity = {
    id: '1',
    name: 'Test Entity'
  };

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<TestEntity>>;

    testRepository = new TestRepository(repository);
  });

  describe('create', () => {
    it('should create and save an entity', async () => {
      const createDto = { name: 'Test Entity' };
      repository.create.mockReturnValue(mockEntity);
      repository.save.mockResolvedValue(mockEntity);

      const result = await testRepository.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockEntity);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('findById', () => {
    it('should find an entity by id', async () => {
      repository.findOne.mockResolvedValue(mockEntity);

      const result = await testRepository.findById('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockEntity);
    });

    it('should find an entity by id with options', async () => {
      const options: FindOneOptions<TestEntity> = {
        relations: ['related']
      };
      repository.findOne.mockResolvedValue(mockEntity);

      const result = await testRepository.findById('1', options);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['related']
      });
      expect(result).toEqual(mockEntity);
    });

    it('should return null when entity is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await testRepository.findById('999');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an entity and return the updated entity', async () => {
      const updateDto = { name: 'Updated Entity' };
      const updatedEntity = { ...mockEntity, ...updateDto };
      repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      repository.findOne.mockResolvedValue(updatedEntity);

      const result = await testRepository.update('1', updateDto);

      expect(repository.update).toHaveBeenCalledWith('1', updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(updatedEntity);
    });

    it('should throw an error when entity is not found after update', async () => {
      const updateDto = { name: 'Updated Entity' };
      repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);
      repository.findOne.mockResolvedValue(null);

      await expect(testRepository.update('999', updateDto))
        .rejects
        .toThrow('Entity with id 999 not found');
      expect(repository.update).toHaveBeenCalledWith('999', updateDto);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });

    it('should handle update with no changes', async () => {
      const updateDto = { name: 'Test Entity' };
      repository.update.mockResolvedValue({ affected: 0, raw: {} } as any);
      repository.findOne.mockResolvedValue(mockEntity);

      const result = await testRepository.update('1', updateDto);

      expect(repository.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(mockEntity);
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      repository.update.mockResolvedValue({ affected: 1, raw: {} } as any);

      await testRepository.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });
  describe('updateOne', () => {
    it('should update an entity based on condition and return the updated entity', async () => {
      const condition = { name: 'Test Entity' };
      const updateDto = { name: 'Updated Entity' };
      const updatedEntity = { ...mockEntity, ...updateDto };

      repository.findOne.mockResolvedValue(mockEntity);
      repository.save.mockResolvedValue(updatedEntity);

      const result = await testRepository.updateOne(condition, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: condition });
      expect(repository.save).toHaveBeenCalledWith({ ...mockEntity, ...updateDto });
      expect(result).toEqual(updatedEntity);
    });

    it('should throw an error when entity is not found by condition', async () => {
      const condition = { name: 'Non-existent Entity' };
      const updateDto = { name: 'Updated Entity' };

      repository.findOne.mockResolvedValue(null);

      await expect(testRepository.updateOne(condition, updateDto))
        .rejects
        .toThrow('Entity not found');

      expect(repository.findOne).toHaveBeenCalledWith({ where: condition });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateByCondition', () => {
    it('should update entities matching the condition and return UpdateResult', async () => {
      const condition = { name: 'Test Entity' };
      const updateDto = { name: 'Updated Entity' };
      const mockUpdateResult: UpdateResult = {
        affected: 2,
        raw: {},
        generatedMaps: []
      };

      repository.update.mockResolvedValue(mockUpdateResult);

      const result = await testRepository.updateByCondition(condition, updateDto);

      expect(repository.update).toHaveBeenCalledWith(condition, updateDto);
      expect(result).toEqual(mockUpdateResult);
    });

    it('should return an UpdateResult with affected: 0 when no entities match the condition', async () => {
      const condition = { name: 'Non-existent Entity' };
      const updateDto = { name: 'Updated Entity' };
      const mockUpdateResult: UpdateResult = {
        affected: 0,
        raw: {},
        generatedMaps: []
      };

      repository.update.mockResolvedValue(mockUpdateResult);

      const result = await testRepository.updateByCondition(condition, updateDto);

      expect(repository.update).toHaveBeenCalledWith(condition, updateDto);
      expect(result).toEqual(mockUpdateResult);
      expect(result.affected).toBe(0);
    });
  });
});