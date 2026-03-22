// ranch-tracker/client/src/lib/constants.ts

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard', path: '/' },
  { key: 'agriculture', label: 'Agriculture', path: '/agriculture' },
  { key: 'dairy', label: 'Dairy', path: '/dairy' },
  { key: 'shop', label: 'Shop & POS', path: '/shop' },
] as const;


export const PAYMENT_MODES = ['cash', 'upi', 'card', 'credit'] as const;

export const WORKER_TYPES = ['daily', 'monthly', 'contract'] as const;

export const ASSET_CATEGORIES = ['DAIRY', 'AGRICULTURE', 'PROCESSING', 'SHOP', 'UTILITY'] as const;

export const CHART_COLORS = {
  revenue: '#38bdf8',
  expenses: '#f87171',
  profit: '#4ade80',
  neutral: '#64748b',
};

export const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
] as const;

// client/src/lib/constants.ts

export const ARABLE_CROPS = [
  { id: 'wheat',          name: 'Wheat',            localName: 'kanak' },
  { id: 'rice',           name: 'Rice',             localName: 'Jhona' },
  { id: 'maize',          name: 'Maize',            localName: 'Makki' },
  { id: 'barley',         name: 'Barley',           localName: 'Jau' },
  { id: 'moong',          name: 'Moong',            localName: 'Moongi' },
  { id: 'urad',           name: 'Urad',             localName: 'Urad' },
  { id: 'masoor',         name: 'Masoor',           localName: 'Masaar' },
  { id: 'channa',         name: 'Channa',           localName: 'Chole' },
  { id: 'bajra',          name: 'Bajra',            localName: 'bajra' },
  { id: 'jowar',          name: 'Jowar',            localName: 'jowar' },
  { id: 'ragi',           name: 'Ragi',             localName: 'ragi' },
  { id: 'foxtail',        name: 'Foxtail Millet',   localName: 'Kangni' },
  { id: 'sugarcane',      name: 'Sugarcane',        localName: 'Ganna' },
  { id: 'cotton',         name: 'Cotton',           localName: 'Kapah' },
  { id: 'chillies',       name: 'Chillies',         localName: 'Mirch' },
  { id: 'pea',            name: 'Pea',              localName: 'Matar' },
  { id: 'soyabean',       name: 'Soyabean',         localName: 'Soya' },
  { id: 'rajma',          name: 'Rajma',            localName: 'Rajma' },
  { id: 'groundnut',      name: 'Groundnut',        localName: 'Moongphali' },
];

export const VEGETABLE_GROUPS = {
  LEAFY: {
    label: 'Leafy Greens',
    crops: [
      { id: 'spinach',    name: 'Spinach',          localName: 'Palak' },
      { id: 'fenugreek',  name: 'Fenugreek',        localName: 'Methi' },
      { id: 'lettuce',    name: 'Lettuce',          localName: 'Salad Patta' },
    ],
  },
  ROOT: {
    label: 'Root Vegetables',
    crops: [
      { id: 'cabbage',    name: 'Cabbage',          localName: 'Patta Gobhi' },
      { id: 'carrot',     name: 'Carrot',           localName: 'Gajar' },
      { id: 'radish',     name: 'Radish',           localName: 'Mooli' },
      { id: 'beetroot',   name: 'Beetroot',         localName: 'Chukandar' },
      { id: 'turnip',     name: 'Turnip',           localName: 'Shalgam' },
      { id: 'potato',     name: 'Potato',           localName: 'Aloo' },
      { id: 'sweet_potato',name:'Sweet Potato',     localName: 'Shakarkandi' },
      { id: 'yam',        name: 'Yam',              localName: 'Zimikand' },
      { id: 'onion',      name: 'Onion',            localName: 'Pyaz' },
      { id: 'garlic',     name: 'Garlic',           localName: 'Lahsun' },
      { id: 'leek',       name: 'Leek',             localName: 'hare pyaz/ booka' },
    ],
  },
  FRUIT_VEG: {
    label: 'Fruit Vegetables',
    crops: [
      { id: 'tomato',     name: 'Tomato',           localName: 'Tamatar' },
      { id: 'brinjal',    name: 'Brinjal',          localName: 'Baingan' },
      { id: 'capsicum',   name: 'Capsicum',         localName: 'Shimla Mirch' },
      { id: 'cucumber',   name: 'Cucumber',         localName: 'Kheera' },
    ],
  },
  FLOWER_VEG: {
    label: 'Flower & Gourd Vegetables',
    crops: [
      { id: 'cauliflower',name: 'Cauliflower',      localName: 'Phool Gobhi' },
      { id: 'broccoli',   name: 'Broccoli',         localName: 'Broccoli' },
      { id: 'artichoke',  name: 'Artichoke',        localName: 'Artichoke' },
      { id: 'peas',       name: 'Peas',             localName: 'Matar' },
      { id: 'french_beans',name:'French Beans',     localName: 'Sem' },
      { id: 'cowpea',     name: 'Cowpea',           localName: 'Lobia' },
      { id: 'bottle_gourd',name:'Bottle Gourd',     localName: 'Lauki' },
      { id: 'bitter_gourd',name:'Bitter Gourd',     localName: 'Karela' },
      { id: 'ridge_gourd',name: 'Ridge Gourd',      localName: 'Tori' },
      { id: 'pumpkin',    name: 'Pumpkin',          localName: 'Kaddu' },
    ],
  },
};

export const EXPENSE_CATEGORIES = [
  { value: 'Machinery', label: 'Land Preparation' },
  { value: 'Seed', label: 'Seeds & Saplings' },
  { value: 'Fertilizer', label: 'Fertilizer' },
  { value: 'Irrigation', label: 'Irrigation' },
  { value: 'Labour', label: 'Labour' },
  { value: 'Pest Control', label: 'Pest Control' },
  { value: 'Machinery', label: 'Harvesting' },
  { value: 'Machinery', label: 'Transport' },
  { value: 'Other', label: 'Other' },
];

export const SEASON_STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'PLANNED',    label: 'Planned',    color: 'bg-slate-500' },
  { value: 'ACTIVE',     label: 'Active',     color: 'bg-agri-500' },
  { value: 'HARVESTED',  label: 'Harvested',  color: 'bg-harvest-500' },
  { value: 'COMPLETED',  label: 'Completed',  color: 'bg-agri-700' },
  { value: 'ABANDONED',  label: 'Abandoned',  color: 'bg-red-600' },
];

export const AREA_UNITS = [
  { value: 'acres',    label: 'Acres' },
  { value: 'bigha',    label: 'Bigha' },
  { value: 'hectare',  label: 'Hectare' },
  { value: 'kanal',    label: 'Kanal' },
  { value: 'marla',    label: 'Marla' },
];

export const YIELD_UNITS = [
  { value: 'kg',       label: 'Kilograms (kg)' },
  { value: 'quintal',  label: 'Quintal (100 kg)' },
  { value: 'tonne',    label: 'Tonne' },
  { value: 'bag',      label: 'Bag (50 kg)' },
  { value: 'bundle',   label: 'Bundle' },
];

// client/src/lib/constants.ts
export const ANIMAL_STATUSES = [
  { value: 'CALF',             label: 'Calf'             },
  { value: 'WEANED_CALF',      label: 'Weaned Calf'      },
  { value: 'HEIFER',           label: 'Heifer'           },
  { value: 'PREGNANT_HEIFER',  label: 'Pregnant Heifer'  },
  { value: 'LACTATING',        label: 'Lactating'        },
  { value: 'MILKING',          label: 'Milking'          },
  { value: 'DRY',              label: 'Dry Cow'          },
  { value: 'TRANSITION',       label: 'Transition Cow'   },
  { value: 'SOLD',             label: 'Sold'             },
  { value: 'DEAD',             label: 'Dead'             },
] as const
 
export const ANIMAL_TYPES = [
  { value: 'COW',     label: 'Cow'     },
  { value: 'BUFFALO', label: 'Buffalo' },
] as const
 
export const ANIMAL_GENDERS = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE',   label: 'Male'   },
] as const
 
// ─── Status visual styles ──────────────────────────────────────────────────────
export const STATUS_DOT: Record<string, string> = {
  CALF:            '#3b82f6',
  WEANED_CALF:     '#60a5fa',
  HEIFER:          '#8b5cf6',
  PREGNANT_HEIFER: '#ec4899',
  LACTATING:       '#10b981',
  MILKING:         '#10b981', 
  DRY:             '#f59e0b',
  TRANSITION:      '#f97316',
  SOLD:            '#22c55e',
  DEAD:            '#ef4444',
}
 
export const STATUS_BG: Record<string, string> = {
  CALF:            '#eff6ff',
  WEANED_CALF:     '#dbeafe',
  HEIFER:          '#f5f3ff',
  PREGNANT_HEIFER: '#fdf2f8',
  LACTATING:       '#ecfdf5',
  MILKING:         '#ecfdf5',
  DRY:             '#fefce8',
  TRANSITION:      '#fff7ed',
  SOLD:            '#f0fdf4',
  DEAD:            '#fef2f2',
}
 
export const STATUS_TEXT: Record<string, string> = {
  CALF:            '#1e3a8a',
  WEANED_CALF:     '#1e40af',
  HEIFER:          '#4c1d95',
  PREGNANT_HEIFER: '#831843',
  LACTATING:       '#065f46',
  MILKING:         '#065f46',
  DRY:             '#78350f',
  TRANSITION:      '#7c2d12',
  SOLD:            '#14532d',
  DEAD:            '#7f1d1d',
}
 
// Label map for display
export const STATUS_LABEL: Record<string, string> = {
  CALF:            'Calf',
  WEANED_CALF:     'Weaned Calf',
  HEIFER:          'Heifer',
  PREGNANT_HEIFER: 'Pregnant Heifer',
  LACTATING:       'Lactating',
  MILKING:         'Milking',
  DRY:             'Dry Cow',
  TRANSITION:      'Transition Cow',
  SOLD:            'Sold',
  DEAD:            'Dead',
}
 
// ─── Milk sessions ─────────────────────────────────────────────────────────────
export const MILK_SESSIONS = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'EVENING', label: 'Evening' },
] as const
 
// ─── AI / Reproduction ────────────────────────────────────────────────────────
export const AI_STATUSES = [
  { value: 'DONE',               label: 'Done'              },
  { value: 'CONFIRMED_PREGNANT', label: 'Confirmed Pregnant'},
  { value: 'NOT_PREGNANT',       label: 'Not Pregnant'      },
  { value: 'REPEAT',             label: 'Repeat'            },
] as const
 
// ─── Vaccination ──────────────────────────────────────────────────────────────
export const VACCINE_STATUSES = [
  { value: 'GIVEN',   label: 'Given'   },
  { value: 'DUE',     label: 'Due'     },
  { value: 'OVERDUE', label: 'Overdue' },
] as const
 
// ─── Fodder / Feed ────────────────────────────────────────────────────────────
export const FODDER_TYPES = [
  { value: 'GREEN',       label: 'Green Fodder',  color: '#10b981', unit: 'kg' },
  { value: 'DRY',         label: 'Dry / Straw',   color: '#f59e0b', unit: 'kg' },
  { value: 'SILAGE',      label: 'Silage',         color: '#0891b2', unit: 'kg' },
  { value: 'CONCENTRATE', label: 'Concentrate',    color: '#8b5cf6', unit: 'kg' },
  { value: 'SUPPLEMENT',  label: 'Supplement/Mineral', color: '#f43f5e', unit: 'g'  },
] as const
 
export const FODDER_COLORS: Record<string, string> = {
  GREEN:       '#10b981',
  DRY:         '#f59e0b',
  SILAGE:      '#b26e08',
  CONCENTRATE: '#aba222',
  SUPPLEMENT:  '#8917af',
}
 
// ─── Breed lists ──────────────────────────────────────────────────────────────
export const COW_BREEDS = [
  'Gir', 'Sahiwal', 'Tharparkar', 'Kankrej', 'Ongole',
  'Red Sindhi', 'Hariana', 'Rathi', 'Holstein Friesian',
  'Jersey', 'HF Cross', 'Jersey Cross', 'Other',
]
 
export const BUFFALO_BREEDS = [
  'Murrah', 'Surti', 'Mehsana', 'Nili-Ravi', 'Jaffarabadi',
  'Pandharpuri', 'Banni', 'Nagpuri', 'Graded Murrah', 'Other',
]
 

export const PRODUCT_TYPES = [
  'PANEER', 'GHEE', 'DAHI', 'BUTTER', 'MAKKAN', 'KHOYA',
  'CREAM', 'LASSI', 'KULFI', 'KHEER', 'ICE_CREAM',
  'HOT_MILK', 'BAKERY', 'CHAAT', 'RESTAURANT',
] as const

export const BATCH_STATUSES = ['PROCESSING', 'READY', 'EXPIRED'] as const

export const MILK_SOURCES = ['INTERNAL', 'EXTERNAL'] as const

export const PRODUCT_UNITS: Record<string, string> = {
  PANEER:    'kg',
  GHEE:      'ltr',
  DAHI:      'kg',
  BUTTER:    'kg',
  MAKKAN:    'kg',
  KHOYA:     'kg',
  CREAM:     'ltr',
  LASSI:     'ltr',
  KULFI:     'pcs',
  KHEER:     'kg',
  ICE_CREAM: 'ltr',
  HOT_MILK:  'ltr',
  BAKERY:    'pcs',
  CHAAT:     'plate',
  RESTAURANT:'plate',
}