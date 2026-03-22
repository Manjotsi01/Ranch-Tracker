// src/pages/shop/index.tsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Package, Receipt, TrendingUp,
  ChevronRight, AlertCircle, Zap,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts'
import { shopApi } from '../../lib/api'
import StatCard from '../../components/ui/StatCard'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency, formatDate, getProductLabel } from '../../lib/utils'
import type { ShopStats, RevenueDataPoint, ProductSaleBreakdown, Batch } from '../../types'

const PRODUCT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

const ShopOverview: React.FC = () => {
  const [stats, setStats] = useState<ShopStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueDataPoint[]>([])
  const [breakdown, setBreakdown] = useState<ProductSaleBreakdown[]>([])
  const [expiring, setExpiring] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statsRes, revenueRes, breakdownRes, batchRes] = await Promise.all([
          shopApi.getStats(),
          shopApi.getRevenueChart({ period: 'week' }),
          shopApi.getProductBreakdown(),
          shopApi.getBatches({ status: 'READY' }),
        ])
        setStats(statsRes.data.data ?? statsRes.data)
        setRevenue(revenueRes.data.data ?? revenueRes.data)
        setBreakdown(breakdownRes.data.data ?? breakdownRes.data)

        const batches: Batch[] = batchRes.data.data ?? batchRes.data
        const soon = batches.filter((b) => {
          const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / 86400000)
          return days <= 3 && days >= 0
        })
        setExpiring(soon)
      } catch {
        setError('Failed to load shop data. Check your API connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <ShopSkeleton />

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Connection Error</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Shop Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Dairy • Bakery • Restaurant • Chaat</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/shop/processing"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Package size={15} />
            Batches
          </Link>
          <Link
            to="/shop/pos"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Zap size={15} />
            Open POS
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={stats?.todaySales ?? 0}
          trendLabel="transactions today"
          icon={<Receipt size={16} />}
          accentColor="#3b82f6"
          format="number"
        />
        <StatCard
          label="Today's Revenue"
          value={stats?.todayRevenue ?? 0}
          trendLabel="cash + digital"
          icon={<TrendingUp size={16} />}
          accentColor="#10b981"
          format="currency"
        />
        <StatCard
          label="Week Revenue"
          value={stats?.weekRevenue ?? 0}
          trendLabel="last 7 days"
          icon={<ShoppingBag size={16} />}
          accentColor="#ef4444"
          format="currency"
        />
        <StatCard
          label="Active Batches"
          value={stats?.activeBatches ?? 0}
          trendLabel={`${stats?.lowStockAlerts ?? 0} low stock`}
          icon={<Package size={16} />}
          accentColor="#f59e0b"
          format="number"
        />
      </div>

      {/* Expiry Alerts */}
      {expiring.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle size={15} />
            Expiring Soon ({expiring.length} batch{expiring.length > 1 ? 'es' : ''})
          </p>
          <div className="flex flex-wrap gap-2">
            {expiring.map((b) => {
              const days = Math.ceil((new Date(b.expiryDate).getTime() - Date.now()) / 86400000)
              return (
                <Link
                  key={b._id}
                  to={`/shop/processing?id=${b._id}`}
                  className="flex items-center gap-2 bg-white border border-red-200 rounded-xl px-3 py-2 text-sm hover:border-red-400 transition-colors"
                >
                  <span className="font-semibold text-slate-800">{getProductLabel(b.productType)}</span>
                  <Badge variant="red">{days === 0 ? 'Today' : `${days}d`}</Badge>
                  <span className="text-slate-400">{b.stockRemaining} {b.output.quantityProduced > 0 ? 'units' : ''}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-bold text-slate-900">Revenue Trend</p>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days</p>
            </div>
            <Badge variant="blue">Weekly</Badge>
          </div>
          {revenue.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                  }
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  labelFormatter={(l: string) => formatDate(l)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Product Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="font-bold text-slate-900 mb-1">Sales by Product</p>
          <p className="text-xs text-slate-400 mb-5">Revenue this period</p>
          {breakdown.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={breakdown.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="productType" type="category" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={getProductLabel} width={70} />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="totalRevenue" radius={[0, 6, 6, 0]}>
                  {breakdown.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/shop/processing', label: 'Batch Processing', sub: 'Create & manage production batches', icon: <Package size={22} className="text-blue-600" />, bg: 'bg-blue-50' },
          { to: '/shop/pos',        label: 'Point of Sale',    sub: 'Sell products, accept payments',    icon: <Zap size={22} className="text-red-600" />,   bg: 'bg-red-50'  },
          { to: '/shop/sales',      label: 'Sales History',    sub: 'View all past transactions',        icon: <Receipt size={22} className="text-emerald-600" />, bg: 'bg-emerald-50' },
        ].map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`${card.bg} rounded-xl p-3 shrink-0`}>{card.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}

const EmptyChart: React.FC = () => (
  <div className="h-[220px] flex flex-col items-center justify-center text-slate-300">
    <TrendingUp size={32} className="mb-2" />
    <p className="text-sm">No data from API yet</p>
  </div>
)

const ShopSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-8 bg-slate-100 rounded-xl w-48" />
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-3 gap-5">
      <div className="col-span-2 h-72 bg-slate-100 rounded-2xl" />
      <div className="h-72 bg-slate-100 rounded-2xl" />
    </div>
  </div>
)

export default ShopOverview