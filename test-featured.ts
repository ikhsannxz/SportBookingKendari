import { getFeaturedVenues } from './src/lib/supabase/queries/venues'

async function run() {
  console.log('Fetching featured venues...')
  const result = await getFeaturedVenues()
  console.log('Result:', result)
}

run()
