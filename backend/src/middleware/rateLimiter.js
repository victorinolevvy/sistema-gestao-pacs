const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente após 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // limite de 5 tentativas de login por IP
  message: {
    error: 'Muitas tentativas de login, por favor tente novamente após 1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  limiter,
  loginLimiter
}; 