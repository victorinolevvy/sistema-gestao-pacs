const { Pagamento, Pac, Provincia, Usuario, PacGestorContrato } = require('../models');
const { Op } = require('sequelize');
const { calcularMulta, calcularValorDevido, determinarStatusPagamento } = require('../utils/pagamentoUtils');
const logger = require('../config/logger');

// Listar todos os pagamentos (REVISED FOR PAGINATION, SORTING, FILTERING, SEARCH)
exports.listarPagamentos = async (req, res) => {
  const usuario_id = req.user?.id;
  const usuario_role = req.user?.role;
  const allowedRoles = ['GESTOR','ADMIN','SUPERVISOR'];

  if (!allowedRoles.includes(usuario_role)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  try {
    // --- Pagination ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10; // Default limit 10
    const offset = (page - 1) * limit;

    // --- Sorting ---
    const sortBy = req.query.sortBy || 'data_pagamento'; // Default sort field
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // Default DESC
    let order = [];

    // Handle nested sorting (e.g., pac.nome)
    if (sortBy.startsWith('pac.')) {
        const relatedField = sortBy.split('.')[1];
        order.push([{ model: Pac, as: 'pac' }, relatedField, sortOrder]);
    } else if (sortBy.startsWith('provincia.')) {
        const relatedField = sortBy.split('.')[1];
        // Need to ensure Provincia is included correctly for sorting
         order.push([{ model: Pac, as: 'pac' }, { model: Provincia, as: 'provincia' }, relatedField, sortOrder]);
    } else if (sortBy.startsWith('usuarioRegistro.')) {
        const relatedField = sortBy.split('.')[1];
        order.push([{ model: Usuario, as: 'usuarioRegistro' }, relatedField, sortOrder]);
    } else if (sortBy.startsWith('usuarioConfirmacao.')) {
        const relatedField = sortBy.split('.')[1];
        order.push([{ model: Usuario, as: 'usuarioConfirmacao' }, relatedField, sortOrder]);
    }
     else {
      // Direct field on Pagamento model
      order.push([sortBy, sortOrder]);
    }
     // Add a secondary sort key for consistency if not sorting by ID
    if (sortBy !== 'id') {
        order.push(['id', 'DESC']); // Or 'ASC' depending on preference
    }


    // --- Filtering & Search ---
    const where = {};
    const pacWhere = {}; // Separate where clause for PAC model

    // Role-based filtering (GESTOR sees only their PACs)
    if (usuario_role === 'GESTOR') {
      pacWhere.gestor_id = usuario_id;
    }

    // General Filters (from query params like filter[status]=Pendente)
    if (req.query.filter) {
      for (const key in req.query.filter) {
        const value = req.query.filter[key];
        if (value) {
           if (key === 'pac_id') {
             where.pac_id = value;
           } else if (key === 'provincia_id') {
             // Filter by provincia_id within the PAC model
             pacWhere.provincia_id = value;
           } else if (key === 'status') {
             where.status = value;
           } else if (key === 'mes_referencia') {
             where.mes_referencia = parseInt(value, 10);
           } else if (key === 'ano_referencia') {
             where.ano_referencia = parseInt(value, 10);
           } else if (key === 'status_confirmacao') {
             where.status_confirmacao = value;
           }
           // Add more filterable fields as needed
        }
      }
    }

     // Date Range Filter (Example: filter[data_pagamento_start]=YYYY-MM-DD&filter[data_pagamento_end]=YYYY-MM-DD)
    if (req.query.filter?.data_pagamento_start && req.query.filter?.data_pagamento_end) {
        where.data_pagamento = {
            [Op.between]: [new Date(req.query.filter.data_pagamento_start), new Date(req.query.filter.data_pagamento_end)]
        };
    } else if (req.query.filter?.data_pagamento_start) {
        where.data_pagamento = { [Op.gte]: new Date(req.query.filter.data_pagamento_start) };
    } else if (req.query.filter?.data_pagamento_end) {
        where.data_pagamento = { [Op.lte]: new Date(req.query.filter.data_pagamento_end) };
    }


    // Search (Example: search=MyPacName) - Searching PAC name
    if (req.query.search) {
      pacWhere.nome = { [Op.iLike]: `%${req.query.search}%` }; // Case-insensitive search
    }

    // --- Sequelize Query ---
    const includeOptions = [
      {
        model: Pac,
        as: 'pac',
        attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal', 'data_inicio_atividade', 'provincia_id'], // Include provincia_id
        where: pacWhere, // Apply PAC-specific filters/search here
        required: Object.keys(pacWhere).length > 0 || req.query.search, // Make required if filtering/searching on PAC
        include: [{ model: Provincia, as: 'provincia', attributes: ['id', 'nome', 'codigo'] }]
      },
      { model: Usuario, as: 'usuarioRegistro', attributes: ['id', 'nome'] },
      { model: Usuario, as: 'usuarioConfirmacao', attributes: ['id', 'nome'] }
    ];


    const { count, rows } = await Pagamento.findAndCountAll({
      where: where, // Apply Pagamento-specific filters here
      include: includeOptions,
      limit: limit,
      offset: offset,
      order: order,
      distinct: true, // Important when using includes with limits/offsets
    });

    // --- Response ---
    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pagamentos: rows,
    });

  } catch (error) {
    logger.error('Erro ao listar pagamentos:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao listar pagamentos' });
  }
};

// Buscar pagamento por ID (Minor change: field names if needed in response)
exports.buscarPagamentoPorId = async (req, res) => {
  // ... (Authorization logic remains the same) ...
  const usuario_id = req.user?.id;
  const usuario_role = req.user?.role;
  const allowedRoles = ['GESTOR','ADMIN','SUPERVISOR'];
  const { id } = req.params;

  if (!allowedRoles.includes(usuario_role)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  try {
    const pagamento = await Pagamento.findByPk(id, {
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal', 'data_inicio_atividade'],
          include: [{
            model: Provincia,
            as: 'provincia',
            attributes: ['id', 'nome', 'codigo']
          }]
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

    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    if (!pagamento.pac) {
      logger.error(`Inconsistent data: Pagamento ${id} is missing PAC association.`);
      return res.status(500).json({ message: 'Erro interno: Dados do PAC associado não encontrados.' });
    }

    if (usuario_role === 'GESTOR' && pagamento.pac.gestor_id !== usuario_id) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    return res.status(200).json(pagamento);
  } catch (error) {
    logger.error('Erro ao buscar pagamento:', { error: error.message, stack: error.stack, paymentId: id });
    return res.status(500).json({ message: 'Erro ao buscar pagamento' });
  }
};

// Listar pagamentos por PAC (Minor change: field names if needed in response)
exports.listarPagamentosPorPac = async (req, res) => {
  // ... (Authorization logic remains the same) ...
  const usuario_id = req.user?.id;
  const usuario_role = req.user?.role;
  const { pacId } = req.params;
  const allowedRoles = ['GESTOR','ADMIN','SUPERVISOR'];

  if (!allowedRoles.includes(usuario_role)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }

  try {
    if (usuario_role === 'GESTOR') {
      const pac = await Pac.findByPk(pacId);
      if (!pac || pac.gestor_id !== usuario_id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
    }

    const pagamentos = await Pagamento.findAll({
      where: { pac_id: pacId },
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal', 'data_inicio_atividade'],
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
      ],
      order: [['data_pagamento', 'DESC']]
    });

    return res.status(200).json(pagamentos);
  } catch (error) {
    logger.error('Erro ao listar pagamentos do PAC:', { error: error.message, stack: error.stack, pacId });
    return res.status(500).json({ message: 'Erro ao listar pagamentos do PAC' });
  }
};

// Listar pagamentos por período (Minor change: field names if needed in response)
exports.listarPagamentosPorPeriodo = async (req, res) => {
  // ... (Authorization logic remains the same) ...
  const usuario_id = req.user?.id;
  const usuario_role = req.user?.role;
  const allowedRoles = ['GESTOR','ADMIN','SUPERVISOR'];
  if (!allowedRoles.includes(usuario_role)) {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
    const { mes, ano } = req.params;
    const pacInclude = {
      model: Pac,
      as: 'pac',
      // Include data_inicio_atividade if needed
      attributes: ['id','nome','gestor_id','valor_renda_mensal', 'data_inicio_atividade'],
      include: [{ model: Provincia, as: 'provincia', attributes: ['id','nome','codigo'] }]
    };
    if (usuario_role === 'GESTOR') {
      pacInclude.where = { gestor_id: usuario_id };
    }
    const pagamentos = await Pagamento.findAll({
      where: { mes_referencia: mes, ano_referencia: ano },
      include: [pacInclude,
         { model: Usuario, as: 'usuarioRegistro', attributes: ['id','nome'] }, // Include users
         { model: Usuario, as: 'usuarioConfirmacao', attributes: ['id','nome'] }
      ],
      // Ensure response includes new fields
      // attributes: { exclude: ['valor_pago', 'valor_regularizado'] }, // Example
      order: [['data_pagamento','DESC']]
    });
    return res.status(200).json(pagamentos);
  } catch (error) {
    logger.error('Erro ao listar pagamentos por período:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao listar pagamentos por período' });
  }
};

// Criar pagamento (REVISED SIGNIFICANTLY)
exports.criarPagamento = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      pac_id,
      data_pagamento, // This is the date the payment *was made*, used for penalty calculation
      valor_efetuado, // Changed from valor_pago/valor_regularizado
      mes_referencia,
      ano_referencia,
      observacoes,
    } = req.body;

    const usuario_id = req.user?.id;
    const usuario_role = req.user?.role;

    // --- Authorization & Basic Validation ---
    if (!usuario_id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const allowedRoles = ['GESTOR', 'ADMIN', 'SUPERVISOR'];
    if (!allowedRoles.includes(usuario_role)) {
      return res.status(403).json({ message: 'Apenas gestores, administradores ou supervisores podem registrar pagamentos.' });
    }
    if (!pac_id || !mes_referencia || !ano_referencia || valor_efetuado === undefined || valor_efetuado === null) {
      return res.status(400).json({ message: 'PAC, mês/ano de referência e valor efetuado são obrigatórios' });
    }
    const valorEfetuadoNum = parseFloat(valor_efetuado);
     if (isNaN(valorEfetuadoNum) || valorEfetuadoNum < 0) {
        return res.status(400).json({ message: 'Valor efetuado inválido.' });
    }

    // --- Fetch PAC & Validate ---
    const pac = await Pac.findByPk(pac_id, { attributes: ['id', 'valor_renda_mensal', 'gestor_id', 'data_inicio_atividade'] });
    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }
    if (usuario_role === 'GESTOR' && pac.gestor_id !== usuario_id) {
      return res.status(403).json({ message: 'Você não tem permissão para registrar pagamentos para este PAC.' });
    }

    // --- Validate Start Date ---
    if (pac.data_inicio_atividade) {
        const dataInicio = new Date(pac.data_inicio_atividade);
        // Create a date for the *start* of the reference month/year
        const inicioMesReferencia = new Date(ano_referencia, mes_referencia - 1, 1); // Month is 0-indexed

        if (inicioMesReferencia < dataInicio) {
            return res.status(400).json({ message: `Pagamentos para este PAC só são permitidos a partir de ${pac.data_inicio_atividade}.` });
        }
    } else {
        // Handle case where data_inicio_atividade is not set - maybe allow payment, maybe require it?
        console.warn(`PAC ${pac_id} não possui data de início de atividade definida.`);
        // Depending on policy, you might return an error here:
        // return res.status(400).json({ message: 'PAC não possui data de início de atividade definida. Contacte o administrador.' });
    }


    // --- Check Existing Payment ---
    const pagamentoExistente = await Pagamento.findOne({
      where: { pac_id, mes_referencia, ano_referencia }
    });
    if (pagamentoExistente) {
      return res.status(400).json({
        message: 'Já existe um pagamento registrado para este PAC neste período',
        pagamento: pagamentoExistente // Return existing payment info
      });
    }

    // --- Determine Historical Rent ---
    const referenceDate = new Date(ano_referencia, mes_referencia - 1, 1); // First day of the reference month
    const historicalRecord = await PacGestorContrato.findOne({
      where: {
        pac_id: pac_id,
        data_inicio: { [Op.lte]: referenceDate },
        [Op.or]: [
          { data_fim: { [Op.gte]: referenceDate } },
          { data_fim: { [Op.is]: null } }
        ]
      },
      order: [['data_inicio', 'DESC']]
    });

    const valorRendaMensalHistorico = historicalRecord
      ? parseFloat(historicalRecord.valor_renda_mensal || 0)
      : parseFloat(pac.valor_renda_mensal || 0); // Fallback to current PAC rent

    // --- Calculate Penalty (Multa) ---
    // Use provided date or today. Ensure it's a valid Date object.
    let dataPagamentoReal;
    if (data_pagamento) {
        try {
            dataPagamentoReal = new Date(data_pagamento);
            if (isNaN(dataPagamentoReal.getTime())) { // Check if date is valid
                 throw new Error('Invalid date format');
            }
        } catch (e) {
             console.error("Invalid date provided:", data_pagamento);
             return res.status(400).json({ message: 'Data de pagamento inválida. Use o formato YYYY-MM-DD.' });
        }
    } else {
        dataPagamentoReal = new Date(); // Use today if no date provided
    }

    // Call the updated calcularMulta from utils using HISTORICAL rent
    const valorMulta = calcularMulta(mes_referencia, ano_referencia, dataPagamentoReal, valorRendaMensalHistorico);

    // --- Calculate Total Due ---
    // Call calcularValorDevido from utils using HISTORICAL rent
    const valorDevido = calcularValorDevido(valorRendaMensalHistorico, valorMulta);

    // --- Determine Status ---
    // Call determinarStatusPagamento from utils
    const statusCalculado = determinarStatusPagamento(valorEfetuadoNum, valorDevido);

    // --- Handle File Upload ---
    const comprovativoPath = req.file ? `/uploads/comprovantes/${req.file.filename}` : null;

    // --- Create Payment Record ---
    const pagamento = await Pagamento.create({
      pac_id,
      data_pagamento: dataPagamentoReal, // Date payment was actually made
      valor_efetuado: valorEfetuadoNum, // Use the validated number
      valor_multa: valorMulta,
      valor_devido: valorDevido,
      mes_referencia,
      ano_referencia,
      observacoes,
      comprovativo_url: comprovativoPath,
      status: statusCalculado, // Use the status calculated by the util function
      usuario_id, // User who registered the payment
      status_confirmacao: 'PENDENTE', // Default confirmation status
      confirmado_por_usuario_id: null,
      data_confirmacao: null
    });

    // --- Fetch Complete Record & Return ---
    const pagamentoCompleto = await Pagamento.findByPk(pagamento.id, {
        include: [
          { model: Pac, as: 'pac', include: [{ model: Provincia, as: 'provincia' }] },
          { model: Usuario, as: 'usuarioRegistro', attributes: ['id', 'nome'] },
          { model: Usuario, as: 'usuarioConfirmacao', attributes: ['id', 'nome'] } // Include confirmation user placeholder
        ]
      });
    return res.status(201).json(pagamentoCompleto);

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    // Remove uploaded file if DB operation failed
    if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Erro ao remover arquivo após falha:", err);
        });
    }
    return res.status(500).json({ message: 'Erro ao criar pagamento', error: error.message });
  }
};

// Atualizar pagamento (REVISED SIGNIFICANTLY)
exports.atualizarPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pac_id,
      data_pagamento, // Date payment was made
      valor_efetuado, // Changed field
      mes_referencia,
      ano_referencia,
      observacoes,
      // comprovativo_url can be updated, handle file upload separately if needed
    } = req.body;

    const usuario_id = req.user?.id;
    const usuario_role = req.user?.role;

    // --- Authorization & Fetch Existing ---
    if (!usuario_id) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }
    const pagamento = await Pagamento.findByPk(id, {
        // Include current PAC for fallback and comparison
        include: [{ model: Pac, as: 'pac', attributes: ['id', 'valor_renda_mensal', 'gestor_id', 'data_inicio_atividade'] }]
    });
    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }
     if (!pagamento.pac) {
       // Should not happen if DB is consistent, but good practice to check
       return res.status(500).json({ message: 'Erro interno: PAC associado ao pagamento não encontrado.' });
    }

    // Authorization: Only ADMIN, SUPERVISOR, or the original GESTOR (if PENDENTE) can update
    const isOwner = pagamento.usuario_id === usuario_id;
    const isPending = pagamento.status_confirmacao === 'PENDENTE';
    const isAdminOrSupervisor = usuario_role === 'ADMIN' || usuario_role === 'SUPERVISOR';

    if (!(isAdminOrSupervisor || (usuario_role === 'GESTOR' && isOwner && isPending))) {
        return res.status(403).json({ message: 'Você não tem permissão para atualizar este pagamento.' });
    }

    // --- Prepare Updated Values ---
    const updateData = {};
    let needsRecalculation = false;
    let currentPac = pagamento.pac; // Start with the current PAC associated with the payment
    let newPac = currentPac; // This will hold the PAC details relevant for calculation (might change if pac_id changes)

    // Check if PAC is changing
    if (pac_id !== undefined && pac_id !== pagamento.pac_id) {
        newPac = await Pac.findByPk(pac_id, { attributes: ['id', 'valor_renda_mensal', 'gestor_id', 'data_inicio_atividade'] });
        if (!newPac) {
            return res.status(404).json({ message: 'Novo PAC não encontrado ao tentar atualizar' });
        }
        // If the updater is the GESTOR, ensure they are assigned to the *new* PAC
        if (usuario_role === 'GESTOR' && newPac.gestor_id !== usuario_id) {
            return res.status(403).json({ message: 'Você não pode alterar o pagamento para um PAC que não gerencia.' });
        }
        updateData.pac_id = pac_id;
        needsRecalculation = true;
    }

    // Check other fields that affect calculation or require reset
    const newDataPagamento = data_pagamento ? new Date(data_pagamento) : pagamento.data_pagamento;
    if (data_pagamento !== undefined && newDataPagamento.toISOString() !== pagamento.data_pagamento.toISOString()) {
        updateData.data_pagamento = newDataPagamento;
        needsRecalculation = true;
    }

    const newValorEfetuado = valor_efetuado !== undefined ? parseFloat(valor_efetuado) : pagamento.valor_efetuado;
     if (valor_efetuado !== undefined && (isNaN(newValorEfetuado) || newValorEfetuado < 0)) {
        return res.status(400).json({ message: 'Valor efetuado inválido.' });
    }
    if (valor_efetuado !== undefined && newValorEfetuado !== pagamento.valor_efetuado) {
        updateData.valor_efetuado = newValorEfetuado;
        needsRecalculation = true; // Status depends on this
    }

    const newMesReferencia = mes_referencia !== undefined ? mes_referencia : pagamento.mes_referencia;
    if (mes_referencia !== undefined && newMesReferencia !== pagamento.mes_referencia) {
        updateData.mes_referencia = newMesReferencia;
        needsRecalculation = true;
    }

    const newAnoReferencia = ano_referencia !== undefined ? ano_referencia : pagamento.ano_referencia;
    if (ano_referencia !== undefined && newAnoReferencia !== pagamento.ano_referencia) {
        updateData.ano_referencia = newAnoReferencia;
        needsRecalculation = true;
    }

     if (observacoes !== undefined) {
        updateData.observacoes = observacoes;
        // Optionally, decide if changing observations resets confirmation
        // needsRecalculation = true; // Uncomment if obs change should reset
    }

    // Handle comprovativo_url update - This might involve deleting old file, saving new one.
    // For simplicity, we assume comprovativo_url is just updated if provided.
    // A more robust solution handles file uploads during update.
    // if (req.file) { updateData.comprovativo_url = ...; needsRecalculation = true; }
    // else if (comprovativo_url !== undefined) { updateData.comprovativo_url = comprovativo_url; needsRecalculation = true; }


    // --- Recalculate if necessary ---
    if (needsRecalculation) {
        const finalPacId = updateData.pac_id || pagamento.pac_id;
        const finalMesRef = updateData.mes_referencia || pagamento.mes_referencia;
        const finalAnoRef = updateData.ano_referencia || pagamento.ano_referencia;
        const finalDataPag = updateData.data_pagamento || pagamento.data_pagamento; // Use updated or original
        const finalValorEfetuado = updateData.valor_efetuado !== undefined ? updateData.valor_efetuado : pagamento.valor_efetuado;

        // --- Determine Historical Rent for Recalculation ---
        const referenceDateRecalc = new Date(finalAnoRef, finalMesRef - 1, 1);
        const historicalRecordRecalc = await PacGestorContrato.findOne({
          where: {
            pac_id: finalPacId,
            data_inicio: { [Op.lte]: referenceDateRecalc },
            [Op.or]: [
              { data_fim: { [Op.gte]: referenceDateRecalc } },
              { data_fim: { [Op.is]: null } }
            ]
          },
          order: [['data_inicio', 'DESC']]
        });

        // Use historical rent if found, otherwise fallback to the *relevant* PAC's current rent
        // (newPac if PAC changed, currentPac otherwise)
        const valorRendaMensalHistoricoRecalc = historicalRecordRecalc
          ? parseFloat(historicalRecordRecalc.valor_renda_mensal || 0)
          : parseFloat(newPac.valor_renda_mensal || 0); // Fallback to relevant PAC's current rent

        // Recalculate multa and devido using utils and HISTORICAL rent
        const newValorMulta = calcularMulta(finalMesRef, finalAnoRef, finalDataPag, valorRendaMensalHistoricoRecalc);
        const newValorDevido = calcularValorDevido(valorRendaMensalHistoricoRecalc, newValorMulta);

        updateData.valor_multa = newValorMulta;
        updateData.valor_devido = newValorDevido;

        // Recalculate status using utils
         if (isNaN(finalValorEfetuado) || finalValorEfetuado < 0) {
             return res.status(400).json({ message: 'Valor efetuado inválido na atualização.' });
         }
         updateData.valor_efetuado = finalValorEfetuado; // Ensure valor_efetuado is in updateData if changed
        updateData.status = determinarStatusPagamento(finalValorEfetuado, newValorDevido);

        // If status changes due to recalculation, maybe reset confirmation?
        // updateData.status_confirmacao = 'PENDENTE';
        // updateData.confirmado_por_usuario_id = null;
        // updateData.data_confirmacao = null;
    } else if (updateData.valor_efetuado !== undefined) {
         // If only valor_efetuado changes, just recalculate status using existing devido
         const currentValorEfetuado = updateData.valor_efetuado;
         if (isNaN(currentValorEfetuado) || currentValorEfetuado < 0) {
             return res.status(400).json({ message: 'Valor efetuado inválido na atualização.' });
         }
         updateData.status = determinarStatusPagamento(currentValorEfetuado, pagamento.valor_devido); // Use existing devido
         // Maybe reset confirmation status if amount/status changes?
         // updateData.status_confirmacao = 'PENDENTE';
         // updateData.confirmado_por_usuario_id = null;
         // updateData.data_confirmacao = null;
    }

    // --- Update the Payment ---
    await pagamento.update(updateData);

    // --- Fetch Updated Record & Return ---
    const pagamentoAtualizado = await Pagamento.findByPk(id, {
        include: [
          {
            model: Pac,
            as: 'pac',
            attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal', 'data_inicio_atividade'], // Include relevant PAC fields
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
    logger.error('Erro ao atualizar pagamento:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao atualizar pagamento', error: error.message });
  }
};

// Remover pagamento (Authorization logic updated slightly for clarity)
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
    const isOwner = pagamento.usuario_id === usuario_id;
    const isPending = pagamento.status_confirmacao === 'PENDENTE';
    const isAdminOrSupervisor = usuario_role === 'ADMIN' || usuario_role === 'SUPERVISOR';

     if (!(isAdminOrSupervisor || (usuario_role === 'GESTOR' && isOwner && isPending))) {
        return res.status(403).json({ message: 'Você não tem permissão para remover este pagamento.' });
    }

    // Optional: Add logic to handle deleting associated file from storage if comprovativo_url exists
    // if (pagamento.comprovativo_url) { ... fs.unlink ... }

    await pagamento.destroy();
    return res.status(200).json({ message: 'Pagamento removido com sucesso' });
  } catch (error) {
    logger.error('Erro ao remover pagamento:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao remover pagamento', error: error.message });
  }
};

// Confirmar ou Rejeitar Pagamento (No changes needed here based on the prompt)
exports.confirmOrRejectPayment = async (req, res) => {
    // ... (Existing logic remains valid) ...
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
            // Allow changing from REJEITADO back to PENDENTE or to CONFIRMADO? Or only PENDENTE -> CONF/REJ?
            // Current logic: Only PENDENTE can be changed.
             return res.status(400).json({ message: `Este pagamento já está ${pagamento.status_confirmacao.toLowerCase()}. Não pode ser alterado diretamente.` });
             // Alternative: Allow ADMIN/SUPERVISOR to override?
             // if (pagamento.status_confirmacao !== 'PENDENTE' && !(usuario_role === 'ADMIN' || usuario_role === 'SUPERVISOR')) {
             //    return res.status(400).json({ message: `Este pagamento já está ${pagamento.status_confirmacao.toLowerCase()}.` });
             // }
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
                  attributes: ['id', 'nome', 'gestor_id', 'valor_renda_mensal', 'data_inicio_atividade'], // Include relevant PAC fields
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
        logger.error('Erro ao confirmar/rejeitar pagamento:', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Erro ao processar a confirmação/rejeição do pagamento', error: error.message });
    }
};


// Obter resumo por província e período (REVISED to use new fields)
exports.obterResumoPorProvincia = async (req, res) => {
  try {
    const { mes, ano } = req.params;

    // Fetch all CONFIRMED payments for the period
    const pagamentos = await Pagamento.findAll({
      where: {
        mes_referencia: mes,
        ano_referencia: ano,
        status_confirmacao: 'CONFIRMADO' // Only confirmed payments
      },
      include: [
        {
          model: Pac,
          as: 'pac',
          attributes: ['id', 'nome', 'valor_renda_mensal', 'provincia_id'], // valor_renda_mensal needed for comparison/context
          include: [
            {
              model: Provincia,
              as: 'provincia',
              attributes: ['id', 'nome', 'codigo']
            }
          ]
        }
      ],
      // Select only necessary fields from Pagamento
      attributes: ['id', 'pac_id', 'valor_efetuado', 'valor_multa', 'valor_devido']
    });

    // Aggregate data by province
    const resumoPorProvincia = {};

    pagamentos.forEach(pagamento => {
      // Ensure PAC and Provincia data are present
      if (!pagamento.pac || !pagamento.pac.provincia) {
          console.warn(`Pagamento ${pagamento.id} sem PAC ou Província associada no resumo.`);
          return; // Skip this payment if data is inconsistent
      }

      const provinciaId = pagamento.pac.provincia.id;
      const provinciaNome = pagamento.pac.provincia.nome;

      if (!resumoPorProvincia[provinciaId]) {
        resumoPorProvincia[provinciaId] = {
          id: provinciaId,
          nome: provinciaNome,
          valor_devido_total: 0, // Total expected (rent + penalties) for confirmed payments
          valor_efetuado_total: 0, // Total actually paid for confirmed payments
          valor_multa_total: 0, // Total penalties applied for confirmed payments
          count_pagamentos_confirmados: 0, // Count of confirmed payment records included
          // Note: Calculating total expected rent for *all* PACs in the province vs
          // only those with confirmed payments requires a different query (fetch all PACs).
          // This summary focuses on the confirmed payments found.
        };
      }

      // Aggregate values from the confirmed payment
      resumoPorProvincia[provinciaId].valor_devido_total += parseFloat(pagamento.valor_devido || 0);
      resumoPorProvincia[provinciaId].valor_efetuado_total += parseFloat(pagamento.valor_efetuado || 0);
      resumoPorProvincia[provinciaId].valor_multa_total += parseFloat(pagamento.valor_multa || 0);
      resumoPorProvincia[provinciaId].count_pagamentos_confirmados += 1;
    });

    // Convert object to array for the response
    const resultado = Object.values(resumoPorProvincia);

    return res.status(200).json(resultado);
  } catch (error) {
    logger.error('Erro ao obter resumo por província:', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: 'Erro ao obter resumo por província' });
  }
};