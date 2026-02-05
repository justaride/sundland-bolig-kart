# Sundland Bolig (Kart & Analyse)

Denne applikasjonen er et verktøy for visualisering og analyse av bolig- og næringsutvikling i Sundland-området, Drammen.

## Funksjonalitet

- **Eiendomskart**: Oversikt over planlagte og eksisterende boligprosjekter.
- **Næringskart**: Oversikt over butikker og utsalgssteder basert på Plaace-data.
- **Dashboard**: Dypdykk i demografi, besøksmønster, handel og vekst.
- **Utvikler-innsikt**: Beriket informasjon om utbyggere og eiendomsaktører.

## Data-integrasjoner

### Plaace
Inneholder detaljert informasjon om:
- Demografiske trender (alder, kjønn, inntekt).
- Besøksdata (bevegelsesmønster, opprinnelse).
- Handelstall (estimert omsetning, markedsandeler).

### OffentligData (MCP)
Applikasjonen er integrert med **OffentligData.com** sin MCP-server for sanntidsberikelse av selskapstall:
- **Regnskapsdata**: Offisielle tall fra Brønnøysundregistrene (2024).
- **Roller**: Oversikt over styremedlemmer og daglig ledelse.
- **Aksjonærer**: Topp 10 aksjonærer for alle utbyggere.

## Utvikling

### Scripts

- `npm run dev`: Starter lokal utviklingsserver.
- `python3 scripts/enrich_developers.py`: Synkroniserer utbyggerdata med OffentligData MCP.
- `node scripts/convertPlaace.mjs`: Konverterer rå CSV-data fra Plaace til JSON.
- `node scripts/geocodeProperties.mjs`: Oppdaterer koordinater for eiendomsprosjekter.

## Deployment

Prosjektet er distribuert via Vercel:
`vercel --prod`
