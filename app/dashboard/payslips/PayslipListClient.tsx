'use client'

import React, { useState, useMemo } from 'react'
import { PayslipPrintView, PayslipData } from '@/components/PayslipPrintView'
import { PayslipPrintButton } from '@/components/PayslipPrintButton'
import { updatePayslipStatus, deletePayslip } from './actions'
import { X, Eye, Printer, Trash2, Undo, CheckCircle, Clock } from 'lucide-react'

interface Payslip {
  id: string
  employee_id: string
  period_start: string
  period_end: string
  days_worked: number
  daily_rate: number
  total_basic_salary: number
  shimei_points: number
  shimei_back_rate: number
  shimei_total_back: number
  ld_count: number
  ld_rate: number
  total_ld_back: number
  dohan_back: number
  total_back: number
  deduction_hm: number
  deduction_penalty: number
  deduction_apartment: number
  total_net_salary: number
  status: 'draft' | 'published' | 'confirmed'
  is_confirmed: boolean
  confirmed_at: string | null
  employees: {
    name: string
  }
}

export default function PayslipListClient({ 
  payslips, 
  businessName,
  employees 
}: { 
  payslips: Payslip[], 
  businessName: string,
  employees: { id: string, name: string }[]
}) {
  const [filterEmployee, setFilterEmployee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewingPayslip, setPreviewingPayslip] = useState<Payslip | null>(null)

  const filteredPayslips = useMemo(() => {
    return payslips.filter(p => {
      const matchEmployee = filterEmployee === 'all' || p.employee_id === filterEmployee
      const matchStatus = filterStatus === 'all' || p.status === filterStatus
      return matchEmployee && matchStatus
    })
  }, [payslips, filterEmployee, filterStatus])

  const handleStatusChange = async (id: string, status: 'draft' | 'published') => {
    try {
      await updatePayslipStatus(id, status)
    } catch (err: any) {
      alert('Error updating status: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft payslip?')) return
    try {
      await deletePayslip(id)
    } catch (err: any) {
      alert('Error deleting payslip: ' + err.message)
    }
  }

  const getPrintData = (p: Payslip): PayslipData => ({
    businessName,
    periodStart: p.period_start,
    periodEnd: p.period_end,
    employeeName: p.employees.name,
    daysWorked: Number(p.days_worked),
    dailyRate: Number(p.daily_rate),
    totalBasicSalary: Number(p.total_basic_salary),
    shimeiPoints: Number(p.shimei_points),
    shimeiBackRate: Number(p.shimei_back_rate),
    shimeiTotalBack: Number(p.shimei_total_back),
    ldCount: Number(p.ld_count),
    ldRate: Number(p.ld_rate),
    totalLdBack: Number(p.total_ld_back),
    dohanBack: Number(p.dohan_back),
    totalBack: Number(p.total_back),
    deductionHm: Number(p.deduction_hm),
    deductionPenalty: Number(p.deduction_penalty),
    deductionApartment: Number(p.deduction_apartment),
    totalNetSalary: Number(p.total_net_salary)
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Employee</label>
          <select 
            className="w-full border rounded-lg p-2 text-sm"
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select 
            className="w-full border rounded-lg p-2 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Net Salary</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Confirmed</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayslips.map((p) => (
              <tr key={p.id} className={`${p.status !== 'confirmed' && !p.is_confirmed ? 'bg-amber-50/30' : ''} hover:bg-gray-50`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.employees.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(p.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#1e3a5f]">
                  ₱{Number(p.total_net_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.status === 'draft' && <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 uppercase">Draft</span>}
                  {p.status === 'published' && <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-blue-100 text-blue-600 uppercase">Published</span>}
                  {p.status === 'confirmed' && <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-600 uppercase">Confirmed</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.is_confirmed ? (
                    <div className="flex items-center text-green-600 text-xs font-bold">
                      <CheckCircle size={14} className="mr-1" />
                      <span>{new Date(p.confirmed_at!).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 text-xs font-bold">
                      <Clock size={14} className="mr-1" />
                      <span>Pending</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button onClick={() => setPreviewingPayslip(p)} className="p-2 text-gray-500 hover:text-[#1e3a5f]" title="Preview">
                    <Eye size={18} />
                  </button>
                  {p.status === 'draft' && (
                    <>
                      <button onClick={() => handleStatusChange(p.id, 'published')} className="text-xs font-bold text-blue-600 hover:underline">Publish</button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  {p.status === 'published' && !p.is_confirmed && (
                    <button onClick={() => handleStatusChange(p.id, 'draft')} className="p-2 text-amber-500 hover:text-amber-700" title="Unpublish">
                      <Undo size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview Modal */}
      {previewingPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setPreviewingPayslip(null)} className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X size={24} />
            </button>
            <div className="p-8">
              <PayslipPrintView data={getPrintData(previewingPayslip)} />
              <div className="mt-6 flex gap-4">
                <div className="flex-1">
                  <PayslipPrintButton data={getPrintData(previewingPayslip)} />
                </div>
                <button onClick={() => setPreviewingPayslip(null)} className="px-6 py-2 border rounded-lg font-bold">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
