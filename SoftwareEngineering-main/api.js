import axios from 'axios';

// Backend1 (业务后端) 运行在 8001
const API_BASE = 'http://localhost:8001';
// Algorithm (联邦学习聚合器) 运行在 8000
const FL_BASE = 'http://localhost:8000';

export const api = {
  // --- 处方业务 (Backend1 -> Ledger) ---
  createPrescription: async (payload) => {
    // 对应 backend1/main.py 的 /prescriptions/create
    return axios.post(`${API_BASE}/prescriptions/create`, { payload });
  },
  
  verifyPrescription: async (id) => {
    // 对应 backend1/main.py 的 /prescriptions/verify
    return axios.post(`${API_BASE}/prescriptions/verify?prescription_id=${id}`);
  },

  dispensePrescription: async (id) => {
    // 对应 backend1/main.py 的 /prescriptions/dispense
    return axios.post(`${API_BASE}/prescriptions/dispense?prescription_id=${id}`);
  },

  getPrescription: async (id) => {
    return axios.get(`${API_BASE}/prescriptions/${id}`);
  },

  // --- 联邦学习 (Algorithm1 Aggregator) ---
  getFLStatus: async () => {
    // 对应 algorithm1/aggregator.py 的 /status
    return axios.get(`${FL_BASE}/status`);
  },

  getFLHistory: async () => {
    // 对应 algorithm1/aggregator.py 的 /history
    return axios.get(`${FL_BASE}/history`);
  }
};
