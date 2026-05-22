'use client'

import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { PayslipPrintView, PayslipData } from './PayslipPrintView'
import { Printer } from 'lucide-react'

export const PayslipPrintButton = ({ data }: { data: PayslipData }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Payslip_${data.employeeName}_${data.periodEnd}`,
  })

  return (
    <>
      <div style={{ display: 'none' }}>
        <PayslipPrintView ref={contentRef} data={data} />
      </div>
      <button
        onClick={() => handlePrint()}
        className="flex items-center space-x-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-md hover:bg-[#152943] transition-colors shadow-sm"
      >
        <Printer size={18} />
        <span className="font-bold">Print Payslip</span>
      </button>
    </>
  )
}
