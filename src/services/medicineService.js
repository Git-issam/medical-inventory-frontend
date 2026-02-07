import api from './api';

const medicineService = {
    // Get all medicines
    getAllMedicines: async () => {
        const response = await api.get('/medicines');
        return response.data;
    },

    // Get dashboard statistics
    getStats: async () => {
        const response = await api.get('/medicines/stats');
        return response.data;
    },

    // Add new medicine
    addMedicine: async (medicineData) => {
        const response = await api.post('/medicines', medicineData);
        return response.data;
    },

    // Update medicine
    updateMedicine: async (id, medicineData) => {
        const response = await api.put(`/medicines/${id}`, medicineData);
        return response.data;
    },

    // Delete medicine
    deleteMedicine: async (id) => {
        const response = await api.delete(`/medicines/${id}`);
        return response.data;
    },
};

export default medicineService;
