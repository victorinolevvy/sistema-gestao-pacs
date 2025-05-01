const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'pacs_database',
  process.env.DB_USER || 'pacs_user',
  process.env.DB_PASSWORD || 'pacs_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5436,
    dialect: 'postgres',
    schema: process.env.DB_SCHEMA || 'pacs', // Adiciona esta linha
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/
      ],
      max: 3
    }
  }
);

// Testar conexão
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Não foi possível conectar ao banco de dados:', err);
    process.exit(1);
  });

module.exports = sequelize;