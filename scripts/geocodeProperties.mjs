import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROPERTIES_PATH = resolve(__dirname, '../src/data/properties.json')

const ADRESSE_URL = 'https://ws.geonorge.no/adresser/v1/sok'
const STEDSNAVN_URL = 'https://ws.geonorge.no/stedsnavn/v1/sted'
const RATE_LIMIT_MS = 300

const DRAMMEN_BOUNDS = {
  latMin: 59.70, latMax: 59.78,
  lngMin: 10.10, lngMax: 10.30,
}

const MANUAL_COORDS = {
  'proffen-hageby': { lat: 59.7415, lng: 10.1635 },
  'stroemsoe-brygge': { lat: 59.7400, lng: 10.2090 },
  'tangen-terrasse': { lat: 59.7310, lng: 10.2360 },
  'stroemsoe-kunstsenter': { lat: 59.7355, lng: 10.2060 },
  'groenland-enebolig-felt': { lat: 59.7400, lng: 10.2020 },
  'stroemsoe-torg-utvikling': { lat: 59.7352, lng: 10.2065 },
  'deciliteren': { lat: 59.7384, lng: 10.2080 },
  'slippen-tangen': { lat: 59.7305, lng: 10.2350 },
  'bangelokka': { lat: 59.7316, lng: 10.2112 },
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function inDrammen(coords) {
  return coords.lat >= DRAMMEN_BOUNDS.latMin && coords.lat <= DRAMMEN_BOUNDS.latMax
    && coords.lng >= DRAMMEN_BOUNDS.lngMin && coords.lng <= DRAMMEN_BOUNDS.lngMax
}

async function geocodeAddress(address) {
  const params = new URLSearchParams({
    sok: `${address}, Drammen`,
    treffPerSide: '1',
  })
  const res = await fetch(`${ADRESSE_URL}?${params}`)
  const data = await res.json()

  if (data.adresser?.length > 0) {
    const punkt = data.adresser[0].representasjonspunkt
    if (punkt) return { lat: punkt.lat, lng: punkt.lon }
  }
  return null
}

async function geocodeStedsnavn(name) {
  const params = new URLSearchParams({
    sok: name,
    kommunenavn: 'Drammen',
    treffPerSide: '1',
  })
  const res = await fetch(`${STEDSNAVN_URL}?${params}`)
  const data = await res.json()

  if (data.namn?.length > 0) {
    const punkt = data.namn[0].representasjonspunkt
    if (punkt) return { lat: punkt.nord, lng: punkt.aust }
  }
  if (data.navn?.length > 0) {
    const punkt = data.navn[0].representasjonspunkt
    if (punkt) return { lat: punkt.nord, lng: punkt.aust }
  }
  return null
}

async function main() {
  const properties = JSON.parse(readFileSync(PROPERTIES_PATH, 'utf-8'))

  console.log(`Geocoding ${properties.length} properties...\n`)

  let apiCount = 0
  let manualCount = 0

  for (const prop of properties) {
    if (MANUAL_COORDS[prop.id]) {
      const mc = MANUAL_COORDS[prop.id]
      const oldLat = prop.lat
      const oldLng = prop.lng
      prop.lat = mc.lat
      prop.lng = mc.lng
      manualCount++
      console.log(`  ~ ${prop.name}: ${oldLat},${oldLng} → ${prop.lat},${prop.lng} (manual)`)
      continue
    }

    await sleep(RATE_LIMIT_MS)
    let coords = await geocodeAddress(prop.address)

    if (coords && !inDrammen(coords)) {
      console.log(`  ⚠ ${prop.name}: ${coords.lat.toFixed(4)},${coords.lng.toFixed(4)} outside Drammen, retrying...`)
      coords = null
    }

    if (!coords) {
      await sleep(RATE_LIMIT_MS)
      coords = await geocodeStedsnavn(prop.address)
    }

    if (coords && !inDrammen(coords)) coords = null

    if (coords) {
      const oldLat = prop.lat
      const oldLng = prop.lng
      prop.lat = parseFloat(coords.lat.toFixed(6))
      prop.lng = parseFloat(coords.lng.toFixed(6))
      apiCount++
      console.log(`  ✓ ${prop.name}: ${oldLat},${oldLng} → ${prop.lat},${prop.lng}`)
    } else {
      console.log(`  ✗ ${prop.name} (${prop.address}) - keeping existing coords`)
    }
  }

  writeFileSync(PROPERTIES_PATH, JSON.stringify(properties, null, 2))
  console.log(`\nDone! API: ${apiCount}, Manual: ${manualCount}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
