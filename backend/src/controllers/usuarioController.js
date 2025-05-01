const { Usuario, Sequelize } = require('../models'); // Adicionar Sequelize para usar Op
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../config/logger');

// Gerar token JWT
const gerarToken = (usuario) => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET || 'pacs_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    
    // Buscar usuário por email
    const usuario = await Usuario.findOne({ where: { email } });
    
    if (!usuario) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaCorreta) {
      console.log('Senha incorreta para o usuário:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
  
    // Atualizar último acesso
    await usuario.update({ ultimo_acesso: new Date() });
    
    // Gerar token
    const token = gerarToken(usuario);
    
    return res.status(200).json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Listar todos os usuários (com filtro opcional por role)
exports.listarUsuarios = async (req, res) => {
  try {
    const { role } = req.query; // Obter role da query string
    
    const whereClause = {}; // Objeto para a cláusula where
    if (role) {
      whereClause.role = role; // Adicionar filtro por role se fornecido
    }

    const usuarios = await Usuario.findAll({
      where: whereClause, // Aplicar o filtro
      attributes: { exclude: ['senha'] },
      order: [['nome', 'ASC']]
    });
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ message: 'Erro ao listar usuários' });
  }
};

// Buscar usuário por ID (somente para admin ou próprio usuário)
exports.buscarUsuarioPorId = async (req, res, next) => {
  const { id } = req.params;
  console.log(`>>> CONTROLLER: Entrou em buscarUsuarioPorId com id: ${id}`); // Log adicionado
  try {
    // Validação explícita se o ID é 'gestores' ou não numérico
    if (id === 'gestores' || isNaN(parseInt(id))) {
       console.log(`>>> CONTROLLER: ID '${id}' é inválido ou é 'gestores'.`); // Log adicionado
       return res.status(400).json({ error: 'ID de usuário inválido. Deve ser um número.' });
    }

    const numericId = parseInt(id);
    console.log(`>>> CONTROLLER: Procurando usuário com ID numérico: ${numericId}`); // Log adicionado
    const usuario = await Usuario.findByPk(numericId);

    if (!usuario) {
      console.log(`>>> CONTROLLER: Usuário com ID ${numericId} não encontrado.`); // Log adicionado
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(usuario);
  } catch (error) {
    logger.error(`Erro ao buscar usuário com ID ${id}:`, error);
    // Não logar no console se for o erro esperado de sintaxe inválida, pois já tratamos acima
    if (!error.message?.includes('invalid input syntax for type integer')) {
       console.error(`Erro inesperado ao buscar usuário com ID ${id}:`, error);
    }
    next(error);
  }
};

// Criar usuário (somente para admin)
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, cargo, role } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    const usuario = await Usuario.create({
      nome,
      email,
      senha,
      cargo,
      role: role || 'user'
    });
    
    // Remover senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario.get({ plain: true });
    
    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// Atualizar usuário (somente para admin ou próprio usuário)
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, senha, cargo, role, ativo } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Impedir alteração de email (removido da lógica de atualização abaixo)
    if (req.body.email && req.body.email !== usuario.email) {
      // Embora não vamos atualizar, podemos informar que a tentativa foi ignorada ou retornar erro
      // Por simplicidade, vamos apenas ignorar a tentativa de alterar o email.
      logger.warn(`Tentativa de alterar email do usuário ${id} para ${req.body.email} foi ignorada.`);
    }

    // Verificar se é o último admin ativo antes de alterar role ou status ativo
    const isChangingRole = role && role !== usuario.role;
    const isDeactivating = ativo === false && usuario.ativo === true;

    if ((isChangingRole || isDeactivating) && usuario.role === 'ADMIN' && usuario.ativo) {
      const adminCount = await Usuario.count({
        where: {
          role: 'ADMIN',
          ativo: true,
          id: { [Sequelize.Op.ne]: usuario.id } // Excluir o próprio usuário da contagem
        }
      });

      // Se não houver outros admins ativos, impedir a alteração
      if (adminCount === 0) {
        return res.status(400).json({ message: 'Não é possível alterar o papel ou desativar o último administrador ativo.' });
      }
    }

    // Atualizar dados (sem o email)
    await usuario.update({
      nome: nome || usuario.nome,
      // email: email || usuario.email, // REMOVIDO - Não permitir alteração de email
      // A senha será hasheada pelo hook beforeUpdate se 'senha' for fornecido no body
      ...(senha && { senha: senha }), // Incluir senha apenas se fornecida
      cargo: cargo !== undefined ? cargo : usuario.cargo,
      role: role || usuario.role,
      ativo: ativo !== undefined ? ativo : usuario.ativo
    });

    // Remover senha do retorno
    const { senha: _, ...usuarioAtualizado } = usuario.get({ plain: true });

    return res.status(200).json(usuarioAtualizado);
  } catch (error) {
    logger.error(`Erro ao atualizar usuário ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

// Remover usuário (somente para admin)
exports.removerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    await usuario.destroy();
    
    return res.status(200).json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return res.status(500).json({ message: 'Erro ao remover usuário' });
  }
};

// Obter perfil do usuário logado
exports.obterPerfil = async (req, res) => {
  try {
    const userId = req.user.id; // Acessando o ID do usuário através do objeto user
    
    const usuario = await Usuario.findByPk(userId, {
      attributes: { exclude: ['senha'] }
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    return res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return res.status(500).json({ message: 'Erro ao obter perfil' });
  }
};

// Atualizar senha
exports.atualizarSenha = async (req, res) => {
  try {
    const userId = req.userId; // Virá do middleware de autenticação
    const { senhaAtual, novaSenha } = req.body;
    
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    
    const usuario = await Usuario.findByPk(userId);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar senha atual
    const senhaCorreta = await usuario.verificarSenha(senhaAtual);
    
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Atualizar senha
    await usuario.update({ senha: novaSenha });
    
    return res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return res.status(500).json({ message: 'Erro ao atualizar senha' });
  }
};

// Listar usuários com perfil 'Gestor'
exports.listarGestores = async (req, res, next) => {
  console.log('>>> CONTROLLER: Entrou em listarGestores'); // Log adicionado
  try {
    const gestores = await Usuario.findAll({
      where: { role: 'GESTOR' }, // Confirmar se o valor é 'GESTOR' ou 'Gestor'
      attributes: ['id', 'nome']
    });
    console.log(`>>> CONTROLLER: Gestores encontrados: ${gestores.length}`); // Log adicionado
    res.json(gestores);
  } catch (error) {
    logger.error('Erro ao listar gestores:', error);
    console.error('Erro ao listar gestores:', error); // Log extra no console
    next(error);
  }
};