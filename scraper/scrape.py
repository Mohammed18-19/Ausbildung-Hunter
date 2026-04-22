"""
Ausbildung Intelligence Hunter — Daily Scraper
Sources:
  1. Bundesagentur für Arbeit API  (primary — official, no auth needed)
  2. ausbildung.de                 (secondary — listing counts + employers)
  3. Stepstone.de                  (tertiary  — volume signal)
Output: public/data/jobs.json
"""

import httpx
import json
import time
import random
import re
import logging
from datetime import datetime, timezone
from pathlib import Path
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s")
log = logging.getLogger(__name__)

OUTPUT = Path(__file__).parent.parent / "public" / "data" / "jobs.json"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

FIELDS = [
    {"id": 1,  "name": "Pflegefachmann",         "ba_query": "Pflegefachmann",               "site_slug": "pflegefachmann"},
    {"id": 2,  "name": "Fachinformatiker",        "ba_query": "Fachinformatiker",             "site_slug": "fachinformatiker"},
    {"id": 3,  "name": "Mechatroniker",           "ba_query": "Mechatroniker",                "site_slug": "mechatroniker"},
    {"id": 4,  "name": "Elektroniker",            "ba_query": "Elektroniker",                 "site_slug": "elektroniker"},
    {"id": 5,  "name": "Industriemechaniker",     "ba_query": "Industriemechaniker",          "site_slug": "industriemechaniker"},
    {"id": 6,  "name": "Fachkraft Lagerlogistik", "ba_query": "Fachkraft für Lagerlogistik",  "site_slug": "fachkraft-lagerlogistik"},
    {"id": 7,  "name": "Altenpflege",             "ba_query": "Altenpfleger",                 "site_slug": "altenpfleger"},
    {"id": 8,  "name": "Kfz-Mechatroniker",       "ba_query": "Kfz-Mechatroniker",            "site_slug": "kfz-mechatroniker"},
    {"id": 9,  "name": "Hotelfachmann",           "ba_query": "Hotelfachmann",                "site_slug": "hotelfachmann"},
    {"id": 10, "name": "Bau / Maurer",            "ba_query": "Maurer",                       "site_slug": "maurer"},
    {"id": 11, "name": "Tiefbaufacharbeiter",     "ba_query": "Tiefbaufacharbeiter",          "site_slug": "tiefbaufacharbeiter"},
    {"id": 12, "name": "Bauzeichner",             "ba_query": "Bauzeichner",                  "site_slug": "bauzeichner"},
]

# ─────────────────────────────────────────────────────────────
# SOURCE 1: Bundesagentur für Arbeit (official REST API)
# ─────────────────────────────────────────────────────────────
def fetch_ba(query: str, client: httpx.Client) -> dict:
    url = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs"
    params = {"angebotsart": 4, "was": query, "pav": "false", "page": 1, "size": 5}
    try:
        r = client.get(url, params=params,
                       headers={**HEADERS, "X-API-Key": "jobboerse-jobsuche"},
                       timeout=15)
        r.raise_for_status()
        data  = r.json()
        total = data.get("maxErgebnisse", 0)
        cities = [
            j.get("arbeitsort", {}).get("ort", "")
            for j in (data.get("stellenangebote") or [])[:5]
            if j.get("arbeitsort", {}).get("ort")
        ]
        log.info(f"  BA       [{query}] → {total}")
        return {"count": total, "cities": cities}
    except Exception as e:
        log.warning(f"  BA       [{query}] FAILED: {e}")
        return {"count": 0, "cities": []}

# ─────────────────────────────────────────────────────────────
# SOURCE 2: ausbildung.de search
# ─────────────────────────────────────────────────────────────
def fetch_ausbildung_de(slug: str, client: httpx.Client) -> dict:
    url = f"https://www.ausbildung.de/suche/?q={slug}&location=Deutschland"
    try:
        r = client.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()
        soup  = BeautifulSoup(r.text, "lxml")
        count = 0
        for sel in ["[data-testid='result-count']", ".results-count", ".search-results-count", "h1"]:
            el = soup.select_one(sel)
            if el:
                nums = re.findall(r"\d+", el.get_text().replace(".", "").replace(",", ""))
                if nums:
                    count = int(nums[0])
                    break
        companies = [
            el.get_text(strip=True)
            for el in soup.select(".company-name,.employer-name,[data-testid='company-name']")[:6]
        ]
        log.info(f"  ausb.de  [{slug}] → {count}")
        return {"count": count, "companies": companies}
    except Exception as e:
        log.warning(f"  ausb.de  [{slug}] FAILED: {e}")
        return {"count": 0, "companies": []}

# ─────────────────────────────────────────────────────────────
# SOURCE 3: Stepstone
# ─────────────────────────────────────────────────────────────
def fetch_stepstone(query: str, client: httpx.Client) -> dict:
    slug = query.lower().replace(" ", "-").replace("ü", "ue").replace("ä", "ae").replace("ö", "oe")
    url  = f"https://www.stepstone.de/jobs/ausbildung-{slug}/in-deutschland"
    try:
        r = client.get(url, headers=HEADERS, timeout=15, follow_redirects=True)
        r.raise_for_status()
        soup  = BeautifulSoup(r.text, "lxml")
        count = 0
        for el in soup.select("[data-testid='search-results-count'],.resultlist-0iFkw__count"):
            nums = re.findall(r"\d+", el.get_text().replace(".", ""))
            if nums:
                count = int(nums[0])
                break
        log.info(f"  stepstone[{query}] → {count}")
        return {"count": count}
    except Exception as e:
        log.warning(f"  stepstone[{query}] FAILED: {e}")
        return {"count": 0}

# ─────────────────────────────────────────────────────────────
# SCORING
# ─────────────────────────────────────────────────────────────
def to_demand_score(ba_count: int) -> int:
    if ba_count <= 0: return 0
    return max(10, min(100, int(ba_count / 50)))  # 5000 postings → 100

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def load_previous():
    if OUTPUT.exists():
        try: return json.loads(OUTPUT.read_text())
        except: pass
    return {"fields": []}

def main():
    log.info("=" * 55)
    log.info("Ausbildung Intelligence Hunter — Daily Scrape")
    log.info(f"UTC: {datetime.now(timezone.utc).isoformat()}")
    log.info("=" * 55)

    previous = load_previous()
    results, failed = [], []

    with httpx.Client(follow_redirects=True, timeout=20) as client:
        for i, field in enumerate(FIELDS):
            log.info(f"\n[{i+1}/{len(FIELDS)}] {field['name']}")
            if i > 0:
                time.sleep(random.uniform(1.5, 3.0))

            ba        = fetch_ba(field["ba_query"], client)
            time.sleep(random.uniform(0.8, 1.5))
            site      = fetch_ausbildung_de(field["site_slug"], client)
            time.sleep(random.uniform(0.8, 1.5))
            stepstone = fetch_stepstone(field["ba_query"], client)

            if ba["count"] == 0 and site["count"] == 0:
                prev = next((f for f in previous.get("fields", []) if f["id"] == field["id"]), None)
                if prev:
                    results.append(prev)
                    failed.append(field["name"])
                    log.warning(f"  → using cached data for {field['name']}")
                    continue

            record = {
                "id":              field["id"],
                "name":            field["name"],
                "demand_score":    to_demand_score(ba["count"]),
                "total_listings":  ba["count"] + site["count"] + stepstone["count"],
                "ba_listings":     ba["count"],
                "ausbildung_de":   site["count"],
                "stepstone":       stepstone["count"],
                "top_cities":      list(dict.fromkeys(ba["cities"]))[:6],
                "companies_hiring": site.get("companies", []),
                "scraped_at":      datetime.now(timezone.utc).isoformat(),
            }
            results.append(record)
            log.info(f"  ✓ demand_score={record['demand_score']}  total={record['total_listings']}")

    payload = {
        "scraped_at":   datetime.now(timezone.utc).isoformat(),
        "total_fields": len(results),
        "failed":       failed,
        "status":       "partial" if failed else "success",
        "fields":       sorted(results, key=lambda x: x["demand_score"], reverse=True),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    log.info(f"\n✅ Saved {len(results)} fields → {OUTPUT}")
    log.info(f"   Failed: {failed or 'none'}")

if __name__ == "__main__":
    main()