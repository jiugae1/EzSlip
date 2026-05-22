'use client'

import React, { forwardRef } from 'react'

export interface PayslipData {
  businessName: string
  periodStart: string
  periodEnd: string
  employeeName: string
  daysWorked: number
  dailyRate: number
  totalBasicSalary: number
  shimeiPoints: number
  shimeiBackRate: number
  shimeiTotalBack: number
  ldCount: number
  ldRate: number
  totalLdBack: number
  dohanBack: number
  totalBack: number
  deductionHm: number
  deductionPenalty: number
  deductionApartment: number
  totalNetSalary: number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

export const PayslipPrintView = forwardRef<HTMLDivElement, { data: PayslipData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="print-area bg-white p-8 max-w-md mx-auto shadow-lg border border-gray-200">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; border: none; shadow: none; }
          @page { size: A6; margin: 5mm; }
        }
      `}} />
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">{data.businessName}</h1>
        <p className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wider">Payslip Report</p>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-y-2 text-sm border-y-2 border-black py-4 mb-4">
        <div className="font-bold uppercase">Employee:</div>
        <div className="text-right font-medium">{data.employeeName}</div>
        <div className="font-bold uppercase">Period:</div>
        <div className="text-right text-xs">{data.periodStart} ~ {data.periodEnd}</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-1.5 text-sm mb-6">
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="font-semibold">Days Worked ({data.daysWorked})</span>
          <span>{formatCurrency(data.totalBasicSalary)}</span>
        </div>
        
        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="font-semibold">Shimei Points ({data.shimeiPoints} x {formatCurrency(data.shimeiBackRate)})</span>
          <span>{formatCurrency(data.shimeiTotalBack)}</span>
        </div>

        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="font-semibold">LD Count ({data.ldCount} x {formatCurrency(data.ldRate)})</span>
          <span>{formatCurrency(data.totalLdBack)}</span>
        </div>

        <div className="flex justify-between border-b border-gray-100 pb-1">
          <span className="font-semibold">Dohan Back</span>
          <span>{formatCurrency(data.dohanBack)}</span>
        </div>

        <div className="flex justify-between bg-gray-50 p-1 font-bold">
          <span>TOTAL BACK</span>
          <span>{formatCurrency(data.totalBack)}</span>
        </div>

        {/* Deductions */}
        <div className="pt-2 text-red-600 space-y-1.5">
          <div className="flex justify-between border-b border-red-50 pb-1 italic">
            <span>Deduction (HM)</span>
            <span>- {formatCurrency(data.deductionHm)}</span>
          </div>
          <div className="flex justify-between border-b border-red-50 pb-1 italic">
            <span>Deduction (Penalty)</span>
            <span>- {formatCurrency(data.deductionPenalty)}</span>
          </div>
          <div className="flex justify-between border-b border-red-50 pb-1 italic">
            <span>Deduction (Apartment)</span>
            <span>- {formatCurrency(data.deductionApartment)}</span>
          </div>
        </div>
      </div>

      {/* Final Total */}
      <div className="bg-black text-white p-4 text-center rounded-sm mb-8">
        <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Total Net Salary</p>
        <p className="text-3xl font-black">{formatCurrency(data.totalNetSalary)}</p>
      </div>

      {/* Footer / Signature */}
      <div className="flex justify-between text-[10px] font-bold uppercase pt-4 border-t border-dashed border-gray-300">
        <div>
          <p className="mb-8">Prepared by:</p>
          <div className="border-t border-black w-24"></div>
        </div>
        <div className="text-right">
          <p className="mb-8">Employee:</p>
          <div className="border-t border-black w-24 ml-auto"></div>
        </div>
      </div>
    </div>
  )
})

PayslipPrintView.displayName = 'PayslipPrintView'
