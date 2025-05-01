const sequelize = require('../config/database');
const Provincia = require('./Provincia');
const Pac = require('./Pac');
const Usuario = require('./Usuario');
const Pagamento = require('./Pagamento'); // Importar Pagamento

const db = {};

db.Sequelize = sequelize.Sequelize;
db.sequelize = sequelize;

db.Provincia = Provincia;
db.Pac = Pac;
db.Usuario = Usuario;
db.Pagamento = Pagamento; // Adicionar Pagamento ao objeto db

// Associações

// Província <-> Pac (1:N)
Provincia.hasMany(Pac, { foreignKey: 'provincia_id', as: 'pacs' });
Pac.belongsTo(Provincia, { foreignKey: 'provincia_id', as: 'provincia' });

// Usuário <-> Pac (1:N) - Relação de quem é o gestor responsável
Usuario.hasMany(Pac, { foreignKey: 'gestor_id', as: 'pacsGeridos' }); // Update foreignKey
Pac.belongsTo(Usuario, { foreignKey: 'gestor_id', as: 'gestor' }); // Update foreignKey and alias

// Pac <-> Pagamento (1:N)
Pac.hasMany(Pagamento, { foreignKey: 'pac_id', as: 'pagamentos' });
Pagamento.belongsTo(Pac, { foreignKey: 'pac_id', as: 'pac' });

// Usuário <-> Pagamento (1:N) - Relação de quem registrou o pagamento
Usuario.hasMany(Pagamento, { foreignKey: 'usuario_id', as: 'pagamentosRegistrados' });
Pagamento.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuarioRegistro' }); // Adicionar esta associação

// Usuário <-> Pagamento (1:N) - Relação de quem confirmou o pagamento
Usuario.hasMany(Pagamento, { foreignKey: 'confirmado_por_usuario_id', as: 'pagamentosConfirmados' });
Pagamento.belongsTo(Usuario, { foreignKey: 'confirmado_por_usuario_id', as: 'usuarioConfirmacao' });

module.exports = db;