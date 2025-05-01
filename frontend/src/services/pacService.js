// filepath: frontend/src/services/pacService.js
import api from './api'; // Import the configured axios instance

// Fetch PACs assigned to the logged-in GESTOR
// The backend GET /api/pacs route now automatically filters for GESTOR role
export const getMeusPacs = () => {
    // Call the main /pacs endpoint; backend handles filtering
    return api.get('/pacs');
};

// Add other PAC-related functions as needed
export const getAllPacs = () => api.get('/pacs'); // Uncommented this line
// export const getPacById = (id) => api.get(`/pacs/${id}`);
// export const createPac = (data) => api.post('/pacs', data);
export const updatePac = (id, data) => api.put(`/pacs/${id}`, data); // Added data parameter back
// export const deletePac = (id) => api.delete(`/pacs/${id}`);