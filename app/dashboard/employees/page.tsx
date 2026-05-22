import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeTableClient from './EmployeeTableClient'
import { Copy } from 'lucide-react'
import CompanyCodeBanner from './CompanyCodeBanner'

export default async function EmployeesPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get company info for this owner
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, company_code')
    .eq('owner_auth_id', user.id)
    .single()

  if (companyError || !company) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load company information.</p>
      </div>
    )
  }

  // 3. Fetch employees for this company
  const { data: employees, error: employeesError } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (employeesError) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load employees.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Company Code Banner */}
      <CompanyCodeBanner code={company.company_code} />

      {/* Employee Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-900">Manage Employees</h1>
        </div>
        <EmployeeTableClient employees={employees || []} />
      </div>
    </div>
  )
}
