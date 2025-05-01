const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Mock Redis
jest.mock('../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  on: jest.fn()
}));

// Mock Winston
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    json: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    File: jest.fn(),
    Console: jest.fn()
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    add: jest.fn()
  }))
}));

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'pacs_test';
process.env.JWT_SECRET = 'test_secret';
process.env.PORT = '3002'; // Porta diferente para testes

// Função para executar comandos do banco de dados
const runDbCommand = async (command) => {
  try {
    await execAsync(command);
  } catch (error) {
    console.error(`Erro ao executar comando: ${command}`, error);
    throw error;
  }
};

// Configurar banco de dados de teste
beforeAll(async () => {
  // Criar banco de dados de teste se não existir
  try {
    await runDbCommand(`psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -c "CREATE DATABASE ${process.env.DB_NAME};"`);
  } catch (error) {
    // Ignora erro se o banco já existe
  }
  
  // Executar migrações
  await runDbCommand(`npx sequelize-cli db:migrate --env test`);
});

// Limpar banco de dados após os testes
afterAll(async () => {
  try {
    await runDbCommand(`psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} -c "DROP DATABASE IF EXISTS ${process.env.DB_NAME};"`);
  } catch (error) {
    console.error('Erro ao limpar banco de dados:', error);
  }
}); 