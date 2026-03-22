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

    // Dispense medicines on billing (deducts stock)
    dispenseMedicines: async (payload) => {
        const response = await api.post('/medicines/dispense', payload);
        return response.data;
    },

    // Sales report — period: 'daily' | 'monthly' | 'yearly'
    getSalesReport: async (period = 'daily', date = null, year = null) => {
        const params = { period };
        if (date) params.date = date;
        if (year) params.year = year;
        const response = await api.get('/sales/report', { params });
        return response.data;
    },

    // Monthly summary for the given year (for charts)
    getSalesSummary: async (year = null) => {
        const params = {};
        if (year) params.year = year;
        const response = await api.get('/sales/summary', { params });
        return response.data;
    },
};

export default medicineService;
