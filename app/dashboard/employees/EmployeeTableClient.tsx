'use client'

import React, { useState } from 'react'
import { Pencil, Trash2, Eye, X, Check, Copy } from 'lucide-react'
import { updateDailyRate, deleteEmployee } from './actions'

interface Employee {
  id: string
  name: string
  username: string
  daily_rate: number
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
  auth_user_id: string | null
  created_at: string
}

export default function EmployeeTableClient({ employees }: { employees: Employee[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRate, setEditRate] = useState<string>('')
  const [viewingBank, setViewingBank] = useState<Employee | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id)
    setEditRate(employee.daily_rate.toString())
  }

  const handleSaveRate = async (id: string) => {
    try {
      await updateDailyRate(id, parseFloat(editRate))
      setEditingId(null)
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    try {
      await deleteEmployee(id)
    } catch (err: any) {
      if (err.message === 'HAS_PAYSLIPS') {
        alert('Cannot delete employee with existing payslips.')
      } else {
        alert('Failed to delete: ' + err.message)
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Registered</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingId === emp.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="w-20 border rounded px-1 py-0.5"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                    />
                    <button onClick={() => handleSaveRate(emp.id)} className="text-green-600 hover:text-green-800">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>₱{emp.daily_rate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => handleEdit(emp)} className="text-gray-400 hover:text-[#1e3a5f]">
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {emp.bank_name ? (
                  <div className="flex items-center space-x-2">
                    <span>{emp.bank_name} ****{emp.account_number?.slice(-4)}</span>
                    <button onClick={() => setViewingBank(emp)} className="text-[#1e3a5f] hover:underline font-medium">
                      View
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">⚠️ Not registered</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {emp.auth_user_id ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    ✅ Active
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    ⬜ Pending
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bank Account Modal */}
      {viewingBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#1e3a5f]">Bank Account Details</h3>
              <button onClick={() => setViewingBank(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Employee Name</p>
                <p className="font-medium">{viewingBank.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Bank / E-Wallet</p>
                <p className="font-medium">{viewingBank.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Account Number</p>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                  <p className="font-mono">{viewingBank.account_number}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(viewingBank.account_number || '')
                      alert('Copied!')
                    }}
                    className="text-gray-500 hover:text-[#1e3a5f]"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Account Name</p>
                <p className="font-medium">{viewingBank.account_holder}</p>
              </div>
              <button
                onClick={() => setViewingBank(null)}
                className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
