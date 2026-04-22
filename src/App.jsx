import { useState, useMemo } from "react";
import { useLiveData } from "./hooks/useLiveData";
import {
  DATA, computeScore, LANG_ORDER, langToNum,
  scoreColor, scoreLabel, industryColor,
} from "./data/ausbildung";

/* ── FONTS ─────────────────────────────────────────────────── */
const _link = document.createElement("link");
_link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap";
_link.rel  = "stylesheet";
document.head.appendChild(_link);

/* ── CSV EXPORT ────────────────────────────────────────────── */
function exportCSV(data) {
  const headers = ["Rank","Field","Industry","Score","Demand","Acceptance","Competition","Salary Min","Salary Max","Language","Live Listings"];
  const rows    = data.map((d, i) => [
    i + 1, d.name, d.industry, d.score, d.demand, d.acceptance,
    d.competition, d.salaryMin, d.salaryMax, d.langLevel, d.liveListings ?? "N/A",
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "ausbildung-report.csv"; a.click();
  URL.revokeObjectURL(url);
}

/* ── APP ───────────────────────────────────────────────────── */
export default function App({ onLogout }) {
  const [tab, setTab]             = useState("dashboard");
  const [selectedCard, setSelectedCard] = useState(null);
  const [filters, setFilters]     = useState({ lang: "all", industry: "all", minSalary: 0, easyOnly: false, city: "all" });
  const [aiForm, setAiForm]       = useState({ age: "", lang: "A2", country: "", skills: "" });
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Live data from daily scraper
  const { liveData, lastUpdated, isLive } = useLiveData(DATA);

  const SCORED = useMemo(() =>
    liveData.map((d) => ({ ...d, score: computeScore(d) }))
            .sort((a, b) => b.score - a.score),
  [liveData]);

  const filtered = useMemo(() =>
    SCORED.filter((d) => {
      if (filters.lang !== "all" && langToNum(d.langLevel) > langToNum(filters.lang)) return false;
      if (filters.industry !== "all" && d.industry !== filters.industry) return false;
      if (d.salaryMin < filters.minSalary) return false;
      if (filters.easyOnly && d.acceptance < 75) return false;
      if (filters.city !== "all" && !d.cities.some((c) => c.toLowerCase().includes(filters.city.toLowerCase()))) return false;
      return true;
    }),
  [SCORED, filters]);

  // AI Analyzer
  async function runAI() {
    if (!aiForm.age || !aiForm.country) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a German Ausbildung career advisor. Analyze this applicant and recommend the top 3 programs from: ${SCORED.map(d => d.name).join(", ")}.

Profile:
- Age: ${aiForm.age}
- German Level: ${aiForm.lang}
- Country: ${aiForm.country}
- Skills: ${aiForm.skills || "None specified"}

Return ONLY valid JSON (no markdown, no explanation):
{
  "recommendations": [
    { "field": "...", "acceptanceChance": 85, "strategy": "...", "advantage": "..." }
  ],
  "overallStrategy": "..."
}`,
          }],
        }),
      });
      const data = await res.json();
      const text = (data.content || []).map((b) => b.text || "").join("");
      setAiResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setAiResult({ error: "Analysis failed. Check your network and try again." });
    }
    setAiLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#05050a" }}>
      {/* HEADER */}
      <header style={{
        background: "linear-gradient(180deg,#0a0a14 0%,#05050a 100%)",
        borderBottom: "1px solid #1a1a2e",
        padding: "0 32px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: 8, padding: "6px 10px", fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "#000", letterSpacing: 1 }}>AIH</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 2, color: "#f8fafc" }}>AUSBILDUNG INTELLIGENCE HUNTER</div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 3, fontFamily: "'JetBrains Mono',monospace" }}>
                GERMANY CAREER INTELLIGENCE PLATFORM
                {isLive && lastUpdated && (
                  <span style={{ marginLeft: 12, color: "#10b981" }}>
                    🟢 LIVE · {new Date(lastUpdated).toLocaleDateString("de-DE")}
                  </span>
                )}
              </div>
            </div>
          </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <nav style={{ display: "flex", gap: 4 }}>
                {[{ id: "dashboard", label: "Dashboard" }, { id: "analyzer", label: "AI Analyzer" }, { id: "market", label: "Market Intel" }].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    background: tab === t.id ? "#f59e0b15" : "transparent",
                    border: tab === t.id ? "1px solid #f59e0b44" : "1px solid transparent",
                    color: tab === t.id ? "#f59e0b" : "#64748b",
                    padding: "6px 16px", borderRadius: 6, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", transition: "all .2s",
                  }}>{t.label}</button>
                ))}
              </nav>
              {onLogout && (
                <button onClick={onLogout} style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#64748b", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Outfit',sans-serif" }}>
                  ⏻ Logout
                </button>
              )}
            </div>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 32px" }}>
        {tab === "dashboard" && (
          <Dashboard
            filtered={filtered} filters={filters} setFilters={setFilters}
            scored={SCORED} selectedCard={selectedCard} setSelectedCard={setSelectedCard}
            onExport={() => exportCSV(filtered)}
            isLive={isLive} lastUpdated={lastUpdated}
          />
        )}
        {tab === "analyzer" && (
          <Analyzer aiForm={aiForm} setAiForm={setAiForm} aiResult={aiResult} aiLoading={aiLoading} runAI={runAI} scored={SCORED} />
        )}
        {tab === "market" && <MarketIntel />}
      </main>

      {selectedCard && <DetailModal item={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
}

/* ── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ filtered, filters, setFilters, scored, selectedCard, setSelectedCard, onExport, isLive, lastUpdated }) {
  const avgAcceptance = Math.round(scored.reduce((s, d) => s + d.acceptance, 0) / scored.length);
  const topShortage   = Math.max(...scored.map(d => d.shortage));
  const totalLive     = scored.reduce((s, d) => s + (d.liveListings || 0), 0);

  return (
    <div>
      {/* LIVE DATA BANNER */}
      {isLive ? (
        <div className="fade-up" style={{ background: "#10b98110", border: "1px solid #10b98133", borderRadius: 10, padding: "10px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ fontSize: 13, color: "#10b981", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1 }}>
              LIVE DATA ACTIVE
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              — {totalLive.toLocaleString()} total job listings scraped from BA API · ausbildung.de · Stepstone
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#475569", fontFamily: "'JetBrains Mono',monospace" }}>
            Updated: {new Date(lastUpdated).toLocaleString("de-DE")}
          </span>
        </div>
      ) : (
        <div style={{ background: "#f59e0b08", border: "1px solid #f59e0b22", borderRadius: 10, padding: "10px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
          <span style={{ fontSize: 13, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace" }}>STATIC DATA</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>— Run the GitHub Actions scraper to load live listings</span>
        </div>
      )}
      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Fields Analyzed",  value: scored.length,    sub: "Ausbildung programs tracked",   icon: "📊" },
          { label: "Avg Acceptance",   value: avgAcceptance+"%", sub: "For international applicants", icon: "✅" },
          { label: "Peak Shortage",    value: topShortage+"%",  sub: "Maximum sector gap",            icon: "📈" },
          { label: "Results Showing",  value: filtered.length,  sub: "After your filters",            icon: "🎯" },
        ].map((k, i) => (
          <div key={i} className="fade-up" style={{
            background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 12, padding: "20px 24px",
            animationDelay: `${i * 0.07}s`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>{k.label.toUpperCase()}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: "#f59e0b", lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{k.sub}</div>
              </div>
              <div style={{ fontSize: 24 }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <FilterPanel filters={filters} setFilters={setFilters} />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#64748b", fontFamily: "'JetBrains Mono',monospace" }}>
              SHOWING <span style={{ color: "#f59e0b" }}>{filtered.length}</span> OF {scored.length} PROGRAMS
            </div>
            <button onClick={onExport} style={{
              background: "#f59e0b10", border: "1px solid #f59e0b44", color: "#f59e0b",
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>⬇ Export CSV</button>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div>No results match your filters — try relaxing language or salary requirements.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
              {filtered.map((item, i) => (
                <OpportunityCard
                  key={item.id} item={item}
                  rank={scored.findIndex(d => d.id === item.id) + 1}
                  delay={i * 0.05}
                  onClick={() => setSelectedCard(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* LIVE LISTINGS TABLE */}
      {isLive && (
        <div className="fade-up" style={{ marginTop: 32, background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#f1f5f9" }}>LIVE MARKET LISTINGS</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Real posting counts scraped daily · BA API + ausbildung.de + Stepstone</div>
            </div>
            <div style={{ fontSize: 13, color: "#10b981", fontFamily: "'JetBrains Mono',monospace", background: "#10b98115", border: "1px solid #10b98133", padding: "6px 16px", borderRadius: 8 }}>
              📡 {totalLive.toLocaleString()} TOTAL LISTINGS
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #1a1a2e" }}>
                  {["#", "Field", "Industry", "BA Listings", "Total Live", "Demand Score", "AIH Score"].map(h => (
                    <th key={h} style={{ padding: "8px 16px", textAlign: h === "Field" || h === "Industry" ? "left" : "center", fontSize: 10, color: "#475569", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scored.map((item, i) => {
                  const sc = scoreColor(item.score);
                  const dc = scoreColor(item.demand);
                  return (
                    <tr key={item.id}
                      style={{ borderBottom: "1px solid #1a1a2e", cursor: "pointer", transition: "background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f59e0b08"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => setSelectedCard(item)}
                    >
                      <td style={{ padding: "12px 16px", color: "#475569", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, textAlign: "center" }}>{i + 1}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{item.icon}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: "#f1f5f9" }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{item.nameEn}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: `${industryColor[item.industry] || "#f59e0b"}15`, color: industryColor[item.industry] || "#f59e0b", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{item.industry}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", color: "#06b6d4", fontWeight: 700 }}>
                        {item.baListings != null ? item.baListings.toLocaleString() : <span style={{ color: "#2a2a3e" }}>–</span>}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: "#10b981", fontSize: 14 }}>
                          {item.liveListings ? item.liveListings.toLocaleString() : <span style={{ color: "#2a2a3e" }}>pending</span>}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <div style={{ height: 6, width: 60, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${item.demand}%`, background: dc, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", color: dc, fontWeight: 700 }}>{item.demand}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ background: `${sc}15`, border: `1px solid ${sc}44`, color: sc, padding: "4px 12px", borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700 }}>{item.score}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── FILTER PANEL ──────────────────────────────────────────── */
function FilterPanel({ filters, setFilters }) {
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const inp = {
    width: "100%", background: "#0a0a14", border: "1px solid #1a1a2e",
    color: "#e2e8f0", padding: "8px 12px", borderRadius: 8,
    fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif",
  };
  return (
    <div style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 12, padding: 20, position: "sticky", top: 88, height: "fit-content" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#f59e0b", fontFamily: "'JetBrains Mono',monospace", marginBottom: 20 }}>FILTER SYSTEM</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Language */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>GERMAN LEVEL (MAX)</div>
          <select value={filters.lang} onChange={e => set("lang", e.target.value)} style={inp}>
            <option value="all">Any Level</option>
            {LANG_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        {/* Industry */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>INDUSTRY</div>
          <select value={filters.industry} onChange={e => set("industry", e.target.value)} style={inp}>
            <option value="all">All Industries</option>
            {[...new Set(DATA.map(d => d.industry))].map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        {/* Salary slider */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>MIN SALARY: €{filters.minSalary}/MO</div>
          <input type="range" min={0} max={1200} step={50} value={filters.minSalary}
            onChange={e => set("minSalary", +e.target.value)}
            style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginTop: 4 }}>
            <span>€0</span><span>€1,200</span>
          </div>
        </div>
        {/* City */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 6, fontFamily: "'JetBrains Mono',monospace" }}>CITY</div>
          <select value={filters.city} onChange={e => set("city", e.target.value)} style={inp}>
            <option value="all">All Cities</option>
            {["Berlin","Munich","Hamburg","Frankfurt","Stuttgart","Cologne"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* Easy entry toggle */}
        <button onClick={() => set("easyOnly", !filters.easyOnly)} style={{
          width: "100%", padding: "8px 12px", borderRadius: 8, cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          background: filters.easyOnly ? "#f59e0b15" : "#0a0a14",
          border: filters.easyOnly ? "1px solid #f59e0b" : "1px solid #1a1a2e",
          color: filters.easyOnly ? "#f59e0b" : "#64748b",
          transition: "all .2s",
        }}>
          {filters.easyOnly ? "✓ Easy Entry Only (>75%)" : "Show Easy Entry Only"}
        </button>
        <button onClick={() => setFilters({ lang: "all", industry: "all", minSalary: 0, easyOnly: false, city: "all" })} style={{
          width: "100%", padding: 8, borderRadius: 8, cursor: "pointer",
          background: "transparent", border: "1px solid #1a1a2e", color: "#475569", fontSize: 12,
        }}>Reset Filters</button>
      </div>
    </div>
  );
}

/* ── OPPORTUNITY CARD ──────────────────────────────────────── */
function OpportunityCard({ item, rank, delay, onClick }) {
  const color    = scoreColor(item.score);
  const indColor = industryColor[item.industry] || "#f59e0b";
  return (
    <div className="card-hover fade-up" onClick={onClick} style={{
      background: "#0d0d16", border: "1px solid #1a1a2e",
      borderRadius: 12, padding: 20, cursor: "pointer",
      animationDelay: `${delay}s`, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: rank <= 3 ? `linear-gradient(180deg,${color},transparent)` : "#1a1a2e", borderRadius: "12px 0 0 12px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>{item.icon}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{item.name}</span>
              {rank <= 3 && <span style={{ fontSize: 10, background: "#f59e0b20", color: "#f59e0b", padding: "2px 6px", borderRadius: 4, fontFamily: "'JetBrains Mono',monospace" }}>#{rank}</span>}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{item.nameEn}</div>
          </div>
        </div>
        <div className={rank <= 3 ? "score-glow" : ""} style={{ background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 72 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color, lineHeight: 1 }}>{item.score}</div>
          <div style={{ fontSize: 9, color, letterSpacing: 1, fontFamily: "'JetBrains Mono',monospace" }}>{scoreLabel(item.score)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ background: `${indColor}15`, color: indColor, fontSize: 11, padding: "3px 8px", borderRadius: 4, border: `1px solid ${indColor}33`, fontWeight: 600 }}>{item.industry}</span>
        <span style={{ marginLeft: 8, fontSize: 11, color: "#475569" }}>🗣 {item.langLevel}</span>
        {item.liveListings && <span style={{ marginLeft: 8, fontSize: 11, color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>📡 {item.liveListings.toLocaleString()} live</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {[["Demand", item.demand], ["Acceptance", item.acceptance], ["Low Competition", 100 - item.competition]].map(([label, val]) => (
          <div key={label} style={{ background: "#0a0a14", borderRadius: 8, padding: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: scoreColor(val), fontWeight: 700 }}>{val}</div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>Monthly Salary</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#10b981", fontWeight: 700 }}>€{item.salaryMin}–€{item.salaryMax}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {item.tags.map(t => <span key={t} style={{ fontSize: 10, background: "#1a1a2e", color: "#94a3b8", padding: "3px 8px", borderRadius: 4 }}>{t}</span>)}
      </div>

      {/* Quick apply links */}
      {item.links && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }} onClick={e => e.stopPropagation()}>
          {[
            { key: "ba",           label: "🏛 BA",     color: "#06b6d4" },
            { key: "ausbildungDe", label: "🎓 ausbildung.de", color: "#8b5cf6" },
            { key: "azubi",        label: "⚡ azubi.de", color: "#10b981" },
          ].filter(l => item.links[l.key]).map(l => (
            <a key={l.key} href={item.links[l.key]} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 5,
                background: `${l.color}15`, color: l.color, border: `1px solid ${l.color}33`,
                textDecoration: "none", transition: "all .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${l.color}30`}
              onMouseLeave={e => e.currentTarget.style.background = `${l.color}15`}
            >{l.label}</a>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#475569", fontStyle: "italic" }}>Click card for full analysis →</div>
    </div>
  );
}

/* ── DETAIL MODAL ──────────────────────────────────────────── */
function DetailModal({ item, onClose }) {
  const color = scoreColor(item.score);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 16, padding: 32, maxWidth: 640, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontSize: 40 }}>{item.icon}</div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, color: "#f1f5f9" }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 14 }}>{item.nameEn} · {item.industry}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#475569", fontSize: 28, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            ["Intelligence Score", `${item.score}/100`, color],
            ["Acceptance Rate",    `${item.acceptance}%`, scoreColor(item.acceptance)],
            ["Market Demand",      `${item.demand}/100`, scoreColor(item.demand)],
            ["Competition",        `${item.competition}/100`, scoreColor(100 - item.competition)],
            ["Salary Range",       `€${item.salaryMin}–€${item.salaryMax}/mo`, "#10b981"],
            ["Language Required",  item.langLevel, "#06b6d4"],
            ["Job Shortage",       `${item.shortage}%`, item.shortage >= 30 ? "#ef4444" : "#f59e0b"],
            ["Live Listings",      item.liveListings ? item.liveListings.toLocaleString() : "Pending scrape", "#10b981"],
          ].map(([label, val, c]) => (
            <div key={label} style={{ background: "#0a0a14", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>{label.toUpperCase()}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: c, fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#0a0a14", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>MARKET ANALYSIS</div>
          <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{item.description}</p>
        </div>

        {item.companiesHiring?.length > 0 && (
          <div style={{ background: "#0a0a14", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>COMPANIES HIRING NOW</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {item.companiesHiring.map(c => <span key={c} style={{ background: "#f59e0b10", border: "1px solid #f59e0b33", color: "#f59e0b", padding: "4px 12px", borderRadius: 6, fontSize: 12 }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ background: "#0a0a14", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#06b6d4", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 10 }}>TOP CITIES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(item.topCitiesLive || item.cities).map(c => <span key={c} style={{ background: "#06b6d415", border: "1px solid #06b6d433", color: "#06b6d4", padding: "4px 12px", borderRadius: 6, fontSize: 13 }}>{c}</span>)}
          </div>
        </div>

        {/* DIRECT LINKS */}
        {item.links && (
          <div style={{ background: "#0a0a14", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "#f59e0b", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 12 }}>
              🔗 APPLY DIRECTLY — JOB PORTALS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { key: "ba",          label: "🏛 Bundesagentur für Arbeit", sub: "Official German gov portal", color: "#06b6d4" },
                { key: "ausbildungDe",label: "🎓 ausbildung.de",            sub: "Largest Ausbildung platform", color: "#8b5cf6" },
                { key: "stepstone",   label: "📋 Stepstone.de",             sub: "Major job board",            color: "#f59e0b" },
                { key: "azubi",       label: "⚡ azubi.de",                  sub: "Ausbildung specialist",      color: "#10b981" },
                { key: "extra",       label: "🌐 Sector Portal",             sub: "Industry-specific listings", color: "#ec4899" },
              ].filter(l => item.links[l.key]).map(l => (
                <a key={l.key} href={item.links[l.key]} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: `${l.color}10`, border: `1px solid ${l.color}33`,
                    borderRadius: 10, padding: "12px 14px", textDecoration: "none",
                    transition: "all .2s", cursor: "pointer",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${l.color}20`; e.currentTarget.style.borderColor = `${l.color}66`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${l.color}10`; e.currentTarget.style.borderColor = `${l.color}33`; }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: l.color }}>{l.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{l.sub}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: l.color, fontSize: 16 }}>→</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── AI ANALYZER ───────────────────────────────────────────── */
function Analyzer({ aiForm, setAiForm, aiResult, aiLoading, runAI, scored }) {
  const f   = (k, v) => setAiForm(p => ({ ...p, [k]: v }));
  const inp = { width: "100%", background: "#0d0d16", border: "1px solid #1a1a2e", color: "#e2e8f0", padding: "10px 14px", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "'Outfit',sans-serif" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24, alignItems: "start" }}>
      <div className="fade-up" style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 16, padding: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#f59e0b", marginBottom: 6 }}>AI PROFILE ANALYZER</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Enter your profile for a personalized Ausbildung strategy.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["AGE", "number", "e.g. 22", "age"], ["COUNTRY OF ORIGIN", "text", "e.g. Morocco, India", "country"]].map(([label, type, ph, key]) => (
            <div key={key}>
              <label style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>{label}</label>
              <input type={type} placeholder={ph} value={aiForm[key]} onChange={e => f(key, e.target.value)} style={inp} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>GERMAN LEVEL</label>
            <select value={aiForm.lang} onChange={e => f("lang", e.target.value)} style={inp}>
              {LANG_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontFamily: "'JetBrains Mono',monospace", letterSpacing: 1, display: "block", marginBottom: 6 }}>SKILLS / BACKGROUND</label>
            <textarea placeholder="e.g. Programming, customer service..." value={aiForm.skills} onChange={e => f("skills", e.target.value)} style={{ ...inp, height: 80, resize: "vertical" }} />
          </div>
          <button onClick={runAI} disabled={aiLoading || !aiForm.age || !aiForm.country} style={{
            background: aiLoading ? "#1a1a2e" : "linear-gradient(135deg,#f59e0b,#d97706)",
            border: "none", color: aiLoading ? "#475569" : "#000",
            padding: 12, borderRadius: 10, cursor: aiLoading ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 800, letterSpacing: 1, transition: "all .2s", marginTop: 4,
          }}>{aiLoading ? "⏳ ANALYZING..." : "⚡ ANALYZE MY PROFILE"}</button>
        </div>
      </div>

      <div>
        {!aiResult && !aiLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 12 }}>
            <div style={{ fontSize: 64 }}>🤖</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 2, color: "#2a2a3e" }}>AI READY</div>
            <div style={{ fontSize: 14, color: "#1e1e2e" }}>Fill out your profile to get personalized recommendations</div>
          </div>
        )}
        {aiLoading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
            <div className="pulse" style={{ fontSize: 48 }}>🧠</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#f59e0b", letterSpacing: 2 }}>PROCESSING PROFILE...</div>
          </div>
        )}
        {aiResult?.error && <div style={{ background: "#ef444415", border: "1px solid #ef444433", borderRadius: 12, padding: 24, color: "#ef4444" }}>{aiResult.error}</div>}
        {aiResult?.recommendations && (
          <div className="fade-up">
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#f1f5f9", marginBottom: 20 }}>YOUR PERSONALIZED RECOMMENDATIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              {aiResult.recommendations.map((rec, i) => {
                const match = DATA.find(d => d.name.toLowerCase().includes(rec.field.split(" ")[0].toLowerCase()));
                const c = scoreColor(rec.acceptanceChance);
                return (
                  <div key={i} className="card-hover" style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 12, padding: 24, borderLeft: `3px solid ${c}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 28 }}>{match?.icon || "🎯"}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17, color: "#f1f5f9" }}>{rec.field}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>Recommendation #{i + 1}</div>
                        </div>
                      </div>
                      <div style={{ background: `${c}15`, border: `1px solid ${c}44`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: c, lineHeight: 1 }}>{rec.acceptanceChance}%</div>
                        <div style={{ fontSize: 9, color: c, fontFamily: "'JetBrains Mono',monospace" }}>CHANCE</div>
                      </div>
                    </div>
                    <div style={{ background: "#06b6d410", border: "1px solid #06b6d420", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: "#06b6d4", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>YOUR ADVANTAGE</div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>{rec.advantage}</div>
                    </div>
                    <div style={{ background: "#f59e0b10", border: "1px solid #f59e0b20", borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>STRATEGY</div>
                      <div style={{ fontSize: 13, color: "#94a3b8" }}>{rec.strategy}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#10b98115", border: "1px solid #10b98133", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, color: "#10b981", letterSpacing: 2, fontFamily: "'JetBrains Mono',monospace", marginBottom: 8 }}>OVERALL STRATEGY</div>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8 }}>{aiResult.overallStrategy}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── MARKET INTEL ──────────────────────────────────────────── */
function MarketIntel() {
  const sectors = [
    { name: "Healthcare & Nursing",    shortage: 42, trend: "+8% YoY",  icon: "🏥", status: "CRITICAL", color: "#ef4444" },
    { name: "Construction & Trades",   shortage: 36, trend: "+5% YoY",  icon: "🏗️", status: "SEVERE",   color: "#f97316" },
    { name: "Electronics & Energy",    shortage: 34, trend: "+9% YoY",  icon: "⚡", status: "SEVERE",   color: "#f97316" },
    { name: "Logistics & Warehousing", shortage: 33, trend: "+11% YoY", icon: "📦", status: "SEVERE",   color: "#f97316" },
    { name: "Information Technology",  shortage: 31, trend: "+14% YoY", icon: "💻", status: "HIGH",     color: "#f59e0b" },
    { name: "Industrial Mechanics",    shortage: 27, trend: "+4% YoY",  icon: "🔧", status: "HIGH",     color: "#f59e0b" },
    { name: "Automotive",              shortage: 25, trend: "+3% YoY",  icon: "🚗", status: "MODERATE", color: "#06b6d4" },
    { name: "Hospitality",             shortage: 22, trend: "+6% YoY",  icon: "🏨", status: "MODERATE", color: "#06b6d4" },
  ];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div className="fade-up" style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 16, padding: 28 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#ef4444", marginBottom: 4 }}>CRITICAL SHORTAGE ALERT</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Sectors with &gt;30% workforce shortage</div>
          {sectors.filter(s => s.shortage >= 30).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: s.color, fontWeight: 700 }}>{s.shortage}%</span>
                </div>
                <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${s.shortage}%`, background: `linear-gradient(90deg,${s.color},${s.color}88)`, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fade-up" style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 16, padding: 28, animationDelay: "0.1s" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#f59e0b", marginBottom: 4 }}>MARKET TRENDS 2024–2025</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Year-over-year workforce gap acceleration</div>
          {sectors.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1a1a2e" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 13 }}>{s.name}</span>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 11, background: `${s.color}15`, color: s.color, padding: "2px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono',monospace" }}>{s.status}</span>
                <span style={{ fontSize: 12, color: "#10b981", fontFamily: "'JetBrains Mono',monospace" }}>{s.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up" style={{ animationDelay: "0.2s" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: "#f1f5f9", marginBottom: 16 }}>KEY INTELLIGENCE INSIGHTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { icon: "🇩🇪", title: "Demographic Crisis",    body: "Germany needs 400,000+ skilled workers annually through 2030. Baby boomer retirements creating structural, permanent gaps in every traded sector." },
            { icon: "🌍", title: "International Advantage", body: "New Fachkräfteeinwanderungsgesetz (2023) streamlined international applicant pathways. Healthcare and construction actively sponsor international trainees." },
            { icon: "📈", title: "IT Sector Explosion",     body: "Germany's digital transformation is accelerating. Fachinformatiker graduates have near-100% employment rates and fastest salary growth post-Ausbildung." },
          ].map((ins, i) => (
            <div key={i} style={{ background: "#0d0d16", border: "1px solid #1a1a2e", borderRadius: 12, padding: 22 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{ins.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", marginBottom: 8 }}>{ins.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{ins.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}