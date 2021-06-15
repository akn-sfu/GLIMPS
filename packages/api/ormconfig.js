module.exports = {
  type: 'postgres',
  database: 'glimps',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: parseInt(process.env.TYPEORM_PORT, 10) || 5432,
  username: process.env.TYPEORM_USERNAME || 'postgres',
  password: process.env.TYPEORM_PASSWORD || 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
};
