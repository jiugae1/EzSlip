export const runtime = 'edge'

import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmployeeDashboardClient from './EmployeeDashboardClient'

export default async function EmployeeDashboardPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/employee/login')

  // 2. Fetch employee data
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (employeeError || !employee) {
    return <div className="p-6 text-red-600">Failed to load employee profile.</div>
  }

  // 3. Fetch company data
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name')
    .eq('id', employee.company_id)
    .single()

  if (companyError || !company) {
    return <div className="p-6 text-red-600">Failed to load company information.</div>
  }

  // 4. Fetch published payslips for this employee
  const { data: payslips, error: payslipsError } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('status', 'published') // Only show published ones
    .order('period_start', { ascending: false })

  // Also include already confirmed ones
  const { data: confirmedPayslips } = await supabase
    .from('payslips')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('status', 'confirmed')
    .order('period_start', { ascending: false })

  const allVisiblePayslips = [...(payslips || []), ...(confirmedPayslips || [])].sort(
    (a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
  )

  return (
    <EmployeeDashboardClient 
      employee={employee} 
      company={company} 
      payslips={allVisiblePayslips} 
    />
  )
}
