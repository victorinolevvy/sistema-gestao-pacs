const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path'); // Import path module
const { limiter } = require('./middleware/rateLimiter');
const agendadorService = require('./services/agendadorService');
const winston = require('winston');
const setupSwagger = require('./config/swagger');
const checkDatabase = require('./scripts/checkDatabase');

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000; // Alterado de 3001 para 3000

// Middleware de segurança
app.use(helmet());

// Middleware de compressão
app.use(compression());

// Middleware CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..' , 'uploads'))); // Add this line

// Rate limiting
app.use(limiter);

// Logging de requisições
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    body: req.body
  });
  next();
});

// Configurar Swagger
setupSwagger(app);

// Conexão com o banco de dados
const sequelize = require('./config/database');

// Testar conexão com o banco
sequelize.authenticate()
  .then(() => {
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    // Iniciar agendador após conexão com o banco
    if (process.env.NODE_ENV !== 'test') {
      agendadorService.iniciar();
    }
  })
  .catch(err => {
    logger.error('Não foi possível conectar ao banco de dados:', err);
    process.exit(1); // Encerra o processo se não conseguir conectar ao banco
  });

// Importar rotas
const routes = require('./routes/');

// Configurar rotas
app.use('/api', routes);

// Rota básica para teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Sistema de Gestão de PACs' });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error('Erro:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Erro interno do servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
async function startServer() {
  try {
    // Verificar e inicializar banco de dados
    await checkDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;