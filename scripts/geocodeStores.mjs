import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMMERCE_PATH = resolve(__dirname, '../src/data/plaace/commerce.json')
const OUTPUT_PATH = resolve(__dirname, '../src/data/storeLocations.json')

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const RATE_LIMIT_MS = 1100

const KNOWN_ADDRESSES = {
  'GULDLISTEN 35': { lat: 59.72954, lng: 10.18993 },
  'GULDLISTEN 20': { lat: 59.72970, lng: 10.18880 },
  'GULDLISTEN': { lat: 59.72960, lng: 10.18950 },
  'PROFESSOR SMITHS ALLE': { lat: 59.73000, lng: 10.18850 },
  'PROFESSOR SMITHS ALLE 54': { lat: 59.73020, lng: 10.18780 },
  'PROFESSOR SMITHS ALLE 55': { lat: 59.73010, lng: 10.18800 },
  'PROFESSOR SMITHS ALLE 56': { lat: 59.72990, lng: 10.18830 },
  'SYRETÅRNET 15': { lat: 59.72850, lng: 10.18700 },
  'SYRETÅRNET 3': { lat: 59.72870, lng: 10.18720 },
  'NEDRE EIKERVEI 8': { lat: 59.73310, lng: 10.19350 },
  'NEDRE EIKERVEI 26': { lat: 59.73250, lng: 10.19500 },
  'VINTERGATA 11': { lat: 59.73100, lng: 10.19100 },
  'VINTERGATA 19': { lat: 59.73080, lng: 10.19150 },
  'STORGATA 6 A': { lat: 59.74320, lng: 10.20500 },
  'KNUD SCHARTUMS GATE 7': { lat: 59.74100, lng: 10.20200 },
  'BRAGERNES TORG 6': { lat: 59.74200, lng: 10.20700 },
  'LEIV ERIKSONS GATE 4': { lat: 59.73500, lng: 10.19600 },
  'LIEBAKKEN 26': { lat: 59.73700, lng: 10.17800 },
  'LIERSTRANDA': { lat: 59.74500, lng: 10.17000 },
  'DRAMMEN': { lat: 59.73500, lng: 10.19500 },
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function addJitter(lat, lng, index) {
  const angle = (index * 137.508) * (Math.PI / 180)
  const radius = 0.0002 + (index % 7) * 0.00005
  return {
    lat: lat + Math.cos(angle) * radius,
    lng: lng + Math.sin(angle) * radius,
  }
}

function simplifyCategory(fullCategory) {
  const parts = fullCategory.split(' / ')
  return parts.length > 1 ? parts[1] : parts[0]
}

function topCategory(fullCategory) {
  return fullCategory.split(' / ')[0]
}

async function geocode(address) {
  const query = `${address}, Drammen, Norway`
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '1',
    countrycodes: 'no',
  })
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'SundlandBoligKart/1.0' },
  })
  const data = await res.json()
  if (data.length === 0) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

async function main() {
  const commerce = JSON.parse(readFileSync(COMMERCE_PATH, 'utf-8'))
  const stores = commerce.stores
  const results = []
  const addressCounts = {}
  let geocodedCount = 0
  let knownCount = 0

  console.log(`Geocoding ${stores.length} stores...\n`)

  for (const store of stores) {
    const addr = store.address.trim().toUpperCase()
    let coords = null

    const knownKey = Object.keys(KNOWN_ADDRESSES).find(
      k => addr === k || addr.startsWith(k)
    )

    if (knownKey) {
      addressCounts[knownKey] = (addressCounts[knownKey] || 0) + 1
      const base = KNOWN_ADDRESSES[knownKey]
      coords = addJitter(base.lat, base.lng, addressCounts[knownKey])
      knownCount++
    } else {
      await sleep(RATE_LIMIT_MS)
      coords = await geocode(store.address)
      geocodedCount++
      if (!coords) {
        console.log(`  ✗ Could not geocode: ${store.name} (${store.address})`)
        coords = addJitter(59.73000, 10.19000, results.length)
      }
    }

    results.push({
      id: `store-${store.rank}`,
      name: store.name,
      category: simplifyCategory(store.category),
      topCategory: topCategory(store.category),
      address: store.address,
      lat: parseFloat(coords.lat.toFixed(6)),
      lng: parseFloat(coords.lng.toFixed(6)),
      revenue: store.revenue,
      employees: store.employees,
      yoyGrowth: store.yoyGrowth,
      marketShare: store.marketShare,
      chainLocations: store.chainLocations,
    })

    if (results.length % 20 === 0) {
      console.log(`  Processed ${results.length}/${stores.length}...`)
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
  console.log(`\nDone! ${results.length} stores geocoded.`)
  console.log(`  Known addresses: ${knownCount}`)
  console.log(`  Nominatim lookups: ${geocodedCount}`)
  console.log(`\nOutput: ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
