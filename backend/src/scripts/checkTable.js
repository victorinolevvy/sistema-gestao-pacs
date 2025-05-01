// backend/src/scripts/checkTable.js
const sequelize = require('../config/database');
const { Pagamento } = require('../models'); // Ajuste o caminho se necessário

async function checkDatabase() {
  console.log('Tentando conectar ao banco de dados...');
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    console.log('Tentando sincronizar o modelo Pagamento...');
    // Usar { alter: true } pode ser útil se a tabela já existir mas precisar de ajustes
    // Usar { force: true } recriaria a tabela (CUIDADO: apaga dados existentes)
    // Sem opções, ele tenta criar a tabela apenas se ela não existir.
    await Pagamento.sync(); 
    console.log('Modelo Pagamento sincronizado com sucesso (tabela "pagamentos" deve existir).');

    // Opcional: Tentar uma consulta simples
    // console.log('Tentando buscar um pagamento...');
    // const count = await Pagamento.count();
    // console.log(`Encontrados ${count} registros na tabela pagamentos.`);

  } catch (error) {
    console.error('Erro durante a verificação do banco de dados:', error);
  } finally {
    console.log('Fechando conexão com o banco de dados.');
    await sequelize.close();
  }
}

checkDatabase();
