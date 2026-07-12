import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function auditAndFix() {
  console.log('--- AUDITING INCONSISTENCIES ---')

  // 1. Cancelled bookings with pending/unpaid payments
  const { data: cancelledData, error: e1 } = await supabase
    .from('bookings')
    .select('id, status, payments(id, status)')
    .eq('status', 'cancelled')
  
  if (e1) console.error(e1)
  
  const invalidCancelled = cancelledData?.filter(b => {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    return payment && ['pending', 'unpaid'].includes(payment.status)
  }) || []

  console.log(`Found ${invalidCancelled.length} cancelled bookings with pending/unpaid payments.`)

  // 2. Expired bookings with pending/unpaid payments
  const { data: expiredData, error: e2 } = await supabase
    .from('bookings')
    .select('id, status, payments(id, status)')
    .eq('status', 'expired')

  if (e2) console.error(e2)

  const invalidExpired = expiredData?.filter(b => {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    return payment && ['pending', 'unpaid'].includes(payment.status)
  }) || []

  console.log(`Found ${invalidExpired.length} expired bookings with pending/unpaid payments.`)

  // 3. Completed bookings with pending/unpaid payments
  const { data: completedData, error: e3 } = await supabase
    .from('bookings')
    .select('id, status, payments(id, status)')
    .eq('status', 'completed')

  if (e3) console.error(e3)

  const invalidCompleted = completedData?.filter(b => {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    return payment && ['pending', 'unpaid'].includes(payment.status)
  }) || []

  console.log(`Found ${invalidCompleted.length} completed bookings with pending/unpaid payments.`)


  console.log('\n--- FIXING RECORDS ---')

  // Fix Cancelled -> Rejected (or Cancelled if supported, but rejected is standard)
  for (const b of invalidCancelled) {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    if (payment) {
      console.log(`Updating payment ${payment.id} to 'rejected' for cancelled booking ${b.id}`)
      await supabase.from('payments').update({ status: 'rejected' }).eq('id', payment.id)
    }
  }

  // Fix Expired -> Expired
  for (const b of invalidExpired) {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    if (payment) {
      console.log(`Updating payment ${payment.id} to 'expired' for expired booking ${b.id}`)
      // Note: If 'expired' isn't in payment_status, this might fail via JS client unless it's text. Let's see.
      const { error } = await supabase.from('payments').update({ status: 'expired' }).eq('id', payment.id)
      if (error) {
        console.log(`  Failed to set 'expired': ${error.message}. Setting to 'rejected' instead as fallback.`)
        await supabase.from('payments').update({ status: 'rejected' }).eq('id', payment.id)
      }
    }
  }

  // Fix Completed -> Verified
  for (const b of invalidCompleted) {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    if (payment) {
      console.log(`Updating payment ${payment.id} to 'verified' for completed booking ${b.id}`)
      await supabase.from('payments').update({ status: 'verified' }).eq('id', payment.id)
    }
  }

  console.log('Fix complete.')
}

auditAndFix()
