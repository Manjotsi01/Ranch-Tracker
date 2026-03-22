// Path: ranch-tracker/client/src/types/index.ts

// ─── Dashboard Types ──────────────────────────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  todayMilkLiters: number;
  activeCrops: number;
  activeAnimals: number;
  activeSeasons: number;
  herdSize: number;
  cowCount: number;
  buffaloCount: number;
  pendingWages: number;
  surplusThisMonth: number;
  allSeasons: number;
}

export interface ModuleKPI {
  module: string;
  revenue: number;
  expenses: number;
  profit: number;
  trend: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  module: string;
  message: string;
  createdAt: string;
}

export interface ProfitChartPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DashboardData {
  stats: DashboardStats;
  moduleKPIs: ModuleKPI[];
  alerts: Alert[];
  profitChart: ProfitChartPoint[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  module: string;
  amount?: number;
  createdAt: string;
}



// ─── Agriculture Types ───────────────────────────────────────────────────────

export type CropCategory = 'ARABLE' | 'VEGETABLE';

export type SeasonStatus = 'PLANNED' | 'ACTIVE' | 'HARVESTED' | 'COMPLETED' | 'ABANDONED';

export interface Crop {
  cropId: string;
  name: string;
  localName?: string;
  category: CropCategory;
  subCategory?: string; 
  description?: string;
  icon?: string;
  seasons?: CropSeason[];
  latestSeason?: CropSeason;
  stats?: {
    totalArea: number;
    totalExpense: number;
    totalRevenue: number;
    totalProfit: number;
    activeSeasonsCount: number;
  };
}

export interface CropSeason {
  seasonId: string;
  cropId: string;
  cropName?: string;
  label: string; 
  startDate: string;
  endDate: string;
  status: SeasonStatus;
  variety?: string;
  areaSown: number; 
  areaUnit: string;
  budget: number;
  totalExpense?: number;
  totalYield?: number;
  yieldUnit?: string;
  totalRevenue?: number;
  netProfit?: number;
  roi?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeasonExpense {
  expenseId: string;
  seasonId: string;
  date: string;
  category: 'LAND_PREP' | 'SEEDS' | 'FERTILIZER' | 'IRRIGATION' | 'LABOR' | 'PEST_CONTROL' | 'HARVESTING' | 'TRANSPORT' | 'OTHER';
  description: string;
  amount: number;
  quantity?: number;
  unit?: string;
  vendor?: string;
}

export interface SeasonResource {
  resourceId: string;
  seasonId: string;
  date: string;
  type: 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'WATER' | 'LABOR' | 'EQUIPMENT';
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface YieldEntry {
  yieldId: string;
  seasonId: string;
  date: string;
  quantity: number;
  unit: string;
  grade?: string;
  marketPrice: number;
  revenue: number;
  notes?: string;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SelectOption {
  value: string;
  label: string;
}


// ─── Animal Types ─────────────────────────────────────────────────────────────
export type AnimalStatus =
  | 'CALF'
  | 'WEANED_CALF'
  | 'HEIFER'
  | 'PREGNANT_HEIFER'
  | 'LACTATING'      
  | 'DRY'
  | 'TRANSITION'
  | 'MILKING'       
  | 'SOLD'
  | 'DEAD';
 
export type AnimalType   = 'COW' | 'BUFFALO';
export type AnimalGender = 'FEMALE' | 'MALE';
 
export interface Bloodline {
  damId?:        string;
  damTag?:       string;
  sireSemen?:    string;
  bullName?:     string;
  geneticNotes?: string;
}
 
export interface Animal {
  _id:            string;
  animalId:       string;
  tagNo:          string;
  name?:          string;
  type:           AnimalType;
  gender:         AnimalGender;
  breed:          string;
  dateOfBirth?:   string;
  status:         AnimalStatus;
  bloodline:      Bloodline;
  purchaseDate?:  string;
  purchaseCost?:  number;
  currentWeight?: number;
  color?:         string;
  notes?:         string;
  createdAt:      string;
  updatedAt:      string;
}
 
export interface AnimalListItem extends Animal {
  latestMilk?:          number;
  currentLactationDay?: number;
  monthlyMilk?:         number;
}
 
// ─── Milk Records ──────────────────────────────────────────────────────────────
 
export type MilkSession = 'MORNING' | 'EVENING';
 
export interface MilkRecord {
  _id:       string;
  animalId:  string;
  date:      string;
  session:   MilkSession;
  quantity:  number;
  fat?:      number;
  snf?:      number;
  notes?:    string;
  createdAt: string;
}
 
export interface DailyMilkSummary {
  date:    string;
  morning: number;
  evening: number;
  total:   number;
}
 
export interface MonthlyMilkStats {
  month:       string;
  totalLiters: number;
  avgPerDay:   number;
  peakDay:     string;
  peakLiters:  number;
}
 
// ─── Lactation ─────────────────────────────────────────────────────────────────
 
export interface Lactation {
  _id:             string;
  animalId:        string;
  lactationNumber: number;
  startDate:       string;
  endDate?:        string;
  calvingId?:      string;
  totalYield?:     number;
  peakYield?:      number;
  peakDay?:        number;
  status:          'ACTIVE' | 'COMPLETED';
}
 
// ─── Reproduction ──────────────────────────────────────────────────────────────
 
export type AIStatus        = 'DONE' | 'CONFIRMED_PREGNANT' | 'NOT_PREGNANT' | 'REPEAT';
export type PregnancyStatus = 'PREGNANT' | 'NOT_PREGNANT' | 'UNKNOWN' | 'OPEN';
 
export interface AIRecord {
  _id:                string;
  animalId:           string;
  date:               string;
  semenBullName?:     string;
  semenCode?:         string;
  technicianName?:    string;
  status:             AIStatus;
  pregnancyCheckDate?: string;
  notes?:             string;
  createdAt:          string;
}
 
export interface CalvingRecord {
  _id:           string;
  animalId:      string;
  date:          string;
  calfGender:    AnimalGender;
  calfTagNo?:    string;
  calfWeight?:   number;
  complications?: string;
  aiRecordId?:   string;
  notes?:        string;
  createdAt:     string;
}
 
export interface ReproductionSummary {
  animalId:               string;
  currentPregnancyStatus: PregnancyStatus;
  expectedDueDate?:       string;
  totalCalvings:          number;
  lastCalvingDate?:       string;
  totalAIAttempts:        number;
  lastAIDate?:            string;
  aiRecords:              AIRecord[];
  calvingRecords:         CalvingRecord[];
}
 
// ─── Health ────────────────────────────────────────────────────────────────────
 
export type VaccineStatus = 'GIVEN' | 'DUE' | 'OVERDUE';
 
export interface VaccinationRecord {
  _id:               string;
  animalId:          string;
  vaccineName:       string;
  date:              string;
  nextDueDate?:      string;
  dosage?:           string;
  veterinarianName?: string;
  cost?:             number;
  notes?:            string;
  status:            VaccineStatus;
  createdAt:         string;
}
 
export interface TreatmentRecord {
  _id:               string;
  animalId:          string;
  date:              string;
  diagnosis:         string;
  medicines:         string[];
  veterinarianName?: string;
  cost?:             number;
  followUpDate?:     string;
  notes?:            string;
  createdAt:         string;
}
 
export interface HealthSummary {
  animalId:             string;
  totalVaccinationCost: number;
  totalTreatmentCost:   number;
  upcomingVaccinations: VaccinationRecord[];
  recentTreatments:     TreatmentRecord[];
  vaccinations:         VaccinationRecord[];
  treatments:           TreatmentRecord[];
}
 
// ─── Feeding ───────────────────────────────────────────────────────────────────
 
export type FodderType = 'GREEN' | 'DRY' | 'SILAGE' | 'CONCENTRATE' | 'SUPPLEMENT';
 
export interface FeedRecord {
  _id:        string;
  animalId:   string;
  date:       string;
  fodderType: FodderType;
  fodderName: string;
  quantity:   number;
  costPerKg?: number;
  totalCost?: number;
  notes?:     string;
  createdAt:  string;
}
 
export interface FeedingPlan {
  _id:           string;
  animalId?:     string;
  fodderType:    FodderType;
  fodderName:    string;
  dailyQuantity: number;
  unit:          string;
  costPerUnit?:  number;
  isActive?:     boolean;
}
 
export interface DailyFeedBreakdown {
  fodderType:    FodderType;
  totalQuantity: number;
  unit:          string;
  dailyCost:     number;
}
 
export interface FeedingSummary {
  animalId:          string;
  currentPlan:       FeedingPlan[];
  monthlyFeedCost:   number;
  yearlyFeedCost:    number;
  dailyFeedCost:     number;           
  dailyBreakdown:    DailyFeedBreakdown[]; 
}
 
// ─── Profitability ─────────────────────────────────────────────────────────────
 
export interface AnimalProfitability {
  animalId:    string;
  period:      string;
  milkIncome:  number;
  feedCost:    number;
  medicalCost: number;
  otherCost:   number;
  netProfit:   number;
  roi?:        number;
}
 
// ─── Fodder Module ─────────────────────────────────────────────────────────────
 
export interface FodderCrop {
  _id:                  string;
  cropName:             string;
  variety?:             string;
  area?:                number;
  plantingDate?:        string;
  expectedHarvestDate?: string;
  status:               'GROWING' | 'HARVESTED' | 'PLANNED';
  expectedYield?:       number;
  actualYield?:         number;
  cost?:                number;
  notes?:               string;
}
 
export interface FodderStock {
  _id:          string;
  fodderType:   FodderType;
  fodderName:   string;
  quantity:     number;
  unit:         string;
  costPerUnit?: number;
  purchaseDate?: string;
  expiryDate?:  string;
  supplier?:    string;
  notes?:       string;
}
 
// ─── Herd Summary ──────────────────────────────────────────────────────────────
 
export interface HerdSummary {
  totalAnimals:      number;
  byStatus:          Record<string, number>;
  byType:            Record<AnimalType, number>;
  milkingCount:      number;
  todayMilk:         number;
  monthlyMilk:       number;
  avgMilkPerAnimal:  number;
}
 
// ─── API Response Wrappers ─────────────────────────────────────────────────────
 
export interface ApiResponse<T> {
  success: boolean;
  data:    T;
  message?: string;
}
 
export interface PaginatedResponse<T> {
  success: boolean;
  data:    T[];
  total:   number;
  page:    number;
  limit:   number;
}
 
// ─── Shared ────────────────────────────────────────────────────────────────────
 
export interface SelectOption {
  value: string;
  label: string;
}

// ─── Shop / POS ──────────────────────────────────────────────────────────────

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
export type BatchStatus = 'PROCESSING' | 'READY' | 'EXPIRED'
export type ProductType =
  | 'PANEER'
  | 'GHEE'
  | 'DAHI'
  | 'BUTTER'
  | 'MAKKAN'
  | 'KHOYA'
  | 'CREAM'
  | 'LASSI'
  | 'KULFI'
  | 'KHEER'
  | 'ICE_CREAM'
  | 'HOT_MILK'
  | 'BAKERY'
  | 'CHAAT'
  | 'RESTAURANT'

export interface BatchInput {
  milkLiters: number
  milkSource: 'INTERNAL' | 'EXTERNAL'
  avgFat: number
  avgSNF: number
  milkCost: number
}

export interface BatchCosts {
  labor: number
  fuel: number
  ingredients: number
  packaging: number
  utilities: number
}

export interface BatchOutput {
  quantityProduced: number
  wastage: number
}

export interface BatchPricing {
  costPerUnit: number
  sellingPricePerUnit: number
}

export interface Batch {
  _id: string
  batchId: string
  productType: ProductType
  productionDate: string
  expiryDate: string
  input: BatchInput
  costs: BatchCosts
  output: BatchOutput
  pricing: BatchPricing
  stockRemaining: number
  qualityScore: number
  status: BatchStatus
  createdAt: string
  updatedAt: string
}

export interface CreateBatchPayload {
  productType: ProductType
  productionDate: string
  expiryDate: string
  input: BatchInput
  costs: BatchCosts
  output: BatchOutput
  pricing: BatchPricing
  qualityScore?: number
}

export interface SaleItem {
  productId: string
  batchId: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Sale {
  _id: string
  saleId: string
  dateTime: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  paymentMode: PaymentMode
  totalAmount: number
  createdBy: string
  createdAt: string
}

export interface CreateSalePayload {
  customerId?: string
  customerName?: string
  items: Omit<SaleItem, 'total'>[]
  paymentMode: PaymentMode
}

export interface Product {
  _id: string
  productType: ProductType
  name: string
  unit: string         
  currentStock: number
  batches: Batch[]
}

export interface ShopStats {
  todaySales: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  activeBatches: number
  lowStockAlerts: number
  topProduct: string
  avgOrderValue: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface ProductSaleBreakdown {
  productType: string
  totalSold: number
  totalRevenue: number
  margin: number
}

// ─── Shared / Layout ─────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  path: string
  icon: string
  stage: number
  children?: NavItem[]
}

export interface AlertItem {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  module: string
  timestamp: string
}
