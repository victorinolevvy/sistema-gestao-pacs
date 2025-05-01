import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext'; // Import notification context

// Definir os perfis e seus nomes amigáveis (consistent with UsuariosList)
const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  VISUALIZADOR: 'Visualizador',
  GESTOR: 'Gestor'
};

const UsuarioForm = () => {
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const { showNotification } = useNotification(); // Use notification context
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    role: '' // Initialize role
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsuario = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/usuarios/${id}`);
        const userData = response.data;
        setFormData({
          nome: userData.nome || '',
          email: userData.email || '',
          cargo: userData.cargo || '',
          role: userData.role || '' // Set role from fetched data
        });
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        setError(err.message || 'Erro ao carregar dados do usuário.');
        showNotification(`Erro: ${err.message || 'Não foi possível carregar o usuário.'}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id, showNotification]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Exclude password fields if they were part of formData
    const { senha, confirmarSenha, ...dataToUpdate } = formData;

    try {
      await api.put(`/usuarios/${id}`, dataToUpdate);
      showNotification('Usuário atualizado com sucesso!', 'success');
      navigate('/usuarios'); // Navigate back to the list after successful update
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      const errorMessage = err.message || 'Erro ao atualizar usuário.';
      setError(errorMessage);
      showNotification(`Erro: ${errorMessage}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Editar Usuário
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="nome"
                  label="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // Agora sempre desabilitado
                  InputProps={{
                    readOnly: true, // Adiciona estilo visual de apenas leitura
                  }}
                  helperText="O email não pode ser alterado."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="cargo"
                  label="Cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="role"
                  label="Papel"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {Object.entries(ROLES).map(([key, name]) => (
                    <MenuItem key={key} value={key}>
                      {name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/usuarios')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Salvar Alterações'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsuarioForm;
