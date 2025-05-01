const redis = require('../config/redis');

const cache = (duration) => {
  return async (req, res, next) => {
    // Gerar chave única para a requisição
    const key = `cache:${req.originalUrl || req.url}`;

    try {
      // Tentar obter dados do cache
      const cachedData = await redis.get(key);

      if (cachedData) {
        // Se existir no cache, retornar os dados
        return res.json(JSON.parse(cachedData));
      }

      // Se não existir no cache, continuar com a requisição
      // e armazenar a resposta original
      const originalJson = res.json;
      res.json = (body) => {
        // Armazenar no cache
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson.call(res, body);
      };

      next();
    } catch (error) {
      // Em caso de erro no cache, continuar com a requisição
      next();
    }
  };
};

module.exports = cache; 