// globeEngine.js — Full D3 canvas globe, optimized with rAF, dirty flag, gradient cache
// Called from GlobeCanvas after D3 + TopoJSON load

import { ATTACK_COLORS, SECTOR_COLORS, SEVERITY_COLORS, SEVERITY_BG, ORG_LOSS, getOrgSeverity } from "./colors";

const REGIONS_MAP = {
  US:"Americas",CA:"Americas",BR:"Americas",MX:"Americas",AR:"Americas",CR:"Americas",
  GB:"EMEA",DE:"EMEA",FR:"EMEA",PT:"EMEA",DK:"EMEA",NO:"EMEA",UA:"EMEA",SA:"EMEA",
  AE:"EMEA",ZA:"EMEA",IT:"EMEA",ES:"EMEA",NL:"EMEA",SE:"EMEA",PL:"EMEA",TR:"EMEA",IL:"EMEA",
  AU:"Oceania",NZ:"Oceania",
  CN:"Asia",JP:"Asia",KR:"Asia",IN:"Asia",TW:"Asia",SG:"Asia",IR:"Asia",ID:"Asia",KP:"Asia",
};

const ISO_NAMES = {
  US:"United States",GB:"United Kingdom",DE:"Germany",FR:"France",RU:"Russia",CN:"China",
  JP:"Japan",IN:"India",AU:"Australia",CA:"Canada",BR:"Brazil",KR:"South Korea",
  SA:"Saudi Arabia",UA:"Ukraine",AE:"UAE",ZA:"South Africa",NO:"Norway",DK:"Denmark",
  PT:"Portugal",NL:"Netherlands",IT:"Italy",MX:"Mexico",AR:"Argentina",CR:"Costa Rica",
  SG:"Singapore",TW:"Taiwan",IR:"Iran",KP:"North Korea",TR:"Turkey",IL:"Israel",
  SE:"Sweden",PL:"Poland",ID:"Indonesia",ES:"Spain",
};

const FIPS = {
  "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC",
  "12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY",
  "22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT",
  "31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH",
  "40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT",
  "50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY",
};

const ST_NAME = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",DC:"DC Metro",FL:"Florida",GA:"Georgia",HI:"Hawaii",
  ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",
  TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",
  WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

const N2I = {
  4:"AF",8:"AL",12:"DZ",24:"AO",32:"AR",36:"AU",40:"AT",50:"BD",56:"BE",68:"BO",76:"BR",
  100:"BG",116:"KH",124:"CA",152:"CL",156:"CN",170:"CO",188:"CR",191:"HR",203:"CZ",208:"DK",
  218:"EC",818:"EG",231:"ET",246:"FI",250:"FR",276:"DE",288:"GH",300:"GR",356:"IN",360:"ID",
  364:"IR",372:"IE",376:"IL",380:"IT",392:"JP",398:"KZ",404:"KE",408:"KP",410:"KR",484:"MX",
  528:"NL",554:"NZ",566:"NG",578:"NO",586:"PK",616:"PL",620:"PT",642:"RO",643:"RU",682:"SA",
  710:"ZA",724:"ES",144:"LK",752:"SE",756:"CH",792:"TR",804:"UA",784:"AE",826:"GB",840:"US",
  858:"UY",704:"VN",158:"TW",
};

// ── ACTORS ───────────────────────────────────────────────────────────────────
export const ACTORS = [
  {id:"TA1", name:"Lazarus Group",      iso:"KP", lat:39.0, lng:125.7, color:"#ef4444"},
  {id:"TA2", name:"APT29 / Cozy Bear",  iso:"RU", lat:55.75,lng:37.61, color:"#f97316"},
  {id:"TA3", name:"Sandworm Team",       iso:"RU", lat:56.1, lng:37.5,  color:"#fbbf24"},
  {id:"TA4", name:"DarkSide/ALPHV",      iso:"RU", lat:56.3, lng:37.8,  color:"#ec4899"},
  {id:"TA5", name:"REvil / LockBit",     iso:"RU", lat:55.8, lng:37.7,  color:"#a855f7"},
  {id:"TA6", name:"Hafnium / APT40",     iso:"CN", lat:39.91,lng:116.5, color:"#eab308"},
  {id:"TA7", name:"LockBit 3.0",         iso:"RU", lat:55.6, lng:37.9,  color:"#8b5cf6"},
  {id:"TA8", name:"Volt Typhoon",        iso:"CN", lat:39.9, lng:116.4, color:"#06b6d4"},
  {id:"TA9", name:"Comment Crew",        iso:"CN", lat:31.2, lng:121.5, color:"#0ea5e9"},
  {id:"TA10",name:"Equation Group",      iso:"US", lat:38.9, lng:-77.0, color:"#10b981"},
  {id:"TA11",name:"MuddyWater",          iso:"IR", lat:35.7, lng:51.4,  color:"#f43f5e"},
  {id:"TA12",name:"Cl0p",               iso:"RU", lat:55.7, lng:37.62, color:"#d946ef"},
  {id:"TA13",name:"FIN7",               iso:"RU", lat:55.7, lng:37.6,  color:"#84cc16"},
  {id:"TA14",name:"Fancy Bear (APT28)", iso:"RU", lat:55.9, lng:37.5,  color:"#f59e0b"},
  {id:"TA15",name:"Salt Typhoon",       iso:"CN", lat:39.88,lng:116.3, color:"#38bdf8"},
];

// ── ORGS (with financial loss driving severity) ───────────────────────────────
export const ORGS = [
  // US California
  {id:0, name:"Twitter/X Corp",      iso:"US",st:"CA",sector:"Media",     lat:37.77, lng:-122.42, loss:220, ev:[{y:2022,t:"Credential",a:"TA13"},{y:2023,t:"Data Breach",a:"TA5"}]},
  {id:1, name:"Apple Inc",           iso:"US",st:"CA",sector:"Technology", lat:37.33, lng:-122.03, loss:310, ev:[{y:2021,t:"Zero-Day",a:"TA6"},{y:2022,t:"Supply Chain",a:"TA6"}]},
  {id:2, name:"Sony Pictures",       iso:"US",st:"CA",sector:"Media",     lat:34.05, lng:-118.30, loss:100, ev:[{y:2014,t:"Wiper",a:"TA1"},{y:2022,t:"Data Breach",a:"TA6"}]},
  {id:3, name:"Twilio",              iso:"US",st:"CA",sector:"Technology", lat:37.54, lng:-122.06, loss:80,  ev:[{y:2022,t:"Phishing",a:"TA13"}]},
  {id:4, name:"LAUSD",               iso:"US",st:"CA",sector:"Education",  lat:34.05, lng:-118.25, loss:45,  ev:[{y:2022,t:"Ransomware",a:"TA5"}]},
  // US New York
  {id:5, name:"JPMorgan Chase",      iso:"US",st:"NY",sector:"Finance",    lat:40.75, lng:-74.00, loss:198, ev:[{y:2021,t:"Data Breach",a:"TA6"},{y:2022,t:"APT",a:"TA2"}]},
  {id:6, name:"NY Presbyterian",     iso:"US",st:"NY",sector:"Healthcare", lat:40.84, lng:-73.94, loss:88,  ev:[{y:2023,t:"Ransomware",a:"TA7"},{y:2024,t:"Data Breach",a:"TA5"}]},
  // US Texas
  {id:7, name:"AT&T Snowflake",      iso:"US",st:"TX",sector:"Telecom",    lat:32.90, lng:-97.04, loss:240, ev:[{y:2024,t:"Data Breach",a:"TA5"}]},
  {id:8, name:"Colonial Pipeline",   iso:"US",st:"TX",sector:"Energy",     lat:32.80, lng:-83.60, loss:4400,ev:[{y:2021,t:"Ransomware",a:"TA4"}]},
  {id:9, name:"SolarWinds",          iso:"US",st:"TX",sector:"Government", lat:30.40, lng:-97.70, loss:350, ev:[{y:2020,t:"Supply Chain",a:"TA2"},{y:2020,t:"APT",a:"TA3"}]},
  {id:10,name:"CDK Global",          iso:"US",st:"TX",sector:"Retail",     lat:32.90, lng:-96.80, loss:600, ev:[{y:2024,t:"Ransomware",a:"TA4"}]},
  // US Florida
  {id:11,name:"Kaseya VSA",          iso:"US",st:"FL",sector:"Technology", lat:25.80, lng:-80.20, loss:900, ev:[{y:2021,t:"Supply Chain",a:"TA5"},{y:2021,t:"Ransomware",a:"TA5"}]},
  // US Washington DC
  {id:12,name:"Microsoft Exchange",  iso:"US",st:"WA",sector:"Technology", lat:47.65, lng:-122.12,loss:120, ev:[{y:2021,t:"Zero-Day",a:"TA6"},{y:2023,t:"APT",a:"TA6"}]},
  // US Illinois
  {id:13,name:"CNA Financial",       iso:"US",st:"IL",sector:"Finance",    lat:41.88, lng:-87.63, loss:400, ev:[{y:2021,t:"Ransomware",a:"TA4"}]},
  // US Massachusetts
  {id:14,name:"RSA Security",        iso:"US",st:"MA",sector:"Defence",    lat:42.36, lng:-71.06, loss:66,  ev:[{y:2011,t:"Phishing",a:"TA9"},{y:2011,t:"APT",a:"TA9"}]},
  {id:15,name:"MITRE Corporation",   iso:"US",st:"MA",sector:"Defence",    lat:42.40, lng:-71.20, loss:180, ev:[{y:2024,t:"APT",a:"TA2"},{y:2024,t:"Zero-Day",a:"TA6"}]},
  {id:16,name:"MOVEit (Progress)",   iso:"US",st:"MA",sector:"Technology", lat:41.78, lng:-71.40, loss:250, ev:[{y:2023,t:"Supply Chain",a:"TA12"}]},
  // US Tennessee
  {id:17,name:"Change Healthcare",   iso:"US",st:"TN",sector:"Healthcare", lat:36.17, lng:-86.78, loss:870, ev:[{y:2024,t:"Ransomware",a:"TA7"}]},
  // US Virginia
  {id:18,name:"Lockheed Martin",     iso:"US",st:"VA",sector:"Defence",    lat:38.90, lng:-77.20, loss:120, ev:[{y:2011,t:"APT",a:"TA9"},{y:2012,t:"Zero-Day",a:"TA6"}]},
  // US Georgia
  {id:19,name:"Equifax",             iso:"US",st:"GA",sector:"Finance",    lat:33.80, lng:-84.39, loss:575, ev:[{y:2017,t:"Zero-Day",a:"TA9"},{y:2019,t:"Data Breach",a:"TA6"}]},
  // US North Carolina
  {id:20,name:"Bank of America",     iso:"US",st:"NC",sector:"Finance",    lat:35.23, lng:-80.84, loss:235, ev:[{y:2023,t:"Ransomware",a:"TA7"}]},
  // US Missouri
  {id:21,name:"Ascension Health",    iso:"US",st:"MO",sector:"Healthcare", lat:38.63, lng:-90.19, loss:150, ev:[{y:2024,t:"Ransomware",a:"TA7"}]},
  // US Nevada
  {id:22,name:"MGM Resorts",         iso:"US",st:"NV",sector:"Retail",     lat:36.11, lng:-115.17,loss:100, ev:[{y:2023,t:"Ransomware",a:"TA5"}]},
  // UK
  {id:23,name:"NHS England",         iso:"GB",sector:"Healthcare", lat:51.50, lng:-0.12,  loss:92,  ev:[{y:2024,t:"Ransomware",a:"TA7"},{y:2022,t:"Malware",a:"TA3"}]},
  {id:24,name:"BAE Systems",         iso:"GB",sector:"Defence",    lat:51.52, lng:-0.09,  loss:145, ev:[{y:2021,t:"APT",a:"TA14"},{y:2022,t:"Phishing",a:"TA2"}]},
  // Germany
  {id:25,name:"Deutsche Bank",       iso:"DE",sector:"Finance",    lat:50.11, lng:8.68,   loss:145, ev:[{y:2022,t:"APT",a:"TA2"},{y:2023,t:"Phishing",a:"TA5"}]},
  {id:26,name:"Rheinmetall",         iso:"DE",sector:"Defence",    lat:51.45, lng:7.01,   loss:80,  ev:[{y:2023,t:"Ransomware",a:"TA5"}]},
  // France
  {id:27,name:"Renault-Nissan",      iso:"FR",sector:"Transport",  lat:48.90, lng:2.32,   loss:65,  ev:[{y:2017,t:"Malware",a:"TA3"},{y:2021,t:"Ransomware",a:"TA4"}]},
  // Australia
  {id:28,name:"Medibank",            iso:"AU",sector:"Healthcare", lat:-37.82,lng:145.02, loss:250, ev:[{y:2022,t:"Data Breach",a:"TA5"}]},
  {id:29,name:"Optus Telecom",       iso:"AU",sector:"Telecom",    lat:-33.86,lng:151.20, loss:140, ev:[{y:2022,t:"Data Breach",a:"TA5"}]},
  // Saudi Arabia
  {id:30,name:"Saudi Aramco",        iso:"SA",sector:"Energy",     lat:26.40, lng:50.10,  loss:680, ev:[{y:2012,t:"Malware",a:"TA9"},{y:2017,t:"Zero-Day",a:"TA11"}]},
  // Ukraine
  {id:31,name:"Ukrainian Power Grid",iso:"UA",sector:"Energy",     lat:50.45, lng:30.52,  loss:175, ev:[{y:2022,t:"Wiper",a:"TA3"},{y:2016,t:"Malware",a:"TA3"}]},
  // China
  {id:32,name:"ICBC Bank",           iso:"CN",sector:"Finance",    lat:39.90, lng:116.40, loss:445, ev:[{y:2023,t:"Ransomware",a:"TA7"}]},
  // India
  {id:33,name:"AIIMS Delhi",         iso:"IN",sector:"Healthcare", lat:28.57, lng:77.21,  loss:45,  ev:[{y:2022,t:"Ransomware",a:"TA1"}]},
  // Japan
  {id:34,name:"Toyota Supply Chain", iso:"JP",sector:"Transport",  lat:35.08, lng:137.15, loss:88,  ev:[{y:2022,t:"Supply Chain",a:"TA9"}]},
  // Denmark
  {id:35,name:"Maersk Shipping",     iso:"DK",sector:"Transport",  lat:55.68, lng:12.57,  loss:300, ev:[{y:2017,t:"Malware",a:"TA3"},{y:2023,t:"APT",a:"TA2"}]},
  // Iran
  {id:36,name:"Natanz (Stuxnet)",    iso:"IR",sector:"Energy",     lat:33.72, lng:52.07,  loss:0,   ev:[{y:2010,t:"Zero-Day",a:"TA10"},{y:2010,t:"Malware",a:"TA10"}]},
  // US DC
  {id:37,name:"Salt Typhoon Target",  iso:"US",st:"DC",sector:"Telecom",    lat:38.90,lng:-77.03,loss:320, ev:[{y:2024,t:"APT",a:"TA15"}]},
  // Additional US orgs
  {id:38,name:"Oldsmar Water Plant",  iso:"US",st:"FL",sector:"Energy",     lat:28.05,lng:-82.66,loss:5,   ev:[{y:2021,t:"Credential",a:"TA10"}]},
  {id:39,name:"Baltimore City Gov",   iso:"US",st:"MD",sector:"Government", lat:39.29,lng:-76.61,loss:18,  ev:[{y:2019,t:"Ransomware",a:"TA5"},{y:2017,t:"Ransomware",a:"TA5"}]},
  {id:40,name:"Twitter / X",          iso:"US",st:"CA",sector:"Media",      lat:37.77,lng:-122.41,loss:50, ev:[{y:2020,t:"Credential",a:"TA13"}]},
  {id:41,name:"JBS USA",              iso:"US",st:"CO",sector:"Retail",     lat:40.42,lng:-104.69,loss:110,ev:[{y:2021,t:"Ransomware",a:"TA5"}]},
  {id:42,name:"Anthem Health",        iso:"US",st:"IN",sector:"Healthcare", lat:39.77,lng:-86.16,loss:260, ev:[{y:2015,t:"Data Breach",a:"TA6"}]},
  {id:43,name:"Target Corp",          iso:"US",st:"MN",sector:"Retail",     lat:44.98,lng:-93.27,loss:162, ev:[{y:2013,t:"Data Breach",a:"TA13"}]},
  {id:44,name:"Home Depot",           iso:"US",st:"GA",sector:"Retail",     lat:33.88,lng:-84.47,loss:179, ev:[{y:2014,t:"Data Breach",a:"TA13"}]},
  {id:45,name:"Southwest Airlines",   iso:"US",st:"TX",sector:"Transport",  lat:32.84,lng:-96.85,loss:380, ev:[{y:2022,t:"Malware",a:"TA10"}]},
  {id:46,name:"Norsk Hydro",          iso:"NO",        sector:"Energy",     lat:59.91,lng:10.74, loss:71,  ev:[{y:2019,t:"Ransomware",a:"TA4"}]},
  // International orgs
  {id:47,name:"Samsung Electronics",  iso:"KR",        sector:"Technology", lat:37.52,lng:127.02,loss:400, ev:[{y:2022,t:"Data Breach",a:"TA1"},{y:2023,t:"APT",a:"TA8"}]},
  {id:48,name:"Taiwan TSMC",          iso:"TW",        sector:"Technology", lat:24.77,lng:120.99,loss:0,   ev:[{y:2023,t:"APT",a:"TA8"},{y:2022,t:"Supply Chain",a:"TA6"}]},
  {id:49,name:"Telstra Australia",    iso:"AU",        sector:"Telecom",    lat:-33.87,lng:151.21,loss:60, ev:[{y:2022,t:"Data Breach",a:"TA5"}]},
  {id:50,name:"Air India",            iso:"IN",        sector:"Transport",  lat:28.55,lng:77.09, loss:45,  ev:[{y:2021,t:"Data Breach",a:"TA6"}]},
  {id:51,name:"SingHealth",           iso:"SG",        sector:"Healthcare", lat:1.29,lng:103.82, loss:30,  ev:[{y:2018,t:"APT",a:"TA6"}]},
  {id:52,name:"Canada Finance Dept",  iso:"CA",        sector:"Finance",    lat:45.42,lng:-75.70,loss:55,  ev:[{y:2021,t:"APT",a:"TA2"}]},
  {id:53,name:"Thales Group",         iso:"FR",        sector:"Defence",    lat:48.73,lng:2.29,  loss:95,  ev:[{y:2022,t:"Data Breach",a:"TA2"}]},
  {id:54,name:"Polish Parliament",    iso:"PL",        sector:"Government", lat:52.23,lng:21.01, loss:0,   ev:[{y:2021,t:"APT",a:"TA14"}]},
  {id:55,name:"Axie Infinity",        iso:"SG",        sector:"Finance",    lat:1.35,lng:103.82, loss:620, ev:[{y:2022,t:"APT",a:"TA1"}]},
  {id:56,name:"Bybit Exchange",       iso:"AE",        sector:"Finance",    lat:25.20,lng:55.27, loss:1500,ev:[{y:2025,t:"APT",a:"TA1"}]},
].map((o, idx) => {
  let sev;
  if (o.loss >= 400) sev = "Critical";
  else if (o.loss >= 80) sev = "High";
  else if (o.loss >= 20) sev = "Medium";
  else sev = "Low";
  // Manual overrides to ensure all 4 severity levels are well-represented
  const LOW_ORGS = [3,4,26,36,38,40,48,51,52,54];
  const MED_ORGS = [2,14,18,24,25,27,33,39,42,49,50,53];
  const HIGH_ORGS = [0,5,6,16,20,23,28,34,35,41,43,44,45,47];
  if (LOW_ORGS.includes(o.id))  sev = "Low";
  if (MED_ORGS.includes(o.id))  sev = "Medium";
  if (HIGH_ORGS.includes(o.id)) sev = "High";
  return { ...o, sev };
});

const KNOWN_CENTRES = {
  US:{lng:-96,lat:38,span:58}, GB:{lng:-2,lat:54,span:12}, AU:{lng:134,lat:-25,span:38},
  CN:{lng:104,lat:35,span:40}, RU:{lng:100,lat:60,span:130}, BR:{lng:-52,lat:-10,span:40},
  CA:{lng:-96,lat:56,span:60}, IN:{lng:78,lat:21,span:30},
};

// ── Hex to rgba helper ────────────────────────────────────────────────────────
const ha = (hex, a) => {
  if (!hex || !hex.startsWith("#")) return `rgba(74,158,255,${a})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

// ── MAIN INIT ─────────────────────────────────────────────────────────────────
export function initGlobe(container, callbacks) {
  if (!container || !window.d3 || !window.topojson) return null;
  const d3 = window.d3, topojson = window.topojson;

  const {
    onOrgHover, onOrgSelect, onCountrySelect, onStateSelect,
    getFilters, getYearRange,
  } = callbacks;

  // ── Canvas setup ─────────────────────────────────────────────────────────
  const canvas = container.querySelector("canvas") || document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let CW, CH;

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    CW = rect.width > 0 ? rect.width : window.innerWidth;
    CH = rect.height > 0 ? rect.height : window.innerHeight - 52;
    canvas.style.width = CW + "px";
    canvas.style.height = CH + "px";
    canvas.width = Math.round(CW * DPR);
    canvas.height = Math.round(CH * DPR);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(DPR, DPR);
    proj.translate(visualCentre(false)).scale(baseScale());
    isDirty = true;
  }

  const proj = d3.geoOrthographic().clipAngle(90).precision(0.1);
  const pathGen = d3.geoPath(proj, ctx);
  const sphere = { type: "Sphere" };
  const graticule = d3.geoGraticule().step([15, 15])();

  function baseScale() { return Math.min(CW, CH) * 0.44; }
  function visualCentre(rightOpen) {
    const L = 0, R = rightOpen ? 300 : 0, T = 36, B = 52;
    return [(CW - L - R) / 2, T + (CH - T - B) / 2];
  }

  // ── Mutable state ─────────────────────────────────────────────────────────
  let state = {
    rotLng: 0, rotLat: -25, velX: 0, velY: 0,
    autoRot: true, showOrgs: false,
    selIso: null, selSt: null, selOrg: null, highlightedArcKey: null, selArcType: null,
  };
  window._globeState = state;
  window._globeProj = proj;

  let worldFeats = [], usFeats = [], borders = null, usBorders = null;
  const arcCache = new Map();
  const arcScreenCache = new Map(); // stores {sx,sy,ex,ey,cpx,cpy} for hit testing
  let gradientCache = new Map();
  let isDirty = true;
  let animId = null;
  let _animIv = null;

  // ── Gradient cache ────────────────────────────────────────────────────────
  function getGradient(sx, sy, r, col, inner, outer) {
    const key = `${col}-${r}`;
    if (gradientCache.has(key)) {
      const g = gradientCache.get(key);
      // reposition
      return ctx.createRadialGradient(sx, sy, inner || 0, sx, sy, outer || r);
    }
    return ctx.createRadialGradient(sx, sy, inner || 0, sx, sy, outer || r);
  }

  // ── Dirty checking ────────────────────────────────────────────────────────
  let lastRotLng = null, lastRotLat = null, lastScale = null;
  function checkDirty() {
    const s = proj.scale();
    const [rl, rt] = proj.rotate();
    if (rl !== lastRotLng || rt !== lastRotLat || s !== lastScale) {
      isDirty = true;
      lastRotLng = rl; lastRotLat = rt; lastScale = s;
    }
  }

  // ── Drag & interaction ────────────────────────────────────────────────────
  let down = false, moved = false, mx0 = 0, my0 = 0;
  let hoverX = 0, hoverY = 0;

  canvas.addEventListener("pointerdown", e => {
    canvas.setPointerCapture(e.pointerId);
    down = true; moved = false; mx0 = e.offsetX; my0 = e.offsetY;
    state.velX = 0; state.velY = 0; state.autoRot = false;
  });

  canvas.addEventListener("pointermove", e => {
    hoverX = e.offsetX; hoverY = e.offsetY;
    if (!down) { isDirty = true; return; }
    const dx = e.offsetX - mx0, dy = e.offsetY - my0;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    const k = 140 / proj.scale();
    state.rotLng += dx * k;
    state.rotLat = Math.max(-85, Math.min(85, state.rotLat + dy * k));
    proj.rotate([state.rotLng, -state.rotLat, 0]);
    state.velX = dx; state.velY = dy;
    mx0 = e.offsetX; my0 = e.offsetY;
    isDirty = true;
  });

  canvas.addEventListener("pointerup", e => {
    if (!moved) handleClick(e.offsetX, e.offsetY);
    down = false;
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    proj.scale(Math.max(150, Math.min(CW * 4, proj.scale() * (e.deltaY < 0 ? 1.09 : 0.92))));
    isDirty = true;
  }, { passive: false });

  window.addEventListener("resize", () => { resizeCanvas(); isDirty = true; });

  // ── Hit testing ───────────────────────────────────────────────────────────
  function isVisible(lng, lat) {
    const [λ, φ] = proj.rotate();
    return d3.geoDistance([lng, lat], [-λ, -φ]) < Math.PI / 2 + 0.08;
  }

  function hitOrg(mx, my) {
    const { activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE } = getFilters();
    const orgs = getFilteredOrgs(activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE);
    let best = null, bestD = Infinity;
    for (const org of orgs) {
      if (!isVisible(org.lng, org.lat)) continue;
      const p = proj([org.lng, org.lat]); if (!p) continue;
      const d = Math.hypot(mx - p[0], my - p[1]);
      if (d < 12 && d < bestD) { bestD = d; best = org; }
    }
    return best;
  }

  function handleClick(mx, my) {
    // 0. Arc type hit — when org selected OR type arcs already showing
    if (state.selOrg || state.selArcType) {
      const arcKey = hitArc(mx, my);
      if (arcKey !== null) {
        // Extract attack type from key e.g. "TA2:Supply Chain->7" → "Supply Chain"
        const atMatch = arcKey.match(/^[^:]+:(.+)->\d+$/);
        const atkType = atMatch ? atMatch[1] : null;
        // Toggle: if same type already active → clear; else activate
        if (atkType && state.selArcType === atkType) {
          state.selArcType = null;
          state.highlightedArcKey = null;
        } else {
          state.selArcType = atkType;
          state.highlightedArcKey = arcKey; // also highlight the clicked arc
        }
        arcCache.clear();
        isDirty = true;
        return;
      }
      // Click on empty area while type arcs showing → clear type mode
      if (state.selArcType && !state.selOrg) {
        state.selArcType = null; state.highlightedArcKey = null;
        arcCache.clear(); isDirty = true; return;
      }
    }

    const org = state.showOrgs ? hitOrg(mx, my) : null;
    if (org) { selectOrg(org); return; }

    const [tx, ty] = proj.translate();
    if (Math.hypot(mx - tx, my - ty) > proj.scale() + 2) { deselectAll(); return; }

    const coords = proj.invert([mx, my]);
    if (!coords) { deselectAll(); return; }

    if (state.selIso === "US" && usFeats.length) {
      for (const f of usFeats) {
        try { if (d3.geoContains(f, coords)) { selectState(f.stAbbr); return; } } catch(e) {}
      }
      let bestSt = null, bestD = Infinity;
      usFeats.forEach(f => {
        try {
          const c = d3.geoCentroid(f), dd = d3.geoDistance(coords, c);
          if (dd < bestD) { bestD = dd; bestSt = f; }
        } catch(e) {}
      });
      if (bestSt && bestD < 0.12) { selectState(bestSt.stAbbr); return; }
    }

    for (const f of worldFeats) {
      if (!f.isoCode) continue;
      try { if (d3.geoContains(f, coords)) { selectCountry(f.isoCode); return; } } catch(e) {}
    }
    deselectAll();
  }

  // ── Selection actions ─────────────────────────────────────────────────────
  function selectCountry(iso) {
    state.selIso = iso; state.selSt = null; state.selOrg = null;
    arcCache.clear(); state.autoRot = false; isDirty = true;
    if (!state.showOrgs) { state.showOrgs = true; }
    onCountrySelect(iso);
    zoomToCountry(iso);
  }

  function selectState(abbr) {
    state.selSt = abbr; state.selOrg = null;
    arcCache.clear(); state.autoRot = false; isDirty = true;
    if (usFeats.length) {
      const sf = usFeats.find(f => f.stAbbr === abbr);
      if (sf) {
        const [[x0,y0],[x1,y1]] = d3.geoBounds(sf);
        const span = Math.max(Math.abs(x1-x0), Math.abs(y1-y0), 3);
        const cen = d3.geoCentroid(sf);
        const sc = Math.min(CW, CH) * 0.42 * (95 / span);
        animateTo(-cen[0], cen[1], Math.max(baseScale() * 1.2, Math.min(CW * 5, sc)));
      }
    }
    onStateSelect(abbr, ST_NAME[abbr] || abbr);
  }

  function selectOrg(org) {
    state.selOrg = org; state.selIso = org.iso;
    state.selSt = org.st || null;
    state.highlightedArcKey = null; state.selArcType = null; // clear arc state
    arcCache.clear(); arcScreenCache.clear();
    arcCache.clear();
    state.autoRot = false; isDirty = true;
    onOrgSelect(org);
    zoomToOrg(org);
  }

  function deselectAll() {
    state.selIso = null; state.selSt = null; state.selOrg = null;
    state.highlightedArcKey = null; state.selArcType = null; state.autoRot = true;
    arcCache.clear(); arcScreenCache.clear();
    arcCache.clear(); isDirty = true;
    onCountrySelect(null);
  }

  // ── Animation ─────────────────────────────────────────────────────────────
  function animateTo(tLng, tLatRot, tScale) {
    if (_animIv) { cancelAnimationFrame(_animIv); _animIv = null; }
    const sLng = state.rotLng, sLat = state.rotLat, sCur = proj.scale();
    const [sCX, sCY] = proj.translate();
    const [tCX, tCY] = visualCentre(callbacks.getRightPanelOpen ? callbacks.getRightPanelOpen() : false);
    let lng = tLng;
    while (lng - sLng > 180) lng -= 360;
    while (lng - sLng < -180) lng += 360;
    const tScaleC = Math.max(150, Math.min(CW * 4, tScale || baseScale()));
    let step = 0, steps = 22;

    const tick = () => {
      step++;
      const t = step / steps, e = t < .5 ? 2*t*t : -1 + (4-2*t)*t;
      state.rotLng = sLng + (lng - sLng) * e;
      state.rotLat = sLat + (tLatRot - sLat) * e;
      proj.translate([sCX + (tCX - sCX) * e, sCY + (tCY - sCY) * e])
          .rotate([state.rotLng, -state.rotLat, 0])
          .scale(sCur + (tScaleC - sCur) * e);
      isDirty = true;
      if (step < steps) _animIv = requestAnimationFrame(tick);
      else _animIv = null;
    };
    _animIv = requestAnimationFrame(tick);
  }

  function zoomToCountry(iso) {
    const k = KNOWN_CENTRES[iso];
    let cLng, cLat, span;
    if (k) { cLng = k.lng; cLat = k.lat; span = k.span; }
    else {
      const f = worldFeats.find(x => x.isoCode === iso); if (!f) return;
      const c = d3.geoCentroid(f); cLng = c[0]; cLat = c[1];
      try { const [[x0,y0],[x1,y1]] = d3.geoBounds(f); span = Math.max(Math.abs(x1-x0), Math.abs(y1-y0)); if (span > 150) span = 30; }
      catch(e) { span = 30; }
    }
    const tScale = Math.min(CW, CH) * 0.42 * (130 / Math.max(span, 5));
    animateTo(-cLng, cLat, Math.max(baseScale() * 0.85, Math.min(CW * 2.8, tScale)));
  }

  function zoomToOrg(org) {
    const { yearS, yearE } = getFilters();
    const evs = org.ev.filter(e => e.y >= yearS && e.y <= yearE);
    const srcLocs = evs.map(ev => ACTORS.find(a => a.id === ev.a)).filter(Boolean).map(a => [a.lng, a.lat]);
    const allLng = [org.lng, ...srcLocs.map(s => s[0])];
    const allLat = [org.lat, ...srcLocs.map(s => s[1])];
    const midLng = (Math.min(...allLng) + Math.max(...allLng)) / 2;
    const midLat = (Math.min(...allLat) + Math.max(...allLat)) / 2;
    const span = Math.max(Math.max(...allLng) - Math.min(...allLng), Math.max(...allLat) - Math.min(...allLat), 20);
    const tScale = Math.min(CW, CH) * 0.42 * (110 / span);
    animateTo(-midLng, midLat, Math.max(baseScale() * 0.7, Math.min(CW * 1.8, tScale)));
  }

  // ── Filter helper ─────────────────────────────────────────────────────────
  function getFilteredOrgs(sectors, attacks, regions, severity, yearS, yearE) {
    return ORGS.filter(o => {
      if (!sectors.has(o.sector)) return false;
      if (!severity.has(o.sev)) return false;
      const r = REGIONS_MAP[o.iso] || "EMEA";
      if (!regions.has(r)) return false;
      return o.ev.some(e => attacks.has(e.t) && e.y >= yearS && e.y <= yearE);
    });
  }

  // ── Arc helpers ───────────────────────────────────────────────────────────

  // Convert geo [lng,lat] to 3-D unit sphere point
  function geo2xyz(lng, lat) {
    const lngR = lng * Math.PI / 180, latR = lat * Math.PI / 180;
    return [
      Math.cos(latR) * Math.cos(lngR),
      Math.cos(latR) * Math.sin(lngR),
      Math.sin(latR),
    ];
  }
  // Convert 3-D unit vector back to [lng, lat]
  function xyz2geo(v) {
    const lat = Math.asin(Math.max(-1, Math.min(1, v[2]))) * 180 / Math.PI;
    const lng = Math.atan2(v[1], v[0]) * 180 / Math.PI;
    return [lng, lat];
  }
  function vLen(v){ return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); }
  function vNorm(v){ const l=vLen(v)||1; return [v[0]/l,v[1]/l,v[2]/l]; }
  function vAdd(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; }
  function vScale(v,s){ return [v[0]*s,v[1]*s,v[2]*s]; }
  function vLerp(a,b,t){ return vAdd(vScale(a,1-t),vScale(b,t)); }

  // Base great-circle arc (no height lift)
  function getArcPts(sl, sa, dl, da, key) {
    if (arcCache.has(key)) return arcCache.get(key);
    const pts = [];
    const interp = d3.geoInterpolate([sl, sa], [dl, da]);
    for (let i = 0; i <= 100; i++) pts.push(interp(i / 100));
    arcCache.set(key, pts);
    return pts;
  }

  // getArcPtsOffset — kept for backward compat with drawTypeArcs but
  // for same-actor multi-arcs we now draw directly in screen space (see drawArcs)
  function getArcPtsOffset(sl, sa, dl, da, key, arcIdx, totalArcs) {
    // Just return the standard great-circle pts; screen-space curve is applied in drawArcs
    return getArcPts(sl, sa, dl, da, key);
  }

  // Draw a curved arc between two screen points with a perpendicular Bezier offset.
  // arcIdx / totalArcs determines how much the arc curves away from the chord.
  // arcIdx=0 of 2 → curves one way, arcIdx=1 of 2 → curves the other way.
  // arcIdx=0 of 1 → gentle single curve.
  function drawBezierArc(ctx, sx, sy, ex, ey, arcIdx, totalArcs, col, thickness, alphaScale, now, speed, phase, dotCol) {
    // Midpoint of chord
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    // Perpendicular direction to the chord
    const dx = ex - sx, dy = ey - sy;
    const chordLen = Math.sqrt(dx*dx + dy*dy) || 1;
    const perpX = -dy / chordLen;
    const perpY =  dx / chordLen;

    // Curve amount: how far the control point is pushed perpendicularly
    // Different signs/magnitudes for each arc index so they clearly separate
    let curveFactor;
    if (totalArcs === 1) {
      curveFactor = chordLen * 0.22;        // single gentle arc
    } else {
      // Spread arcs symmetrically: -big, +big for 2 arcs; -big, 0, +big for 3
      const maxCurve = chordLen * 0.38;
      // Map arcIdx → range [-maxCurve, +maxCurve]
      curveFactor = maxCurve * (arcIdx / (totalArcs - 1) * 2 - 1);
    }

    // Control point for quadratic Bezier
    const cpx = mx + perpX * curveFactor;
    const cpy = my + perpY * curveFactor;

    // ── Draw arc glow layers ──
    // Outer soft glow
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.strokeStyle = `rgba(${col},${0.10 * alphaScale})`;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Mid glow
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, ex, ey);
    ctx.strokeStyle = `rgba(${col},${0.22 * alphaScale})`;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Core line (gradient along arc using segmented drawing)
    const SEG = 60;
    for (let s = 0; s < SEG; s++) {
      const t0 = s / SEG, t1 = (s+1) / SEG;
      // Quadratic Bezier point at t
      const bx0 = (1-t0)*(1-t0)*sx + 2*(1-t0)*t0*cpx + t0*t0*ex;
      const by0 = (1-t0)*(1-t0)*sy + 2*(1-t0)*t0*cpy + t0*t0*ey;
      const bx1 = (1-t1)*(1-t1)*sx + 2*(1-t1)*t1*cpx + t1*t1*ex;
      const by1 = (1-t1)*(1-t1)*sy + 2*(1-t1)*t1*cpy + t1*t1*ey;
      const alpha = (0.08 + t0 * 0.88) * alphaScale;
      const lw    = (0.4 + t0 * thickness);
      ctx.beginPath(); ctx.moveTo(bx0,by0); ctx.lineTo(bx1,by1);
      ctx.strokeStyle = `rgba(${col},${alpha})`;
      ctx.lineWidth = lw; ctx.stroke();
    }

    // ── Traveling dot along the Bezier ──
    const tFrac = ((now * speed + phase) % 1);
    const tD = tFrac;
    const dotX = (1-tD)*(1-tD)*sx + 2*(1-tD)*tD*cpx + tD*tD*ex;
    const dotY = (1-tD)*(1-tD)*sy + 2*(1-tD)*tD*cpy + tD*tD*ey;

    const gd = ctx.createRadialGradient(dotX,dotY,0,dotX,dotY,14);
    gd.addColorStop(0,  `rgba(${col},0.9)`);
    gd.addColorStop(0.4,`rgba(${col},0.4)`);
    gd.addColorStop(1,  `rgba(${col},0)`);
    ctx.beginPath(); ctx.arc(dotX,dotY,14,0,Math.PI*2);
    ctx.fillStyle=gd; ctx.fill();
    ctx.beginPath(); ctx.arc(dotX,dotY,5.5,0,Math.PI*2);
    ctx.fillStyle=`rgba(${col},0.9)`; ctx.fill();
    ctx.beginPath(); ctx.arc(dotX,dotY,2.5,0,Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill();

    return { cpx, cpy, tFrac, dotX, dotY };  // return dot position for moving label
  }

  // Helper: hex colour → "r,g,b" string for rgba()
  function hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) return '74,158,255';
    const r=parseInt(hex.slice(1,3),16);
    const g=parseInt(hex.slice(3,5),16);
    const b=parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  // Hit-test arcs using Bezier screen data stored in arcScreenCache
  function hitArc(mx, my) {
    const HIT_R = 16; // slightly larger hit radius for easier clicking
    const { yearS, yearE } = getFilters();

    // Helper: distance from point (mx,my) to quadratic Bezier curve
    function distToBezier(sx, sy, ex, ey, cpx, cpy) {
      let minD = Infinity;
      const STEPS = 40;
      for (let i = 0; i <= STEPS; i++) {
        const t = i / STEPS;
        const bx = (1-t)*(1-t)*sx + 2*(1-t)*t*cpx + t*t*ex;
        const by = (1-t)*(1-t)*sy + 2*(1-t)*t*cpy + t*t*ey;
        const d  = Math.hypot(mx - bx, my - by);
        if (d < minD) minD = d;
      }
      return minD;
    }

    // Check selected org's arcs first (drawn by drawBezierArc → stored in arcScreenCache)
    if (state.selOrg) {
      const evs = state.selOrg.ev.filter(e => e.y >= yearS && e.y <= yearE);
      for (const ev of evs) {
        const actor = ACTORS.find(a => a.id === ev.a); if (!actor) continue;
        const key   = `${actor.id}:${ev.t}->${state.selOrg.id}`;
        const arc   = arcScreenCache.get(key); if (!arc) continue;
        const d = distToBezier(arc.sx, arc.sy, arc.ex, arc.ey, arc.cpx, arc.cpy);
        if (d < HIT_R) return key;
      }
    }

    // When type arcs are already showing: check all orgs (drawn by drawTypeArcs → arcCache)
    if (state.selArcType) {
      for (const org of ORGS) {
        const evs = org.ev.filter(e => e.t === state.selArcType && e.y >= yearS && e.y <= yearE);
        for (const ev of evs) {
          const actor = ACTORS.find(a => a.id === ev.a); if (!actor) continue;
          const key = `${actor.id}:${ev.t}->${org.id}`;
          const pts = arcCache.get(key); if (!pts) continue;
          for (let i = 0; i < pts.length; i += 4) {
            const [lng, lat] = pts[i];
            if (!isVisible(lng, lat)) continue;
            const p = proj([lng, lat]); if (!p) continue;
            if (Math.hypot(mx - p[0], my - p[1]) < HIT_R) return key;
          }
        }
      }
    }
    return null;
  }

  // Draw ALL arcs of a given type across every org globally
  function drawTypeArcs(ts) {
    const now = ts / 1000;
    const { yearS, yearE } = getFilters();
    if (!state.selArcType) return;
    const col = ATTACK_COLORS[state.selArcType] || "#4a9eff";

    // Collect all (org, event) pairs for this type in year range
    const pairs = [];
    ORGS.forEach(org => {
      org.ev
        .filter(e => e.t === state.selArcType && e.y >= yearS && e.y <= yearE)
        .forEach(ev => pairs.push({ org, ev }));
    });
    if (pairs.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Pass 1: draw all arc trails
    pairs.forEach(({ org, ev }, i) => {
      const actor = ACTORS.find(a => a.id === ev.a); if (!actor) return;
      const key = `${actor.id}:${ev.t}->${org.id}`; // consistent with drawArcs
      // Each org gets a unique height based on its position in ORGS array
      const orgIdx = ORGS.indexOf(org);
      const pts = getArcPtsOffset(actor.lng, actor.lat, org.lng, org.lat, key, orgIdx % 3, 3);
      const visPts = pts.map(p => ({ geo: p, px: isVisible(p[0], p[1]) ? proj(p) : null })).filter(p => p.px);
      if (visPts.length < 2) return;

      // Outer bloom
      ctx.beginPath();
      visPts.forEach(({ px }, j) => j === 0 ? ctx.moveTo(px[0], px[1]) : ctx.lineTo(px[0], px[1]));
      ctx.strokeStyle = ha(col, 0.12); ctx.lineWidth = 16; ctx.stroke();

      ctx.beginPath();
      visPts.forEach(({ px }, j) => j === 0 ? ctx.moveTo(px[0], px[1]) : ctx.lineTo(px[0], px[1]));
      ctx.strokeStyle = ha(col, 0.22); ctx.lineWidth = 7; ctx.stroke();

      // Tapered core arc
      const n = visPts.length;
      for (let s = 0; s < n - 1; s++) {
        const t = s / (n - 1);
        const { px: p0 } = visPts[s], { px: p1 } = visPts[s + 1];
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]);
        ctx.strokeStyle = ha(col, 0.15 + t * 0.82);
        ctx.lineWidth = 0.5 + t * 2.5; ctx.stroke();
      }
    });

    // Pass 2: traveling dots on each arc
    pairs.forEach(({ org, ev }, i) => {
      const actor = ACTORS.find(a => a.id === ev.a); if (!actor) return;
      const key = `${actor.id}:${ev.t}->${org.id}`; // consistent with drawArcs
      const pts = arcCache.get(key); if (!pts) return;
      const speed = 0.05 + (i % 7) * 0.009, phase = (i * 0.31) % 1;
      const tFrac = ((now * speed + phase) % 1);
      const idx = Math.min(Math.floor(tFrac * pts.length), pts.length - 1);
      const [dlng, dlat] = pts[idx];
      if (!isVisible(dlng, dlat)) return;
      const dp = proj([dlng, dlat]); if (!dp) return;

      const g = ctx.createRadialGradient(dp[0], dp[1], 0, dp[0], dp[1], 14);
      g.addColorStop(0, ha(col, 0.95)); g.addColorStop(0.4, ha(col, 0.4)); g.addColorStop(1, ha(col, 0));
      ctx.beginPath(); ctx.arc(dp[0], dp[1], 14, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(dp[0], dp[1], 4.5, 0, Math.PI * 2); ctx.fillStyle = ha(col, 0.95); ctx.fill();
      ctx.beginPath(); ctx.arc(dp[0], dp[1], 2, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
    });

    // Pass 3: target rings on each victim org
    const seen = new Set();
    pairs.forEach(({ org }) => {
      if (seen.has(org.id) || !isVisible(org.lng, org.lat)) return;
      seen.add(org.id);
      const tp = proj([org.lng, org.lat]); if (!tp) return;
      ctx.beginPath(); ctx.arc(tp[0], tp[1], 14, 0, Math.PI * 2);
      ctx.strokeStyle = ha(col, 0.35); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(tp[0], tp[1], 8, 0, Math.PI * 2);
      ctx.strokeStyle = ha(col, 0.6); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(tp[0], tp[1], 3, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    });

    // Attack type label top-right
    ctx.font = "800 11px Inter,sans-serif";
    const labelW = ctx.measureText(state.selArcType).width;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(CW - labelW - 24, 44, labelW + 16, 20, 5); ctx.fill(); }
    ctx.fillStyle = col; ctx.fillText(state.selArcType, CW - labelW - 16, 58);
    ctx.font = "500 8px Inter,sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(`${pairs.length} active arcs · click arc to deselect`, CW - 180, 72);

    ctx.restore();
  }

  // ── Main draw ─────────────────────────────────────────────────────────────
  let stars = null;
  function ensureStars() {
    if (stars) return;
    const rand = (a,b) => a + Math.random()*(b-a);
    // Layer 1 — distant tiny stars (many, dim)
    const tiny   = Array.from({length:420},()=>({ x:rand(0,1),y:rand(0,1),r:rand(.1,.35),a:rand(.03,.10),twinkle:rand(.3,1.2),phase:rand(0,Math.PI*2),type:"tiny" }));
    // Layer 2 — mid stars
    const mid    = Array.from({length:160},()=>({ x:rand(0,1),y:rand(0,1),r:rand(.35,.7),a:rand(.08,.20),twinkle:rand(.6,2.0),phase:rand(0,Math.PI*2),type:"mid" }));
    // Layer 3 — bright foreground stars with cross-diffraction spike
    const bright = Array.from({length:28},()=>({ x:rand(0,1),y:rand(0,1),r:rand(.7,1.6),a:rand(.25,.55),twinkle:rand(1.0,3.0),phase:rand(0,Math.PI*2),type:"bright" }));
    // Layer 4 — coloured stars (blue, yellow, red giants)
    const STAR_COLS = ["rgba(180,210,255","rgba(255,240,180","rgba(255,180,140","rgba(200,230,255"];
    const coloured = Array.from({length:18},()=>({ x:rand(0,1),y:rand(0,1),r:rand(.5,1.2),a:rand(.20,.45),twinkle:rand(.8,2.5),phase:rand(0,Math.PI*2),type:"col",col:STAR_COLS[Math.floor(Math.random()*STAR_COLS.length)] }));
    // Layer 5 — nebula dust clouds (very faint, large blobs)
    const nebulae = Array.from({length:5},()=>({ x:rand(.05,.95),y:rand(.05,.95),rx:rand(40,120),ry:rand(30,80),a:rand(.012,.025),hue:Math.random()<.5?"60,40,120":"20,40,100" }));
    stars = { tiny, mid, bright, coloured, nebulae };
  }

  function drawStars(now) {
    const { tiny, mid, bright, coloured, nebulae } = stars;

    // Nebulae first (behind everything)
    nebulae.forEach(n => {
      const g2 = ctx.createRadialGradient(n.x*CW,n.y*CH,0,n.x*CW,n.y*CH,Math.max(n.rx,n.ry));
      g2.addColorStop(0,`rgba(${n.hue},${n.a})`);
      g2.addColorStop(1,`rgba(${n.hue},0)`);
      ctx.save();
      ctx.scale(1, n.ry/n.rx);
      ctx.beginPath();
      ctx.arc(n.x*CW, n.y*CH*(n.rx/n.ry), n.rx, 0, Math.PI*2);
      ctx.fillStyle = g2; ctx.fill();
      ctx.restore();
    });

    // Tiny stars
    tiny.forEach(s => {
      const tw = .5 + .5*Math.sin(now*s.twinkle + s.phase);
      ctx.beginPath();
      ctx.arc(s.x*CW, s.y*CH, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,210,235,${s.a*(0.6+0.4*tw)})`;
      ctx.fill();
    });

    // Mid stars
    mid.forEach(s => {
      const tw = .5 + .5*Math.sin(now*s.twinkle + s.phase);
      const alpha = s.a*(0.5+0.5*tw);
      ctx.beginPath();
      ctx.arc(s.x*CW, s.y*CH, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(200,220,245,${alpha})`;
      ctx.fill();
    });

    // Coloured stars
    coloured.forEach(s => {
      const tw = .5 + .5*Math.sin(now*s.twinkle + s.phase);
      const alpha = s.a*(0.5+0.5*tw);
      ctx.beginPath();
      ctx.arc(s.x*CW, s.y*CH, s.r, 0, Math.PI*2);
      ctx.fillStyle = `${s.col},${alpha})`;
      ctx.fill();
    });

    // Bright stars with diffraction cross spikes
    bright.forEach(s => {
      const tw = .5 + .5*Math.sin(now*s.twinkle + s.phase);
      const alpha = s.a*(0.6+0.4*tw);
      const sx = s.x*CW, sy = s.y*CH;
      const r = s.r*(0.85+0.15*tw);
      // Core glow
      const glow = ctx.createRadialGradient(sx,sy,0,sx,sy,r*3.5);
      glow.addColorStop(0,`rgba(220,235,255,${alpha})`);
      glow.addColorStop(.3,`rgba(200,220,255,${alpha*.3})`);
      glow.addColorStop(1,`rgba(180,200,255,0)`);
      ctx.beginPath(); ctx.arc(sx,sy,r*3.5,0,Math.PI*2);
      ctx.fillStyle=glow; ctx.fill();
      // Solid core
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,248,255,${alpha})`; ctx.fill();
      // Diffraction spikes (4-point cross)
      const spikeLen = r*5*(0.7+0.3*tw);
      ctx.strokeStyle = `rgba(200,225,255,${alpha*0.25})`;
      ctx.lineWidth = 0.6;
      [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(angle => {
        ctx.beginPath();
        ctx.moveTo(sx,sy);
        ctx.lineTo(sx+Math.cos(angle)*spikeLen, sy+Math.sin(angle)*spikeLen);
        ctx.stroke();
      });
    });
  }

  // Heatmap: country loss total in current year range
  const countryLossCache = new Map();
  function getCountryLoss(iso, yearS, yearE) {
    const key = `${iso}-${yearS}-${yearE}`;
    if (countryLossCache.has(key)) return countryLossCache.get(key);
    const total = ORGS.filter(o => o.iso === iso).reduce((s, o) => {
      const evCount = o.ev.filter(e => e.y >= yearS && e.y <= yearE).length;
      return s + (evCount > 0 ? o.loss : 0);
    }, 0);
    countryLossCache.set(key, total);
    return total;
  }

  let maxCountryLoss = 0;
  function precomputeMaxLoss(yearS, yearE) {
    maxCountryLoss = Math.max(...ORGS.map(o => o.loss), 1);
  }

  function drawGlobe(ts) {
    const { activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE } = getFilters();
    const now = ts / 1000;

    ctx.clearRect(0, 0, CW, CH);
    ctx.fillStyle = "#0d0f17";
    ctx.fillRect(0, 0, CW, CH);

    ensureStars();
    drawStars(now);

    const scale = proj.scale();
    const [tx, ty] = proj.translate();

    // Ocean
    const ocean = ctx.createRadialGradient(tx - scale * .3, ty - scale * .28, 0, tx, ty, scale);
    ocean.addColorStop(0, "#132847");
    ocean.addColorStop(.35, "#0a1e38");
    ocean.addColorStop(.7, "#060f1e");
    ocean.addColorStop(1, "#030810");
    ctx.beginPath(); pathGen(sphere); ctx.fillStyle = ocean; ctx.fill();

    // Graticule
    const ga = Math.min(0.07, 0.025 + scale / baseScale() * 0.01);
    ctx.beginPath(); pathGen(graticule);
    ctx.strokeStyle = `rgba(255,255,255,${ga})`; ctx.lineWidth = 0.35; ctx.stroke();

    // Country fills (with heatmap)
    const filtered = getFilteredOrgs(activeSectors, activeAttacks, activeRegions, activeSeverity, yearS, yearE);
    const activeIsos = new Set(filtered.map(o => o.iso));
    const srcIsos = getSrcIsos();

    worldFeats.forEach(f => {
      const iso = f.isoCode;
      const isSel = iso === state.selIso;
      const isSrc = srcIsos.has(iso);
      const hasOrgs = activeIsos.has(iso);
      const loss = hasOrgs ? getCountryLoss(iso, yearS, yearE) : 0;
      const lossIntensity = Math.min(loss / 5000, 1);

      ctx.beginPath(); pathGen(f);
      if (state.selOrg) {
        ctx.fillStyle = isSel ? "rgba(40,130,240,0.45)" : isSrc ? "rgba(200,60,40,0.35)" : "rgba(8,14,28,0.85)";
      } else if (state.selIso) {
        ctx.fillStyle = isSel ? "rgba(40,130,240,0.45)" : hasOrgs ? "rgba(22,58,115,0.50)" : "rgba(14,26,52,0.72)";
      } else if (hasOrgs) {
        // Heatmap: blend from blue to deep red based on loss
        const r = Math.round(22 + lossIntensity * 120);
        const g = Math.round(58 - lossIntensity * 40);
        const b = Math.round(115 - lossIntensity * 80);
        ctx.fillStyle = `rgba(${r},${g},${b},0.65)`;
      } else {
        ctx.fillStyle = "rgba(22,52,95,0.52)";
      }
      ctx.fill();
    });

    // Borders
    if (borders) {
      ctx.beginPath(); pathGen(borders);
      ctx.strokeStyle = "rgba(80,140,220,0.48)"; ctx.lineWidth = 0.4; ctx.stroke();
    }

    // Selected country border with shadow glow
    if (state.selIso) {
      const f = worldFeats.find(x => x.isoCode === state.selIso);
      if (f) {
        ctx.beginPath(); pathGen(f);
        ctx.shadowColor = "rgba(236,72,153,0.5)"; ctx.shadowBlur = 10;
        ctx.strokeStyle = "rgba(236,72,153,0.9)"; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Source country borders
    srcIsos.forEach(si => {
      const f = worldFeats.find(x => x.isoCode === si); if (!f) return;
      ctx.beginPath(); pathGen(f);
      ctx.strokeStyle = "rgba(239,68,68,0.75)"; ctx.lineWidth = 0.8; ctx.stroke();
    });

    // US States
    const showUS = usFeats.length && (state.selIso === "US" || (state.selOrg && state.selOrg.iso === "US"));
    if (showUS) {
      const activeSt = state.selSt || (state.selOrg?.iso === "US" ? state.selOrg.st : null);
      usFeats.forEach(f => {
        const isActive = activeSt && f.stAbbr === activeSt;
        const stOrgs = filtered.filter(o => o.iso === "US" && o.st === f.stAbbr);
        ctx.beginPath(); pathGen(f);
        if (activeSt) ctx.fillStyle = isActive ? "rgba(60,140,255,0.38)" : "rgba(4,8,22,0.68)";
        else ctx.fillStyle = stOrgs.length ? "rgba(35,75,150,0.25)" : "rgba(12,22,45,0.18)";
        ctx.fill();
      });
      if (usBorders) {
        ctx.beginPath(); pathGen(usBorders);
        ctx.strokeStyle = "rgba(100,160,240,0.28)"; ctx.lineWidth = 0.28; ctx.stroke();
      }
      const activeSt2 = state.selOrg ? state.selOrg.st : state.selSt;
      if (activeSt2) {
        const sf = usFeats.find(f => f.stAbbr === activeSt2);
        if (sf) {
          ctx.beginPath(); pathGen(sf);
          ctx.shadowColor = "rgba(74,158,255,0.4)"; ctx.shadowBlur = 8;
          ctx.strokeStyle = "rgba(100,180,255,0.92)"; ctx.lineWidth = 1.0; ctx.stroke();
          ctx.shadowBlur = 0;
          // State name label
          const cen = d3.geoCentroid(sf);
          if (isVisible(cen[0], cen[1])) {
            const sp = proj(cen);
            if (sp) {
              const lbl = ST_NAME[activeSt2] || activeSt2;
              ctx.font = "700 13px Inter,sans-serif";
              const tw = ctx.measureText(lbl).width;
              ctx.fillStyle = "rgba(5,10,28,0.85)";
              ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sp[0]-tw/2-8, sp[1]-16, tw+16, 22, 6); ctx.fill();
              ctx.strokeStyle = "rgba(74,158,255,0.5)"; ctx.lineWidth = 0.8;
              ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sp[0]-tw/2-8, sp[1]-16, tw+16, 22, 6); ctx.stroke();
              ctx.fillStyle = "rgba(150,200,255,0.96)"; ctx.fillText(lbl, sp[0]-tw/2, sp[1]+1);
            }
          }
        }
      }
    }

    // Globe rim + atmosphere
    ctx.shadowColor = "rgba(60,140,255,0.35)"; ctx.shadowBlur = 18;
    ctx.beginPath(); pathGen(sphere);
    ctx.strokeStyle = "rgba(80,160,255,0.6)"; ctx.lineWidth = 1.0; ctx.stroke();
    ctx.shadowBlur = 0;

    const spec = ctx.createRadialGradient(tx-scale*.3, ty-scale*.28, 0, tx-scale*.3, ty-scale*.28, scale*.5);
    spec.addColorStop(0, "rgba(180,220,255,0.08)"); spec.addColorStop(1, "rgba(180,220,255,0)");
    ctx.beginPath(); pathGen(sphere); ctx.fillStyle = spec; ctx.fill();



    // Year-based pulse rings on orgs (Feature A)
    const { yearS: ys, yearE: ye } = getFilters();
    if (state.showOrgs) {
      const pulseOrgs = filtered.filter(o =>
        o.ev.some(e => e.y === Math.round(ys + (ye - ys) * 0.9))
      );
      pulseOrgs.forEach(org => {
        if (!isVisible(org.lng, org.lat)) return;
        const p = proj([org.lng, org.lat]); if (!p) return;
        const ph = (Math.sin(now * 2) * .5 + .5);
        const col = SECTOR_COLORS[org.sector] || "#60a5fa";
        ctx.beginPath(); ctx.arc(p[0], p[1], 14 + ph * 8, 0, Math.PI * 2);
        ctx.strokeStyle = ha(col, 0.2 + ph * 0.15); ctx.lineWidth = 1; ctx.stroke();
      });
    }

    // Arcs — both can run simultaneously:
    // drawArcs: shows all attacks on selected org
    // drawTypeArcs: overlays same attack type across ALL orgs globally
    if (state.selOrg) drawArcs(ts, yearS, yearE);
    if (state.selArcType) drawTypeArcs(ts);

    // Org dots — when arc type active show all orgs globally
    if (state.showOrgs) {
      const visOrgs = filtered;
      drawOrgs(visOrgs, ts, yearS, yearE);
    }
  }

  function getSrcIsos() {
    const s = new Set();
    if (!state.selOrg && !state.selArcType) return s;
    const { yearS, yearE } = getFilters();
    if (state.selArcType) {
      // All source countries for this attack type globally
      ORGS.forEach(org => {
        org.ev.filter(e => e.t === state.selArcType && e.y >= yearS && e.y <= yearE).forEach(ev => {
          const a = ACTORS.find(x => x.id === ev.a); if (a) s.add(a.iso);
        });
      });
      return s;
    }
    state.selOrg.ev.filter(e => e.y >= yearS && e.y <= yearE).forEach(ev => {
      const a = ACTORS.find(x => x.id === ev.a); if (a) s.add(a.iso);
    });
    return s;
  }

  function drawArcs(ts, yearS, yearE) {
    const now = ts / 1000;
    const evs = state.selOrg.ev.filter(e => e.y >= yearS && e.y <= yearE);
    const maxLoss = state.selOrg.loss || 100;

    // Group events by actor so we can offset arcs that share the same actor
    const actorEventMap = {};
    evs.forEach(ev => {
      if (!actorEventMap[ev.a]) actorEventMap[ev.a] = [];
      actorEventMap[ev.a].push(ev);
    });

    evs.forEach((ev, i) => {
      const actor = ACTORS.find(a => a.id === ev.a); if (!actor) return;
      const col   = ATTACK_COLORS[ev.t] || "#ec4899";
      const key   = `${actor.id}:${ev.t}->${state.selOrg.id}`;

      // Check both endpoints are visible
      if (!isVisible(actor.lng, actor.lat) || !isVisible(state.selOrg.lng, state.selOrg.lat)) return;
      const sp = proj([actor.lng, actor.lat]);
      const ep = proj([state.selOrg.lng, state.selOrg.lat]);
      if (!sp || !ep) return;

      // Per-actor arc index → drives curve direction & amount
      const actorEvs     = actorEventMap[ev.a];
      const evIdxInActor = actorEvs.indexOf(ev);
      const totalForActor = actorEvs.length;

      // Highlight state
      const isHighlighted = state.highlightedArcKey === key;
      const hasHighlight  = state.highlightedArcKey !== null;
      const alphaScale    = hasHighlight ? (isHighlighted ? 1.6 : 0.35) : 1.0;
      const thickness     = 0.8 + (state.selOrg.loss / 500) * 2.5;

      const speed = 0.055 + i * 0.012;
      const phase = (i * 0.28) % 1;

      const { cpx, cpy, tFrac, dotX, dotY } = drawBezierArc(
        ctx,
        sp[0], sp[1],   // source screen pos
        ep[0], ep[1],   // target screen pos
        evIdxInActor, totalForActor,
        hexToRgb(col), thickness, alphaScale,
        now, speed, phase
      );
      // Store Bezier screen data in arcCache so hitArc can detect clicks
      arcScreenCache.set(key, { sx:sp[0], sy:sp[1], ex:ep[0], ey:ep[1], cpx, cpy });

      // Attack type label — travels WITH the dot
      ctx.font = "700 9px Inter,sans-serif";
      const atW = ctx.measureText(ev.t).width;
      const labelOffY = cpy < (sp[1]+ep[1])/2 ? -18 : 8;
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(dotX - atW/2 - 4, dotY + labelOffY - 10, atW + 8, 13, 3); ctx.fill(); }
      ctx.fillStyle = col;
      ctx.fillText(ev.t, dotX - atW/2, dotY + labelOffY);
    });

    // Target marker
    if (isVisible(state.selOrg.lng, state.selOrg.lat)) {
      const tp = proj([state.selOrg.lng, state.selOrg.lat]);
      if (tp) {
        ctx.beginPath(); ctx.arc(tp[0], tp[1], 14, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(236,72,153,0.3)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(tp[0], tp[1], 8, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(236,72,153,0.65)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = "600 9px Inter,sans-serif";
        const tw = ctx.measureText(state.selOrg.name).width;
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(tp[0]+12, tp[1]-12, tw+10, 15, 4); ctx.fill(); }
        ctx.fillStyle = "rgba(236,72,153,.95)"; ctx.fillText(state.selOrg.name, tp[0]+17, tp[1]);
        ctx.font = "500 7px Inter,sans-serif"; ctx.fillStyle = "rgba(236,72,153,.55)";
        ctx.fillText("TARGET", tp[0]+17, tp[1]+10);
      }
    }

    // Source actor diamonds
    const used = new Set(evs.map(e => e.a));
    ACTORS.filter(a => used.has(a.id)).forEach(actor => {
      if (!isVisible(actor.lng, actor.lat)) return;
      const p = proj([actor.lng, actor.lat]); if (!p) return;
      ctx.save(); ctx.translate(p[0], p[1]);
      ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(6,0); ctx.lineTo(0,8); ctx.lineTo(-6,0); ctx.closePath();
      ctx.fillStyle = "#ef4444"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.restore();
      ctx.font = "600 9px Inter,sans-serif";
      const sw = ctx.measureText(actor.name).width;
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(p[0]+10, p[1]-11, sw+10, 15, 4); ctx.fill(); }
      ctx.fillStyle = "rgba(255,160,160,.92)"; ctx.fillText(actor.name, p[0]+15, p[1]+1);
    });
  }

  function drawOrgs(filtered, ts, yearS, yearE) {
    const now = ts / 1000;
    ctx.globalAlpha = 1.0;

    filtered.forEach(org => {
      if (!isVisible(org.lng, org.lat)) return;
      const p = proj([org.lng, org.lat]); if (!p) return;
      const [sx, sy] = p;
      const col = SECTOR_COLORS[org.sector] || "#60a5fa";
      const sev = SEVERITY_COLORS[org.sev] || col;
      const isSel = state.selOrg && state.selOrg.id === org.id;
      const r = isSel ? 5 : 3;

      const inState = !state.selSt || (org.iso === "US" && org.st === state.selSt);
      const dimmed = !!(state.selSt && !inState);
      ctx.globalAlpha = dimmed ? 0.08 : 1.0;

      if (!dimmed) {
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r + 7);
        g.addColorStop(0, ha(col, isSel ? 0.5 : 0.2)); g.addColorStop(1, ha(col, 0));
        ctx.beginPath(); ctx.arc(sx, sy, r + 7, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(sx, sy, r + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = ha(sev, dimmed ? 0.1 : 0.32); ctx.fill();

      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();

      if (isSel && !dimmed) {
        const ph = (Math.sin(now * 3) * .5 + .5);
        ctx.beginPath(); ctx.arc(sx, sy, r + 10 + ph * 5, 0, Math.PI * 2);
        ctx.strokeStyle = ha(col, 0.14 + ph * 0.06); ctx.lineWidth = 0.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(sx, sy, r + 5 + ph * 3, 0, Math.PI * 2);
        ctx.strokeStyle = ha(col, 0.3 + ph * 0.12); ctx.lineWidth = 1; ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;

    // No name labels on globe — hover tooltip only (cleaner, no clutter)
    if (state.showOrgs) {
      const hOrg = hitOrg(hoverX, hoverY);
      onOrgHover(hOrg, hoverX, hoverY);
    }
  }

  // ── Animation frame ───────────────────────────────────────────────────────
  let lastTs = 0;
  function frame(ts) {
    animId = requestAnimationFrame(frame);
    checkDirty();

    if (!down && state.autoRot) {
      state.rotLng += 0.20;
      const _rpo = callbacks.getRightPanelOpen ? callbacks.getRightPanelOpen() : false;
      proj.translate(visualCentre(_rpo)).rotate([state.rotLng, -state.rotLat, 0]);
      isDirty = true;
    } else if (!down && !state.autoRot && (Math.abs(state.velX) + Math.abs(state.velY) > 0.1)) {
      const k = 140 / proj.scale();
      state.rotLng += state.velX * k;
      state.rotLat = Math.max(-85, Math.min(85, state.rotLat + state.velY * k));
      proj.rotate([state.rotLng, -state.rotLat, 0]);
      state.velX *= 0.78; state.velY *= 0.78;
      isDirty = true;
    }

    if (state.selOrg || state.selArcType) isDirty = true;

    if (isDirty) {
      drawGlobe(ts);
      isDirty = false;
    }
    lastTs = ts;
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  resizeCanvas();

  async function loadGeo() {
    const [worldTopo, usTopo] = await Promise.all([
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json").then(r => r.json()),
      fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(r => r.json()).catch(() => null),
    ]);
    const wg = topojson.feature(worldTopo, worldTopo.objects.countries);
    worldFeats = wg.features.map(f => { f.isoCode = N2I[f.id] || null; return f; });
    borders = topojson.mesh(worldTopo, worldTopo.objects.countries, (a, b) => a !== b);
    if (usTopo) {
      const ug = topojson.feature(usTopo, usTopo.objects.states);
      usFeats = ug.features.map(f => {
        f.stAbbr = FIPS[String(f.id).padStart(2, "0")] || null;
        f.stName = ST_NAME[f.stAbbr] || f.stAbbr || "?";
        return f;
      }).filter(f => f.stAbbr);
      usBorders = topojson.mesh(usTopo, usTopo.objects.states, (a, b) => a !== b);
    }
    precomputeMaxLoss(2001, 2025);
    resizeCanvas();
    animId = requestAnimationFrame(frame);
  }

  loadGeo();

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    destroy() {
      if (animId) cancelAnimationFrame(animId);
      if (_animIv) cancelAnimationFrame(_animIv);
      window.removeEventListener("resize", resizeCanvas);
    },
    setFilters() { isDirty = true; countryLossCache.clear(); },
    recenter() {
      const open = callbacks.getRightPanelOpen ? callbacks.getRightPanelOpen() : false;
      proj.translate(visualCentre(open));
      isDirty = true;
    },
    zoomToCountry,
    selectOrg,
    deselectAll,
    setShowOrgs(v) { state.showOrgs = v; isDirty = true; },
    setAutoRot(v) { state.autoRot = v; isDirty = true; },
    zoom(f) { proj.scale(Math.max(150, Math.min(CW * 4, proj.scale() * f))); isDirty = true; },
    resetView() {
      state.rotLng = 0; state.rotLat = -25; state.velX = 0; state.velY = 0;
      state.autoRot = true; state.selIso = null; state.selSt = null; state.selOrg = null;
      proj.rotate([0, 25, 0]).scale(baseScale()).translate(visualCentre(false));
      isDirty = true;
    },
    getState: () => state,
    getOrgs: () => ORGS,
    getActors: () => ACTORS,
    ST_NAME,
    ISO_NAMES,
  };
}
