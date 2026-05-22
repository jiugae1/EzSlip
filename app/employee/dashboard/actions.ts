'use server'

import { createServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBankAccount(
  employeeId: string,
  bankName: string,
  accountNumber: string,
  accountHolder: string
) {
  const supabase = await createServer()

  const { error } = await supabase
    .from('employees')
    .update({
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
    })
    .eq('id', employeeId)

  if (error) throw new Error(error.message)

  revalidatePath('/employee/dashboard')
}

export async function confirmPayslip(payslipId: string) {
  const supabase = await createServer()

  const { error } = await supabase
    .from('payslips')
    .update({
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      status: 'confirmed'
    })
    .eq('id', payslipId)

  if (error) throw new Error(error.message)

  revalidatePath('/employee/dashboard')
  revalidatePath('/dashboard/payslips')
}
