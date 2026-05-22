import Link from 'next/link'
import { LayoutDashboard, Users, FileText, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-[#1e3a5f] p-3 rounded-2xl mb-6 shadow-xl">
          <FileText className="text-white" size={48} />
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
          PaySlip <span className="text-[#1e3a5f]">PH</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-12">
          The professional digital payslip solution for businesses in the Philippines. 
          Manage employees, generate slips, and track payments in one dark-mode optimized platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <Link 
            href="/login" 
            className="flex-1 bg-[#1e3a5f] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#152943] transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
          >
            <LayoutDashboard size={20} />
            <span>Business Owner</span>
          </Link>
          <Link 
            href="/employee/login" 
            className="flex-1 bg-[#0e7490] text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-[#0a5a6f] transition-all shadow-lg shadow-cyan-100 flex items-center justify-center space-x-2"
          >
            <Users size={20} />
            <span>Employee Portal</span>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1e3a5f]">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Real-time Calculation</h3>
            <p className="text-sm text-gray-500">Auto-calculated salary, points, and deductions for accuracy.</p>
          </div>
          <div className="text-center">
            <div className="bg-cyan-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0e7490]">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Print-Ready Slips</h3>
            <p className="text-sm text-gray-500">Professional A6 format slips ready for printing or digital sharing.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Secure Portals</h3>
            <p className="text-sm text-gray-500">Dedicated access for both owners and employees with full privacy.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 text-xs border-t border-gray-50">
        &copy; 2026 PaySlip PH. Designed for Philippine Businesses.
      </footer>
    </div>
  )
}
