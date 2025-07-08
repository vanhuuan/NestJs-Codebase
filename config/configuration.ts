export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'blog',
    // For test environment
    testHost: process.env.TEST_DB_HOST || 'localhost',
    testPort: parseInt(process.env.TEST_DB_PORT || '5433', 10),
    testUsername: process.env.TEST_DB_USERNAME || 'postgres',
    testPassword: process.env.TEST_DB_PASSWORD || 'postgres',
    testDatabase: process.env.TEST_DB_DATABASE || 'blog_test',
  },
});