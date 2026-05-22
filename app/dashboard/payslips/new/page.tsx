import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewPayslipForm from './NewPayslipForm'

export default async function NewPayslipPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get company info for this owner
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name')
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
    .select('id, name, daily_rate, bank_name, account_number, account_holder')
    .eq('company_id', company.id)
    .order('name', { ascending: true })

  if (employeesError) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load employees.</p>
      </div>
    )
  }

  return (
    <NewPayslipForm 
      employees={employees || []} 
      companyId={company.id} 
      businessName={company.name} 
    />
  )
}
