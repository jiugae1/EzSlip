import { createServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings as SettingsIcon, Building, ShieldCheck } from 'lucide-react'
import CompanyCodeBanner from '../employees/CompanyCodeBanner'

export default async function SettingsPage() {
  const supabase = await createServer()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get company info
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_auth_id', user.id)
    .single()

  if (companyError || !company) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load company information.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="bg-[#1e3a5f] p-2 rounded-lg text-white">
          <SettingsIcon size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Company Info Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center space-x-2">
          <Building size={18} className="text-[#1e3a5f]" />
          <h2 className="font-bold text-gray-900">Business Profile</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Business Name</label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-700">
                {company.name}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-widest">Owner Email</label>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-600">
                {company.owner_email}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Code Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <ShieldCheck size={18} className="text-[#1e3a5f]" />
          <h2 className="font-bold text-gray-900">Security & Invitation</h2>
        </div>
        <CompanyCodeBanner code={company.company_code} />
        <p className="text-sm text-gray-500 px-1">
          This code is required for your employees to register and link their accounts to your business. 
          Keep it secure and only share it with authorized personnel.
        </p>
      </section>

      {/* Account Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-blue-900 font-bold mb-2">Account Administration</h3>
        <p className="text-sm text-blue-700 leading-relaxed">
          You are currently logged in as the primary administrator. To change your password or update your email, 
          please use the Supabase Auth settings or contact support.
        </p>
      </div>
    </div>
  )
}
