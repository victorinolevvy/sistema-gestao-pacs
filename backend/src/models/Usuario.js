const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

// Definir os perfis permitidos
const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  VISUALIZADOR: 'VISUALIZADOR',
  GESTOR: 'GESTOR'
};

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING(100)
  },
  role: {
    type: DataTypes.ENUM(Object.values(ROLES)), // Usar ENUM com os valores definidos
    allowNull: false // Garantir que um perfil seja sempre definido
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ultimo_acesso: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'usuarios',
  schema:'pacs',
  timestamps: false,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    }
  }
});

// Define associations within the model file
Usuario.associate = (models) => {
  // Existing associations (if any)
  Usuario.hasMany(models.Pagamento, { foreignKey: 'usuario_id', as: 'pagamentosRegistrados' });
  Usuario.hasMany(models.Pagamento, { foreignKey: 'confirmado_por_usuario_id', as: 'pagamentosConfirmados' });
  Usuario.hasMany(models.Pac, { foreignKey: 'gestor_id', as: 'pacsGeridos', sourceKey: 'id' }); // PACs currently managed

  // New association with PacGestorContrato
  Usuario.hasMany(models.PacGestorContrato, {
    foreignKey: 'gestor_id',
    as: 'contratosComoGestor' // Alias for the history of contracts as manager
  });
};

// Método para verificar senha
Usuario.prototype.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Exportar ROLES para uso em outros lugares
Usuario.ROLES = ROLES;

module.exports = Usuario;