const { body, param, query } = require('express-validator');

const validators = {
  // Validação de usuário
  usuario: {
    login: [
      body('email').isEmail().withMessage('Email inválido'),
      body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    ],
    criar: [
      body('nome').notEmpty().withMessage('Nome é obrigatório'),
      body('email').isEmail().withMessage('Email inválido'),
      body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
      body('role').isIn(['ADMIN', 'SUPERVISOR', 'VISUALIZADOR', 'GESTOR']).withMessage('Role inválida')
    ],
    atualizar: [
      param('id').isInt().withMessage('ID inválido'),
      body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
      body('email').optional().isEmail().withMessage('Email inválido'),
      body('role').optional().isIn(['ADMIN', 'SUPERVISOR', 'VISUALIZADOR', 'GESTOR']).withMessage('Role inválida')
    ]
  },

  // Validação de PAC
  pac: {
    criar: [
      body('nome').notEmpty().withMessage('Nome é obrigatório'),
      body('provincia_id').isInt({ gt: 0 }).withMessage('ID da Província inválido'),
      body('usuario_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID do Gestor inválido'),
      body('valor_renda_mensal').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('Valor da renda mensal deve ser um número positivo')
    ],
    atualizar: [
      param('id').isInt().withMessage('ID inválido'),
      body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
      body('provincia_id').optional().isInt({ gt: 0 }).withMessage('ID da Província inválido'),
      body('usuario_id').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('ID do Gestor inválido'),
      body('valor_renda_mensal').optional({ nullable: true }).isFloat({ gt: 0 }).withMessage('Valor da renda mensal deve ser um número positivo')
    ]
  },

  // Validação de pagamento
  pagamento: {
    criar: [
      body('pacId').isInt().withMessage('ID do PAC inválido'),
      body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser maior que zero'),
      body('dataVencimento').isISO8601().withMessage('Data de vencimento inválida'),
      body('status').isIn(['PENDENTE', 'PAGO', 'ATRASADO']).withMessage('Status inválido')
    ],
    atualizar: [
      param('id').isInt().withMessage('ID inválido'),
      body('valor').optional().isFloat({ min: 0 }).withMessage('Valor deve ser maior que zero'),
      body('dataVencimento').optional().isISO8601().withMessage('Data de vencimento inválida'),
      body('status').optional().isIn(['PENDENTE', 'PAGO', 'ATRASADO']).withMessage('Status inválido')
    ],
    listarPorPeriodo: [
      query('mes').isInt({ min: 1, max: 12 }).withMessage('Mês inválido'),
      query('ano').isInt({ min: 2000 }).withMessage('Ano inválido')
    ]
  }
};

module.exports = validators;