/* eslint-env node */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SERVICE_ROLE_KEY)

const logErrorAndExit = (tableName, error) => {
  console.error(
    `An error occurred in table '${tableName}' with code ${error.code}: ${error.message}`
  )
  process.exit(1)
}

const logStep = (stepMessage) => {
  console.log(stepMessage)
}

const seedMembers = async () => {
  logStep('Seeding members...')

  const members = [
    { line_id: 'U000000000000000000000000000001', display_name: '測試會員 A', picture_url: null },
    { line_id: 'U000000000000000000000000000002', display_name: '測試會員 B', picture_url: null },
    { line_id: 'U000000000000000000000000000003', display_name: '測試會員 C', picture_url: null }
  ]

  const { error } = await supabase.from('members').insert(members)

  if (error) return logErrorAndExit('members', error)

  logStep('Members seeded successfully.')
}

seedMembers()
