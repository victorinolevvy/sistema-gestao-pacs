const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Carrega variáveis de ambiente do .env na raiz do projeto

module.exports = {
  development: {
    username: process.env.DB_USER || 'pacs_user',
    password: process.env.DB_PASSWORD || 'pacs_password',
    database: process.env.DB_NAME || 'pacs_database',
    // Use 'postgres' as the host when running in Docker via docker-compose
    // Use the internal port 5432, not the host-mapped port 5436
    host: process.env.DB_HOST || 'pacs-postgres', // Corrigido para o nome do serviço do docker-compose
    port: process.env.DB_PORT || 5432,      // Default to internal container port
    dialect: "postgres",
    schema: 'pacs' // Alterar para 'pacs'
  },
  test: {
    // Manter ou ajustar conforme necessário para o ambiente de teste
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    // Manter ou ajustar conforme necessário para o ambiente de produção
    // É altamente recomendável usar variáveis de ambiente aqui também
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST, // Should be set via env var in production
    port: process.env.DB_PORT, // Should be set via env var in production
    dialect: "postgres",
    schema: 'pacs' // Alterar para 'pacs'
  }
};
