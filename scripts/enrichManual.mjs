import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORES_PATH = resolve(__dirname, '../src/data/storeLocations.json')
const MANUAL_PATH = resolve(__dirname, '../data/manual-enrichment.json')

function main() {
  const stores = JSON.parse(readFileSync(STORES_PATH, 'utf-8'))

  let existing = {}
  if (existsSync(MANUAL_PATH)) {
    const prev = JSON.parse(readFileSync(MANUAL_PATH, 'utf-8'))
    for (const entry of prev) {
      existing[entry.id] = entry
    }
  }

  const template = stores.map(s => ({
    id: s.id,
    name: s.name,
    orgNr: existing[s.id]?.orgNr || s.orgNr || null,
    website: existing[s.id]?.website || s.website || null,
    phone: existing[s.id]?.phone || s.phone || null,
    email: existing[s.id]?.email || s.email || null,
    facebook: existing[s.id]?.facebook || s.facebook || null,
    instagram: existing[s.id]?.instagram || s.instagram || null,
  }))

  const dir = dirname(MANUAL_PATH)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(MANUAL_PATH, JSON.stringify(template, null, 2))

  const filled = template.filter(t =>
    t.website || t.phone || t.email || t.facebook || t.instagram
  ).length

  console.log(`Generated manual enrichment template: ${MANUAL_PATH}`)
  console.log(`  ${template.length} stores total`)
  console.log(`  ${filled} with some data pre-filled`)
  console.log(`\nEdit this file to add: website, phone, email, facebook, instagram`)
}

main()
