import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import api from '../services/api'; // Importar a instância configurada do api

// Definir os perfis e seus nomes amigáveis
const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  VISUALIZADOR: 'Visualizador',
  GESTOR: 'Gestor'
};

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '', // Adicionar confirmarSenha
    role: 'VISUALIZADOR', // Atualizar valor padrão
    cargo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/usuarios'); 
      setUsuarios(response.data);
      setError(''); // Limpar erro em caso de sucesso
    } catch (error) {
      console.error('Erro detalhado ao carregar usuários:', error); // Log mais detalhado
      setError(error.message || 'Erro ao carregar usuários'); // Usar a mensagem de erro da api
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '', // Resetar confirmarSenha
      role: 'VISUALIZADOR', // Resetar para o padrão
      cargo: ''
    });
    setOpenDialog(true);
    setError(''); // Limpar erro ao abrir
    setSuccess(''); // Limpar sucesso ao abrir
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true); // Iniciar carregamento
    try {
      // Enviar dados sem confirmarSenha
      const { confirmarSenha, ...dataToSend } = formData;
      await api.post('/usuarios', dataToSend);
      setSuccess('Usuário criado com sucesso!');
      handleCloseDialog();
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro detalhado ao criar usuário:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao criar usuário');
      // Limpar senhas em caso de erro também
      setFormData(prev => ({ ...prev, senha: '', confirmarSenha: '' }));
    } finally {
      setIsSubmitting(false); // Finalizar carregamento
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setError(''); // Limpar erro antes de tentar
      setSuccess(''); // Limpar sucesso antes de tentar
      try {
        await api.delete(`/usuarios/${id}`); 
        setSuccess('Usuário excluído com sucesso!');
        await carregarUsuarios(); // Recarregar usuários após excluir
      } catch (error) {
        console.error('Erro detalhado ao excluir usuário:', error); // Log mais detalhado
        setError(error.message || 'Erro ao excluir usuário'); // Usar a mensagem de erro da api
      }
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', overflow: 'auto' }}>
      <Card sx={{ maxWidth: '100%', overflow: 'visible' }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="h5" component="h2">
              Gerenciamento de Usuários
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Novo Usuário
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Papel</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.cargo}</TableCell>
                    {/* Usar o objeto ROLES para exibir o nome amigável */}
                    <TableCell>{ROLES[usuario.role] || usuario.role}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        // Update onClick to navigate to the edit page
                        onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(usuario.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Novo Usuário</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="nome"
              label="Nome"
              type="text"
              fullWidth
              required
              value={formData.nome}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="senha"
              label="Senha"
              type="password"
              fullWidth
              required
              value={formData.senha}
              onChange={handleChange}
              error={!!error && error.includes('senha')} // Highlight se erro relacionado à senha
            />
            <TextField // Adicionar campo Confirmar Senha
              margin="dense"
              name="confirmarSenha"
              label="Confirmar Senha"
              type="password"
              fullWidth
              required
              value={formData.confirmarSenha}
              onChange={handleChange}
              error={!!error && error.includes('senhas não coincidem')} // Highlight se erro de confirmação
            />
            <TextField
              margin="dense"
              name="cargo"
              label="Cargo"
              type="text"
              fullWidth
              value={formData.cargo}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="role"
              label="Papel"
              select
              fullWidth
              required
              value={formData.role}
              onChange={handleChange}
            >
              {/* Gerar opções dinamicamente a partir do objeto ROLES */}
              {Object.entries(ROLES).map(([key, name]) => (
                <MenuItem key={key} value={key}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancelar</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting} // Desabilitar enquanto submete
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Salvar'} {/* Mostrar loading */}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsuariosList;