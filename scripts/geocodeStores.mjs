import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMMERCE_PATH = resolve(__dirname, '../src/data/plaace/commerce.json')
const OUTPUT_PATH = resolve(__dirname, '../src/data/storeLocations.json')

const KARTVERKET_URL = 'https://ws.geonorge.no/adresser/v1/sok'
const RATE_LIMIT_MS = 200

const GULSKOGEN_SENTER = { lat: 59.7423, lng: 10.1576 }

const SHOPPING_CENTER_OVERRIDES = {
  'PROFESSOR SMITHS ALLE': GULSKOGEN_SENTER,
  'GULDLISTEN': GULSKOGEN_SENTER,
}

const MANUAL_FALLBACKS = {
  'LIERSTRANDA': { lat: 59.7517, lng: 10.2530 },
  'STORGATA 6 A': { lat: 59.7429, lng: 10.2068 },
  'DRAMMEN': GULSKOGEN_SENTER,
}

const DRAMMEN_BOUNDS = {
  latMin: 59.70, latMax: 59.78,
  lngMin: 10.10, lngMax: 10.30,
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

function isInDrammenBounds(lat, lng) {
  return (
    lat >= DRAMMEN_BOUNDS.latMin && lat <= DRAMMEN_BOUNDS.latMax &&
    lng >= DRAMMEN_BOUNDS.lngMin && lng <= DRAMMEN_BOUNDS.lngMax
  )
}

function matchesShoppingCenter(address) {
  const upper = address.trim().toUpperCase()
  for (const [prefix, coords] of Object.entries(SHOPPING_CENTER_OVERRIDES)) {
    if (upper === prefix || (upper.startsWith(prefix) && !upper.slice(prefix.length).trim().match(/^\d/))) {
      return coords
    }
  }
  return null
}

async function geocodeKartverket(address) {
  const query = `${address}, Drammen`
  const params = new URLSearchParams({
    sok: query,
    treffPerSide: '1',
  })
  const res = await fetch(`${KARTVERKET_URL}?${params}`)
  const data = await res.json()

  if (!data.adresser || data.adresser.length === 0) return null

  const punkt = data.adresser[0].representasjonspunkt
  if (!punkt) return null

  return { lat: punkt.lat, lng: punkt.lon }
}

async function main() {
  const commerce = JSON.parse(readFileSync(COMMERCE_PATH, 'utf-8'))
  const stores = commerce.stores
  const results = []
  const addressCache = {}
  const addressCounts = {}
  let geocodedCount = 0
  let failedCount = 0
  let overrideCount = 0

  console.log(`Geocoding ${stores.length} stores via Kartverket...\n`)

  for (const store of stores) {
    const addr = store.address.trim().toUpperCase()
    let coords = null
    let coordinateSource = 'kartverket'

    if (addressCache[addr]) {
      addressCounts[addr] = (addressCounts[addr] || 1) + 1
      coords = addJitter(addressCache[addr].lat, addressCache[addr].lng, addressCounts[addr])
      coordinateSource = addressCache[addr]._source || 'kartverket'
    } else {
      const centerCoords = matchesShoppingCenter(addr)
      if (centerCoords) {
        addressCache[addr] = { ...centerCoords, _source: 'shopping_center' }
        addressCounts[addr] = 1
        coords = addJitter(centerCoords.lat, centerCoords.lng, 1)
        coordinateSource = 'shopping_center'
        overrideCount++
        console.log(`  ● ${store.address} → ${centerCoords.lat.toFixed(5)}, ${centerCoords.lng.toFixed(5)} (shopping center)`)
      } else if (MANUAL_FALLBACKS[addr]) {
        const fb = MANUAL_FALLBACKS[addr]
        addressCache[addr] = { ...fb, _source: 'manual' }
        addressCounts[addr] = 1
        coords = addJitter(fb.lat, fb.lng, 1)
        coordinateSource = 'manual'
        console.log(`  ~ ${store.address} → ${fb.lat.toFixed(5)}, ${fb.lng.toFixed(5)} (manual)`)
      } else {
        await sleep(RATE_LIMIT_MS)
        const result = await geocodeKartverket(store.address)
        geocodedCount++

        if (result && isInDrammenBounds(result.lat, result.lng)) {
          addressCache[addr] = { ...result, _source: 'kartverket' }
          addressCounts[addr] = 1
          coords = addJitter(result.lat, result.lng, 1)
          coordinateSource = 'kartverket'
          console.log(`  ✓ ${store.address} → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`)
        } else if (result) {
          console.log(`  ✗ Out of bounds: ${store.name} (${store.address}) → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`)
          failedCount++
          coords = null
        } else {
          console.log(`  ✗ Could not geocode: ${store.name} (${store.address})`)
          failedCount++
          coords = null
        }
      }
    }

    if (!coords) continue

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
      coordinateSource,
      orgNr: null,
      website: null,
      phone: null,
      email: null,
      facebook: null,
      instagram: null,
    })

    if (results.length % 20 === 0) {
      console.log(`  Processed ${results.length}/${stores.length}...`)
    }
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
  console.log(`\nDone! ${results.length} stores geocoded.`)
  console.log(`  API lookups: ${geocodedCount}`)
  console.log(`  Shopping center overrides: ${overrideCount}`)
  console.log(`  Failed: ${failedCount}`)
  console.log(`\nOutput: ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
