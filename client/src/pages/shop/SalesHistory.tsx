// src/pages/shop/SalesHistory.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { Search, Eye, Download, Receipt, TrendingUp } from 'lucide-react'
import { shopApi } from '../../lib/api'
import { Badge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Table } from '../../components/ui/Table'
import { ExportBtn } from '../../components/shared/ExportBtn'
import { formatCurrency, formatDateTime, getProductLabel } from '../../lib/utils'
import type { Sale, PaymentMode } from '../../types'

const PAYMENT_BADGE: Record<PaymentMode, 'green' | 'blue' | 'indigo' | 'amber'> = {
  CASH: 'green', UPI: 'blue', CARD: 'indigo', CREDIT: 'amber',
}

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await shopApi.getSales({
        page,
        limit: LIMIT,
        ...(fromDate ? { from: fromDate } : {}),
        ...(toDate ? { to: toDate } : {}),
        ...(filterPayment ? { paymentMode: filterPayment } : {}),
      })
      const payload = res.data.data ?? res.data
      if (Array.isArray(payload)) {
        setSales(payload)
        setTotal(payload.length)
      } else {
        setSales(payload.data ?? [])
        setTotal(payload.total ?? 0)
      }
    } catch {
      setError('Failed to load sales data.')
    } finally {
      setLoading(false)
    }
  }, [page, fromDate, toDate, filterPayment])

  useEffect(() => { load() }, [load])

  const filtered = sales.filter((s) =>
    !search ||
    s.saleId.toLowerCase().includes(search.toLowerCase()) ||
    (s.customerName ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = filtered.reduce((sum, s) => sum + s.totalAmount, 0)

  const exportCSV = () => {
    const rows = [
      ['Sale ID', 'Date', 'Customer', 'Items', 'Payment', 'Total'],
      ...filtered.map((s) => [
        s.saleId,
        formatDateTime(s.dateTime),
        s.customerName ?? '',
        s.items.length,
        s.paymentMode,
        s.totalAmount,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'sales.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales History</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {total} transactions · {formatCurrency(totalRevenue)} shown
          </p>
        </div>
        <ExportBtn onExportCSV={exportCSV} />
      </div>

      {/* Summary bar */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Transactions', value: filtered.length, icon: <Receipt size={16} className="text-blue-500" /> },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: <TrendingUp size={16} className="text-emerald-500" /> },
            { label: 'Avg Order Value', value: formatCurrency(filtered.length > 0 ? totalRevenue / filtered.length : 0), icon: <Receipt size={16} className="text-amber-500" /> },
            { label: 'Cash Collected', value: formatCurrency(filtered.filter((s) => s.paymentMode === 'CASH').reduce((s, x) => s + x.totalAmount, 0)), icon: <Receipt size={16} className="text-green-500" /> },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
              <div className="bg-slate-50 rounded-lg p-2">{item.icon}</div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{item.label}</p>
                <p className="text-sm font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Sale ID or customer…"
            className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
          className="h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-slate-400 text-sm">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
          className="h-10 px-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1">
          {['', 'CASH', 'UPI', 'CARD', 'CREDIT'].map((m) => (
            <button
              key={m || 'all'}
              onClick={() => { setFilterPayment(m); setPage(1) }}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                filterPayment === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
              ].join(' ')}
            >
              {m || 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      <Table<Sale & Record<string, unknown>>
        data={filtered as (Sale & Record<string, unknown>)[]}
        loading={loading}
    
        emptyMessage="No sales found for the selected filters."
        onRowClick={(row) => setSelectedSale(row as Sale)}
        columns={[
          {
            key: 'saleId',
            header: 'Sale ID',
            render: (row) => (
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                {(row as Sale).saleId}
              </span>
            ),
          },
          {
            key: 'dateTime',
            header: 'Date & Time',
            render: (row) => (
              <span className="text-slate-700 text-sm">{formatDateTime((row as Sale).dateTime)}</span>
            ),
          },
          {
            key: 'customerName',
            header: 'Customer',
            render: (row) => (
              <span className="text-slate-700">{(row as Sale).customerName ?? <span className="text-slate-300">—</span>}</span>
            ),
          },
          {
            key: 'items',
            header: 'Items',
            render: (row) => {
              const s = row as Sale
              return (
                <div className="flex flex-wrap gap-1">
                  {s.items.slice(0, 3).map((item, i) => (
                    <Badge key={i} variant="default">{getProductLabel(item.productId)} ×{item.quantity}</Badge>
                  ))}
                  {s.items.length > 3 && (
                    <Badge variant="slate">+{s.items.length - 3}</Badge>
                  )}
                </div>
              )
            },
          },
          {
            key: 'paymentMode',
            header: 'Payment',
            render: (row) => {
              const mode = (row as Sale).paymentMode
              return <Badge variant={PAYMENT_BADGE[mode]}>{mode}</Badge>
            },
          },
          {
            key: 'totalAmount',
            header: 'Total',
            render: (row) => (
              <span className="font-bold text-slate-900">{formatCurrency((row as Sale).totalAmount)}</span>
            ),
          },
          {
            key: 'view',
            header: '',
            render: (row) => (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedSale(row as Sale) }}
                className="text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                <Eye size={15} />
              </button>
            ),
          },
        ]}
      />

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer hover:bg-slate-50"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * LIMIT >= total}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer hover:bg-slate-50"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      <Modal
        open={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title={`Sale Detail — ${selectedSale?.saleId ?? ''}`}
        size="md"
        footer={
          <button
            onClick={() => setSelectedSale(null)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        }
      >
        {selectedSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-400">Date</span><p className="font-semibold">{formatDateTime(selectedSale.dateTime)}</p></div>
              <div><span className="text-slate-400">Payment</span><p><Badge variant={PAYMENT_BADGE[selectedSale.paymentMode]}>{selectedSale.paymentMode}</Badge></p></div>
              {selectedSale.customerName && (
                <div><span className="text-slate-400">Customer</span><p className="font-semibold">{selectedSale.customerName}</p></div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Items</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Product</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Price</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Disc%</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items.map((item, i) => (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{getProductLabel(item.productId)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.discount}%</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between text-lg font-bold bg-blue-50 rounded-xl px-4 py-3">
              <span className="text-slate-700">Grand Total</span>
              <span className="text-blue-600">{formatCurrency(selectedSale.totalAmount)}</span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <Download size={14} /> Print Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SalesHistory