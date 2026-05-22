'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmployeeLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // 1. Query employees table to verify username
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('username')
        .eq('username', username)
        .single()

      if (empError || !employee) {
        throw new Error('Username not found.')
      }

      // 2. Construct internal email and sign in
      const internalEmail = `${username}@payslip.internal`
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: internalEmail,
        password,
      })

      if (authError) throw new Error('Invalid username or password.')

      if (data.user) {
        router.push('/employee/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-[#0e7490]">Employee Login</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-[#0e7490]">
          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0e7490] hover:bg-[#0a5a6f] focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-[#0e7490] hover:underline font-medium">
              Are you a business owner? Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
