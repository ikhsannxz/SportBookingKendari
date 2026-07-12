import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues!inner(*, venue_images(*)), profiles(*), payments(*)')
    .eq('id', '509b312b-8797-47d9-8550-7734f5b4e3c4')
  
  console.log('Error:', error)
}
test()
