// Path: ranch-tracker/client/src/lib/api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request interceptor (single, deduplicated) ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor (single, deduplicated) ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats:          ()                                    => api.get('/dashboard/stats'),
  getKPIs:           ()                                    => api.get('/dashboard/kpis'),
  getAlerts:         ()                                    => api.get('/dashboard/alerts'),
  getProfitChart:    (period: 'week' | 'month' | 'year' = 'month') => api.get(`/dashboard/profit-chart?period=${period}`),
  getRecentActivity: ()                                    => api.get('/dashboard/recent-activity'),
  getFullDashboard:  ()                                    => api.get('/dashboard'),
};

// ─── Agriculture API ──────────────────────────────────────────────────────────
export const agricultureApi = {
  getCrops:       ()                                       => api.get('/agriculture/crops'),
  getCrop:        (cropId: string)                         => api.get(`/agriculture/crops/${cropId}`),
  getCropSeasons: (cropId: string)                         => api.get(`/agriculture/crops/${cropId}/seasons`),

  createSeason:   (data: unknown)                          => api.post('/agriculture/seasons', data),
  getSeason:      (seasonId: string)                       => api.get(`/agriculture/seasons/${seasonId}`),
  updateSeason:   (seasonId: string, data: unknown)        => api.put(`/agriculture/seasons/${seasonId}`, data),
  deleteSeason:   (seasonId: string)                       => api.delete(`/agriculture/seasons/${seasonId}`),

  getExpenses:    (seasonId: string)                       => api.get(`/agriculture/seasons/${seasonId}/expenses`),
  addExpense:     (seasonId: string, data: unknown)        => api.post(`/agriculture/seasons/${seasonId}/expenses`, data),
  deleteExpense:  (seasonId: string, expenseId: string)    => api.delete(`/agriculture/seasons/${seasonId}/expenses/${expenseId}`),

  getResources:   (seasonId: string)                       => api.get(`/agriculture/seasons/${seasonId}/resources`),
  addResource:    (seasonId: string, data: unknown)        => api.post(`/agriculture/seasons/${seasonId}/resources`, data),
  deleteResource: (seasonId: string, resourceId: string)   => api.delete(`/agriculture/seasons/${seasonId}/resources/${resourceId}`),

  getYields:      (seasonId: string)                       => api.get(`/agriculture/seasons/${seasonId}/yields`),
  addYield:       (seasonId: string, data: unknown)        => api.post(`/agriculture/seasons/${seasonId}/yields`, data),
  deleteYield:    (seasonId: string, yieldId: string)      => api.delete(`/agriculture/seasons/${seasonId}/yields/${yieldId}`),
};

// ─── Dairy API ────────────────────────────────────────────────────────────────
export const dairyApi = {
  // Herd & Animals
  getHerdSummary:  ()                                              => api.get('/dairy/herd/summary'),
  getAnimals:      (params?: Record<string, unknown>)              => api.get('/dairy/animals', { params }),
  getAnimal:       (id: string)                                    => api.get(`/dairy/animals/${id}`),
  createAnimal:    (data: unknown)                                 => api.post('/dairy/animals', data),
  updateAnimal:    (id: string, data: unknown)                     => api.put(`/dairy/animals/${id}`, data),
  deleteAnimal:    (id: string)                                    => api.delete(`/dairy/animals/${id}`),

  // Milk
  getMilkRecords:  (animalId: string, params?: Record<string, unknown>) => api.get(`/dairy/animals/${animalId}/milk`, { params }),
  getMilkSummary:  (animalId: string, params?: Record<string, unknown>) => api.get(`/dairy/animals/${animalId}/milk/summary`, { params }),
  createMilkRecord:(animalId: string, data: unknown)               => api.post(`/dairy/animals/${animalId}/milk`, data),
  deleteMilkRecord:(animalId: string, recordId: string)            => api.delete(`/dairy/animals/${animalId}/milk/${recordId}`),

  // Lactation
  getLactations:   (animalId: string)                              => api.get(`/dairy/animals/${animalId}/lactations`),
  createLactation: (animalId: string, data: unknown)               => api.post(`/dairy/animals/${animalId}/lactations`, data),
  updateLactation: (animalId: string, lacId: string, data: unknown)=> api.put(`/dairy/animals/${animalId}/lactations/${lacId}`, data),

  // Reproduction
  getReproduction: (animalId: string)                              => api.get(`/dairy/animals/${animalId}/reproduction`),
  createAIRecord:  (animalId: string, data: unknown)               => api.post(`/dairy/animals/${animalId}/reproduction/ai`, data),
  updateAIRecord:  (animalId: string, aiId: string, data: unknown) => api.put(`/dairy/animals/${animalId}/reproduction/ai/${aiId}`, data),
  createCalving:   (animalId: string, data: unknown)               => api.post(`/dairy/animals/${animalId}/reproduction/calving`, data),

  // Health
  getHealth:          (animalId: string)                           => api.get(`/dairy/animals/${animalId}/health`),
  createVaccination:  (animalId: string, data: unknown)            => api.post(`/dairy/animals/${animalId}/health/vaccinations`, data),
  updateVaccination:  (animalId: string, vId: string, data: unknown)=> api.put(`/dairy/animals/${animalId}/health/vaccinations/${vId}`, data),
  createTreatment:    (animalId: string, data: unknown)            => api.post(`/dairy/animals/${animalId}/health/treatments`, data),
  updateTreatment:    (animalId: string, tId: string, data: unknown)=> api.put(`/dairy/animals/${animalId}/health/treatments/${tId}`, data),

  // Feeding
  getFeeding:       (animalId: string)                             => api.get(`/dairy/animals/${animalId}/feeding`),
  createFeedRecord: (animalId: string, data: unknown)              => api.post(`/dairy/animals/${animalId}/feeding/records`, data),
  upsertFeedingPlan:(animalId: string, data: unknown)              => api.put(`/dairy/animals/${animalId}/feeding/plan`, data),

  // Profitability
  getProfitability: (animalId: string, params?: Record<string, unknown>) => api.get(`/dairy/animals/${animalId}/profitability`, { params }),

  // Fodder
  getFodderCrops:()=> api.get('/dairy/fodder/crops'),
  createFodderCrop:(data: unknown)=> api.post('/dairy/fodder/crops', data),
  updateFodderCrop:(id: string, data: unknown)=> api.put(`/dairy/fodder/crops/${id}`, data),
  getFodderStock:()=> api.get('/dairy/fodder/stock'),
  createFodderStock:(data: unknown)=> api.post('/dairy/fodder/stock', data),
  updateFodderStock:(id: string, data: unknown)=> api.put(`/dairy/fodder/stock/${id}`, data),
};

// ─── Shop API ─────────────────────────────────────────────────────────────────
export const shopApi = {
  getStats: () =>
    api.get('/shop/stats'),

  getBatches:    (params?: { status?: string; productType?: string }) =>
    api.get('/shop/batches', { params }),
  getBatchById:  (id: string) =>
    api.get(`/shop/batches/${id}`),
  createBatch:   (payload: unknown) =>
    api.post('/shop/batches', payload),
  updateBatch:   (id: string, payload: unknown) =>
    api.patch(`/shop/batches/${id}`, payload),
  deleteBatch:   (id: string) =>
    api.delete(`/shop/batches/${id}`),

  getSales:    (params?: { page?: number; limit?: number; from?: string; to?: string; paymentMode?: string }) =>
    api.get('/shop/sales', { params }),
  getSaleById: (id: string) =>
    api.get(`/shop/sales/${id}`),
  createSale:  (payload: unknown) =>
    api.post('/shop/sales', payload),

  getRevenueChart:    (params?: { period?: 'week' | 'month' | 'year' }) =>
    api.get('/shop/reports/revenue', { params }),
  getProductBreakdown:(params?: { from?: string; to?: string }) =>
    api.get('/shop/reports/products', { params }),
  getDailyReport:     (date?: string) =>
    api.get('/shop/reports/daily', { params: { date } }),
};
export default api;