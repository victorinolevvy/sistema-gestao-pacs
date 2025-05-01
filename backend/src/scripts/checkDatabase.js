const models = require('../models');
const sequelize = require('../config/database'); // Importar a instância do sequelize
const bcrypt = require('bcrypt');

async function checkDatabase() {
  try {
    // Check database connection instead of altering schema
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados verificada com sucesso.');

    // Verificar se existe algum usuário
    const usuarios = await models.Usuario.findAll(); // Usar models.Usuario
    console.log('Usuários encontrados:', usuarios.length);

    if (usuarios.length === 0) {
      // Criar usuário admin se não existir nenhum
      const admin = await models.Usuario.create({ // Usar models.Usuario
        nome: 'Admin',
        email: 'admin@teste.com',
        senha: '123456',
        role: 'ADMIN'
      });
      console.log('Usuário admin criado com sucesso:', admin.toJSON());
    }

    // Listar todos os usuários
    const todosUsuarios = await models.Usuario.findAll({ // Usar models.Usuario
      attributes: ['id', 'nome', 'email', 'role']
    });
    console.log('Lista de usuários:', JSON.stringify(todosUsuarios, null, 2));

  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    throw error; // Propagar o erro para que o servidor não inicie se houver problemas
  }
}

module.exports = checkDatabase;