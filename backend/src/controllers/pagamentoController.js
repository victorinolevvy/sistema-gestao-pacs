const { Pagamento, Pac, Provincia, Usuario } = require('../models'); // Usuario já está incluído
const { Op } = require('sequelize');

// Função auxiliar para calcular o status do pagamento
const calcularStatusPagamento = (valorPago, valorRegularizado, valorRendaMensal) => {
  const totalPago = parseFloat(valorPago || 0) + parseFloat(valorRegularizado || 0);
  const rendaMensal = parseFloat(valorRendaMensal || 0);

  if (rendaMensal <= 0) {
    return 'Valor Renda Inválido'; // Ou outro status apropriado
  }

  if (totalPago >= rendaMensal) {
    return 'Pago';
  } else if (totalPago > 0) {
    return 'Pendente Parcial';
  } else {
    return 'Pendente';
  }
  // Poderíamos adicionar lógica para 'Crédito' se totalPago > rendaMensal,
  // mas isso pode exigir mais contexto sobre como lidar com excessos.
};

// Função auxiliar para determinar o status do pagamento
const determinarStatusPagamento = (valorPago, valorRegularizado, valorRendaMensal) => {
  const totalPago = parseFloat(valorPago || 0) + parseFloat(valorRegularizado || 0);
  const rendaMensal = parseFloat(valorRendaMensal || 0);

  if (totalPago === 0) {
    return 'Pendente'; // Nenhum valor pago ou regularizado
  } else if (totalPago >= rendaMensal) {
    return 'Pago'; // Pagamento igual ou superior à renda mensal
  } else if (totalPago > 0 && totalPago < rendaMensal) {
    return 'Pago Parcialmente'; // Pagamento inferior à renda mensal
  } else {
    return 'Pendente'; // Caso padrão, se algo inesperado ocorrer
  }
};

// Listar todos os pagamentos
exports.listarPagamentos = async (req, res) => {
  try {
    const pagamentos = await Pagamento.findAll({
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioRegistro',
          attributes: ['id', 'nome']
        },
        { // Add include for confirmation user
          model: Usuario,
          as: 'usuarioConfirmacao',
          attributes: ['id', 'nome']
        }
      ],
      order: [['data_pagamento', 'DESC']]
    });
    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    return res.status(500).json({ message: 'Erro ao listar pagamentos' });
  }
};

// Buscar pagamento por ID
exports.buscarPagamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await Pagamento.findByPk(id, {
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioRegistro',
          attributes: ['id', 'nome']
        },
        { // Add include for confirmation user
          model: Usuario,
          as: 'usuarioConfirmacao',
          attributes: ['id', 'nome']
        }
      ]
    });

    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    return res.status(200).json(pagamento);
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return res.status(500).json({ message: 'Erro ao buscar pagamento' });
  }
};

// Listar pagamentos por PAC
exports.listarPagamentosPorPac = async (req, res) => {
  try {
    const { pacId } = req.params;

    const pagamentos = await Pagamento.findAll({
      where: { pac_id: pacId },
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioRegistro',
          attributes: ['id', 'nome']
        },
        { // Add include for confirmation user
          model: Usuario,
          as: 'usuarioConfirmacao',
          attributes: ['id', 'nome']
        }
      ],
      order: [['data_pagamento', 'DESC']]
    });

    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao listar pagamentos por PAC:', error);
    return res.status(500).json({ message: 'Erro ao listar pagamentos por PAC' });
  }
};

// Listar pagamentos por período
exports.listarPagamentosPorPeriodo = async (req, res) => {
  try {
    const { mes, ano } = req.params;

    const pagamentos = await Pagamento.findAll({
      where: {
        mes_referencia: mes,
        ano_referencia: ano
      },
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        },
        {
          model: Usuario,
          as: 'usuarioRegistro',
          attributes: ['id', 'nome']
        },
        { // Add include for confirmation user
          model: Usuario,
          as: 'usuarioConfirmacao',
          attributes: ['id', 'nome']
        }
      ],
      order: [['data_pagamento', 'DESC']]
    });

    return res.status(200).json(pagamentos);
  } catch (error) {
    console.error('Erro ao listar pagamentos por período:', error);
    return res.status(500).json({ message: 'Erro ao listar pagamentos por período' });
  }
};

// Criar pagamento
exports.criarPagamento = async (req, res) => {
  try {
    const {
      pac_id,
      data_pagamento,
      valor_pago,
      valor_regularizado,
      mes_referencia,
      ano_referencia,
      observacoes,
      comprovativo_url // Add comprovativo_url
      // status removido
    } = req.body;

    const usuario_id = req.user?.id;
    const usuario_role = req.user?.role; // Assuming role is available in req.user

    if (!usuario_id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // Authorization: Only GESTOR can create payments
    if (usuario_role !== 'GESTOR') {
        return res.status(403).json({ message: 'Apenas gestores podem registrar pagamentos.' });
    }

    if (!pac_id || !mes_referencia || !ano_referencia) {
      return res.status(400).json({ message: 'PAC, mês e ano de referência são obrigatórios' });
    }

    // Verify PAC exists and the GESTOR is assigned to it
    const pac = await Pac.findByPk(pac_id, { attributes: ['id', 'valor_renda_mensal', 'gestor_id'] }); // Assuming gestor_id exists
    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    // Check if the logged-in GESTOR is assigned to this PAC
    if (pac.gestor_id !== usuario_id) {
        return res.status(403).json({ message: 'Você não tem permissão para registrar pagamentos para este PAC.' });
    }

    // Check if payment already exists for this PAC in the same period
    const pagamentoExistente = await Pagamento.findOne({
      where: {
        pac_id,
        mes_referencia,
        ano_referencia
      }
    });

    if (pagamentoExistente) {
      return res.status(400).json({
        message: 'Já existe um pagamento registrado para este PAC neste período',
        pagamento: pagamentoExistente
      });
    }

    // Determine payment status (Pago, Pendente, etc.)
    const statusCalculado = determinarStatusPagamento(valor_pago, valor_regularizado, pac.valor_renda_mensal);

    const pagamento = await Pagamento.create({
      pac_id,
      data_pagamento: data_pagamento || new Date(),
      valor_pago: valor_pago || 0,
      valor_regularizado: valor_regularizado || 0,
      mes_referencia,
      ano_referencia,
      observacoes,
      comprovativo_url, // Save the proof URL
      status: statusCalculado,
      usuario_id, // User who registered the payment
      status_confirmacao: 'PENDENTE', // Initial confirmation status
      confirmado_por_usuario_id: null, // Not confirmed yet
      data_confirmacao: null // Not confirmed yet
    });

    // Fetch the complete payment details including associations
    const pagamentoCompleto = await Pagamento.findByPk(pagamento.id, {
        include: [
          {
            model: Pac,
            as: 'pac',
            attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
            include: [
              {
                model: Provincia,
                as: 'provincia',
                attributes: ['id', 'nome', 'codigo']
              }
            ]
          },
          {
            model: Usuario,
            as: 'usuarioRegistro',
            attributes: ['id', 'nome']
          },
          { // Include confirmation user (will be null initially)
            model: Usuario,
            as: 'usuarioConfirmacao',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(201).json(pagamentoCompleto);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    // Check for specific Sequelize validation errors if needed
    return res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
  }
};

// Atualizar pagamento
exports.atualizarPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pac_id,
      data_pagamento,
      valor_pago,
      valor_regularizado,
      mes_referencia,
      ano_referencia,
      observacoes,
      comprovativo_url // Add comprovativo_url
      // status removido
    } = req.body;

    const usuario_id = req.user?.id;
    const usuario_role = req.user?.role;

    if (!usuario_id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const pagamento = await Pagamento.findByPk(id);
    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    // Authorization: Only ADMIN, SUPERVISOR, or the original GESTOR (if PENDENTE) can update
    if (!(usuario_role === 'ADMIN' || usuario_role === 'SUPERVISOR' || (usuario_role === 'GESTOR' && pagamento.usuario_id === usuario_id && pagamento.status_confirmacao === 'PENDENTE'))) {
        return res.status(403).json({ message: 'Você não tem permissão para atualizar este pagamento.' });
    }

    // --- Recalculate status ---
    let pacAtual = await Pac.findByPk(pagamento.pac_id, { attributes: ['id', 'valor_renda_mensal', 'gestor_id'] });

    // If the PAC is being changed, fetch the new PAC and check GESTOR assignment if updater is GESTOR
    if (pac_id && pac_id !== pagamento.pac_id) {
      pacAtual = await Pac.findByPk(pac_id, { attributes: ['id', 'valor_renda_mensal', 'gestor_id'] });
      if (!pacAtual) {
        return res.status(404).json({ message: 'Novo PAC não encontrado ao tentar atualizar' });
      }
      // If the updater is the GESTOR, ensure they are assigned to the *new* PAC
      if (usuario_role === 'GESTOR' && pacAtual.gestor_id !== usuario_id) {
          return res.status(403).json({ message: 'Você não pode alterar o pagamento para um PAC que não gerencia.' });
      }
    }

    if (!pacAtual) {
       return res.status(404).json({ message: 'PAC associado ao pagamento não encontrado' });
    }

    const novoValorPago = valor_pago !== undefined ? valor_pago : pagamento.valor_pago;
    const novoValorRegularizado = valor_regularizado !== undefined ? valor_regularizado : pagamento.valor_regularizado;
    const novoStatus = determinarStatusPagamento(novoValorPago, novoValorRegularizado, pacAtual.valor_renda_mensal);
    // --- End Recalculate status ---

    // Reset confirmation status if relevant fields are changed by anyone
    let resetConfirmation = false;
    if (
        (pac_id !== undefined && pac_id !== pagamento.pac_id) ||
        (data_pagamento !== undefined && new Date(data_pagamento).toISOString().split('T')[0] !== new Date(pagamento.data_pagamento).toISOString().split('T')[0]) || // Compare dates only
        (valor_pago !== undefined && parseFloat(valor_pago) !== parseFloat(pagamento.valor_pago)) ||
        (valor_regularizado !== undefined && parseFloat(valor_regularizado) !== parseFloat(pagamento.valor_regularizado)) ||
        (mes_referencia !== undefined && mes_referencia !== pagamento.mes_referencia) ||
        (ano_referencia !== undefined && ano_referencia !== pagamento.ano_referencia) ||
        (comprovativo_url !== undefined && comprovativo_url !== pagamento.comprovativo_url)
    ) {
        resetConfirmation = true;
    }


    await pagamento.update({
      pac_id: pac_id || pagamento.pac_id,
      data_pagamento: data_pagamento || pagamento.data_pagamento,
      valor_pago: novoValorPago,
      valor_regularizado: novoValorRegularizado,
      mes_referencia: mes_referencia || pagamento.mes_referencia,
      ano_referencia: ano_referencia || pagamento.ano_referencia,
      observacoes: observacoes !== undefined ? observacoes : pagamento.observacoes,
      comprovativo_url: comprovativo_url !== undefined ? comprovativo_url : pagamento.comprovativo_url,
      status: novoStatus,
      // Reset confirmation if significant data changed
      status_confirmacao: resetConfirmation ? 'PENDENTE' : pagamento.status_confirmacao,
      confirmado_por_usuario_id: resetConfirmation ? null : pagamento.confirmado_por_usuario_id,
      data_confirmacao: resetConfirmation ? null : pagamento.data_confirmacao,
      // data_atualizacao: new Date() // Sequelize handles updatedAt if timestamps: true
    });

    // Fetch the updated payment with associations
    const pagamentoAtualizado = await Pagamento.findByPk(id, {
        include: [
          {
            model: Pac,
            as: 'pac',
            attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
            include: [
              {
                model: Provincia,
                as: 'provincia',
                attributes: ['id', 'nome', 'codigo']
              }
            ]
          },
           {
            model: Usuario,
            as: 'usuarioRegistro',
            attributes: ['id', 'nome']
          },
          {
            model: Usuario,
            as: 'usuarioConfirmacao',
            attributes: ['id', 'nome']
          }
        ]
      });

      return res.status(200).json(pagamentoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return res.status(500).json({ message: 'Erro ao atualizar pagamento', error: error.message });
  }
};

// Remover pagamento
exports.removerPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user?.id;
    const usuario_role = req.user?.role;

    if (!usuario_id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const pagamento = await Pagamento.findByPk(id);
    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    // Authorization: Only ADMIN, SUPERVISOR, or the original GESTOR (if PENDENTE) can delete
     if (!(usuario_role === 'ADMIN' || usuario_role === 'SUPERVISOR' || (usuario_role === 'GESTOR' && pagamento.usuario_id === usuario_id && pagamento.status_confirmacao === 'PENDENTE'))) {
        return res.status(403).json({ message: 'Você não tem permissão para remover este pagamento.' });
    }

    // Optional: Prevent deletion of CONFIRMADO payments?
    // if (pagamento.status_confirmacao === 'CONFIRMADO' && usuario_role !== 'ADMIN') {
    //     return res.status(403).json({ message: 'Pagamentos confirmados não podem ser removidos por este usuário.' });
    // }

    await pagamento.destroy();
    return res.status(200).json({ message: 'Pagamento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover pagamento:', error);
    return res.status(500).json({ message: 'Erro ao remover pagamento', error: error.message });
  }
};

// Confirmar ou Rejeitar Pagamento (NOVA FUNÇÃO)
exports.confirmOrRejectPayment = async (req, res) => {
    try {
        const { id } = req.params; // ID do pagamento
        const { status_confirmacao } = req.body; // Novo status: 'CONFIRMADO' ou 'REJEITADO'
        const usuario_id = req.user?.id;
        const usuario_role = req.user?.role;

        if (!usuario_id) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Authorization: Only ADMIN or SUPERVISOR can confirm/reject
        if (usuario_role !== 'ADMIN' && usuario_role !== 'SUPERVISOR') {
            return res.status(403).json({ message: 'Apenas Administradores ou Supervisores podem confirmar/rejeitar pagamentos.' });
        }

        if (!status_confirmacao || !['CONFIRMADO', 'REJEITADO'].includes(status_confirmacao)) {
            return res.status(400).json({ message: 'Status de confirmação inválido. Use "CONFIRMADO" ou "REJEITADO".' });
        }

        const pagamento = await Pagamento.findByPk(id);

        if (!pagamento) {
            return res.status(404).json({ message: 'Pagamento não encontrado.' });
        }

        // Can only confirm/reject if currently PENDENTE
        if (pagamento.status_confirmacao !== 'PENDENTE') {
            return res.status(400).json({ message: `Este pagamento já foi ${pagamento.status_confirmacao.toLowerCase()}.` });
        }

        // Update the payment
        pagamento.status_confirmacao = status_confirmacao;
        pagamento.confirmado_por_usuario_id = usuario_id;
        pagamento.data_confirmacao = new Date();

        await pagamento.save();

        // Fetch the updated payment with associations
        const pagamentoAtualizado = await Pagamento.findByPk(id, {
            include: [
                {
                  model: Pac,
                  as: 'pac',
                  attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal'], // Include gestor_id
                  include: [
                    {
                      model: Provincia,
                      as: 'provincia',
                      attributes: ['id', 'nome', 'codigo']
                    }
                  ]
                },
                {
                    model: Usuario,
                    as: 'usuarioRegistro',
                    attributes: ['id', 'nome']
                },
                {
                    model: Usuario,
                    as: 'usuarioConfirmacao',
                    attributes: ['id', 'nome']
                }
            ]
        });

        return res.status(200).json(pagamentoAtualizado);

    } catch (error) {
        console.error('Erro ao confirmar/rejeitar pagamento:', error);
        return res.status(500).json({ message: 'Erro ao processar a confirmação/rejeição do pagamento', error: error.message });
    }
};


// Obter resumo por província e período
exports.obterResumoPorProvincia = async (req, res) => {
  try {
    const { mes, ano } = req.params;

    // Buscar todos os pagamentos CONFIRMADOS do período, agrupando por província
    const pagamentos = await Pagamento.findAll({
      where: {
        mes_referencia: mes,
        ano_referencia: ano,
        status_confirmacao: 'CONFIRMADO' // Only include confirmed payments in summary
      },
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'valor_renda_mensal', 'provincia_id'],
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        }
      ]
    });

    // Agrupar dados por província
    const resumoPorProvincia = {};

    pagamentos.forEach(pagamento => {
      const provinciaId = pagamento.pac.provincia.id;
      const provinciaNome = pagamento.pac.provincia.nome;

      if (!resumoPorProvincia[provinciaId]) {
        resumoPorProvincia[provinciaId] = {
          id: provinciaId,
          nome: provinciaNome,
          valor_previsto: 0,
          valor_pago: 0,
          valor_regularizado: 0,
          total_pacs: 0 // This might need recalculation based on total PACs vs PACs with confirmed payments
        };
      }

      resumoPorProvincia[provinciaId].valor_previsto += parseFloat(pagamento.pac.valor_renda_mensal || 0);
      resumoPorProvincia[provinciaId].valor_pago += parseFloat(pagamento.valor_pago || 0);
      resumoPorProvincia[provinciaId].valor_regularizado += parseFloat(pagamento.valor_regularizado || 0);
      resumoPorProvincia[provinciaId].total_pacs += 1; // Counts PACs with confirmed payments
    });

    // Converter objeto para array
    const resultado = Object.values(resumoPorProvincia);

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao obter resumo por província:', error);
    return res.status(500).json({ message: 'Erro ao obter resumo por província' });
  }
};