'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CompanyCodeBanner({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#1e3a5f] rounded-xl p-6 text-white shadow-lg border border-[#2a4d7d]">
      <div className="flex items-start space-x-4">
        <div className="bg-[#2a4d7d] p-2 rounded-lg">
          <span className="text-xl">💡</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold mb-1">Invite Employees</h2>
          <p className="text-blue-100 text-sm mb-4">
            Share your company code with your employees so they can register on their own.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg px-6 py-2">
              <span className="text-2xl font-mono font-bold tracking-[0.5em] text-white">
                {code}
              </span>
            </div>
            <button 
              onClick={handleCopy}
              className="flex items-center space-x-2 bg-white text-[#1e3a5f] px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
