'use server'

import { createServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDailyRate(employeeId: string, dailyRate: number) {
  const supabase = await createServer()
  
  const { error } = await supabase
    .from('employees')
    .update({ daily_rate: dailyRate })
    .eq('id', employeeId)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/employees')
}

export async function deleteEmployee(employeeId: string) {
  const supabase = await createServer()

  // 1. Check for existing payslips
  const { count, error: countError } = await supabase
    .from('payslips')
    .select('*', { count: 'exact', head: true })
    .eq('employee_id', employeeId)

  if (countError) throw new Error(countError.message)
  
  if (count && count > 0) {
    throw new Error('HAS_PAYSLIPS')
  }

  // 2. Delete employee
  const { error: deleteError } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId)

  if (deleteError) throw new Error(deleteError.message)

  revalidatePath('/dashboard/employees')
}
