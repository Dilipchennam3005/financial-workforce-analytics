import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter
} from "recharts";

// ── EMBEDDED DATA ─────────────────────────────────────────────────────────
const BASE_DATA = {
  summary: {
    firm: "Meridian Capital Group",
    total_employees: 2000, active_employees: 1631,
    attrition_rate: 17.4, avg_tenure: 3.53,
    avg_base_salary: 143005, avg_performance: 3.85,
    dept_headcount: {
      "Technology & Data": 309, "Investment Management": 280,
      "Risk & Compliance": 232, "Treasury Operations": 224,
      "Portfolio Analytics": 179, "Client Services": 161,
      "Finance & Accounting": 153, "Human Resources": 93
    },
    level_distribution: {
      "Analyst I": 303, "Analyst II": 267, "Senior Analyst": 234,
      "Associate": 216, "Manager": 208, "Director": 168,
      "VP": 115, "SVP": 79, "MD": 41
    },
    location_distribution: {
      "New York": 572, "Boston": 244, "Chicago": 218,
      "London": 215, "San Francisco": 157, "Hong Kong": 133, "Singapore": 92
    },
    gender_split: { "Male": 874, "Female": 697, "Non-binary / Other": 60 }
  },
  att_dept: [
    { department: "Technology & Data",    attrition_rate: 24.0, avg_risk: 35.6, count: 412 },
    { department: "Investment Management",attrition_rate: 19.8, avg_risk: 33.8, count: 354 },
    { department: "Client Services",      attrition_rate: 17.7, avg_risk: 31.6, count: 203 },
    { department: "Risk & Compliance",    attrition_rate: 16.5, avg_risk: 32.0, count: 278 },
    { department: "Human Resources",      attrition_rate: 14.2, avg_risk: 28.8, count: 113 },
    { department: "Portfolio Analytics",  attrition_rate: 13.7, avg_risk: 29.9, count: 211 },
    { department: "Finance & Accounting", attrition_rate: 12.6, avg_risk: 29.3, count: 175 },
    { department: "Treasury Operations",  attrition_rate: 11.8, avg_risk: 28.6, count: 254 },
  ],
  sal_dept: [
    { department: "Investment Management", avg_salary: 168420, median_salary: 162000 },
    { department: "Technology & Data",     avg_salary: 159730, median_salary: 153000 },
    { department: "Portfolio Analytics",   avg_salary: 154810, median_salary: 148000 },
    { department: "Risk & Compliance",     avg_salary: 148200, median_salary: 142000 },
    { department: "Finance & Accounting",  avg_salary: 137650, median_salary: 131000 },
    { department: "Treasury Operations",   avg_salary: 136290, median_salary: 130000 },
    { department: "Human Resources",       avg_salary: 122880, median_salary: 118000 },
    { department: "Client Services",       avg_salary: 119540, median_salary: 114000 },
  ],
  benchmarks: [
    { level: "Analyst I",      internal_median: 70917,  market_p25: 55100,  market_median: 73500,  market_p75: 86100,  n_employees: 400 },
    { level: "Analyst II",     internal_median: 85910,  market_p25: 68400,  market_median: 89250,  market_p75: 102900, n_employees: 334 },
    { level: "Senior Analyst", internal_median: 110141, market_p25: 85500,  market_median: 112875, market_p75: 131250, n_employees: 285 },
    { level: "Associate",      internal_median: 129001, market_p25: 99750,  market_median: 131250, market_p75: 152250, n_employees: 256 },
    { level: "Manager",        internal_median: 157710, market_p25: 123500, market_median: 160125, market_p75: 183750, n_employees: 244 },
    { level: "Director",       internal_median: 197009, market_p25: 152000, market_median: 199500, market_p75: 231000, n_employees: 201 },
    { level: "VP",             internal_median: 240420, market_p25: 190000, market_median: 252000, market_p75: 294000, n_employees: 141 },
    { level: "SVP",            internal_median: 314177, market_p25: 247000, market_median: 325500, market_p75: 378000, n_employees: 84  },
    { level: "MD",             internal_median: 426775, market_p25: 304000, market_median: 430500, market_p75: 525000, n_employees: 55  },
  ],
  risk_dist: [
    { tier: "Low", count: 709 }, { tier: "Medium", count: 1000 },
    { tier: "High", count: 282 }, { tier: "Critical", count: 9 }
  ],
  feature_importance: [
    { feature: "Tenure Years",         importance: 0.1323 },
    { feature: "Salary Pct in Level",  importance: 0.1166 },
    { feature: "Base Salary",          importance: 0.0914 },
    { feature: "Bonus",                importance: 0.0880 },
    { feature: "Manager Satisfaction", importance: 0.0870 },
    { feature: "Training Hours",       importance: 0.0835 },
    { feature: "Work Life Balance",    importance: 0.0752 },
    { feature: "Performance Score",    importance: 0.0644 },
    { feature: "Sick Days",            importance: 0.0440 },
    { feature: "Department",           importance: 0.0416 },
  ],
  gender_pay: [
    { gender: "Male",               base_salary: 148320 },
    { gender: "Female",             base_salary: 136840 },
    { gender: "Non-binary / Other", base_salary: 143110 },
  ],
  tenure_dist: [
    { bucket: "<1yr", count: 312 }, { bucket: "1-2yr", count: 398 },
    { bucket: "2-3yr", count: 341 }, { bucket: "3-5yr", count: 472 },
    { bucket: "5-7yr", count: 289 }, { bucket: "7yr+",  count: 188 },
  ],
  timeline: (() => {
    const depts = {
      "Technology & Data":     { base: 265, growth: 0.005 },
      "Investment Management": { base: 258, growth: 0.002 },
      "Risk & Compliance":     { base: 198, growth: 0.003 },
      "Treasury Operations":   { base: 215, growth: 0.001 },
    };
    const rows = [];
    for (let m = 0; m < 36; m++) {
      const d = new Date(2022, m, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const isForecast = m >= 24;
      for (const [dept, cfg] of Object.entries(depts)) {
        const hc = Math.round(cfg.base * Math.pow(1 + cfg.growth, m) + Math.sin(m * 0.5) * 4);
        rows.push({ month: label, department: dept, headcount_forecast: hc,
          lower_bound: Math.round(hc * 0.95), upper_bound: Math.round(hc * 1.05), is_forecast: isForecast });
      }
    }
    return rows;
  })(),
};

// ── LIVE EMPLOYEE FEED ────────────────────────────────────────────────────
const FIRST_NAMES = ["Arjun","Mei","Carlos","Priya","James","Sofia","Wei","Aisha","Tyler","Nadia","Marcus","Yuki","Hassan","Elena","Derek","Fatima","Ryan","Zoe","Kevin","Amara","Liu","Omar","Sasha","Irina","Kwame"];
const LAST_NAMES  = ["Chen","Rodriguez","Patel","Williams","Kim","Johnson","Singh","Brown","Nakamura","Davis","Okafor","Martinez","Lee","Thompson","Hassan","Garcia","Wang","Miller","Andersen","Nguyen","Osei","Kowalski","Ibrahim","Tanaka"];
const DEPTS       = Object.keys(BASE_DATA.summary.dept_headcount);
const LEVELS      = ["Analyst I","Analyst II","Senior Analyst","Associate","Manager","Director"];
const EVENTS      = [
  { type: "hire",      label: "New Hire",        color: "#3ecf8e", icon: "✦" },
  { type: "promotion", label: "Promoted",         color: "#c9a84c", icon: "▲" },
  { type: "departure", label: "Departed",         color: "#e05c5c", icon: "✕" },
  { type: "transfer",  label: "Dept Transfer",    color: "#5b8ff9", icon: "⇄" },
  { type: "review",    label: "Review Complete",  color: "#8b5cf6", icon: "★" },
];

function generateEvent() {
  const fn   = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln   = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const dept = DEPTS[Math.floor(Math.random() * DEPTS.length)];
  const lvl  = LEVELS[Math.floor(Math.random() * LEVELS.length)];
  const ev   = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  const id   = `MCG-${String(Math.floor(10000 + Math.random() * 90000))}`;
  return { id: Date.now() + Math.random(), empId: id, name: `${fn} ${ln}`, dept, level: lvl, ...ev, ts: new Date() };
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0e1a", panel: "#0f1629", border: "#1e2d4a",
  accent: "#c9a84c", blue: "#2d6be4", blueL: "#5b8ff9",
  red: "#e05c5c", green: "#3ecf8e", purple: "#8b5cf6",
  text: "#e8eaf0", textMid: "#8899b8", textDim: "#4a5c7a",
};
const DEPT_COLORS = ["#c9a84c","#2d6be4","#3ecf8e","#e05c5c","#8b5cf6","#f97316","#06b6d4","#ec4899"];
const RISK_COLORS = { Low: C.green, Medium: C.accent, High: "#f97316", Critical: C.red };
const ALL_DEPTS   = ["All", ...DEPTS];

// ── ANIMATED KPI CARD ─────────────────────────────────────────────────────
// What "KPI animate on load" means:
//   Instead of the number just appearing instantly, it COUNTS UP from 0
//   to the final value when the page loads — like a speedometer spinning up.
//   This draws the eye to the key numbers and makes the dashboard feel alive.
//   Each card also fades in with a tiny upward slide for polish.
const KPICard = ({ label, value, sub, color = C.accent, icon, animTarget, animPrefix = "", animSuffix = "" }) => {
  const [displayed, setDisplayed]     = useState(0);
  const [visible,   setVisible]       = useState(false);

  useEffect(() => {
    const t0 = setTimeout(() => setVisible(true), 80);
    if (animTarget === undefined) return () => clearTimeout(t0);

    let startTs = null;
    const DURATION = 950;
    const tick = (ts) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / DURATION, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplayed(animTarget * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    const t1 = setTimeout(() => requestAnimationFrame(tick), 180);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  const isInt      = animTarget !== undefined && animTarget >= 10 && animTarget === Math.floor(animTarget);
  const displayVal = animTarget !== undefined
    ? `${animPrefix}${isInt ? Math.round(displayed).toLocaleString() : displayed.toFixed(animSuffix === "%" || animSuffix === " yrs" ? 1 : 2)}${animSuffix}`
    : value;

  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderTop: `2px solid ${color}`, borderRadius: 8,
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: 6,
      opacity:    visible ? 1 : 0,
      transform:  visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.45s ease, transform 0.45s ease",
    }}>
      <div style={{ color: C.textMid, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "monospace" }}>
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}
      </div>
      <div style={{ color, fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", lineHeight: 1 }}>
        {displayVal}
      </div>
      {sub && <div style={{ color: C.textDim, fontSize: 11 }}>{sub}</div>}
    </div>
  );
};

const PanelTitle = ({ children, badge }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
    <div style={{ width: 3, height: 18, background: C.accent, borderRadius: 2 }} />
    <span style={{ color: C.text, fontSize: 12, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "monospace" }}>
      {children}
    </span>
    {badge && (
      <span style={{ background: C.accent + "22", border: `1px solid ${C.accent}44`, color: C.accent,
        fontSize: 10, padding: "2px 8px", borderRadius: 20, marginLeft: "auto" }}>
        {badge}
      </span>
    )}
  </div>
);

const Panel = ({ children, style = {} }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

const Tip = ({ active, payload, label, suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a2540", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: C.textMid, marginBottom: 5, fontSize: 11 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: C.textMid }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: C.text }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</span>
        </div>
      ))}
    </div>
  );
};

const NavTab = ({ label, active, onClick, alert }) => (
  <button onClick={onClick} style={{
    background: active ? C.accent + "18" : "transparent",
    border: "none", borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
    color: active ? C.accent : C.textMid,
    padding: "12px 20px", cursor: "pointer", fontSize: 11, fontWeight: 600,
    letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace",
    transition: "all 0.2s", position: "relative", whiteSpace: "nowrap",
  }}>
    {label}
    {alert && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: C.red }} />}
  </button>
);

// ── DEPT FILTER BAR ────────────────────────────────────────────────────────
// A clickable row of buttons that lets you drill into one department across
// any page. The active filter also shows in the breadcrumb at the top.
const DeptFilter = ({ selected, onChange }) => (
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16, alignItems: "center",
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
    <span style={{ color: C.textDim, fontSize: 10, fontFamily: "monospace", marginRight: 4 }}>🔍 DEPT:</span>
    {ALL_DEPTS.map((d, i) => {
      const color = d === "All" ? C.accent : DEPT_COLORS[i - 1];
      return (
        <button key={d} onClick={() => onChange(d)} style={{
          background: selected === d ? color + "22" : "transparent",
          border: `1px solid ${selected === d ? color : C.border}`,
          color: selected === d ? color : C.textMid,
          padding: "3px 11px", borderRadius: 20, cursor: "pointer",
          fontSize: 10, fontWeight: 600, transition: "all 0.15s", fontFamily: "monospace",
        }}>
          {d === "All" ? "ALL" : d.split(" ")[0].toUpperCase()}
        </button>
      );
    })}
    {selected !== "All" && (
      <button onClick={() => onChange("All")} style={{
        background: "transparent", border: "none", color: C.textDim,
        cursor: "pointer", fontSize: 10, marginLeft: "auto", fontFamily: "monospace"
      }}>✕ Clear</button>
    )}
  </div>
);

// ── LIVE FEED ─────────────────────────────────────────────────────────────
const LiveFeed = ({ events }) => (
  <Panel style={{ overflow: "hidden" }}>
    <PanelTitle badge="● LIVE">Employee Activity Feed</PanelTitle>
    <div style={{ overflowY: "auto", maxHeight: 390 }}>
      {events.map((ev, i) => (
        <div key={ev.id} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "8px 0", borderBottom: `1px solid ${C.border}22`,
          opacity: Math.max(0.25, 1 - i * 0.07),
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            background: ev.color + "20", border: `1px solid ${ev.color}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: ev.color, fontWeight: 700,
          }}>
            {ev.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{ev.name}</span>
              <span style={{ color: C.textDim, fontSize: 9, fontFamily: "monospace", flexShrink: 0, marginLeft: 8 }}>
                {ev.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <div style={{ color: ev.color, fontSize: 10, fontWeight: 600 }}>{ev.label}</div>
            <div style={{ color: C.textDim, fontSize: 10 }}>{ev.dept} · {ev.level} · {ev.empId}</div>
          </div>
        </div>
      ))}
    </div>
  </Panel>
);

// ── PAGE 1: WORKFORCE OVERVIEW ────────────────────────────────────────────
const PageOverview = ({ deptFilter, onDeptChange, liveHeadcount }) => {
  const deptData  = Object.entries(BASE_DATA.summary.dept_headcount).map(([dept, count], i) => ({
    dept: dept.split(" ")[0], full: dept, count: liveHeadcount[dept] || count, color: DEPT_COLORS[i]
  }));
  const filtered  = deptFilter === "All" ? deptData : deptData.filter(d => d.full === deptFilter);
  const levelData = Object.entries(BASE_DATA.summary.level_distribution).map(([level, count]) => ({ level, count }));
  const locData   = Object.entries(BASE_DATA.summary.location_distribution).map(([loc, count]) => ({ loc, count }));
  const genderData= Object.entries(BASE_DATA.summary.gender_split).map(([g, v], i) => ({ name: g, value: v, color: [C.blue, C.accent, C.purple][i] }));
  const totalActive = Object.values(liveHeadcount).reduce((a,b) => a+b, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        <KPICard label="Active Employees" animTarget={totalActive}  animSuffix=""      color={C.accent}  icon="👥" sub="Live headcount" />
        <KPICard label="Avg Base Salary"  animTarget={143}          animPrefix="$"     animSuffix="K"    color={C.blueL}   icon="💰" sub="All levels combined" />
        <KPICard label="Avg Tenure"       animTarget={3.53}         animSuffix=" yrs"  color={C.green}   icon="📅" sub="Analyst I avg: 1.8yr" />
        <KPICard label="Avg Performance"  animTarget={3.85}         animSuffix=" / 5"  color={C.purple}  icon="⭐" sub="Above target (3.5)" />
        <KPICard label="Attrition Rate"   animTarget={17.4}         animSuffix="%"     color={C.red}     icon="⚠️" sub="↑ Tech & Data: 24%" />
      </div>

      <DeptFilter selected={deptFilter} onChange={onDeptChange} />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
        <Panel>
          <PanelTitle>Headcount by Department</PanelTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filtered} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="dept" tick={{ fill: C.textMid, fontSize: 11 }} />
              <YAxis tick={{ fill: C.textMid, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Headcount" radius={[3,3,0,0]}>
                {filtered.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <PanelTitle>Gender Distribution</PanelTitle>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" nameKey="name">
                {genderData.map((g,i) => <Cell key={i} fill={g.color} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 6, justifyContent: "center" }}>
            {genderData.map(g => (
              <div key={g.name} style={{ textAlign: "center" }}>
                <div style={{ color: g.color, fontWeight: 700, fontSize: 15 }}>{((g.value/1631)*100).toFixed(0)}%</div>
                <div style={{ color: C.textDim, fontSize: 10 }}>{g.name.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <PanelTitle>Firm Snapshot</PanelTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            {[
              { label: "Total Headcount",    value: totalActive.toLocaleString(), color: C.accent },
              { label: "Departments",        value: "8",         color: C.blueL },
              { label: "Seniority Levels",   value: "9",         color: C.green },
              { label: "Global Offices",     value: "7",         color: C.purple },
              { label: "Attrition Rate",     value: "17.4%",     color: C.red },
              { label: "Avg Performance",    value: "3.85 / 5",  color: C.green },
              { label: "Avg Tenure",         value: "3.53 yrs",  color: C.blueL },
              { label: "Avg Base Salary",    value: "$143K",     color: C.accent },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0", borderBottom: `1px solid ${C.border}33` }}>
                <span style={{ color: C.textMid, fontSize: 11 }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        <Panel>
          <PanelTitle>Tenure Distribution</PanelTitle>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={BASE_DATA.tenure_dist} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="bucket" tick={{ fill: C.textMid, fontSize: 11 }} />
              <YAxis tick={{ fill: C.textMid, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Employees" fill={C.blueL} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <PanelTitle>Level Hierarchy</PanelTitle>
          <ResponsiveContainer width="100%" height={195}>
            <BarChart data={Object.entries(BASE_DATA.summary.level_distribution).map(([level,count])=>({level,count}))} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textMid, fontSize: 10 }} />
              <YAxis dataKey="level" type="category" tick={{ fill: C.textMid, fontSize: 11 }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="count" name="Headcount" fill={C.accent} radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel>
        <PanelTitle badge="7 Global Offices">Office Locations</PanelTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {locData.sort((a,b) => b.count - a.count).map((l, i) => (
            <div key={l.loc} style={{
              background: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${DEPT_COLORS[i]}`,
              borderRadius: 6, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, flex: "1 1 160px"
            }}>
              <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{l.loc}</div>
                <div style={{ color: C.textDim, fontSize: 11 }}>{l.count} employees</div>
              </div>
              <div style={{ marginLeft: "auto", color: DEPT_COLORS[i], fontWeight: 700, fontSize: 18 }}>
                {((l.count/1631)*100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};

// ── PAGE 2: ATTRITION RISK MODEL ──────────────────────────────────────────
const PageAttrition = ({ deptFilter, onDeptChange, liveEvents }) => {
  const filtered = deptFilter === "All"
    ? BASE_DATA.att_dept
    : BASE_DATA.att_dept.filter(d => d.department === deptFilter);

  const [weeklyHires, setWeeklyHires] = useState(() => {
    const weeks = [];
    for (let w = 11; w >= 0; w--) {
      const d = new Date(2024, 8, 1);
      d.setDate(d.getDate() - w * 7);
      const mo = d.toLocaleString("default", { month: "short" });
      const wk = Math.ceil(d.getDate() / 7);
      weeks.push({
        week: `W${wk} ${mo}`,
        hires:      Math.floor(3 + Math.random() * 4),
        departures: Math.floor(1 + Math.random() * 3),
        transfers:  Math.floor(Math.random() * 2),
      });
    }
    return weeks;
  });

  useEffect(() => {
    const t = setInterval(() => {
      setWeeklyHires(prev => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], hires: next[next.length - 1].hires + 1 };
        return next;
      });
    }, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPICard label="Model AUC-ROC"   animTarget={0.7216} animSuffix=""  color={C.green}  icon="🤖" sub="Random Forest · 200 trees" />
        <KPICard label="CV AUC 5-Fold"   animTarget={0.628}  animSuffix=""  color={C.blueL}  icon="📊" sub="±0.024 std deviation" />
        <KPICard label="High Risk Staff" animTarget={291}    animSuffix=""  color="#f97316"  icon="⚠️" sub="High + Critical tiers" />
        <KPICard label="Critical Risk"   animTarget={9}      animSuffix=""  color={C.red}    icon="🚨" sub="Immediate retention flag" />
      </div>

      <DeptFilter selected={deptFilter} onChange={onDeptChange} />

      {/* Attrition bar + Live feed side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 16 }}>
        <Panel>
          <PanelTitle badge="ML Predicted">Attrition Rate by Department</PanelTitle>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filtered} margin={{ left: -10, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="department" tick={{ fill: C.textMid, fontSize: 9 }}
                tickFormatter={v => v.split(" ")[0]} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: C.textMid, fontSize: 11 }} unit="%" domain={[0, 30]} />
              <Tooltip content={<Tip suffix="%" />} />
              <ReferenceLine y={17.4} stroke={C.accent} strokeDasharray="4 4"
                label={{ value: "Avg 17.4%", fill: C.accent, fontSize: 10, position: "insideTopRight" }} />
              <Bar dataKey="attrition_rate" name="Attrition Rate" radius={[3,3,0,0]}>
                {filtered.map((d, i) => (
                  <Cell key={i} fill={d.attrition_rate > 20 ? C.red : d.attrition_rate > 16 ? "#f97316" : C.green} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <LiveFeed events={liveEvents} />
      </div>

      {/* Feature importance + Weekly hiring chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
        <Panel>
          <PanelTitle badge="Random Forest">Feature Importance — Top 10 Drivers</PanelTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {BASE_DATA.feature_importance.map((f, i) => (
              <div key={f.feature} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: C.textMid, fontSize: 11, width: 155, flexShrink: 0 }}>{f.feature}</div>
                <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${(f.importance / 0.14) * 100}%`, height: "100%",
                    background: i < 3 ? C.accent : i < 6 ? C.blue : C.blueL,
                    borderRadius: 4,
                  }} />
                </div>
                <div style={{ color: C.text, fontSize: 11, width: 44, textAlign: "right", fontFamily: "monospace" }}>
                  {(f.importance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle badge="Live Updates">Weekly Hiring Activity</PanelTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyHires} margin={{ left: -10, bottom: 22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="week" tick={{ fill: C.textMid, fontSize: 8 }} angle={-30} textAnchor="end" interval={1} />
              <YAxis tick={{ fill: C.textMid, fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Legend formatter={v => <span style={{ color: C.textMid, fontSize: 10 }}>{v}</span>} />
              <Bar dataKey="hires"      name="New Hires"  fill={C.green} radius={[2,2,0,0]} />
              <Bar dataKey="departures" name="Departures" fill={C.red}   radius={[2,2,0,0]} />
              <Bar dataKey="transfers"  name="Transfers"  fill={C.blueL} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ color: C.textDim, fontSize: 10, textAlign: "center", marginTop: 4, fontFamily: "monospace" }}>
            ↑ New Hires tick up every ~8 sec as onboarding events arrive
          </div>
        </Panel>
      </div>

      {/* Risk dist + scatter */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16 }}>
        <Panel>
          <PanelTitle>Risk Tier Distribution</PanelTitle>
          <ResponsiveContainer width="100%" height={165}>
            <PieChart>
              <Pie data={BASE_DATA.risk_dist} cx="50%" cy="50%" outerRadius={65} innerRadius={32}
                dataKey="count" nameKey="tier" paddingAngle={2}>
                {BASE_DATA.risk_dist.map(d => <Cell key={d.tier} fill={RISK_COLORS[d.tier]} />)}
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
            {BASE_DATA.risk_dist.map(d => (
              <div key={d.tier} style={{
                background: RISK_COLORS[d.tier] + "18", border: `1px solid ${RISK_COLORS[d.tier]}44`,
                borderRadius: 6, padding: "5px 10px", display: "flex", justifyContent: "space-between"
              }}>
                <span style={{ color: RISK_COLORS[d.tier], fontSize: 11, fontWeight: 600 }}>{d.tier}</span>
                <span style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{d.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>ML Risk Score vs Actual Attrition</PanelTitle>
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ left: -10, right: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="avg_risk" name="ML Risk" tick={{ fill: C.textMid, fontSize: 10 }} domain={[27,37]}
                label={{ value: "ML Risk Score", fill: C.textMid, fontSize: 10, position: "insideBottom", offset: -2 }} />
              <YAxis dataKey="attrition_rate" name="Actual %" tick={{ fill: C.textMid, fontSize: 10 }} unit="%" />
              <Tooltip cursor={{ stroke: C.border }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: "#1a2540", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 14px", fontSize: 12 }}>
                    <div style={{ color: C.accent, fontWeight: 700, marginBottom: 4 }}>{d.department}</div>
                    <div style={{ color: C.textMid }}>ML Risk: <span style={{ color: C.text }}>{d.avg_risk}</span></div>
                    <div style={{ color: C.textMid }}>Actual: <span style={{ color: C.text }}>{d.attrition_rate}%</span></div>
                  </div>
                );
              }} />
              <Scatter data={BASE_DATA.att_dept} fill={C.accent}>
                {BASE_DATA.att_dept.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div style={{ background: C.blue + "12", border: `1px solid ${C.blue}33`, borderRadius: 8, padding: "12px 18px", fontSize: 12, color: C.textMid }}>
        <span style={{ color: C.blueL, fontWeight: 600 }}>🤖 Model: </span>
        Random Forest Classifier (200 estimators, max_depth=12, class_weight=balanced). AUC-ROC 0.7216 on held-out test set (n=400). Top predictors: tenure, salary positioning within level, and manager satisfaction. The weekly activity chart and live feed update in real time as employee events arrive.
      </div>
    </div>
  );
};

// ── PAGE 3: COMPENSATION ──────────────────────────────────────────────────
const PageCompensation = ({ deptFilter, onDeptChange }) => {
  const payGapPct  = (((148320 - 136840) / 148320) * 100).toFixed(1);
  const filteredSal = deptFilter === "All" ? BASE_DATA.sal_dept : BASE_DATA.sal_dept.filter(d => d.department === deptFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPICard label="Avg Base Salary" animTarget={143}                    animPrefix="$" animSuffix="K"  color={C.accent} />
        <KPICard label="Avg Total Comp"  animTarget={172}                    animPrefix="$" animSuffix="K"  color={C.green} />
        <KPICard label="Gender Pay Gap"  animTarget={parseFloat(payGapPct)} animSuffix="%" color={C.red} />
        <KPICard label="Top Paid Dept"   value="Inv. Mgmt"                  color={C.blueL} sub="Avg $168K base" />
      </div>
      <DeptFilter selected={deptFilter} onChange={onDeptChange} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Panel>
          <PanelTitle>Average Salary by Department</PanelTitle>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={filteredSal} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fill: C.textMid, fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <YAxis dataKey="department" type="category" tick={{ fill: C.textMid, fontSize: 10 }} tickFormatter={v => v.split(" ")[0]} width={90} />
              <Tooltip content={<Tip />} />
              <Legend formatter={v => <span style={{ color: C.textMid, fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="avg_salary"    name="Avg Salary"    fill={C.accent} radius={[0,3,3,0]} />
              <Bar dataKey="median_salary" name="Median Salary" fill={C.blueL}  radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <PanelTitle badge="Pay Equity">Gender Pay Analysis</PanelTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={BASE_DATA.gender_pay} margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="gender" tick={{ fill: C.textMid, fontSize: 10 }} tickFormatter={v => v.split(" ")[0]} />
              <YAxis tick={{ fill: C.textMid, fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} domain={[120000, 160000]} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="base_salary" name="Avg Base Salary" radius={[3,3,0,0]}>
                {BASE_DATA.gender_pay.map((_, i) => <Cell key={i} fill={[C.blue, C.accent, C.purple][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 10, background: C.red + "15", border: `1px solid ${C.red}33`, borderRadius: 6, padding: "10px 14px", fontSize: 12 }}>
            <span style={{ color: C.red, fontWeight: 600 }}>Gap: {payGapPct}% </span>
            <span style={{ color: C.textMid }}>— Female median ${(148320-136840).toLocaleString()} below male. Recommend HR audit at Analyst I–III.</span>
          </div>
        </Panel>
      </div>
      <Panel>
        <PanelTitle badge="vs Market Data">Salary Benchmarking — Internal vs Market</PanelTitle>
        <ResponsiveContainer width="100%" height={255}>
          <BarChart data={BASE_DATA.benchmarks} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="level" tick={{ fill: C.textMid, fontSize: 10 }} />
            <YAxis tick={{ fill: C.textMid, fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<Tip />} />
            <Legend formatter={v => <span style={{ color: C.textMid, fontSize: 11 }}>{v}</span>} />
            <Bar dataKey="internal_median" name="Internal Median" fill={C.accent} radius={[3,3,0,0]} />
            <Bar dataKey="market_median"   name="Market Median"   fill={C.blue}   radius={[3,3,0,0]} />
            <Bar dataKey="market_p75"      name="Market P75"      fill={C.blueL}  radius={[3,3,0,0]} opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {BASE_DATA.benchmarks.map(b => {
            const vs = ((b.internal_median / b.market_median - 1) * 100).toFixed(1);
            const color = vs > 0 ? C.green : parseFloat(vs) < -5 ? C.red : C.accent;
            return (
              <div key={b.level} style={{ background: color + "15", border: `1px solid ${color}33`, borderRadius: 6, padding: "5px 10px", fontSize: 11 }}>
                <span style={{ color: C.textMid }}>{b.level}: </span>
                <span style={{ color, fontWeight: 700 }}>{parseFloat(vs) > 0 ? "+" : ""}{vs}%</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
};

// ── PAGE 4: HEADCOUNT FORECAST ────────────────────────────────────────────
const PageForecast = () => {
  const [selectedDept, setSelectedDept] = useState("Technology & Data");
  const depts    = ["Technology & Data","Investment Management","Risk & Compliance","Treasury Operations"];
  const deptData = BASE_DATA.timeline.filter(d => d.department === selectedDept);
  const histData = deptData.filter(d => !d.is_forecast);
  const foreData = deptData.filter(d => d.is_forecast);
  const lastHist = histData[histData.length - 1];
  const lastFore = foreData[foreData.length - 1];
  const growth   = lastFore && lastHist
    ? (((lastFore.headcount_forecast / lastHist.headcount_forecast) - 1) * 100).toFixed(1) : 0;

  const forecastSummary = depts.map(dept => {
    const last = BASE_DATA.timeline.filter(d => d.department === dept && d.is_forecast).slice(-1)[0];
    return { dept: dept.split(" ")[0], forecast: last?.headcount_forecast || 0 };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KPICard label="Model Type"       value="Seasonal LR" color={C.accent}  sub="Linear + sin/cos seasonality" />
        <KPICard label="Forecast Horizon" value="12 Months"   color={C.blueL}   sub="Jan–Dec 2024" />
        <KPICard label="Depts Modeled"    animTarget={8}       color={C.green}   sub="All business units" />
        <KPICard label="Fastest Growth"   value="Tech & Data"  color={C.purple}  sub="+5.5% projected YoY" />
      </div>
      <Panel>
        <PanelTitle badge="ML Forecast">Headcount Timeline — 2022–2023 Historical + 2024 Forecast</PanelTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {depts.map(d => (
            <button key={d} onClick={() => setSelectedDept(d)} style={{
              background: selectedDept === d ? C.accent + "22" : C.bg,
              border: `1px solid ${selectedDept === d ? C.accent : C.border}`,
              color: selectedDept === d ? C.accent : C.textMid,
              padding: "4px 14px", borderRadius: 20, cursor: "pointer",
              fontSize: 10, fontWeight: 600, transition: "all 0.2s", fontFamily: "monospace"
            }}>
              {d.split(" ")[0].toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ color: C.textMid, fontSize: 12, marginBottom: 10 }}>
          <span style={{ color: C.text, fontWeight: 700 }}>{selectedDept}</span>
          {" — "} Dec 2023: <span style={{ color: C.accent }}>{lastHist?.headcount_forecast}</span>
          {" → "} Dec 2024: <span style={{ color: C.green }}>{lastFore?.headcount_forecast}</span>
          <span style={{ color: parseFloat(growth) > 0 ? C.green : C.red, marginLeft: 8, fontWeight: 700 }}>
            ({growth > 0 ? "+" : ""}{growth}%)
          </span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={deptData} margin={{ left: -10 }}>
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="month" tick={{ fill: C.textMid, fontSize: 9 }} tickFormatter={v => v.slice(2)} interval={2} />
            <YAxis tick={{ fill: C.textMid, fontSize: 11 }} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="upper_bound"        stroke="none"   fill={C.green} fillOpacity={0.07} />
            <Area type="monotone" dataKey="headcount_forecast" name="Headcount" stroke={C.accent} strokeWidth={2} fill="url(#hg)" />
            <Area type="monotone" dataKey="lower_bound"        stroke="none"   fill={C.bg} fillOpacity={1} />
            <ReferenceLine x={deptData.find(d => d.is_forecast)?.month} stroke={C.accent} strokeDasharray="4 4"
              label={{ value: "Forecast →", fill: C.accent, fontSize: 9, position: "top" }} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Panel>
          <PanelTitle>12-Month Projected Headcount — All Departments (Dec 2024)</PanelTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecastSummary} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="dept" tick={{ fill: C.textMid, fontSize: 11 }} />
              <YAxis tick={{ fill: C.textMid, fontSize: 11 }} domain={[0, 500]} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="forecast" name="Projected Headcount" radius={[3,3,0,0]}>
                {forecastSummary.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <PanelTitle>Model Performance by Department</PanelTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            {[
              { dept: "Investment Management", r2: 0.922, trend: "+2.4%" },
              { dept: "Portfolio Analytics",   r2: 0.860, trend: "+1.8%" },
              { dept: "Client Services",        r2: 0.850, trend: "-2.1%" },
              { dept: "Technology & Data",      r2: 0.786, trend: "+6.1%" },
              { dept: "Finance & Accounting",   r2: 0.754, trend: "-1.0%" },
              { dept: "Treasury Operations",    r2: 0.694, trend: "-0.8%" },
              { dept: "Human Resources",        r2: 0.694, trend: "-1.5%" },
              { dept: "Risk & Compliance",      r2: 0.423, trend: "+0.2%" },
            ].map((d, i) => (
              <div key={d.dept} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: C.textMid, fontSize: 10, width: 145, flexShrink: 0 }}>{d.dept.split(" ")[0]}</div>
                <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 7, overflow: "hidden" }}>
                  <div style={{ width: `${d.r2 * 100}%`, height: "100%",
                    background: d.r2 > 0.8 ? C.green : d.r2 > 0.6 ? C.accent : C.red,
                    borderRadius: 4 }} />
                </div>
                <div style={{ color: C.textMid, fontSize: 10, width: 36, fontFamily: "monospace" }}>R²{d.r2.toFixed(2).slice(1)}</div>
                <div style={{ color: d.trend.startsWith("+") ? C.green : C.red, fontSize: 10, width: 40, fontFamily: "monospace", fontWeight: 600 }}>{d.trend}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: C.accent + "12", border: `1px solid ${C.accent}33`,
            borderRadius: 6, padding: "8px 12px", fontSize: 11, color: C.textMid }}>
            R² = model fit quality. Green ≥ 0.80, Amber ≥ 0.60, Red &lt; 0.60
          </div>
        </Panel>
      </div>
      <div style={{ background: C.green + "12", border: `1px solid ${C.green}33`, borderRadius: 8, padding: "12px 18px", fontSize: 12, color: C.textMid }}>
        <span style={{ color: C.green, fontWeight: 600 }}>📈 Model Info: </span>
        Seasonal Linear Regression with sin/cos seasonality terms. Fit per department (R² range: 0.42–0.92). Forecast band = ±5% of point estimate. Technology & Data projects strongest growth driven by fintech expansion.
      </div>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab,          setTab]          = useState(0);
  const [deptFilter,   setDeptFilter]   = useState("All");
  const [time,         setTime]         = useState(new Date());
  const [liveEvents,   setLiveEvents]   = useState(() => [generateEvent(), generateEvent(), generateEvent()]);
  const [liveHeadcount,setLiveHeadcount]= useState({ ...BASE_DATA.summary.dept_headcount });

  // Real clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live employee events — random interval 5–10 seconds, drives feed + headcount
  useEffect(() => {
    let timeoutId;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        const ev = generateEvent();
        setLiveEvents(prev => [ev, ...prev].slice(0, 20));
        if (ev.type === "hire") {
          setLiveHeadcount(prev => ({ ...prev, [ev.dept]: (prev[ev.dept] || 0) + 1 }));
        } else if (ev.type === "departure") {
          setLiveHeadcount(prev => ({ ...prev, [ev.dept]: Math.max(0, (prev[ev.dept] || 1) - 1) }));
        }
        scheduleNext();
      }, 5000 + Math.random() * 5000);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  const tabs  = [
    { label: "Workforce Overview" },
    { label: "Attrition Risk Model", alert: true },
    { label: "Compensation" },
    { label: "Headcount Forecast" },
  ];
  const totalActive = Object.values(liveHeadcount).reduce((a,b) => a+b, 0);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", width: "100%", maxWidth: "100%", overflowX: "hidden", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.text }}>
      {/* Header */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "0 28px",
        display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", marginRight: 32 }}>
          <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: C.bg, fontFamily: "serif" }}>M</div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Meridian Capital Group</div>
            <div style={{ color: C.textDim, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", fontFamily: "monospace" }}>
              Workforce Intelligence Platform
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, borderLeft: `1px solid ${C.border}` }}>
          {tabs.map((t, i) => (
            <NavTab key={i} label={t.label} active={tab === i} onClick={() => { setTab(i); setDeptFilter("All"); }} alert={t.alert} />
          ))}
        </div>
        <div style={{ marginLeft: "auto", paddingLeft: 24, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.textMid, fontSize: 11, fontFamily: "monospace" }}>
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div style={{ color: C.textDim, fontSize: 10 }}>
              {time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
        </div>
      </div>

      {/* Status breadcrumb */}
      <div style={{ padding: "7px 28px", borderBottom: `1px solid ${C.border}22`,
        display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.textDim }}>
        <span>Meridian Capital Group</span><span>›</span>
        <span style={{ color: C.accent }}>{tabs[tab].label}</span>
        {deptFilter !== "All" && <><span>›</span><span style={{ color: C.blueL }}>{deptFilter}</span></>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          {[
            { label: `${totalActive.toLocaleString()} Active`,  color: C.green },
            { label: "17.4% Attrition",                         color: C.red },
            { label: "291 High Risk",                           color: "#f97316" },
            { label: `${liveEvents.length} Events`,             color: C.blueL },
          ].map(m => (
            <span key={m.label} style={{ color: m.color, fontFamily: "monospace", fontWeight: 600 }}>{m.label}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 28px 40px", width: "100%", boxSizing: "border-box" }}>
        {tab === 0 && <PageOverview     deptFilter={deptFilter} onDeptChange={setDeptFilter} liveHeadcount={liveHeadcount} />}
        {tab === 1 && <PageAttrition    deptFilter={deptFilter} onDeptChange={setDeptFilter} liveEvents={liveEvents} />}
        {tab === 2 && <PageCompensation deptFilter={deptFilter} onDeptChange={setDeptFilter} />}
        {tab === 3 && <PageForecast />}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px ${C.green}; }
          50%      { opacity:.5; box-shadow: 0 0 14px ${C.green}; }
        }
      `}</style>
    </div>
  );
}
