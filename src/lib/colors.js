// ─── SINGLE SOURCE OF TRUTH FOR ALL COLORS ───────────────────────────────────
// Every component imports from here. Change once, updates everywhere.

export const ATTACK_COLORS = {
  Ransomware:      "#ec4899",
  "Data Breach":   "#a855f7",
  APT:             "#ef4444",
  Phishing:        "#f59e0b",
  Malware:         "#06b6d4",
  DDoS:            "#f97316",
  "Supply Chain":  "#8b5cf6",
  Credential:      "#10b981",
  "Zero-Day":      "#e11d48",
  Wiper:           "#dc2626",
};

export const SECTOR_COLORS = {
  Finance:         "#fcd34d",
  Healthcare:      "#f9a8d4",
  Energy:          "#fb923c",
  Government:      "#93c5fd",
  Retail:          "#86efac",
  Telecom:         "#d8b4fe",
  Defence:         "#fca5a5",
  Transport:       "#6ee7b7",
  Education:       "#67e8f9",
  Media:           "#fda4af",
  Technology:      "#c4b5fd",
};

export const SEVERITY_COLORS = {
  Critical: "#ef4444",
  High:     "#f97316",
  Medium:   "#eab308",
  Low:      "#22c55e",
};

export const SEVERITY_BG = {
  Critical: "rgba(239,68,68,0.15)",
  High:     "rgba(249,115,22,0.15)",
  Medium:   "rgba(234,179,8,0.15)",
  Low:      "rgba(34,197,94,0.15)",
};

// Financial loss per org (M USD) — drives severity on globe
export const ORG_LOSS = {
  "Colonial Pipeline":    4400,
  "Change Healthcare":    870,
  "Kaseya VSA":          900,
  "SolarWinds":          350,
  "Equifax":             575,
  "CNA Financial":       400,
  "AT&T Snowflake":      240,
  "JPMorgan Chase":      198,
  "MITRE Corporation":   180,
  "Ascension Health":    150,
  "ICBC Bank":           445,
  "Saudi Aramco":        680,
  "Maersk Shipping":     300,
  "CDK Global":          600,
  "MGM Resorts":         100,
  "Medibank":            250,
  "RSA Security":        66,
  "Lockheed Martin":     120,
  "Bank of America":     235,
  "Microsoft Exchange":  120,
  "CNA Financial":       400,
  "Twitter/X Corp":      220,
  "Apple Inc":           310,
  "Sony Pictures":       100,
  "NY Presbyterian":     88,
  "NHS England":         92,
  "Deutsche Bank":       145,
  "Renault-Nissan":      65,
  "AIIMS Delhi":         45,
  "Toyota Supply Chain": 88,
  "Ukrainian Power Grid":175,
  "Natanz (Stuxnet)":    0,
  default:               50,
};

// Thresholds tuned so ~25% of orgs land in each tier across the ORGS dataset
export const getOrgSeverity = (loss) => {
  if (loss >= 350) return "Critical";   // ~25%: Colonial, Kaseya, CDK, Aramco, ICBC, Equifax…
  if (loss >= 100) return "High";       // ~25%: JPMorgan, AT&T, Apple, Twitter, Medibank…
  if (loss >= 45)  return "Medium";     // ~25%: LAUSD, NY Pres, RSA, AIIMS, Toyota, NHS…
  return "Low";                         // ~25%: Twilio, Rheinmetall, Renault, Natanz, BAE…
};
