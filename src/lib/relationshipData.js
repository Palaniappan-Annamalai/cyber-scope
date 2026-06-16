import { usaCyberThreats, attackColors, COUNTRY_THREATS } from "./cyberData";

// ── ATTACKER GROUPS ──────────────────────────────────────────────────────────
export const attackerGroups = [
  { id: "lazarus",       label: "Lazarus Group",        origin: "North Korea", type: "Nation-State",  color: "#ef4444", attacks: ["Ransomware","Wiper","Data Breach"] },
  { id: "apt29",         label: "APT29 / Cozy Bear",    origin: "Russia",      type: "Nation-State",  color: "#f97316", attacks: ["APT","Supply Chain","Phishing"] },
  { id: "apt41",         label: "APT41",                origin: "China",       type: "Nation-State",  color: "#eab308", attacks: ["APT","Zero-Day","Supply Chain"] },
  { id: "sandworm",      label: "Sandworm",             origin: "Russia",      type: "Nation-State",  color: "#f43f5e", attacks: ["Wiper","Ransomware","DDoS"] },
  { id: "alphv",         label: "ALPHV / BlackCat",     origin: "Unknown",     type: "RaaS Group",    color: "#ec4899", attacks: ["Ransomware"] },
  { id: "cl0p",          label: "Cl0p",                 origin: "Russia",      type: "RaaS Group",    color: "#d946ef", attacks: ["Ransomware","Supply Chain"] },
  { id: "revil",         label: "REvil / Sodinokibi",   origin: "Russia",      type: "RaaS Group",    color: "#a855f7", attacks: ["Ransomware","Supply Chain"] },
  { id: "scattered",     label: "Scattered Spider",     origin: "Unknown",     type: "Cybercrime",    color: "#8b5cf6", attacks: ["Phishing","Credential","Ransomware"] },
  { id: "saltTyphoon",   label: "Salt Typhoon",         origin: "China",       type: "Nation-State",  color: "#06b6d4", attacks: ["APT","Data Breach"] },
  { id: "voltTyphoon",   label: "Volt Typhoon",         origin: "China",       type: "Nation-State",  color: "#0ea5e9", attacks: ["APT"] },
  { id: "iab",           label: "Initial Access Brokers", origin: "Various",   type: "Cybercrime",    color: "#10b981", attacks: ["Credential","Phishing"] },
  { id: "medusa",        label: "Medusa / RaaS Groups", origin: "Various",     type: "RaaS Group",    color: "#84cc16", attacks: ["Ransomware"] },
];

// ── INCIDENTS with attacker assignments ──────────────────────────────────────
export const enrichedIncidents = usaCyberThreats.map(inc => {
  let attacker = "unknown";
  const t = inc.threat.toLowerCase();
  const o = (inc.origin || "").toLowerCase();
  if (o.includes("north korea") || t.includes("wannacry") || t.includes("lazarus")) attacker = "lazarus";
  else if (o.includes("apt29") || t.includes("solarwinds") || o.includes("cozy bear")) attacker = "apt29";
  else if (o.includes("china-linked apt") || t.includes("aurora") || t.includes("opm") || t.includes("proxylogon")) attacker = "apt41";
  else if (o.includes("salt typhoon")) attacker = "saltTyphoon";
  else if (o.includes("volt typhoon")) attacker = "voltTyphoon";
  else if (o.includes("sandworm") || t.includes("notpetya")) attacker = "sandworm";
  else if (o.includes("alphv") || t.includes("change healthcare") || t.includes("alphv")) attacker = "alphv";
  else if (o.includes("cl0p") || t.includes("moveit")) attacker = "cl0p";
  else if (o.includes("scattered spider") || t.includes("mgm")) attacker = "scattered";
  else if (t.includes("kaseya") || t.includes("colonial") || t.includes("jbs") || t.includes("revil")) attacker = "revil";
  else if (o.includes("medusa")) attacker = "medusa";
  else if (o.includes("initial access")) attacker = "iab";
  return { ...inc, attacker };
});

// Factory: enrich any country's incidents with attacker assignments
export function enrichIncidentsForCountry(iso) {
  const getter = COUNTRY_THREATS[iso];
  const incidents = getter ? getter() : usaCyberThreats;
  return incidents.map(inc => {
    let attacker = "unknown";
    const t = (inc.threat || "").toLowerCase();
    const o = (inc.origin || "").toLowerCase();
    if (o.includes("north korea") || o.includes("lazarus") || t.includes("wannacry") || t.includes("lazarus")) attacker = "lazarus";
    else if (o.includes("apt29") || o.includes("cozy bear") || t.includes("solarwinds")) attacker = "apt29";
    else if (o.includes("china-linked") || o.includes("apt41") || t.includes("aurora") || t.includes("proxylogon")) attacker = "apt41";
    else if (o.includes("salt typhoon")) attacker = "saltTyphoon";
    else if (o.includes("volt typhoon")) attacker = "voltTyphoon";
    else if (o.includes("sandworm") || t.includes("notpetya")) attacker = "sandworm";
    else if (o.includes("alphv") || t.includes("change healthcare")) attacker = "alphv";
    else if (o.includes("cl0p") || t.includes("moveit")) attacker = "cl0p";
    else if (o.includes("scattered spider") || t.includes("mgm")) attacker = "scattered";
    else if (o.includes("revil") || t.includes("kaseya") || t.includes("colonial")) attacker = "revil";
    else if (o.includes("medusa")) attacker = "medusa";
    else if (o.includes("initial access")) attacker = "iab";
    return { ...inc, attacker };
  });
}

// ── GLOBAL EVENTS → CYBER IMPACT ─────────────────────────────────────────────
export const globalEvents = [
  {year:2001,event:"9/11 & Early Cyber Mobilisation",surge:"Nation-state cyber programs accelerate",attackTypes:["Malware","DDoS"],targets:["Government","Technology"],actors:["Unknown state actors"],color:"#ef4444",icon:"💥",incidents:[1,2,4]},
  {year:2003,event:"SQL Slammer & Worm Era",surge:"Internet-wide infrastructure disruption",attackTypes:["Malware","DDoS"],targets:["Technology","Finance"],actors:["Unknown criminal operators"],color:"#f97316",icon:"🐛",incidents:[8,9,10]},
  {year:2007,event:"Estonia Nation-State DDoS",surge:"First coordinated state-on-state cyberattack",attackTypes:["DDoS","APT"],targets:["Government","Media"],actors:["Russia-linked actors"],color:"#eab308",icon:"🌐",incidents:[21,23]},
  {year:2009,event:"Operation Aurora",surge:"State-sponsored espionage enters the corporate sphere",attackTypes:["APT","Zero-Day"],targets:["Technology","Defence"],actors:["China-linked APT (Comment Crew)"],color:"#a855f7",icon:"🎯",incidents:[27,28]},
  {year:2010,event:"Stuxnet & Industrial Warfare",surge:"First ICS-targeting malware deployed in the wild",attackTypes:["Zero-Day","Malware"],targets:["Energy","Government"],actors:["US/Israel (Equation Group)"],color:"#06b6d4",icon:"⚙️",incidents:[30,31]},
  {year:2011,event:"RSA & Sony PSN Breaches",surge:"Spear phishing and mass credential theft go mainstream",attackTypes:["Phishing","Data Breach"],targets:["Defence","Media"],actors:["State-linked actors","Cybercriminals"],color:"#ec4899",icon:"🔐",incidents:[33,34,35]},
  {year:2013,event:"Snowden & Target POS",surge:"Mass surveillance exposed; retail POS attacks surge",attackTypes:["APT","Data Breach"],targets:["Government","Retail"],actors:["NSA (disclosed)","Eastern European cybercriminals"],color:"#8b5cf6",icon:"👁️",incidents:[40,41,42]},
  {year:2014,event:"Sony Pictures & iCloud",surge:"Destructive nation-state attacks enter corporate world",attackTypes:["Wiper","Data Breach"],targets:["Media","Finance"],actors:["Lazarus Group","Cybercriminals"],color:"#ef4444",icon:"💣",incidents:[44,45,46]},
  {year:2015,event:"OPM & Anthem Mega Breaches",surge:"Largest US government data theft in history",attackTypes:["APT","Data Breach"],targets:["Government","Healthcare"],actors:["China-linked APT","Cybercriminals"],color:"#f97316",icon:"🏛️",incidents:[49,50,51]},
  {year:2016,event:"US Election Interference & Mirai",surge:"State influence operations and IoT weaponisation",attackTypes:["APT","DDoS","Phishing"],targets:["Government","Technology"],actors:["APT28/APT29 (Russia)","Botnet operators"],color:"#ec4899",icon:"🗳️",incidents:[54,55,56,57]},
  {year:2017,event:"WannaCry & NotPetya Pandemic",surge:"Global ransomware and wiper attacks cause $10B+ damage",attackTypes:["Ransomware","Wiper","Malware"],targets:["Healthcare","Technology","Transport"],actors:["Lazarus Group","Sandworm (Russia)"],color:"#ef4444",icon:"💀",incidents:[58,59,60]},
  {year:2018,event:"SamSam & GDPR Era",surge:"Ransomware targets municipalities; privacy regulation begins",attackTypes:["Ransomware","Data Breach"],targets:["Government","Healthcare","Retail"],actors:["SamSam group","Cybercriminals"],color:"#f59e0b",icon:"🏙️",incidents:[63,64,65]},
  {year:2019,event:"Ransomware-as-a-Service Boom",surge:"RaaS democratises ransomware; municipal attacks surge",attackTypes:["Ransomware","Credential"],targets:["Government","Finance"],actors:["REvil","Maze","GandCrab"],color:"#ec4899",icon:"💰",incidents:[68,69,70]},
  {year:2020,event:"COVID-19 & SolarWinds",surge:"Pandemic exploited; largest supply chain attack in history",attackTypes:["Supply Chain","APT","Phishing","Ransomware"],targets:["Government","Healthcare","Technology"],actors:["APT29/Cozy Bear","Multiple cybercrime groups"],color:"#06b6d4",icon:"🦠",incidents:[73,74,75,76]},
  {year:2021,event:"Colonial Pipeline & Kaseya",surge:"Critical infrastructure ransomware becomes national crisis",attackTypes:["Ransomware","Supply Chain","Zero-Day"],targets:["Energy","Technology","Government"],actors:["DarkSide","REvil","APT41"],color:"#fbbf24",icon:"⚡",incidents:[78,79,80,81,82]},
  {year:2022,event:"Russia–Ukraine Cyber War",surge:"Nation-state wiper campaigns; hacktivism surges",attackTypes:["Wiper","DDoS","Ransomware","Data Breach"],targets:["Government","Energy","Telecom"],actors:["Sandworm","Gamaredon","Anonymous (hacktivist)"],color:"#fbbf24",icon:"⚔️",incidents:[85,86,87,88]},
  {year:2023,event:"MOVEit & AI Boom",surge:"Mass supply-chain exploitation; AI-assisted cybercrime rises",attackTypes:["Supply Chain","Ransomware","Data Breach"],targets:["Technology","Retail","Healthcare"],actors:["Cl0p","Scattered Spider","ALPHV"],color:"#8b5cf6",icon:"🤖",incidents:[92,93,94,95,96]},
  {year:2024,event:"Salt Typhoon & Change Healthcare",surge:"Telecom espionage; healthcare billing system collapse",attackTypes:["APT","Ransomware","Data Breach"],targets:["Telecom","Healthcare","Retail"],actors:["Salt Typhoon (China)","ALPHV/BlackCat","ShinyHunters"],color:"#f43f5e",icon:"🌊",incidents:[100,101,102,103,104]},
  {year:2025,event:"AI-Powered Attacks & RaaS Peak",surge:"LLM-driven phishing; critical infrastructure ransomware peaks",attackTypes:["Phishing","Ransomware","APT","Supply Chain"],targets:["Finance","Energy","Defence","Technology"],actors:["Medusa","RansomHub","AI-augmented groups","Nation-state APTs"],color:"#ec4899",icon:"🚀",incidents:[109,110,111,112,113,114]},
];



export { attackColors };