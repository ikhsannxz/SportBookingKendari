import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function run() {
  console.log('Fetching featured venues...')
  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_images(url, is_primary)')
    .in('status', ['approved', 'maintenance'])
    .order('rating_avg', { ascending: false })
    .order('review_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)
  
  if (error) {
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Full error:', JSON.stringify(error, null, 2))
  } else {
    console.log('Result:', data)
  }
}

run()
