import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react'

export default async function OwnerDashboardPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get company info
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('owner_auth_id', user.id)
    .single()

  if (!company) return <div>Failed to load company.</div>

  const companyId = company.id
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // 3. Fetch Stats
  const { count: payslipsThisMonth } = await supabase
    .from('payslips')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('period_start', firstDayOfMonth)

  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const { data: totalPayoutData } = await supabase
    .from('payslips')
    .select('total_net_salary')
    .eq('company_id', companyId)
    .gte('period_start', firstDayOfMonth)

  const totalPayout = totalPayoutData?.reduce((acc, curr) => acc + Number(curr.total_net_salary), 0) || 0

  const { count: unconfirmedPayslips } = await supabase
    .from('payslips')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'published')
    .eq('is_confirmed', false)

  // 4. Fetch Recent Payslips (last 10)
  const { data: recentPayslips } = await supabase
    .from('payslips')
    .select(`
      id,
      period_start,
      period_end,
      total_net_salary,
      status,
      is_confirmed,
      confirmed_at,
      employees (
        name
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payslips This Month</p>
          <h3 className="text-3xl font-black text-gray-900">{payslipsThisMonth}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <Users size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Employees</p>
          <h3 className="text-3xl font-black text-gray-900">{totalEmployees}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Payout (Month)</p>
          <h3 className="text-2xl font-black text-gray-900">₱{totalPayout.toLocaleString()}</h3>
        </div>

        <Link 
          href="/dashboard/payslips?status=published&confirmed=false"
          className="bg-[#fef9c3] p-6 rounded-2xl shadow-sm border border-yellow-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="text-sm font-bold text-yellow-800 uppercase tracking-wider">⚠️ Unconfirmed</p>
          <h3 className="text-3xl font-black text-yellow-900">{unconfirmedPayslips}</h3>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/dashboard/payslips/new"
          className="bg-[#1e3a5f] text-white p-6 rounded-2xl flex items-center justify-between group hover:bg-[#152943] transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 p-3 rounded-xl">
              <Plus size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold">New Payslip</h4>
              <p className="text-blue-200 text-sm">Create and issue a new salary slip</p>
            </div>
          </div>
          <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link 
          href="/dashboard/employees"
          className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between group hover:border-[#1e3a5f] transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gray-50 p-3 rounded-xl text-[#1e3a5f]">
              <Users size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Manage Employees</h4>
              <p className="text-gray-500 text-sm">Update rates and bank information</p>
            </div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-[#1e3a5f] transition-colors" />
        </Link>
      </div>

      {/* Recent Payslips Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Recent Payslips</h3>
          <Link href="/dashboard/payslips" className="text-sm font-bold text-[#1e3a5f] hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase">Confirmed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentPayslips?.map((p: any) => (
                <tr 
                  key={p.id} 
                  className={`hover:bg-gray-50 ${!p.is_confirmed && p.status === 'published' ? 'bg-yellow-50/50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.employees?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(p.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-[#1e3a5f]">
                    ₱{Number(p.total_net_salary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                      p.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      p.status === 'published' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.is_confirmed ? (
                      <div className="flex items-center text-green-600 text-xs font-bold">
                        <CheckCircle2 size={14} className="mr-1" />
                        <span>{new Date(p.confirmed_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400 text-xs font-bold">
                        <Clock size={14} className="mr-1" />
                        <span>Pending</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
