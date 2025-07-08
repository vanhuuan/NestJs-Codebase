import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class PostgresTestContainer {
  private container: PostgreSqlContainer;
  private startedContainer: StartedPostgreSqlContainer | null = null;

  constructor() {
    this.container = new PostgreSqlContainer('postgres:14')
      .withUsername('postgres')
      .withPassword('postgres')
      .withDatabase('test_db');
  }

  async start(): Promise<StartedPostgreSqlContainer> {
    this.startedContainer = await this.container.start();
    return this.startedContainer;
  }

  async stop(): Promise<void> {
    if (this.startedContainer) {
      await this.startedContainer.stop();
      this.startedContainer = null;
    }
  }

  getTypeOrmConfig(entities: any[]): TypeOrmModuleOptions {
    if (!this.startedContainer) {
      throw new Error('Container not started. Call start() first.');
    }

    return {
      type: 'postgres',
      host: this.startedContainer.getHost(),
      port: this.startedContainer.getMappedPort(5432),
      username: this.startedContainer.getUsername(),
      password: this.startedContainer.getPassword(),
      database: this.startedContainer.getDatabase(),
      entities: entities,
      synchronize: true,
      logging: false,
    };
  }

  getMockConfigService(): ConfigService {
    if (!this.startedContainer) {
      throw new Error('Container not started. Call start() first.');
    }

    const configMap = new Map<string, any>();
    configMap.set('DB_HOST', this.startedContainer.getHost());
    configMap.set('DB_PORT', this.startedContainer.getMappedPort(5432).toString());
    configMap.set('DB_USERNAME', this.startedContainer.getUsername());
    configMap.set('DB_PASSWORD', this.startedContainer.getPassword());
    configMap.set('DB_DATABASE', this.startedContainer.getDatabase());

    return {
      get: jest.fn((key: string) => configMap.get(key)),
    } as unknown as ConfigService;
  }
}
