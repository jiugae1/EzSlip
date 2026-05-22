'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ companyCode: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'owner',
            name: ownerName,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('This email is already registered.')
        }
        throw authError
      }

      if (authData.user) {
        // 2. Insert into companies
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: businessName,
            owner_email: email,
            owner_auth_id: authData.user.id,
          })
          .select('company_code')
          .single()

        if (companyError) throw companyError

        setSuccessData({ companyCode: companyData.company_code })
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.companyCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (successData) {
    return (
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-green-600">🎉 Registration Successful!</h2>
        <p className="text-gray-600">Your Company Code</p>
        <div className="border-2 border-dashed border-[#1e3a5f] p-4 rounded-lg bg-gray-50">
          <span className="text-3xl font-mono tracking-widest font-bold text-[#1e3a5f]">
            {successData.companyCode}
          </span>
        </div>
        <button
          onClick={copyToClipboard}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#152943] focus:outline-none"
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <p className="text-sm text-gray-500">
          Share this code with your employees so they can register.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex justify-center py-2 px-4 border border-[#1e3a5f] rounded-md shadow-sm text-sm font-medium text-[#1e3a5f] hover:bg-gray-50 focus:outline-none"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#1e3a5f] text-center">Register Your Business</h3>
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded border border-red-200">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Owner's Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>
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
            minLength={8}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#152943] focus:outline-none disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="text-center text-sm">
        <Link href="/login" className="text-[#1e3a5f] hover:underline font-medium">
          Already have an account? Log in
        </Link>
      </div>
    </div>
  )
}
