'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Use object notation for table name and schema
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'status_confirmacao', {
        type: Sequelize.ENUM('PENDENTE', 'CONFIRMADO', 'REJEITADO'),
        allowNull: false,
        defaultValue: 'PENDENTE',
        comment: 'Status da confirmação do pagamento pelo admin/supervisor'
      }, { transaction });

      // Use object notation for table name and schema
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'confirmado_por_usuario_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'usuarios',
            schema: 'pacs' // Ensure schema is specified for the reference
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or CASCADE/RESTRICT depending on requirements
        comment: 'ID do usuário que confirmou o pagamento'
      }, { transaction });

      // Use object notation for table name and schema
      await queryInterface.addColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'data_confirmacao', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora da confirmação do pagamento'
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Use object notation for table name and schema
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'data_confirmacao', { transaction });
      // Use object notation for table name and schema
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'confirmado_por_usuario_id', { transaction });
      // Use object notation for table name and schema
      await queryInterface.removeColumn({ tableName: 'pagamentos', schema: 'pacs' }, 'status_confirmacao', { transaction });
      // Need to remove the ENUM type explicitly for PostgreSQL
      // Ensure the schema is included if the type was created within it
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "pacs"."enum_pagamentos_status_confirmacao";', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
