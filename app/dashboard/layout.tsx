export const runtime = 'edge'

import React from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react'
import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: company } = await supabase
    .from('companies')
    .select('name, company_code')
    .eq('owner_auth_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e3a5f] text-white flex flex-col fixed h-full shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-black tracking-tight flex items-center">
            EzSlip
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-blue-300 font-bold mt-1">
            Owner Portal
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/employees" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
            <Users size={20} />
            <span className="font-medium">Employees</span>
          </Link>
          <Link href="/dashboard/payslips" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
            <FileText size={20} />
            <span className="font-medium">Payslips</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-[10px] text-blue-300 font-bold uppercase mb-1">Company Code</p>
            <p className="text-lg font-mono font-bold">{company?.company_code}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-200 transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company?.name}</h1>
            <p className="text-sm text-gray-500">Welcome back to your dashboard.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-sm font-bold text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  )
}
