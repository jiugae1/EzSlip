'use client'

import React, { useState, useMemo } from 'react'
import { Landmark, CreditCard, User, History, CheckCircle2, AlertCircle, Eye, X, Printer, Check } from 'lucide-react'
import { updateBankAccount, confirmPayslip } from './actions'
import { PayslipPrintView, PayslipData } from '@/components/PayslipPrintView'
import { PayslipPrintButton } from '@/components/PayslipPrintButton'

interface Employee {
  id: string
  name: string
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
}

interface Company {
  name: string
}

interface Payslip {
  id: string
  period_start: string
  period_end: string
  total_net_salary: number
  is_confirmed: boolean
  confirmed_at: string | null
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
}

const PHILIPPINE_BANKS = [
  { label: '⭐ GCash', value: 'GCash' },
  { label: '⭐ Maya', value: 'Maya' },
  { label: 'BDO (Banco de Oro)', value: 'BDO' },
  { label: 'BPI (Bank of the Philippine Islands)', value: 'BPI' },
  { label: 'Metrobank', value: 'Metrobank' },
  { label: 'PNB (Philippine National Bank)', value: 'PNB' },
  { label: 'Landbank of the Philippines', value: 'Landbank' },
  { label: 'DBP (Development Bank of the Philippines)', value: 'DBP' },
  { label: 'Security Bank', value: 'Security Bank' },
  { label: 'RCBC (Rizal Commercial Banking Corporation)', value: 'RCBC' },
  { label: 'UnionBank of the Philippines', value: 'UnionBank' },
  { label: 'Chinabank (China Banking Corporation)', value: 'Chinabank' },
  { label: 'EastWest Bank', value: 'EastWest Bank' },
  { label: 'PSBank (Philippine Savings Bank)', value: 'PSBank' },
  { label: 'Robinsons Bank', value: 'Robinsons Bank' },
  { label: 'Sterling Bank of Asia', value: 'Sterling Bank' },
  { label: 'PBCOM (Philippine Bank of Communications)', value: 'PBCOM' },
  { label: 'ShopeePay', value: 'ShopeePay' },
  { label: 'Coins.ph', value: 'Coins.ph' },
  { label: 'GrabPay', value: 'GrabPay' },
  { label: 'SeaBank', value: 'SeaBank' },
  { label: 'Tonik Bank', value: 'Tonik Bank' },
  { label: 'GoTyme Bank', value: 'GoTyme Bank' },
  { label: 'Overseas Filipino Bank (OFBank)', value: 'OFBank' },
  { label: 'CARD Bank', value: 'CARD Bank' },
  { label: '1st Valley Bank', value: '1st Valley Bank' },
  { label: 'Dungganon Bank', value: 'Dungganon Bank' },
  { label: 'Other', value: 'Other' },
]

export default function EmployeeDashboardClient({ 
  employee, 
  company, 
  payslips 
}: { 
  employee: Employee, 
  company: Company, 
  payslips: Payslip[] 
}) {
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [bankName, setBankName] = useState(employee.bank_name || '')
  const [otherBank, setOtherBank] = useState('')
  const [accountNumber, setAccountNumber] = useState(employee.account_number || '')
  const [accountHolder, setAccountHolder] = useState(employee.account_holder || employee.name)
  const [loading, setLoading] = useState(false)

  const [previewingPayslip, setPreviewingPayslip] = useState<Payslip | null>(null)
  const [confirmingLoading, setConfirmingLoading] = useState(false)
  const [filterMonth, setFilterMonth] = useState('all')

  const uniqueMonths = useMemo(() => {
    const months = payslips.map(p => {
      const date = new Date(p.period_start)
      return {
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        value: `${date.getFullYear()}-${date.getMonth()}`
      }
    })
    // Unique by value
    return Array.from(new Map(months.map(m => [m.value, m])).values())
  }, [payslips])

  const filteredPayslips = useMemo(() => {
    if (filterMonth === 'all') return payslips
    return payslips.filter(p => {
      const date = new Date(p.period_start)
      return `${date.getFullYear()}-${date.getMonth()}` === filterMonth
    })
  }, [payslips, filterMonth])

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const finalBankName = bankName === 'Other' ? otherBank : bankName
      await updateBankAccount(employee.id, finalBankName, accountNumber, accountHolder)
      setIsBankModalOpen(false)
      alert('Bank account saved successfully!')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: string) => {
    setConfirmingLoading(true)
    try {
      await confirmPayslip(id)
      setPreviewingPayslip(prev => prev ? { ...prev, is_confirmed: true, confirmed_at: new Date().toISOString() } : null)
    } catch (err: any) {
      alert('Error confirming: ' + err.message)
    } finally {
      setConfirmingLoading(false)
    }
  }

  const stats = {
    thisMonth: payslips.filter(p => new Date(p.period_start).getMonth() === new Date().getMonth()).length,
    total: payslips.length,
    unconfirmed: payslips.filter(p => !p.is_confirmed).length
  }

  const getPrintData = (p: Payslip): PayslipData => ({
    businessName: company.name,
    periodStart: p.period_start,
    periodEnd: p.period_end,
    employeeName: employee.name,
    daysWorked: p.days_worked,
    dailyRate: p.daily_rate,
    totalBasicSalary: p.total_basic_salary,
    shimeiPoints: p.shimei_points,
    shimeiBackRate: p.shimei_back_rate,
    shimeiTotalBack: p.shimei_total_back,
    ldCount: p.ld_count,
    ldRate: p.ld_rate,
    totalLdBack: p.total_ld_back,
    dohanBack: p.dohan_back,
    totalBack: p.total_back,
    deductionHm: p.deduction_hm,
    deductionPenalty: p.deduction_penalty,
    deductionApartment: p.deduction_apartment,
    totalNetSalary: p.total_net_salary
  })

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-[#0e7490] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {employee.name}! 👋</h1>
          <p className="text-cyan-100 flex items-center">
            <Landmark size={18} className="mr-2" />
            Member of {company.name}
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <User size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">This Month</p>
              <p className="text-2xl font-black text-[#0e7490]">{stats.thisMonth}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-black text-[#0e7490]">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unconfirmed</p>
              <p className="text-2xl font-black text-amber-500">{stats.unconfirmed}</p>
            </div>
          </div>

          {/* My Payslips */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <History className="mr-2 text-[#0e7490]" size={20} />
                My Payslips
              </h2>
              <div className="w-full md:w-48">
                <select 
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#0e7490] outline-none"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option value="all">All Months</option>
                  {uniqueMonths.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredPayslips.length === 0 ? (
                <div className="bg-gray-50 border border-dashed rounded-xl p-8 text-center text-gray-500">
                  {filterMonth === 'all' ? 'No payslips found yet.' : 'No payslips found for this month.'}
                </div>
              ) : (
                filteredPayslips.map(p => (
                  <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Period</p>
                      <p className="font-bold text-gray-900">
                        {new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(p.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Net Salary</p>
                      <p className="text-xl font-black text-[#0e7490]">₱{p.total_net_salary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {p.is_confirmed ? (
                        <span className="text-xs font-bold text-green-600 flex items-center bg-green-50 px-3 py-1 rounded-full">
                          <CheckCircle2 size={14} className="mr-1" /> Confirmed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-500 flex items-center bg-amber-50 px-3 py-1 rounded-full">
                          <AlertCircle size={14} className="mr-1" /> Pending
                        </span>
                      )}
                      <button 
                        onClick={() => setPreviewingPayslip(p)}
                        className="bg-[#0e7490] hover:bg-[#0a5a6f] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors"
                      >
                        <Eye size={16} className="mr-2" /> View Payslip
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Bank Account Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center border-b pb-4">
              <CreditCard className="mr-2 text-[#0e7490]" size={20} />
              Bank Account
            </h3>
            
            {employee.bank_name ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Bank / E-Wallet</p>
                  <p className="font-bold text-[#0e7490]">{employee.bank_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Account Number</p>
                  <p className="font-mono text-gray-700">{employee.account_number}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Account Name</p>
                  <p className="font-bold text-gray-700">{employee.account_holder}</p>
                </div>
                <button 
                  onClick={() => setIsBankModalOpen(true)}
                  className="w-full mt-4 py-3 border border-[#0e7490] text-[#0e7490] font-bold rounded-xl hover:bg-cyan-50 transition-colors"
                >
                  Edit Bank Details
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl text-amber-700 text-sm">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No bank account yet. Please add your account for salary transfers.</p>
                </div>
                <button 
                  onClick={() => setIsBankModalOpen(true)}
                  className="w-full py-3 bg-[#0e7490] text-white font-bold rounded-xl hover:bg-[#0a5a6f] shadow-lg shadow-cyan-100 transition-all"
                >
                  Add Bank Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button onClick={() => setIsBankModalOpen(false)} className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-6 text-[#0e7490]">Salary Transfer Details</h3>
            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bank / E-Wallet</label>
                <select 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#0e7490] outline-none"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                >
                  <option value="">-- Select Bank --</option>
                  {PHILIPPINE_BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              {bankName === 'Other' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specify Bank Name</label>
                  <input 
                    type="text" 
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#0e7490] outline-none"
                    value={otherBank}
                    onChange={(e) => setOtherBank(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#0e7490] outline-none"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Account Holder Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#0e7490] outline-none"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[#0e7490] text-white font-bold rounded-xl hover:bg-[#0a5a6f] shadow-lg shadow-cyan-100 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Bank Details'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {previewingPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setPreviewingPayslip(null)} className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X size={24} />
            </button>
            <div className="p-8">
              <PayslipPrintView data={getPrintData(previewingPayslip)} />
              <div className="mt-8 space-y-4">
                <PayslipPrintButton data={getPrintData(previewingPayslip)} />
                
                {!previewingPayslip.is_confirmed ? (
                  <button 
                    onClick={() => handleConfirm(previewingPayslip.id)}
                    disabled={confirmingLoading}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                  >
                    {confirmingLoading ? 'Confirming...' : 'I have received and confirmed this payslip'}
                  </button>
                ) : (
                  <div className="w-full py-4 bg-gray-100 text-green-700 font-bold rounded-xl flex items-center justify-center border-2 border-green-200">
                    <Check size={20} className="mr-2" />
                    Confirmed on {new Date(previewingPayslip.confirmed_at!).toLocaleString()}
                  </div>
                )}
                
                <button onClick={() => setPreviewingPayslip(null)} className="w-full py-2 text-gray-500 font-medium hover:underline">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
