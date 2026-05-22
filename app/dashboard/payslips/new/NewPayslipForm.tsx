'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createPayslip } from '../actions'
import { PayslipPrintView, PayslipData } from '@/components/PayslipPrintView'
import { PayslipPrintButton } from '@/components/PayslipPrintButton'
import { X, Copy, Eye, Landmark, AlertCircle } from 'lucide-react'

interface Employee {
  id: string
  name: string
  daily_rate: number
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
}

export default function NewPayslipForm({ 
  employees, 
  companyId, 
  businessName 
}: { 
  employees: Employee[], 
  companyId: string,
  businessName: string
}) {
  const router = useRouter()
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  
  // Form Fields
  const [daysWorked, setDaysWorked] = useState(0)
  const [dailyRate, setDailyRate] = useState(0)
  const [shimeiPoints, setShimeiPoints] = useState(0)
  const [shimeiBackRate, setShimeiBackRate] = useState(0)
  const [ldCount, setLdCount] = useState(0)
  const [ldRate, setLdRate] = useState(0)
  const [dohanBack, setDohanBack] = useState(0)
  const [deductionHm, setDeductionHm] = useState(0)
  const [deductionPenalty, setDeductionPenalty] = useState(0)
  const [deductionApartment, setDeductionApartment] = useState(0)

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === selectedEmployeeId), 
    [selectedEmployeeId, employees]
  )

  const handleEmployeeChange = (id: string) => {
    setSelectedEmployeeId(id)
    const emp = employees.find(e => e.id === id)
    if (emp) {
      setDailyRate(emp.daily_rate)
    }
  }

  // Calculations
  const totalBasicSalary = daysWorked * dailyRate
  const shimeiTotalBack = shimeiPoints * shimeiBackRate
  const totalLdBack = ldCount * ldRate
  const totalBack = shimeiTotalBack + totalLdBack + dohanBack
  const totalNetSalary = totalBasicSalary + totalBack - deductionHm - deductionPenalty - deductionApartment

  const getFormData = (status: 'draft' | 'published') => ({
    employee_id: selectedEmployeeId,
    company_id: companyId,
    period_start: periodStart,
    period_end: periodEnd,
    days_worked: daysWorked,
    daily_rate: dailyRate,
    shimei_points: shimeiPoints,
    shimei_back_rate: shimeiBackRate,
    ld_count: ldCount,
    ld_rate: ldRate,
    dohan_back: dohanBack,
    deduction_hm: deductionHm,
    deduction_penalty: deductionPenalty,
    deduction_apartment: deductionApartment,
    status,
  })

  const handleSave = async (status: 'draft' | 'published') => {
    if (!selectedEmployeeId || !periodStart || !periodEnd) {
      alert('Please fill in required fields (Employee, Period)')
      return
    }

    if (status === 'published' && !confirm('Once published, your employee can view this payslip in their portal. Proceed?')) {
      return
    }

    setLoading(true)
    try {
      await createPayslip(getFormData(status))
      router.push('/dashboard/payslips')
    } catch (err: any) {
      alert('Error saving payslip: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const printData: PayslipData = {
    businessName,
    periodStart,
    periodEnd,
    employeeName: selectedEmployee?.name || '',
    daysWorked,
    dailyRate,
    totalBasicSalary,
    shimeiPoints,
    shimeiBackRate,
    shimeiTotalBack,
    ldCount,
    ldRate,
    totalLdBack,
    dohanBack,
    totalBack,
    deductionHm,
    deductionPenalty,
    deductionApartment,
    totalNetSalary
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-8 border-b pb-4">Create New Payslip</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Employee Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Employee</label>
              <select 
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                value={selectedEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
              >
                <option value="">-- Choose Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            {selectedEmployee && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                {selectedEmployee.bank_name ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-[#1e3a5f] font-bold text-sm">
                      <Landmark size={16} className="mr-2" />
                      <span>Salary Transfer Account</span>
                    </div>
                    <div className="text-sm text-gray-700 flex justify-between items-center">
                      <span>{selectedEmployee.bank_name} {selectedEmployee.account_number} ({selectedEmployee.account_holder})</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEmployee.account_number || '')
                          alert('Copied!')
                        }}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start text-amber-700">
                    <AlertCircle size={18} className="mr-2 mt-0.5" />
                    <p className="text-xs">
                      No bank account registered for this employee.<br/>
                      Please ask them to update their profile.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Period Start</label>
              <input 
                type="date"
                className="w-full border rounded-lg p-3"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Period End</label>
              <input 
                type="date"
                className="w-full border rounded-lg p-3"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Work Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">Work Info</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Days of Work</label>
              <input 
                type="number"
                className="w-full border rounded-lg p-2"
                value={daysWorked}
                onChange={(e) => setDaysWorked(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Daily Rate</label>
              <input 
                type="number"
                className="w-full border rounded-lg p-2"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Basic Salary</label>
              <input 
                type="text"
                readOnly
                className="w-full bg-gray-50 border rounded-lg p-2 font-bold"
                value={`₱${totalBasicSalary.toLocaleString()}`}
              />
            </div>
          </div>

          {/* Back Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider border-b pb-2">Back / Incentives</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 text-center">Shimei Pts</label>
                <input type="number" className="w-full border rounded-lg p-2 text-center" value={shimeiPoints} onChange={(e) => setShimeiPoints(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 text-center">Back Rate</label>
                <input type="number" className="w-full border rounded-lg p-2 text-center" value={shimeiBackRate} onChange={(e) => setShimeiBackRate(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 text-center">LD Count</label>
                <input type="number" className="w-full border rounded-lg p-2 text-center" value={ldCount} onChange={(e) => setLdCount(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 text-center">LD Rate</label>
                <input type="number" className="w-full border rounded-lg p-2 text-center" value={ldRate} onChange={(e) => setLdRate(Number(e.target.value))} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dohan Back</label>
              <input type="number" className="w-full border rounded-lg p-2" value={dohanBack} onChange={(e) => setDohanBack(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Total Back</label>
              <input readOnly className="w-full bg-gray-50 border rounded-lg p-2 font-bold" value={`₱${totalBack.toLocaleString()}`} />
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4 text-red-700">
            <h3 className="font-bold uppercase text-xs tracking-wider border-b border-red-100 pb-2">Deductions</h3>
            <div>
              <label className="block text-xs mb-1">Deduction: HM</label>
              <input type="number" className="w-full border-red-100 border rounded-lg p-2" value={deductionHm} onChange={(e) => setDeductionHm(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs mb-1">Penalty</label>
              <input type="number" className="w-full border-red-100 border rounded-lg p-2" value={deductionPenalty} onChange={(e) => setDeductionPenalty(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs mb-1">Apartment</label>
              <input type="number" className="w-full border-red-100 border rounded-lg p-2" value={deductionApartment} onChange={(e) => setDeductionApartment(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Total Display */}
        <div className="mt-12 bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center text-white border-4 border-green-500/30">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Total Net Salary</p>
          <h2 className="text-4xl font-black text-green-400">₱{totalNetSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-all disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 py-4 bg-[#1e3a5f] hover:bg-[#152943] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all"
          >
            <Eye size={20} />
            <span>Preview</span>
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={loading}
            className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Payslip'}
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
              <X size={24} />
            </button>
            <div className="p-8">
              <h3 className="text-xl font-bold mb-6 text-[#1e3a5f]">Payslip Preview</h3>
              <div className="border rounded-xl overflow-hidden mb-6">
                <PayslipPrintView data={printData} />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <PayslipPrintButton data={printData} />
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-6 py-2 border rounded-lg font-bold hover:bg-gray-50"
                >
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
