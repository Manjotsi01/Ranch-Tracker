// client/src/lib/api.ts
/**
 * Secure API client
 * - Token stored in httpOnly cookie (preferred) with localStorage fallback
 * - Input sanitization helpers
 * - XSS escape utilities
 * - Single request/response interceptors
 */
import axios from 'axios';

// ─── XSS / Input Security Utilities ──────────────────────────────────────────

/** Escape HTML special characters to prevent XSS */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/** Strip HTML tags from a string */
export function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a user-facing string:
 * strips tags, trims whitespace, escapes HTML entities.
 */
export function sanitize(input: string): string {
  return escapeHtml(stripTags(input.trim()));
}

/**
 * Sanitize a plain text input (no HTML allowed, restrict special chars).
 * Safe for names, labels, notes, etc.
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>'"`;]/g, '')   // remove chars commonly used in injection
    .slice(0, 2000);            // reasonable max length
}

/** Validate and sanitize a numeric string input */
export function sanitizeNumber(input: string): number | null {
  const n = parseFloat(input.replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? null : n;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Token Management ─────────────────────────────────────────────────────────
// Prefer httpOnly cookies (set by server) for actual auth.
// This module reads a non-sensitive access token from memory or sessionStorage.
// NEVER store sensitive secrets in localStorage.

let _memToken: string | null = null;

function getToken(): string | null {
  // 1. In-memory (most secure, cleared on tab close)
  if (_memToken) return _memToken;
  // 2. sessionStorage (cleared on tab close, not accessible cross-tab)
  //    Only used for access tokens, NOT refresh tokens
  try {
    return sessionStorage.getItem('rt_at');
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  _memToken = token;
  try {
    sessionStorage.setItem('rt_at', token);
  } catch { /* storage unavailable */ }
  // NOTE: For production, the server should set httpOnly cookie instead.
  // Remove this client-side storage once httpOnly cookies are configured.
}

export function clearToken(): void {
  _memToken = null;
  try {
    sessionStorage.removeItem('rt_at');
    localStorage.removeItem('token'); // clear any old localStorage token
  } catch { /* ignore */ }
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
  withCredentials: true, // send httpOnly cookies if server supports it
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF mitigation
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = getToken()
      // Fallback: read from localStorage for backward compatibility
      ?? localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    // 401 Unauthorized → clear token and redirect to login
    if (error.response?.status === 401) {
      clearToken();
      // In a real app: navigate to /login
    }

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
  getStats:          ()                                           => api.get('/dashboard/stats'),
  getKPIs:           ()                                           => api.get('/dashboard/kpis'),
  getAlerts:         ()                                           => api.get('/dashboard/alerts'),
  getProfitChart:    (period: 'week' | 'month' | 'year' = 'month') => api.get(`/dashboard/profit-chart?period=${period}`),
  getRecentActivity: ()                                           => api.get('/dashboard/recent-activity'),
  getFullDashboard:  ()                                           => api.get('/dashboard'),
};

// ─── Agriculture API ──────────────────────────────────────────────────────────
export const agricultureApi = {
  getCrops:       ()                                        => api.get('/agriculture/crops'),
  getCrop:        (cropId: string)                          => api.get(`/agriculture/crops/${encodeURIComponent(cropId)}`),
  getCropSeasons: (cropId: string)                          => api.get(`/agriculture/crops/${encodeURIComponent(cropId)}/seasons`),

  createSeason:   (data: unknown)                           => api.post('/agriculture/seasons', data),
  getSeason:      (seasonId: string)                        => api.get(`/agriculture/seasons/${encodeURIComponent(seasonId)}`),
  updateSeason:   (seasonId: string, data: unknown)         => api.put(`/agriculture/seasons/${encodeURIComponent(seasonId)}`, data),
  deleteSeason:   (seasonId: string)                        => api.delete(`/agriculture/seasons/${encodeURIComponent(seasonId)}`),

  getExpenses:    (seasonId: string)                        => api.get(`/agriculture/seasons/${encodeURIComponent(seasonId)}/expenses`),
  addExpense:     (seasonId: string, data: unknown)         => api.post(`/agriculture/seasons/${encodeURIComponent(seasonId)}/expenses`, data),
  deleteExpense:  (seasonId: string, expenseId: string)     => api.delete(`/agriculture/seasons/${encodeURIComponent(seasonId)}/expenses/${encodeURIComponent(expenseId)}`),

  getResources:   (seasonId: string)                        => api.get(`/agriculture/seasons/${encodeURIComponent(seasonId)}/resources`),
  addResource:    (seasonId: string, data: unknown)         => api.post(`/agriculture/seasons/${encodeURIComponent(seasonId)}/resources`, data),
  deleteResource: (seasonId: string, resourceId: string)    => api.delete(`/agriculture/seasons/${encodeURIComponent(seasonId)}/resources/${encodeURIComponent(resourceId)}`),

  getYields:      (seasonId: string)                        => api.get(`/agriculture/seasons/${encodeURIComponent(seasonId)}/yields`),
  addYield:       (seasonId: string, data: unknown)         => api.post(`/agriculture/seasons/${encodeURIComponent(seasonId)}/yields`, data),
  deleteYield:    (seasonId: string, yieldId: string)       => api.delete(`/agriculture/seasons/${encodeURIComponent(seasonId)}/yields/${encodeURIComponent(yieldId)}`),
};

// ─── Dairy API ────────────────────────────────────────────────────────────────
export const dairyApi = {
  getHerdSummary:  ()                                                        => api.get('/dairy/herd/summary'),
  getAnimals:      (params?: Record<string, unknown>)                        => api.get('/dairy/animals', { params }),
  getAnimal:       (id: string)                                              => api.get(`/dairy/animals/${encodeURIComponent(id)}`),
  createAnimal:    (data: unknown)                                           => api.post('/dairy/animals', data),
  updateAnimal:    (id: string, data: unknown)                               => api.put(`/dairy/animals/${encodeURIComponent(id)}`, data),
  deleteAnimal:    (id: string)                                              => api.delete(`/dairy/animals/${encodeURIComponent(id)}`),

  getMilkRecords:  (animalId: string, params?: Record<string, unknown>)      => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/milk`, { params }),
  getMilkSummary:  (animalId: string, params?: Record<string, unknown>)      => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/milk/summary`, { params }),
  createMilkRecord:(animalId: string, data: unknown)                         => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/milk`, data),
  deleteMilkRecord:(animalId: string, recordId: string)                      => api.delete(`/dairy/animals/${encodeURIComponent(animalId)}/milk/${encodeURIComponent(recordId)}`),

  getLactations:   (animalId: string)                                        => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/lactations`),
  createLactation: (animalId: string, data: unknown)                         => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/lactations`, data),
  updateLactation: (animalId: string, lacId: string, data: unknown)          => api.put(`/dairy/animals/${encodeURIComponent(animalId)}/lactations/${encodeURIComponent(lacId)}`, data),

  getReproduction: (animalId: string)                                        => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/reproduction`),
  createAIRecord:  (animalId: string, data: unknown)                         => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/reproduction/ai`, data),
  updateAIRecord:  (animalId: string, aiId: string, data: unknown)           => api.put(`/dairy/animals/${encodeURIComponent(animalId)}/reproduction/ai/${encodeURIComponent(aiId)}`, data),
  createCalving:   (animalId: string, data: unknown)                         => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/reproduction/calving`, data),

  getHealth:          (animalId: string)                                     => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/health`),
  createVaccination:  (animalId: string, data: unknown)                      => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/health/vaccinations`, data),
  updateVaccination:  (animalId: string, vId: string, data: unknown)         => api.put(`/dairy/animals/${encodeURIComponent(animalId)}/health/vaccinations/${encodeURIComponent(vId)}`, data),
  createTreatment:    (animalId: string, data: unknown)                      => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/health/treatments`, data),
  updateTreatment:    (animalId: string, tId: string, data: unknown)         => api.put(`/dairy/animals/${encodeURIComponent(animalId)}/health/treatments/${encodeURIComponent(tId)}`, data),

  getFeeding:       (animalId: string)                                       => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/feeding`),
  createFeedRecord: (animalId: string, data: unknown)                        => api.post(`/dairy/animals/${encodeURIComponent(animalId)}/feeding/records`, data),
  upsertFeedingPlan:(animalId: string, data: unknown)                        => api.put(`/dairy/animals/${encodeURIComponent(animalId)}/feeding/plan`, data),

  getProfitability: (animalId: string, params?: Record<string, unknown>)     => api.get(`/dairy/animals/${encodeURIComponent(animalId)}/profitability`, { params }),

  getFodderCrops:   ()                                                       => api.get('/dairy/fodder/crops'),
  createFodderCrop: (data: unknown)                                          => api.post('/dairy/fodder/crops', data),
  updateFodderCrop: (id: string, data: unknown)                              => api.put(`/dairy/fodder/crops/${encodeURIComponent(id)}`, data),
  getFodderStock:   ()                                                       => api.get('/dairy/fodder/stock'),
  createFodderStock:(data: unknown)                                          => api.post('/dairy/fodder/stock', data),
  updateFodderStock:(id: string, data: unknown)                              => api.put(`/dairy/fodder/stock/${encodeURIComponent(id)}`, data),
};

// ─── SHOP API ─────────────────────────────────────────────

export const shopApi = {
  // Milk
  getMilkEntries:  (p?: Record<string, string>)   => (api.get('/shop/milk', { params: p })),
  getMilkStock:    (date?: string)                 => (api.get('/shop/milk/stock', { params: date ? { date } : {} })),
  addMilkEntry:    (data: unknown)                 => (api.post('/shop/milk', data)),

  // Products
  getProducts:     (all?: boolean)                 => (api.get('/shop/products', { params: all ? { all: true } : {} })),
  createProduct:   (data: unknown)                 => (api.post('/shop/products', data)),
  updateProduct:   (id: string, data: unknown)     => (api.patch(`/shop/products/${id}`, data)),
  adjustStock:     (id: string, delta: number)     => (api.patch(`/shop/products/${id}/stock/adjust`, { delta })),
  setStock:        (id: string, qty: number)       => (api.patch(`/shop/products/${id}/stock/set`, { qty })),
  deleteProduct:   (id: string)                    => (api.delete(`/shop/products/${id}`)),

  // Sales
  getSales:        (p?: Record<string, string | number>) => (api.get('/shop/sales', { params: p })),
  createSale:      (data: unknown)                 => (api.post('/shop/sales', data)),

  // Wholesale
  getWholesale:    (p?: Record<string, string>)    => (api.get('/shop/wholesale', { params: p })),
  createWholesale: (data: unknown)                 => (api.post('/shop/wholesale', data)),
  markReceived:    (id: string)                    => (api.patch(`/shop/wholesale/${id}/payment`)),

  // Expenses
  getExpenses:     (p?: Record<string, string>)    => (api.get('/shop/expenses', { params: p })),
  upsertExpense:   (data: unknown)                 => (api.post('/shop/expenses', data)),

  // Reports
  getDailyReport:   (date?: string)  => (api.get('/shop/reports/daily', { params: date ? { date } : {} })),
  getMonthlyReport: (month: string)  => (api.get('/shop/reports/monthly', { params: { month } })),
}

export default api;