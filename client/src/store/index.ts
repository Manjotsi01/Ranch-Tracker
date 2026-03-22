// ranch-tracker/client/src/store/index.ts

import { create } from 'zustand';
import type { DashboardStats, 
  ModuleKPI, 
  Alert, 
  ProfitChartPoint, 
  ActivityItem, 
  Crop,
  CropSeason,
  Animal, 
  HerdSummary,
  Batch, 
  Sale, 
  Product, 
  ShopStats,
  RevenueDataPoint,
  ProductSaleBreakdown,
 } from '../types/index';


// ─── Dashboard Store ──────────────────────────────────────────────
interface DashboardStore {
  stats: DashboardStats | null;

  kpis: ModuleKPI[];
  alerts: Alert[];
  profitChart: ProfitChartPoint[];
  recentActivity: ActivityItem[];
  period: 'week' | 'month' | 'year';
  loading: boolean;
  error: string | null;
  setStats: (stats: DashboardStats) => void;
  setKPIs: (kpis: ModuleKPI[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setProfitChart: (data: ProfitChartPoint[]) => void;
  setRecentActivity: (data: ActivityItem[]) => void;
  setPeriod: (period: 'week' | 'month' | 'year') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  dismissAlert: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  kpis: [],
  alerts: [],
  profitChart: [],
  recentActivity: [],
  period: 'month',
  loading: false,
  error: null,
  setStats:          (stats) => set({ stats }),
  setKPIs:           (kpis) => set({ kpis }),
  setAlerts:         (alerts) => set({ alerts }),
  setProfitChart:    (profitChart) => set({ profitChart }),
  setRecentActivity: (recentActivity) => set({ recentActivity }),
  setPeriod:         (period) => set({ period }),
  setLoading:        (loading) => set({ loading }),
  setError:          (error) => set({ error }),
  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
}))


// ─── Agriculture Store ────────────────────────────────────────────────────────
interface AgricultureState {
  crops: Crop[];
  selectedCrop: Crop | null;
  seasons: CropSeason[];
  selectedSeason: CropSeason | null;
  activeTab: 'ARABLE' | 'VEGETABLE';
  loading: boolean;
  error: string | null;
  setActiveTab: (tab: 'ARABLE' | 'VEGETABLE') => void;
  setSelectedCrop: (crop: Crop | null) => void;
  setSelectedSeason: (season: CropSeason | null) => void;
  setCrops: (crops: Crop[]) => void;
  setSeasons: (seasons: CropSeason[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAgricultureStore = create<AgricultureState>((set) => ({
  crops: [],
  selectedCrop: null,
  seasons: [],
  selectedSeason: null,
  activeTab: 'ARABLE',
  loading: false,
  error: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCrop: (crop) => set({ selectedCrop: crop }),
  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setCrops: (crops) => set({ crops }),
  setSeasons: (seasons) => set({ seasons }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));



interface AnimalStore {
  cowAnimals:      Animal[]
  buffaloAnimals:  Animal[]
  animals:         Animal[]
  selectedAnimal:  Animal | null
  herdSummary:     HerdSummary | null
  filters: {
    status: string
    type:   string
    search: string
  }
  setCowAnimals:      (animals: Animal[]) => void
  setBuffaloAnimals:  (animals: Animal[]) => void
  setAnimals:         (animals: Animal[]) => void
  setSelectedAnimal:  (animal: Animal | null) => void
  setHerdSummary:     (summary: HerdSummary) => void
  setFilter:          (key: keyof AnimalStore['filters'], value: string) => void
  clearFilters:       () => void
}
 
export const useAnimalStore = create<AnimalStore>((set) => ({
  cowAnimals:     [],
  buffaloAnimals: [],
  animals:        [],
  selectedAnimal: null,
  herdSummary:    null,
  filters:        { status: '', type: '', search: '' },
 
  setCowAnimals:     (cowAnimals)     => set({ cowAnimals,     animals: cowAnimals }),
  setBuffaloAnimals: (buffaloAnimals) => set({ buffaloAnimals, animals: buffaloAnimals }),
  setAnimals:        (animals)        => set({ animals }),
  setSelectedAnimal: (selectedAnimal) => set({ selectedAnimal }),
  setHerdSummary:    (herdSummary)    => set({ herdSummary }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  clearFilters: () =>
    set({ filters: { status: '', type: '', search: '' } }),
}))
 
interface UIStore {
  sidebarOpen:    boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar:  () => void
}
 
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen:    true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
 

// ─── Shop Store ──────────────────────────────────────────────────────────────
interface ShopState {
  stats: ShopStats | null
  batches: Batch[]
  products: Product[]
  sales: Sale[]
  revenueChart: RevenueDataPoint[]
  productBreakdown: ProductSaleBreakdown[]
  loading: boolean
  error: string | null

  setStats: (s: ShopStats) => void
  setBatches: (b: Batch[]) => void
  setProducts: (p: Product[]) => void
  setSales: (s: Sale[]) => void
  setRevenueChart: (d: RevenueDataPoint[]) => void
  setProductBreakdown: (d: ProductSaleBreakdown[]) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  addBatch: (b: Batch) => void
  updateBatch: (id: string, b: Partial<Batch>) => void
  removeBatch: (id: string) => void
  addSale: (s: Sale) => void
}

export const useShopStore = create<ShopState>((set) => ({
  stats: null,
  batches: [],
  products: [],
  sales: [],
  revenueChart: [],
  productBreakdown: [],
  loading: false,
  error: null,

  setStats: (stats) => set({ stats }),
  setBatches: (batches) => set({ batches }),
  setProducts: (products) => set({ products }),
  setSales: (sales) => set({ sales }),
  setRevenueChart: (revenueChart) => set({ revenueChart }),
  setProductBreakdown: (productBreakdown) => set({ productBreakdown }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  addBatch: (b) => set((s) => ({ batches: [b, ...s.batches] })),
  updateBatch: (id, patch) =>
    set((s) => ({
      batches: s.batches.map((b) => (b._id === id ? { ...b, ...patch } : b)),
    })),
  removeBatch: (id) =>
    set((s) => ({ batches: s.batches.filter((b) => b._id !== id) })),
  addSale: (sale) => set((s) => ({ sales: [sale, ...s.sales] })),
}))

// ─── POS Cart Store ───────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  productType: string
  productName: string
  batchId: string
  batchCode: string
  unitPrice: number
  quantity: number
  discount: number
  unit: string
}

interface CartState {
  items: CartItem[]
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
  customerName: string
  customerId: string
  addItem: (item: CartItem) => void
  updateItem: (id: string, patch: Partial<CartItem>) => void
  removeItem: (id: string) => void
  clearCart: () => void
  setPaymentMode: (m: CartState['paymentMode']) => void
  setCustomer: (name: string, id?: string) => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  paymentMode: 'CASH',
  customerName: '',
  customerId: '',

  addItem: (item) =>
    set((s) => {
      const exists = s.items.find(
        (i) => i.batchId === item.batchId && i.productType === item.productType
      )
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.id === exists.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        }
      }
      return { items: [...s.items, item] }
    }),

  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  clearCart: () =>
    set({ items: [], customerName: '', customerId: '', paymentMode: 'CASH' }),

  setPaymentMode: (paymentMode) => set({ paymentMode }),
  setCustomer: (customerName, customerId = '') => set({ customerName, customerId }),

  getTotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => {
      const lineTotal = item.unitPrice * item.quantity
      const discounted = lineTotal - (lineTotal * item.discount) / 100
      return sum + discounted
    }, 0)
  },

  getItemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
}))
