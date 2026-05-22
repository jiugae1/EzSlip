import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PayslipListClient from './PayslipListClient'
import { Plus } from 'lucide-react'

export default async function PayslipsPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get company info
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
    .eq('owner_auth_id', user.id)
    .single()

  if (companyError || !company) {
    return <div className="p-6 text-red-600">Failed to load company information.</div>
  }

  // 3. Fetch all payslips for this company
  const { data: payslips, error: payslipsError } = await supabase
    .from('payslips')
    .select(`
      *,
      employees (
        name
      )
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (payslipsError) {
    return <div className="p-6 text-red-600">Failed to load payslips.</div>
  }

  // 4. Fetch employees for filters
  const { data: employees } = await supabase
    .from('employees')
    .select('id, name')
    .eq('company_id', company.id)
    .order('name', { ascending: true })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslip Management</h1>
          <p className="text-sm text-gray-500">Create, publish, and track employee payslips.</p>
        </div>
        <Link 
          href="/dashboard/payslips/new"
          className="flex items-center space-x-2 bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#152943] transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          <span>New Payslip</span>
        </Link>
      </div>

      <PayslipListClient 
        payslips={payslips || []} 
        businessName={company.name}
        employees={employees || []}
      />
    </div>
  )
}
