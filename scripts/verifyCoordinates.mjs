import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROPERTIES_PATH = resolve(__dirname, '../src/data/properties.json')
const STORES_PATH = resolve(__dirname, '../src/data/storeLocations.json')

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const RATE_LIMIT_MS = 1100
const MAX_DISTANCE_M = 200
const STORE_MAX_DISTANCE_M = 500

const GULSKOGEN_SENTER = { lat: 59.7423, lng: 10.1576 }

const DRAMMEN_RIVER_BOUNDS = {
  latMin: 59.7385,
  latMax: 59.7415,
  lngMin: 10.195,
  lngMax: 10.215,
}

const DRAMMEN_BOUNDS = {
  latMin: 59.70, latMax: 59.78,
  lngMin: 10.10, lngMax: 10.30,
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isInRiver(lat, lng) {
  return (
    lat > DRAMMEN_RIVER_BOUNDS.latMin &&
    lat < DRAMMEN_RIVER_BOUNDS.latMax &&
    lng > DRAMMEN_RIVER_BOUNDS.lngMin &&
    lng < DRAMMEN_RIVER_BOUNDS.lngMax
  )
}

function isInDrammenBounds(lat, lng) {
  return (
    lat >= DRAMMEN_BOUNDS.latMin && lat <= DRAMMEN_BOUNDS.latMax &&
    lng >= DRAMMEN_BOUNDS.lngMin && lng <= DRAMMEN_BOUNDS.lngMax
  )
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

async function verifyProperties() {
  const properties = JSON.parse(readFileSync(PROPERTIES_PATH, 'utf-8'))
  const results = []
  let hasIssues = false

  console.log(`\n=== PROPERTIES (${properties.length}) ===\n`)

  for (const p of properties) {
    const issues = []

    if (isInRiver(p.lat, p.lng)) {
      issues.push('RIVER: Coordinates are in Drammenselva!')
      hasIssues = true
    }

    if (p.address) {
      await sleep(RATE_LIMIT_MS)
      const geocoded = await geocode(p.address)
      if (geocoded) {
        const dist = haversineDistance(p.lat, p.lng, geocoded.lat, geocoded.lng)
        if (dist > MAX_DISTANCE_M) {
          issues.push(
            `DISTANCE: ${Math.round(dist)}m from geocoded address (${geocoded.lat.toFixed(4)}, ${geocoded.lng.toFixed(4)})`
          )
          hasIssues = true
        }
      } else {
        issues.push('GEOCODE_FAIL: Could not geocode address')
      }
    }

    const status = issues.length === 0 ? 'OK' : 'ISSUE'
    results.push({
      id: p.id,
      name: p.name,
      address: p.address,
      current: { lat: p.lat, lng: p.lng },
      status,
      issues,
    })

    const icon = status === 'OK' ? '✓' : '✗'
    console.log(`${icon} ${p.name} (${p.address})`)
    if (issues.length > 0) {
      issues.forEach(i => console.log(`  → ${i}`))
    }
  }

  return { results, hasIssues }
}

function verifyStores() {
  const stores = JSON.parse(readFileSync(STORES_PATH, 'utf-8'))
  const results = []
  let hasIssues = false

  console.log(`\n=== STORES (${stores.length}) ===\n`)

  for (const s of stores) {
    const issues = []

    if (!isInDrammenBounds(s.lat, s.lng)) {
      issues.push(`OUT_OF_BOUNDS: ${s.lat.toFixed(4)}, ${s.lng.toFixed(4)} is outside Drammen`)
      hasIssues = true
    }

    if (isInRiver(s.lat, s.lng)) {
      issues.push('RIVER: Coordinates are in Drammenselva!')
      hasIssues = true
    }

    const isGulskogenSenter = s.name.toLowerCase().includes('gulskogen senter') ||
      (s.name.toLowerCase().includes('gulskogen') && s.coordinateSource === 'shopping_center')
    if (isGulskogenSenter) {
      const dist = haversineDistance(s.lat, s.lng, GULSKOGEN_SENTER.lat, GULSKOGEN_SENTER.lng)
      if (dist > STORE_MAX_DISTANCE_M) {
        issues.push(`GULSKOGEN: ${Math.round(dist)}m from Gulskogen Senter (max ${STORE_MAX_DISTANCE_M}m)`)
        hasIssues = true
      }
    }

    const status = issues.length === 0 ? 'OK' : 'ISSUE'
    results.push({
      id: s.id,
      name: s.name,
      address: s.address,
      coordinateSource: s.coordinateSource,
      current: { lat: s.lat, lng: s.lng },
      status,
      issues,
    })

    if (issues.length > 0) {
      console.log(`✗ ${s.name} (${s.address})`)
      issues.forEach(i => console.log(`  → ${i}`))
    }
  }

  const ok = results.filter(r => r.status === 'OK').length
  const bad = results.filter(r => r.status === 'ISSUE').length
  console.log(`\nStores: ${ok} OK, ${bad} issues`)

  return { results, hasIssues }
}

async function main() {
  const storeReport = verifyStores()

  const skipProperties = process.argv.includes('--stores-only')
  let propertyReport = { results: [], hasIssues: false }
  if (!skipProperties) {
    propertyReport = await verifyProperties()
  }

  const allResults = {
    stores: storeReport.results,
    properties: propertyReport.results,
    summary: {
      storesOk: storeReport.results.filter(r => r.status === 'OK').length,
      storesIssues: storeReport.results.filter(r => r.status === 'ISSUE').length,
      propertiesOk: propertyReport.results.filter(r => r.status === 'OK').length,
      propertiesIssues: propertyReport.results.filter(r => r.status === 'ISSUE').length,
    },
  }

  console.log('\n--- SUMMARY ---')
  console.log(`Stores:     ${allResults.summary.storesOk} OK, ${allResults.summary.storesIssues} issues`)
  console.log(`Properties: ${allResults.summary.propertiesOk} OK, ${allResults.summary.propertiesIssues} issues`)

  const reportPath = resolve(__dirname, '../coordinate-report.json')
  writeFileSync(reportPath, JSON.stringify(allResults, null, 2))
  console.log(`\nReport saved: ${reportPath}`)

  if (storeReport.hasIssues || propertyReport.hasIssues) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
