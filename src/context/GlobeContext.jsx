import { createContext, useContext, useState, useCallback } from "react";

const GlobeContext = createContext(null);

export function GlobeProvider({ children }) {
  // ── Globe state ──────────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear]       = useState(2025);
  const [yearRange, setYearRange]             = useState([2001, 2025]);
  const [isSliderDragging, setSliderDragging] = useState(false);

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState]     = useState(null);
  const [selectedOrg, setSelectedOrg]         = useState(null);
  const [hoveredOrg, setHoveredOrg]           = useState(null);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [activeSectors, setActiveSectors]   = useState(new Set(["Finance","Healthcare","Energy","Government","Retail","Telecom","Defence","Transport","Education","Media","Technology"]));
  const [activeAttacks, setActiveAttacks]   = useState(new Set(["Ransomware","Data Breach","APT","Phishing","Malware","DDoS","Supply Chain","Credential","Zero-Day","Wiper"]));
  const [activeRegions, setActiveRegions]   = useState(new Set(["Americas","EMEA","Oceania","Asia"]));
  const [activeSeverity, setActiveSeverity] = useState(new Set(["Critical","High","Medium","Low"]));

  // ── Right panel state ────────────────────────────────────────────────────
  // "sectors" | "attacks" | "regions" | "timeline" | null
  const [rightPanel, setRightPanel]         = useState(null);
  const [rightPanelData, setRightPanelData] = useState(null); // extra context

  // ── View state (what replaces the globe) ────────────────────────────────
  // "globe" | "trends" | "threatgraph"
  const [activeView, setActiveView]         = useState("globe");
  const [threatGraphCountry, setThreatGraphCountry] = useState("US");

  // ── Active filter chip (drives right panel heading) ──────────────────────
  const [activePanelSource, setActivePanelSource] = useState(null); // { group, key }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const openRightPanel = useCallback((type, source, data) => {
    setRightPanel(type);
    setActivePanelSource(source);
    if (data) setRightPanelData(data);
  }, []);

  const closeRightPanel = useCallback(() => {
    setRightPanel(null);
    setActivePanelSource(null);
    setRightPanelData(null);
  }, []);

  // Smart toggle: all-on → isolate; only-one → restore all; else normal
  const smartToggle = useCallback((setter, key, allKeys) => {
    setter(prev => {
      const next = new Set(prev);
      const allOn = allKeys.every(k => next.has(k));
      const onlyThis = next.has(key) && next.size === 1;
      if (allOn) {
        allKeys.forEach(k => next.delete(k));
        next.add(key);
      } else if (onlyThis) {
        allKeys.forEach(k => next.add(k));
      } else {
        next.has(key) ? next.delete(key) : next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <GlobeContext.Provider value={{
      selectedYear, setSelectedYear,
      yearRange, setYearRange,
      isSliderDragging, setSliderDragging,
      selectedCountry, setSelectedCountry,
      selectedState, setSelectedState,
      selectedOrg, setSelectedOrg,
      hoveredOrg, setHoveredOrg,
      activeSectors, setActiveSectors,
      activeAttacks, setActiveAttacks,
      activeRegions, setActiveRegions,
      activeSeverity, setActiveSeverity,
      rightPanel, rightPanelData,
      activePanelSource,
      openRightPanel, closeRightPanel,
      activeView, setActiveView,
      threatGraphCountry, setThreatGraphCountry,
      smartToggle,
    }}>
      {children}
    </GlobeContext.Provider>
  );
}

export const useGlobe = () => {
  const ctx = useContext(GlobeContext);
  if (!ctx) throw new Error("useGlobe must be used inside GlobeProvider");
  return ctx;
};
