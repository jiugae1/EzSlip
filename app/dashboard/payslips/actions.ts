'use server'

import { createServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const payslipSchema = z.object({
  employee_id: z.string().uuid(),
  company_id: z.string().uuid(),
  period_start: z.string(),
  period_end: z.string(),
  days_worked: z.number().min(0),
  daily_rate: z.number().min(0),
  shimei_points: z.number().min(0),
  shimei_back_rate: z.number().min(0),
  ld_count: z.number().min(0),
  ld_rate: z.number().min(0),
  dohan_back: z.number().min(0),
  deduction_hm: z.number().min(0),
  deduction_penalty: z.number().min(0),
  deduction_apartment: z.number().min(0),
  status: z.enum(['draft', 'published', 'confirmed']),
})

export async function createPayslip(data: any) {
  const supabase = await createServer()
  
  const validated = payslipSchema.parse(data)

  const { error } = await supabase
    .from('payslips')
    .insert(validated)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard/payslips')
}

export async function updatePayslipStatus(id: string, status: 'draft' | 'published') {
  const supabase = await createServer()

  const { error } = await supabase
    .from('payslips')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/payslips')
}

export async function deletePayslip(id: string) {
  const supabase = await createServer()

  // Only allow deleting drafts (as per instructions)
  const { error } = await supabase
    .from('payslips')
    .delete()
    .eq('id', id)
    .eq('status', 'draft')

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/payslips')
}
