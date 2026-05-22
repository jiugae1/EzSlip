'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        const role = data.user.user_metadata?.role
        if (role === 'owner') {
          router.push('/dashboard')
        } else {
          // If not an owner, they might be an employee trying to use owner login
          router.push('/employee/login')
        }
      }
    } catch (err: any) {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#1e3a5f] text-center">Business Owner Login</h3>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#152943] focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="text-center space-y-2">
        <Link href="/signup" className="block text-sm text-[#1e3a5f] hover:underline">
          Don't have an account? Register your business
        </Link>
        <Link href="/employee/login" className="block text-sm text-[#1e3a5f] hover:underline font-medium">
          Are you an employee? Log in here
        </Link>
      </div>
    </div>
  )
}
