import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const CSV_DIR = join(import.meta.dirname, '..', 'Sundland Bolig Plaace 04.02.26')
const OUT_DIR = join(import.meta.dirname, '..', 'src', 'data', 'plaace')

mkdirSync(OUT_DIR, { recursive: true })

function readCsv(filename) {
  const raw = readFileSync(join(CSV_DIR, filename), 'utf-8')
  return raw.replace(/^\uFEFF/, '')
}

function parseSimpleCsv(text) {
  const lines = text.trim().split('\n')
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map(line => {
    const vals = parseCsvLine(line)
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] })
    return obj
  })
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current.trim())
  return result
}

function parseSemicolonCsv(text) {
  const lines = text.trim().split('\n')
  return lines.slice(1).map(line => {
    const parts = line.split(';').map(s => s.replace(/^"|"$/g, ''))
    return parts
  })
}

function toNum(s) {
  if (!s || s === '-' || s === '') return null
  return parseFloat(s)
}

function round(n, d = 0) {
  if (n === null || n === undefined) return null
  const f = Math.pow(10, d)
  return Math.round(n * f) / f
}

// ============== DEMOGRAPHICS ==============
console.log('Processing demographics...')

const ageRes = parseSimpleCsv(readCsv('Aldersfordeling.csv'))
const ageDistribution = ageRes.map(r => ({
  group: r.Category,
  male: toNum(Object.values(r)[1]),
  female: toNum(Object.values(r)[2])
}))

const buildingsRes = parseSimpleCsv(readCsv('Antall hus.csv'))
const buildings = buildingsRes.map(r => ({
  type: r.Category,
  count: toNum(Object.values(r)[1])
}))

const householdsRes = parseSimpleCsv(readCsv('Antall husholdninger.csv'))
const households = householdsRes.map(r => ({
  type: r.Category,
  count: toNum(Object.values(r)[1])
}))

const incomeRes = parseSimpleCsv(readCsv('Inntektsfordeling.csv'))
const incomeDistribution = incomeRes.map(r => ({
  bracket: r.Category,
  count: round(toNum(Object.values(r)[1]))
}))

const medianRes = parseSimpleCsv(readCsv('Medianinntekt per husholdningstype.csv'))
const medianIncome = medianRes.map(r => ({
  type: r.Category,
  amount: round(toNum(Object.values(r)[1]))
}))

const popRes = parseSimpleCsv(readCsv('Demografi over tid.csv'))
const populationTrend = popRes.map(r => ({
  year: parseInt(r.Category),
  population: toNum(Object.values(r)[1]),
  trendline: round(toNum(Object.values(r)[2]), 1)
}))

const demographics = { ageDistribution, buildings, households, incomeDistribution, medianIncome, populationTrend }
writeFileSync(join(OUT_DIR, 'demographics.json'), JSON.stringify(demographics, null, 2))
console.log('  -> demographics.json')

// ============== VISITORS ==============
console.log('Processing visitors...')

const visAgeRes = parseSimpleCsv(readCsv('Alders- og kjønnsfordeling (besøkende).csv'))
const visAgeDistribution = visAgeRes.map(r => ({
  group: r.Category,
  male: round(toNum(Object.values(r)[1])),
  female: round(toNum(Object.values(r)[2]))
}))

const visBuildRes = parseSimpleCsv(readCsv('Antall hus (besøkende).csv'))
const visBuildings = visBuildRes.map(r => ({
  type: r.Category,
  count: round(toNum(Object.values(r)[1]))
}))

const visHouseRes = parseSimpleCsv(readCsv('Husholdningstypefordeling (besøkende).csv'))
const visHouseholds = visHouseRes.map(r => ({
  type: r.Category,
  count: round(toNum(Object.values(r)[1]))
}))

const visIncomeRes = parseSimpleCsv(readCsv('Inntektsfordeling (besøkende).csv'))
const visIncome = visIncomeRes.map(r => ({
  bracket: r.Category,
  count: round(toNum(Object.values(r)[1]))
}))

const visMedianRes = parseSimpleCsv(readCsv('Medianinntekt per husholdningstype (besøkende).csv'))
const visMedianIncome = visMedianRes.map(r => ({
  type: r.Category,
  amount: round(toNum(Object.values(r)[1]))
}))

const hourlyRes = parseSimpleCsv(readCsv('Besøk per time i tidsperioden (daglig gjennomsnitt).csv'))
const hourly = hourlyRes.map(r => {
  const vals = Object.values(r)
  return {
    hour: vals[0],
    visitors: toNum(vals[1]),
    work: toNum(vals[2]),
    home: toNum(vals[3])
  }
})

const weekdayRes = parseSimpleCsv(readCsv('Besøk per ukedag i tidsperioden (daglig gjennomsnitt).csv'))
const weekday = weekdayRes.map(r => {
  const vals = Object.values(r)
  return {
    day: vals[0],
    visitors: toNum(vals[1]),
    work: toNum(vals[2]),
    home: toNum(vals[3])
  }
})

const quarterlyRes = parseSimpleCsv(readCsv('Bevegelsesmønster (gjennomsnittlig daglige besøk).csv'))
const quarterly = quarterlyRes.map(r => {
  const vals = Object.values(r)
  return {
    quarter: vals[0],
    visitors2023: toNum(vals[1]),
    visitors2024: toNum(vals[2]),
    visitors2025: toNum(vals[3]),
    work2023: toNum(vals[4]),
    work2024: toNum(vals[5]),
    work2025: toNum(vals[6]),
    home2023: toNum(vals[7]),
    home2024: toNum(vals[8]),
    home2025: toNum(vals[9])
  }
})

const originsText = readCsv('Omrader_besokende_kommer_fra.csv')
const originsRows = parseSemicolonCsv(originsText)
const origins = originsRows
  .filter(r => r[0] && r[0] !== '' && r[0] !== 'no_name')
  .map(r => ({
    area: r[0],
    visits: parseInt(r[1]),
    percentage: parseFloat(r[2].replace(',', '.'))
  }))
  .filter(r => !isNaN(r.visits))

const visitors = {
  ageDistribution: visAgeDistribution,
  buildings: visBuildings,
  households: visHouseholds,
  income: visIncome,
  medianIncome: visMedianIncome,
  hourly,
  weekday,
  quarterly,
  origins
}
writeFileSync(join(OUT_DIR, 'visitors.json'), JSON.stringify(visitors, null, 2))
console.log('  -> visitors.json')

// ============== COMMERCE ==============
console.log('Processing commerce...')

const storeText = readFileSync(join(CSV_DIR, 'Estimert omsetning (eks mva) fra fysiske utsalgssteder - Sheet1.csv'), 'utf-8').replace(/^\uFEFF/, '')
const storeLines = storeText.split('\n')

const stores = []
const recordStarts = []
for (let li = 6; li < storeLines.length; li++) {
  if (storeLines[li].match(/^#\d+,/)) recordStarts.push(li)
}

for (let ri = 0; ri < recordStarts.length; ri++) {
  const start = recordStarts[ri]
  const end = ri + 1 < recordStarts.length ? recordStarts[ri + 1] : storeLines.length
  const block = storeLines.slice(start, end).join('\n')

  const headerMatch = block.match(/^#(\d+),([^,]+),([^,]+),([^,]*),([^,]*),/)
  if (!headerMatch) continue

  const rank = parseInt(headerMatch[1])
  const name = headerMatch[2].trim()
  const category = headerMatch[3].trim()
  const address = headerMatch[4].trim()
  const municipality = headerMatch[5].trim()

  let revenue = 0
  const millMatch = block.match(/NOK\s+([\d.,]+)\s*mill/)
  const kMatch = block.match(/NOK\s+([\d.,]+)k/)
  if (millMatch) revenue = parseFloat(millMatch[1].replace(',', '.')) * 1000000
  else if (kMatch) revenue = parseFloat(kMatch[1].replace(',', '.')) * 1000

  let chainShare = null
  const csMatch = block.match(/([\d.]+)%\s*av kjede/)
  if (csMatch) chainShare = parseFloat(csMatch[1])

  let yoyGrowth = null
  const fields = block.split('","')
  if (fields.length >= 2) {
    const yoyField = fields[1]
    const ygMatch = yoyField.match(/^([-\d.,]+)%/)
    if (ygMatch) yoyGrowth = parseFloat(ygMatch[1].replace(',', '.'))
  }

  let employees = 0
  if (fields.length >= 3) {
    const empField = fields[2]
    const empMatch = empField.match(/^(\d+)/)
    if (empMatch) employees = parseInt(empMatch[1])
  }

  let chainEmployees = null
  let chainLocations = null
  const chainMatch = block.match(/(\d+)\s+i\s+(\d+)\s+lokasjoner/)
  if (chainMatch) {
    chainEmployees = parseInt(chainMatch[1])
    chainLocations = parseInt(chainMatch[2])
  }

  let marketShare = 0
  if (fields.length >= 4) {
    const msMatch = fields[3].match(/([\d.]+)%/)
    if (msMatch) marketShare = parseFloat(msMatch[1])
  }

  stores.push({
    rank, name, category, address, municipality,
    revenue: round(revenue),
    chainShare, yoyGrowth, employees,
    chainEmployees, chainLocations, marketShare
  })
}

const catMixRes = parseSimpleCsv(readCsv('Konseptmiks.csv'))
const categoryMix = catMixRes.map(r => ({
  level1: Object.values(r)[1],
  level2: Object.values(r)[2],
  percentage: toNum(Object.values(r)[3])
}))

const chainRes = parseSimpleCsv(readCsv('Kjeder vs. uavhengige konsepter.csv'))
const chainVsIndependent = chainRes.map(r => ({
  year: parseInt(r.Category),
  independent: round(toNum(Object.values(r)[1]), 2),
  chain: round(toNum(Object.values(r)[2]), 2)
}))

const overUnderRes = parseSimpleCsv(readCsv('Over- og underandel vs. kommune.csv'))
const overUnderRepresentation = overUnderRes.map(r => {
  const vals = Object.values(r)
  const value = toNum(vals[1]) || toNum(vals[2]) || toNum(vals[3])
  return {
    category: vals[0],
    value: round(value, 2)
  }
})

const commerce = { stores, categoryMix, chainVsIndependent, overUnderRepresentation }
writeFileSync(join(OUT_DIR, 'commerce.json'), JSON.stringify(commerce, null, 2))
console.log(`  -> commerce.json (${stores.length} stores)`)

// ============== CARD TRANSACTIONS ==============
console.log('Processing card transactions...')

const weeklyRes = parseSimpleCsv(readCsv('Korthandel i valgt tidsrom.csv'))
const weekly = weeklyRes.map(r => {
  const vals = Object.values(r)
  return {
    week: vals[0],
    amount: toNum(vals[2]),
    date: vals[3]
  }
})

const byWeekdayRes = parseSimpleCsv(readCsv('Korthandel per ukedag.csv'))
const byWeekday = byWeekdayRes.map(r => {
  const vals = Object.values(r)
  return {
    day: vals[0],
    '2019': toNum(vals[1]),
    '2020': toNum(vals[2]),
    '2021': toNum(vals[3]),
    '2022': toNum(vals[4]),
    '2023': toNum(vals[5]),
    '2024': toNum(vals[6]),
    '2025': toNum(vals[7]),
    '2026': toNum(vals[8])
  }
})

const cardTransactions = { weekly, byWeekday }
writeFileSync(join(OUT_DIR, 'cardTransactions.json'), JSON.stringify(cardTransactions, null, 2))
console.log('  -> cardTransactions.json')

// ============== GROWTH ==============
console.log('Processing growth...')

const growthRes = parseSimpleCsv(readCsv('Årlig vekst.csv'))
const annualGrowth = growthRes.map(r => {
  const vals = Object.values(r)
  return {
    year: parseInt(vals[0]),
    gulskogenPct: toNum(vals[2]),
    gulskogenNok: round(toNum(vals[3]), 2),
    drammenPct: toNum(vals[5]),
    drammenNok: round(toNum(vals[6]), 2),
    norwayPct: toNum(vals[8]),
    norwayNok: round(toNum(vals[9]), 2)
  }
})

const indexedRes = parseSimpleCsv(readCsv('Indeksert vekst (indeks = 100).csv'))
const indexedGrowth = indexedRes.map(r => {
  const dateStr = Object.values(r)[0]
  const parts = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/)
  let isoDate = ''
  if (parts) {
    const months = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' }
    isoDate = `${parts[3]}-${months[parts[1]] || '01'}-${parts[2].padStart(2, '0')}`
  }
  return {
    date: isoDate,
    value: round(toNum(Object.values(r)[1]), 2)
  }
})

const catDevRes = parseSimpleCsv(readCsv('Utvikling per år.csv'))
const categoryDevelopment = catDevRes.map(r => ({
  year: parseInt(r.Category),
  dining: round(toNum(Object.values(r)[1]), 2),
  retail: round(toNum(Object.values(r)[2]), 2),
  services: round(toNum(Object.values(r)[3]), 2)
}))

const growth = { annualGrowth, indexedGrowth, categoryDevelopment }
writeFileSync(join(OUT_DIR, 'growth.json'), JSON.stringify(growth, null, 2))
console.log(`  -> growth.json (${indexedGrowth.length} indexed rows)`)

// ============== KEY METRICS (updated) ==============
console.log('Processing key metrics...')

const totalPop = populationTrend[populationTrend.length - 1]?.population || 0
const totalHouseholds = households.reduce((s, h) => s + (h.count || 0), 0)
const avgDailyVisits = round(weekday.reduce((s, d) => s + d.visitors + d.work + d.home, 0) / 7)
const avgCardDaily = round(weekly.reduce((s, w) => s + (w.amount || 0), 0) / weekly.length * 1000000 / 7)
const busiestDay = weekday.reduce((max, d) => (d.visitors > max.visitors ? d : max), weekday[0])

const keyMetrics = {
  area: 'Gulskogen stasjon / Sundland, Drammen',
  demography: {
    population: totalPop,
    density: round(totalPop / 2.23),
    area: 2.23
  },
  movement: {
    dailyVisits: avgDailyVisits,
    perKm2: round(avgDailyVisits / 2.23),
    busiestDay: busiestDay.day
  },
  cardTransactions: {
    weeklyAvg: round(weekly.reduce((s, w) => s + (w.amount || 0), 0) / weekly.length, 2),
    totalStores: stores.length,
    totalRevenue: round(stores.reduce((s, st) => s + st.revenue, 0))
  }
}
writeFileSync(join(OUT_DIR, 'keyMetrics.json'), JSON.stringify(keyMetrics, null, 2))
console.log('  -> keyMetrics.json')

console.log('\nDone! All JSON files written to src/data/plaace/')
