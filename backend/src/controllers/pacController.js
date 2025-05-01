const { Pac, Provincia, Usuario } = require('../models'); // Import Usuario

// Listar todos os PACs
exports.listarPacs = async (req, res) => {
  try {
    // Filtrar PACs se usuário for gestor
    const whereClause = {};
    // Use req.user.id and gestor_id for filtering
    if (req.user?.role === 'GESTOR' && req.user?.id) {
      whereClause.gestor_id = req.user.id; // Filter by gestor_id using the authenticated user's ID
    }

    const pacs = await Pac.findAll({
      where: whereClause,
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        // Add include for Usuario (gestor)
        {
          model: Usuario,
          as: 'gestor', // Use 'gestor' as the alias (assuming this is correct)
          attributes: ['id', 'nome'] // Select only id and nome
        }
      ],
      order: [['nome', 'ASC']]
    });
    return res.status(200).json(pacs);
  } catch (error) {
    console.error('Erro ao listar PACs:', error);
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
        // Add include for Usuario (gestor)
        {
          model: Usuario,
          as: 'gestor', // Use 'gestor' as the alias
          attributes: ['id', 'nome'] // Select only id and nome
        }
      ]
    });

    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    return res.status(200).json(pac);
  } catch (error) {
    console.error('Erro ao buscar PAC:', error);
    return res.status(500).json({ message: 'Erro ao buscar PAC' });
  }
};

// Listar PACs por província
exports.listarPacsPorProvincia = async (req, res) => {
  try {
    const { provinciaId } = req.params;
    
    const pacs = await Pac.findAll({
      where: { provincia_id: provinciaId },
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        }
      ],
      order: [['nome', 'ASC']]
    });
    
    return res.status(200).json(pacs);
  } catch (error) {
    console.error('Erro ao listar PACs por província:', error);
    return res.status(500).json({ message: 'Erro ao listar PACs por província' });
  }
};

// Criar PAC
exports.criarPac = async (req, res) => {
  try {
    // Destructure usuario_id instead of gestor
    const { nome, endereco, provincia_id, usuario_id, valor_renda_mensal, status } = req.body;

    if (!nome || !provincia_id) {
      return res.status(400).json({ message: 'Nome e província são obrigatórios' });
    }

    // Verificar se a província existe
    const provincia = await Provincia.findByPk(provincia_id);
    if (!provincia) {
      return res.status(404).json({ message: 'Província não encontrada' });
    }

    // Verificar se o usuario_id (gestor) existe, se fornecido
    if (usuario_id) {
      const gestor = await Usuario.findByPk(usuario_id);
      if (!gestor) {
        return res.status(404).json({ message: 'Usuário gestor não encontrado' });
      }
      // Opcional: Verificar se o usuário tem o perfil 'Gestor'
      // if (gestor.perfil !== 'Gestor') { // Assuming 'perfil' field exists
      //   return res.status(400).json({ message: 'O usuário selecionado não é um gestor' });
      // }
    }

    const pac = await Pac.create({
      nome,
      endereco,
      provincia_id,
      usuario_id: usuario_id || null, // Use usuario_id, allow null
      valor_renda_mensal,
      status
    });

    const pacCompleto = await Pac.findByPk(pac.id, {
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        {
          model: Usuario, // Include Usuario details
          as: 'gestor', // Use the correct alias 'gestor'
          attributes: ['id', 'nome', 'email'] // Select desired attributes
        }
      ]
    });

    return res.status(201).json(pacCompleto);
  } catch (error) {
    console.error('Erro ao criar PAC:', error);
    return res.status(500).json({ message: 'Erro ao criar PAC' });
  }
};

// Atualizar PAC
exports.atualizarPac = async (req, res) => {
  try {
    const { id } = req.params;
    // Destructure usuario_id instead of gestor
    const { nome, endereco, provincia_id, usuario_id, valor_renda_mensal, status } = req.body;

    const pac = await Pac.findByPk(id);
    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }

    // Se a província foi alterada, verificar se existe
    if (provincia_id && provincia_id !== pac.provincia_id) {
      const provincia = await Provincia.findByPk(provincia_id);
      if (!provincia) {
        return res.status(404).json({ message: 'Província não encontrada' });
      }
    }

    // Verificar se o usuario_id (gestor) existe, se fornecido e diferente
    // Allow setting usuario_id to null or empty string to remove association
    const newUsuarioId = usuario_id !== undefined ? (usuario_id === '' ? null : parseInt(usuario_id, 10)) : pac.usuario_id;

    if (newUsuarioId !== pac.usuario_id) {
        if (newUsuarioId !== null) {
            const gestor = await Usuario.findByPk(newUsuarioId);
            if (!gestor) {
                return res.status(404).json({ message: 'Usuário gestor não encontrado' });
            }
            // Opcional: Verificar se o usuário tem o perfil 'Gestor'
            // if (gestor.perfil !== 'Gestor') {
            //   return res.status(400).json({ message: 'O usuário selecionado não é um gestor' });
            // }
        }
    }

    await pac.update({
      nome: nome !== undefined ? nome : pac.nome,
      endereco: endereco !== undefined ? endereco : pac.endereco,
      provincia_id: provincia_id !== undefined ? provincia_id : pac.provincia_id,
      usuario_id: newUsuarioId, // Update usuario_id
      valor_renda_mensal: valor_renda_mensal !== undefined ? valor_renda_mensal : pac.valor_renda_mensal,
      status: status !== undefined ? status : pac.status,
      data_atualizacao: new Date()
    });

    const pacAtualizado = await Pac.findByPk(id, {
      include: [
        {
          model: Provincia,
          as: 'provincia',
          attributes: ['id', 'nome', 'codigo']
        },
        {
          model: Usuario, // Include Usuario details
          as: 'gestor', // Use the correct alias 'gestor'
          attributes: ['id', 'nome', 'email'] // Select desired attributes
        }
      ]
    });

    return res.status(200).json(pacAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar PAC:', error);
    return res.status(500).json({ message: 'Erro ao atualizar PAC' });
  }
};

// Remover PAC
exports.removerPac = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pac = await Pac.findByPk(id);
    if (!pac) {
      return res.status(404).json({ message: 'PAC não encontrado' });
    }
    
    await pac.destroy();
    return res.status(200).json({ message: 'PAC removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover PAC:', error);
    return res.status(500).json({ message: 'Erro ao remover PAC' });
  }
};