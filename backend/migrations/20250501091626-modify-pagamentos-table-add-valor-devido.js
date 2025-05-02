'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add valor_renda_referencia column
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_renda_referencia', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true, // Or false if it should always be set
        defaultValue: 0,
        comment: 'Valor base da renda esperado para o mês/ano de referência'
      }, { transaction });

      // Add valor_devido column
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_devido', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true, // Or false if it should always be calculated/set
        defaultValue: 0,
        comment: 'Valor total devido para o período (renda + multa)'
      }, { transaction });

      // Remove valor_regularizado column
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_regularizado', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add back valor_regularizado column
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_regularizado', {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
        allowNull: false, // Assuming original settings
      }, { transaction });

      // Remove valor_devido column
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_devido', { transaction });

      // Remove valor_renda_referencia column
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'valor_renda_referencia', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
