'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EmployeeSignupPage() {
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [companyStatus, setCompanyStatus] = useState<{ type: 'success' | 'error', message: string, id?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const validateUsername = async () => {
    if (!username) return
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setUsernameStatus({ type: 'error', message: '❌ Alphanumeric only' })
      return
    }

    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('username', username)
      .single()

    if (error && error.code === 'PGRST116') {
      setUsernameStatus({ type: 'success', message: '✅ Username available' })
    } else {
      setUsernameStatus({ type: 'error', message: '❌ Username already taken' })
    }
  }

  const validateCompanyCode = async () => {
    if (!companyCode) return
    const code = companyCode.toUpperCase()

    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('company_code', code)
      .single()

    if (data) {
      setCompanyStatus({ 
        type: 'success', 
        message: `✅ You will be registered under ${data.name}`,
        id: data.id 
      })
    } else {
      setCompanyStatus({ 
        type: 'error', 
        message: '❌ Invalid company code. Please check with your employer.' 
      })
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (!companyStatus?.id) {
      setError('Invalid company code.')
      setLoading(false)
      return
    }

    try {
      const internalEmail = `${username}@payslip.internal`
      
      // 1. Sign up via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password,
        options: {
          data: {
            role: 'employee',
            name: fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Insert into employees
        const { error: dbError } = await supabase
          .from('employees')
          .insert({
            company_id: companyStatus.id,
            name: fullName,
            username: username,
            auth_user_id: authData.user.id,
          })

        if (dbError) throw new Error('Registration failed. Please try again.')

        router.push('/employee/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = 
    usernameStatus?.type === 'success' &&
    password.length >= 8 &&
    password === confirmPassword &&
    fullName !== '' &&
    companyStatus?.type === 'success'

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-[#0e7490]">Employee Registration</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-[#0e7490]">
          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>}
          
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={validateUsername}
              />
              {usernameStatus && (
                <p className={`mt-1 text-xs ${usernameStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {usernameStatus.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password (min 8 characters)</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">❌ Passwords do not match</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company Code</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 uppercase focus:ring-[#0e7490] focus:border-[#0e7490]"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                onBlur={validateCompanyCode}
              />
              {companyStatus && (
                <p className={`mt-1 text-xs ${companyStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {companyStatus.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0e7490] hover:bg-[#0a5a6f] focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/employee/login" className="text-sm text-[#0e7490] hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
