const { Pac, Provincia, Usuario, PacGestorContrato, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// Listar todos os PACs
exports.listarPacs = async (req, res) => {
  try {
    const whereClause = {};
    if (req.user?.role === 'GESTOR' && req.user?.id) {
      whereClause.gestor_id = req.user.id;
    }

    const pacs = await Pac.findAll({
      where: whereClause,
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        {
          model: Usuario,
          as: 'gestorAtual',
          attributes: ['id', 'nome']
        }
      ],
      order: [['nome', 'ASC']]
    });
    return res.status(200).json(pacs);
  } catch (error) {
    logger.error('Erro ao listar PACs:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao listar PACs' });
  }
};

// Buscar PAC por ID
exports.buscarPacPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pac = await Pac.findByPk(id, {
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        {
          model: Usuario,
          as: 'gestorAtual',
          attributes: ['id', 'nome']
        }
      ]
    });

    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    return res.status(200).json(pac);
  } catch (error) {
    logger.error('Erro ao buscar PAC:', { error: error.message, stack: error.stack, pacId: req.params.id });
    return res.status(500).json({ message: 'Erro ao buscar PAC' });
  }
};

// Criar PAC
exports.criarPac = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      nome,
      endereco,
      provincia_id,
      gestor_id: gestorIdInput,
      valor_renda_mensal: valorRendaInput,
      status,
      data_inicio_atividade
    } = req.body;

    const provinciaIdParsed = parseInt(provincia_id, 10);
    const gestorIdParsed = gestorIdInput ? parseInt(gestorIdInput, 10) : null;
    const valorRendaParsed = parseFloat(valorRendaInput);

    if (!nome || isNaN(provinciaIdParsed) || provinciaIdParsed <= 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Nome e ID da Província válido são obrigatórios.' });
    }
    
    if (gestorIdInput && (isNaN(gestorIdParsed) || gestorIdParsed <= 0)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'ID do Gestor fornecido é inválido.' });
    }

    if (isNaN(valorRendaParsed) || valorRendaParsed < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Valor da Renda Mensal válido é obrigatório.' });
    }

    if (gestorIdParsed) {
      const gestor = await Usuario.findByPk(gestorIdParsed, { transaction });
      if (!gestor) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Usuário gestor não encontrado' });
      }
    }

    const pac = await Pac.create({
      nome,
      endereco,
      provincia_id: provinciaIdParsed,
      gestor_id: gestorIdParsed,
      valor_renda_mensal: valorRendaParsed,
      status,
      data_inicio_atividade
    }, { transaction });

    if (gestorIdParsed) {
      const dataInicioContrato = new Date(data_inicio_atividade);
      await PacGestorContrato.create({
        pac_id: pac.id,
        gestor_id: pac.gestor_id,
        valor_renda: pac.valor_renda_mensal,
        data_inicio: dataInicioContrato,
        data_fim: null
      }, { transaction });
    }

    await transaction.commit();

    const pacCompleto = await Pac.findByPk(pac.id, {
      include: [
        { model: Provincia, as: 'provincia', attributes: ['id', 'nome', 'codigo'] },
        { model: Usuario, as: 'gestorAtual', attributes: ['id', 'nome', 'email'] }
      ]
    });

    return res.status(201).json(pacCompleto);

  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao criar PAC:', { error: error.message, stack: error.stack });
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Erro de validação ao criar PAC', errors: error.errors.map(e => e.message) });
    }
    return res.status(500).json({ message: 'Erro interno ao criar PAC', error: error.message });
  }
};

// Atualizar PAC
exports.atualizarPac = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      nome,
      endereco,
      provincia_id: provinciaIdInput,
      gestor_id: gestorIdInput,
      valor_renda_mensal: valorRendaInput,
      status,
      data_inicio_atividade
    } = req.body;

    const pac = await Pac.findByPk(id, {
      include: [
        { model: Provincia, as: 'provincia' },
        { model: Usuario, as: 'gestorAtual' }
      ],
      transaction
    });

    if (!pac) {
      await transaction.rollback();
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    const updateData = {
      data_atualizacao: new Date()
    };

    if (nome !== undefined) updateData.nome = nome;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (status !== undefined) updateData.status = status;
    if (data_inicio_atividade !== undefined) updateData.data_inicio_atividade = data_inicio_atividade;

    if (provinciaIdInput !== undefined) {
      const provinciaIdParsed = parseInt(provinciaIdInput, 10);
      if (!isNaN(provinciaIdParsed) && provinciaIdParsed !== pac.provincia_id) {
        const provincia = await Provincia.findByPk(provinciaIdParsed, { transaction });
        if (!provincia) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Província não encontrada' });
        }
        updateData.provincia_id = provinciaIdParsed;
      }
    }

    const currentGestorId = pac.gestor_id;
    let newGestorId = currentGestorId;
    const gestorInputProvided = gestorIdInput !== undefined;
    
    if (gestorInputProvided) {
      if (gestorIdInput === null || gestorIdInput === '') {
        newGestorId = null;
      } else {
        const parsedId = parseInt(gestorIdInput, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
          await transaction.rollback();
          return res.status(400).json({ message: 'ID do Gestor fornecido é inválido.' });
        }
        
        const gestor = await Usuario.findByPk(parsedId, { transaction });
        if (!gestor) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Gestor não encontrado' });
        }
        
        newGestorId = parsedId;
      }
    }

    const currentValorRenda = pac.valor_renda_mensal;
    let newValorRenda = currentValorRenda;
    const valorRendaInputProvided = valorRendaInput !== undefined;
    
    if (valorRendaInputProvided) {
      const parsedValor = parseFloat(valorRendaInput);
      if (isNaN(parsedValor) || parsedValor < 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Valor da Renda Mensal fornecido é inválido.' });
      }
      newValorRenda = parsedValor;
    }

    const gestorChanged = gestorInputProvided && newGestorId !== currentGestorId;
    const rendaChanged = valorRendaInputProvided && newValorRenda !== currentValorRenda;

    if (gestorChanged || rendaChanged) {
      const currentContract = await PacGestorContrato.findOne({
        where: { 
          pac_id: id, 
          data_fim: null 
        },
        order: [['data_inicio', 'DESC']],
        transaction
      });

      const changeDate = new Date();

      if (currentContract) {
        await currentContract.update({ 
          data_fim: changeDate 
        }, { transaction });
      }

      if (newGestorId !== null) {
        await PacGestorContrato.create({
          pac_id: id,
          gestor_id: newGestorId,
          valor_renda: newValorRenda,
          data_inicio: changeDate,
          data_fim: null
        }, { transaction });
      }

      updateData.gestor_id = newGestorId;
      updateData.valor_renda_mensal = newValorRenda;
    }

    if (Object.keys(updateData).length > 1) {
      await pac.update(updateData, { transaction });
    }

    await transaction.commit();

    const pacAtualizado = await Pac.findByPk(id, {
      include: [
        { model: Provincia, as: 'provincia', attributes: ['id', 'nome', 'codigo'] },
        { model: Usuario, as: 'gestorAtual', attributes: ['id', 'nome', 'email'] }
      ]
    });

    return res.status(200).json(pacAtualizado);

  } catch (error) {
    logger.error('Error updating PAC:', { error: error.message, stack: error.stack, pacId: req.params.id });
    await transaction.rollback();
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Erro de validação ao atualizar PAC', 
        errors: error.errors.map(e => e.message) 
      });
    }
    
    return res.status(500).json({ 
      message: 'Erro interno ao atualizar PAC', 
      error: error.message 
    });
  }
};

// Remover PAC
exports.removerPac = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const pac = await Pac.findByPk(id, { transaction });
    if (!pac) {
      await transaction.rollback();
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    await pac.destroy({ transaction });

    await transaction.commit();
    return res.status(200).json({ message: 'PAC removido com sucesso' });
  } catch (error) {
    await transaction.rollback();
    logger.error('Erro ao remover PAC:', { error: error.message, stack: error.stack, pacId: req.params.id });
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Erro ao remover PAC: Existem pagamentos associados a este PAC.' });
    }
    return res.status(500).json({ message: 'Erro ao remover PAC', error: error.message });
  }
};

// Listar PACs por província
exports.listarPacsPorProvincia = async (req, res) => {
  try {
    const { provinciaId } = req.params;

    // Verify that provinciaId is valid
    const provincia = await Provincia.findByPk(provinciaId);
    if (!provincia) {
      return res.status(404).json({ message: 'Província não encontrada' });
    }

    // Access control for gestor role
    const whereClause = {
      provincia_id: provinciaId
    };
    if (req.user?.role === 'GESTOR' && req.user?.id) {
      whereClause.gestor_id = req.user.id;
    }

    const pacs = await Pac.findAll({
      where: whereClause,
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        {
          model: Usuario,
          as: 'gestorAtual',
          attributes: ['id', 'nome']
        }
      ],
      order: [['nome', 'ASC']]
    });

    return res.status(200).json(pacs);
  } catch (error) {
    logger.error('Erro ao listar PACs por província:', { error: error.message, stack: error.stack, provinciaId: req.params.provinciaId });
    return res.status(500).json({ message: 'Erro ao listar PACs por província' });
  }
};