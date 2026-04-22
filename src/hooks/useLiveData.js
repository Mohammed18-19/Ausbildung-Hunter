// Fetches /data/jobs.json committed daily by GitHub Actions
// and merges live listing counts into the static dataset.

import { useState, useEffect } from "react";

export function useLiveData(staticData) {
  const [liveData, setLiveData]       = useState(staticData);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isLive, setIsLive]           = useState(false);

  useEffect(() => {
    async function fetchLive() {
      try {
        const ts  = Math.floor(Date.now() / 3_600_000); // cache bust hourly
        const res = await fetch(`/data/jobs.json?v=${ts}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json.fields || json.fields.length === 0) return;

        const merged = staticData.map((item) => {
          const live = json.fields.find((f) => f.id === item.id);
          if (!live) return item;
          return {
            ...item,
            demand:          live.demand_score > 0 ? live.demand_score : item.demand,
            liveListings:    live.total_listings,
            baListings:      live.ba_listings,
            topCitiesLive:   live.top_cities?.length ? live.top_cities : item.cities,
            companiesHiring: live.companies_hiring || [],
            dataSource:      "live",
          };
        });

        setLiveData(merged);
        setLastUpdated(json.scraped_at);
        setIsLive(true);
      } catch (err) {
        console.warn("Live data unavailable, using static dataset:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLive();
  }, []);

  return { liveData, lastUpdated, loading, isLive };
}
