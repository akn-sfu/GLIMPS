export default () => ({
  jwtSigningKey: process.env.JWT_SIGNING_KEY || 'localdev',
  jwtAuthExpiryPeriod: process.env.JWT_AUTH_EXPIRY_PERIOD || '24h',
  sfuValidationEndpoint:
    process.env.SFU_VALIDATION_ENDPOINT ||
    'https://cas.sfu.ca/cas/serviceValidate',
  gitlabBaseUrl:
    process.env.GITLAB_BASE_URL || 'https://cmpt373-1211-09.cmpt.sfu.ca/api/v4',
  database: {
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
  },
});
