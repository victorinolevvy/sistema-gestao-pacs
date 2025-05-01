const Pac = require('../models/Pac');
const Pagamento = require('../models/Pagamento');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const listar = async (req, res) => {
  try {
    const { user } = req;
    let whereClause = {};

    if (user.role !== 'admin') {
      whereClause = { id: user.pac_id };
    }

    const relatorios = await Pagamento.findAll({
      include: [{
        model: Pac,
        as: 'pac',
        where: whereClause
      }],
      order: [['data_criacao', 'DESC']]
    });

    res.json(relatorios);
  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ error: 'Erro ao listar relatórios' });
  }
};

const gerar = async (req, res) => {
  try {
    const { user } = req;
    const { tipo, periodo_inicio, periodo_fim, provincia_id } = req.body;

    let whereClause = {};
    if (user.role !== 'admin') {
      whereClause = { id: user.pac_id };
    }

    if (provincia_id) {
      whereClause.provincia_id = provincia_id;
    }

    let relatorio = null;

    switch (tipo) {
      case 'pagamentos':
        relatorio = await Pagamento.findAll({
          include: [{
            model: Pac,
            as: 'pac',
            where: whereClause
          }],
          where: {
            data_pagamento: {
              [Op.between]: [periodo_inicio, periodo_fim]
            }
          },
          order: [['data_pagamento', 'ASC']]
        });
        break;

      case 'status':
        relatorio = await Pac.findAll({
          where: whereClause,
          attributes: [
            'status_financeiro',
            [sequelize.fn('COUNT', sequelize.col('id')), 'quantidade'],
            [sequelize.fn('SUM', sequelize.col('valor_renda_mensal')), 'valor_total']
          ],
          group: ['status_financeiro']
        });
        break;

      case 'multas':
        relatorio = await Pagamento.findAll({
          include: [{
            model: Pac,
            as: 'pac',
            where: whereClause
          }],
          where: {
            valor_multa: {
              [Op.gt]: 0
            },
            data_pagamento: {
              [Op.between]: [periodo_inicio, periodo_fim]
            }
          },
          order: [['data_pagamento', 'ASC']]
        });
        break;

      default:
        return res.status(400).json({ error: 'Tipo de relatório inválido' });
    }

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    let whereClause = { id };
    if (user.role !== 'admin') {
      whereClause.pac_id = user.pac_id;
    }

    const relatorio = await Pagamento.findOne({
      include: [{
        model: Pac,
        as: 'pac'
      }],
      where: whereClause
    });

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error);
    res.status(500).json({ error: 'Erro ao buscar relatório' });
  }
};

const remover = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    let whereClause = { id };
    if (user.role !== 'admin') {
      whereClause.pac_id = user.pac_id;
    }

    const relatorio = await Pagamento.destroy({ where: whereClause });

    if (!relatorio) {
      return res.status(404).json({ error: 'Relatório não encontrado' });
    }

    res.json({ message: 'Relatório removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover relatório:', error);
    res.status(500).json({ error: 'Erro ao remover relatório' });
  }
};

module.exports = {
  listar,
  gerar,
  buscarPorId,
  remover
}; 