import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STORES_PATH = resolve(__dirname, '../src/data/storeLocations.json')
const BRREG_URL = 'https://data.brreg.no/enhetsregisteret/api/enheter'
const RATE_LIMIT_MS = 200

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function extractBrandName(storeName) {
  return storeName
    .replace(/\b(AS|ASA|ANS|DA|ENK|NUF)\b/gi, '')
    .replace(/\b(Drammen|Gulskogen|Senter|Avdeling|Avd|Butikk)\b/gi, '')
    .replace(/\b\d+\b/g, '')
    .replace(/[^A-Za-zÆØÅæøå0-9& '.-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeName(name) {
  return name
    .toUpperCase()
    .replace(/[^A-ZÆØÅ0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyMatch(storeName, brregName) {
  const a = normalizeName(storeName)
  const b = normalizeName(brregName)
  if (a === b) return 1.0
  if (b.includes(a) || a.includes(b)) return 0.9

  const brandA = normalizeName(extractBrandName(storeName))
  const brandB = normalizeName(extractBrandName(brregName))
  if (brandA === brandB) return 0.85
  if (brandB.includes(brandA) || brandA.includes(brandB)) return 0.7

  const aWords = brandA.split(' ').filter(w => w.length > 1)
  const bWords = brandB.split(' ').filter(w => w.length > 1)
  const matches = aWords.filter(w => bWords.some(bw => bw.includes(w) || w.includes(bw))).length
  const score = matches / Math.max(aWords.length, 1)
  return score * 0.6
}

async function searchBrreg(name) {
  const brand = extractBrandName(name)
  if (!brand || brand.length < 2) return null

  const params = new URLSearchParams({ navn: brand, size: '10' })
  const res = await fetch(`${BRREG_URL}?${params}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) return null
  const data = await res.json()

  if (!data._embedded?.enheter?.length) return null
  return data._embedded.enheter
}

async function main() {
  const stores = JSON.parse(readFileSync(STORES_PATH, 'utf-8'))
  let matched = 0
  let notFound = 0
  const brandCache = {}

  console.log(`Enriching ${stores.length} stores from Brønnøysundregistrene...\n`)

  for (const store of stores) {
    const brand = extractBrandName(store.name)

    if (brandCache[brand]) {
      const cached = brandCache[brand]
      store.orgNr = cached.orgNr
      store.website = cached.website
      matched++
      console.log(`  = ${store.name} → cached (${cached.orgNr})`)
      continue
    }

    await sleep(RATE_LIMIT_MS)

    const results = await searchBrreg(store.name)
    if (!results) {
      console.log(`  ✗ No results: ${store.name} (searched: "${brand}")`)
      notFound++
      continue
    }

    let bestMatch = null
    let bestScore = 0

    for (const enhet of results) {
      const score = fuzzyMatch(store.name, enhet.navn)
      if (score > bestScore) {
        bestScore = score
        bestMatch = enhet
      }
    }

    if (bestMatch && bestScore >= 0.4) {
      const orgNr = String(bestMatch.organisasjonsnummer)
      const website = bestMatch.hjemmeside || null
      store.orgNr = orgNr
      store.website = website
      brandCache[brand] = { orgNr, website }
      matched++
      console.log(`  ✓ ${store.name} → ${bestMatch.navn} (${orgNr}, score: ${bestScore.toFixed(2)})`)
    } else {
      console.log(`  ~ ${store.name} → best: "${results[0]?.navn}" (score: ${bestScore.toFixed(2)}, too low)`)
      notFound++
    }
  }

  writeFileSync(STORES_PATH, JSON.stringify(stores, null, 2))
  console.log(`\nDone! ${matched} matched, ${notFound} not found.`)
  console.log(`Output: ${STORES_PATH}`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
