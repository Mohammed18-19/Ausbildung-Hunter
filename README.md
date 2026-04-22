# Ausbildung Intelligence Hunter

> Germany career intelligence platform — find the best Ausbildung programs with real-time job market data.

## Quick Start

```bash
npm install
cp .env.example .env.local   # add your Clerk key (optional)
npm run dev                   # http://localhost:5173
```

## Project Structure

```
├── src/
│   ├── App.jsx               # Main app (Dashboard, AI Analyzer, Market Intel)
│   ├── main.jsx              # Entry point + Clerk auth wrapper
│   ├── index.css             # Global styles
│   ├── data/ausbildung.js    # Static dataset + scoring engine
│   └── hooks/useLiveData.js  # Fetches daily scraped data
├── public/
│   └── data/jobs.json        # Updated daily by GitHub Actions scraper
├── scraper/
│   ├── scrape.py             # Python scraper (BA API + ausbildung.de + Stepstone)
│   └── requirements.txt
├── .github/workflows/
│   └── daily-scrape.yml      # Runs scraper every day at 06:00 UTC
├── vercel.json               # Vercel deployment config
└── vite.config.js
```

## Scoring Formula

```
Score = (0.35 × Demand) + (0.25 × Acceptance) + (0.20 × InvertedCompetition)
      + (0.10 × SalaryScore) + (0.10 × GrowthPotential)
```

## Daily Scraping

The GitHub Actions workflow runs every day at 06:00 UTC:
1. Hits Bundesagentur für Arbeit official API (angebotsart=4 = Ausbildung)
2. Scrapes ausbildung.de search results
3. Scrapes Stepstone.de for volume signals
4. Commits `public/data/jobs.json` → Vercel auto-deploys in ~30s

**To trigger manually:** GitHub → Actions → Daily Ausbildung Scraper → Run workflow

**To test locally:**
```bash
pip install httpx beautifulsoup4 lxml
python scraper/scrape.py
```

## Deploy to Vercel

```bash
git add . && git commit -m "initial" && git push origin main
# Then: vercel.com → New Project → import repo
# Add env var: VITE_CLERK_PUBLISHABLE_KEY
```

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Auth:** Clerk (optional — app works without it in dev)
- **AI:** Claude API (claude-sonnet-4) for profile analyzer
- **Scraping:** Python + httpx + BeautifulSoup
- **Automation:** GitHub Actions (free tier, ~2 min/day)
- **Hosting:** Vercel
