import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROPERTIES_PATH = resolve(__dirname, '../src/data/properties.json')

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const RATE_LIMIT_MS = 1100
const MAX_DISTANCE_M = 200

const DRAMMEN_RIVER_BOUNDS = {
  latMin: 59.7385,
  latMax: 59.7415,
  lngMin: 10.195,
  lngMax: 10.215,
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
  const properties = JSON.parse(readFileSync(PROPERTIES_PATH, 'utf-8'))
  const results = []
  let hasIssues = false

  console.log(`Verifying ${properties.length} properties...\n`)

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
    const result = {
      id: p.id,
      name: p.name,
      address: p.address,
      current: { lat: p.lat, lng: p.lng },
      status,
      issues,
    }
    results.push(result)

    const icon = status === 'OK' ? '✓' : '✗'
    console.log(`${icon} ${p.name} (${p.address})`)
    if (issues.length > 0) {
      issues.forEach(i => console.log(`  → ${i}`))
    }
  }

  console.log('\n---')
  const ok = results.filter(r => r.status === 'OK').length
  const bad = results.filter(r => r.status === 'ISSUE').length
  console.log(`Results: ${ok} OK, ${bad} issues`)

  const reportPath = resolve(__dirname, '../coordinate-report.json')
  writeFileSync(reportPath, JSON.stringify(results, null, 2))
  console.log(`\nReport saved: ${reportPath}`)

  if (hasIssues) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
