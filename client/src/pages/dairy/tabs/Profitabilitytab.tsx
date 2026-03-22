// client/src/pages/dairy/tabs/ProfitabilityTab.tsx

import { useEffect, useState } from 'react'
import { IndianRupee, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useProfitability } from '../../../hooks/useDairyData'
import StatCard from '../../../components/ui/StatCard'
import { formatCurrency } from '../../../lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

interface Props { animalId: string }

const PERIODS = [
  { value: 'current_month', label: 'This Month' },
  { value: 'last_month',    label: 'Last Month' },
  { value: 'current_year',  label: 'This Year' },
]

export function ProfitabilityTab({ animalId }: Props) {
  const { data, loading, fetch } = useProfitability(animalId)
  const [period, setPeriod] = useState('current_month')

  useEffect(() => { fetch({ period }) }, [fetch, period])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
        <Loader2 size={18} className="animate-spin" /> Loading profitability…
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-3xl mb-2">📊</p>
        <p>No profitability data available.</p>
      </div>
    )
  }

  const isProfit = data.netProfit >= 0

  const chartData = [
    { name: 'Milk Income', value: data.milkIncome,          fill: '#3b82f6' },
    { name: 'Feed Cost',   value: data.feedCost,            fill: '#ef4444' },
    { name: 'Medical',     value: data.medicalCost,         fill: '#f59e0b' },
    { name: 'Other',       value: data.otherCost ?? 0,      fill: '#8b5cf6' },
    { name: 'Net Profit',  value: Math.abs(data.netProfit), fill: isProfit ? '#10b981' : '#ef4444' },
  ]

  return (
    <div className="space-y-5">

      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-slate-500">Period:</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="h-8 px-3 rounded-lg border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* KPIs — using correct StatCard props: label + accentColor */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Milk Income"
          value={formatCurrency(data.milkIncome)}
          icon={<IndianRupee size={16} />}
          accentColor="#3b82f6"
        />
        <StatCard
          label="Feed Cost"
          value={formatCurrency(data.feedCost)}
          icon={<IndianRupee size={16} />}
          accentColor="#ef4444"
        />
        <StatCard
          label="Medical Cost"
          value={formatCurrency(data.medicalCost)}
          icon={<IndianRupee size={16} />}
          accentColor="#f59e0b"
        />
        <StatCard
          label="Net Profit"
          value={formatCurrency(data.netProfit)}
          icon={isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          accentColor={isProfit ? '#10b981' : '#ef4444'}
        />
      </div>

      {/* ROI badge */}
      {data.roi != null && (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
          isProfit ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          ROI: {data.roi.toFixed(1)}%
          <span className="font-normal text-xs">(return on investment this period)</span>
        </div>
      )}

      {/* Bar chart */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Income vs Cost Breakdown
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown table */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Detailed Breakdown
        </p>
        <div className="space-y-2.5">
          {[
            { label: 'Milk Income',  value:  data.milkIncome,        positive: true  },
            { label: 'Feed Cost',    value: -data.feedCost,          positive: false },
            { label: 'Medical Cost', value: -data.medicalCost,       positive: false },
            { label: 'Other Costs',  value: -(data.otherCost ?? 0),  positive: false },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{row.label}</span>
              <span className={`font-semibold ${row.positive ? 'text-blue-700' : 'text-red-600'}`}>
                {row.positive ? '+' : ''}{formatCurrency(row.value)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Net Profit</span>
            <span className={`font-bold text-base ${isProfit ? 'text-green-700' : 'text-red-600'}`}>
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}