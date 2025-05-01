'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Renomear a coluna existente para _old (se existir)
      // Usamos try/catch porque a coluna pode não existir se a migração falhou antes
      try {
        await queryInterface.renameColumn(
          { tableName: 'pagamentos', schema: 'pacs' },
          'usuario_id',
          'usuario_id_old',
          { transaction }
        );
      } catch (error) {
        // Ignora o erro se a coluna 'usuario_id' não existir (pode ter sido removida numa tentativa anterior)
        // Ou se a coluna 'usuario_id_old' já existir
        if (!error.message.includes('column "usuario_id" does not exist') && !error.message.includes('column "usuario_id_old" of relation "pagamentos" already exists')) {
          throw error; // Re-lança outros erros inesperados
        }
        console.log("Coluna 'usuario_id' não encontrada ou 'usuario_id_old' já existe, continuando...");
      }


      // 2. Adicionar a nova coluna usuario_id com o tipo correto
      await queryInterface.addColumn(
        { tableName: 'pagamentos', schema: 'pacs' },
        'usuario_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true, // Permitir null temporariamente para adicionar a FK
          references: {
            model: { tableName: 'usuarios', schema: 'pacs' }, // Especificar schema na tabela referenciada
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL' // Ou 'CASCADE'/'RESTRICT' dependendo da lógica desejada
        },
        { transaction }
      );

      // 3. (Opcional) Copiar dados da coluna antiga para a nova (se possível e necessário)
      // Exemplo: await queryInterface.sequelize.query('UPDATE pacs.pagamentos SET usuario_id = CAST(usuario_id_old AS INTEGER) WHERE usuario_id_old IS NOT NULL;', { transaction });
      // Nota: Isto falhará se os dados em usuario_id_old não puderem ser convertidos para INTEGER.
      // Por agora, vamos omitir a cópia de dados para simplificar.

      // 4. Remover a coluna antiga
      // Adicionamos um try/catch aqui também, caso a coluna já tenha sido removida
       try {
        await queryInterface.removeColumn(
          { tableName: 'pagamentos', schema: 'pacs' },
          'usuario_id_old',
          { transaction }
        );
      } catch (error) {
        if (!error.message.includes('column "usuario_id_old" of relation "pagamentos" does not exist')) {
          throw error; // Re-lança outros erros inesperados
        }
         console.log("Coluna 'usuario_id_old' não encontrada para remover, continuando...");
      }

      // 5. Alterar a coluna para não permitir nulos (se for o requisito)
      await queryInterface.changeColumn(
        { tableName: 'pagamentos', schema: 'pacs' },
        'usuario_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false // Agora definimos como não nulo
        },
        { transaction }
      );


      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Adicionar a coluna antiga de volta (provavelmente STRING)
      await queryInterface.addColumn(
        { tableName: 'pagamentos', schema: 'pacs' },
        'usuario_id_old', // Recriar como _old
        {
          type: Sequelize.STRING, // Assumindo que era STRING, ajuste se necessário
          allowNull: true
        },
        { transaction }
      );

      // 2. (Opcional) Copiar dados da coluna nova (INTEGER) para a antiga (STRING)
      // Exemplo: await queryInterface.sequelize.query('UPDATE pacs.pagamentos SET usuario_id_old = CAST(usuario_id AS VARCHAR) WHERE usuario_id IS NOT NULL;', { transaction });
      // Omitindo por agora.

      // 3. Remover a chave estrangeira e a coluna nova (INTEGER)
      // O Sequelize remove a constraint automaticamente ao remover a coluna referenciada
      await queryInterface.removeColumn(
        { tableName: 'pagamentos', schema: 'pacs' },
        'usuario_id',
        { transaction }
      );

      // 4. Renomear a coluna _old de volta para o nome original
      await queryInterface.renameColumn(
        { tableName: 'pagamentos', schema: 'pacs' },
        'usuario_id_old',
        'usuario_id',
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
