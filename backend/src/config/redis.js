const Redis = require('ioredis');
const winston = require('winston');

let redis;

if (process.env.NODE_ENV !== 'test') {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false
    });

    redis.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis não está disponível em ambiente de desenvolvimento');
        return;
      }
      winston.error('Erro na conexão com o Redis:', err);
    });

    redis.on('connect', () => {
      winston.info('Conexão com Redis estabelecida com sucesso');
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Redis não está disponível em ambiente de desenvolvimento');
    } else {
      winston.error('Erro ao criar cliente Redis:', error);
    }
  }
}

// Mock para ambiente de desenvolvimento
if (process.env.NODE_ENV === 'development' && !redis) {
  redis = {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    on: () => {}
  };
}

module.exports = redis; 