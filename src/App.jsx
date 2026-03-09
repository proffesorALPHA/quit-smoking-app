import { useState, useEffect, useRef } from "react";

const HEALTH_MILESTONES = [
  { minutes: 20,     label: "20 minutes", desc: "Heart rate & blood pressure drop",      icon: "❤️" },
  { minutes: 480,    label: "8 hours",    desc: "Carbon monoxide levels normalise",       icon: "🫁" },
  { minutes: 1440,   label: "24 hours",   desc: "Heart attack risk begins to fall",       icon: "🛡️" },
  { minutes: 2880,   label: "48 hours",   desc: "Taste & smell start returning",          icon: "👃" },
  { minutes: 10080,  label: "1 week",     desc: "Nicotine fully leaves your body",        icon: "✨" },
  { minutes: 20160,  label: "2 weeks",    desc: "Circulation & lung function improving",  icon: "🫀" },
  { minutes: 43800,  label: "1 month",    desc: "Coughing & shortness of breath ease",    icon: "💪" },
  { minutes: 131400, label: "3 months",   desc: "Lung function up by 10%",                icon: "🌱" },
  { minutes: 262800, label: "6 months",   desc: "Cravings almost gone",                   icon: "⭐" },
  { minutes: 525960, label: "1 year",     desc: "Heart disease risk halved",              icon: "🏆" },
];

const ACHIEVEMENTS = [
  { id: "first_hour",   minutes: 60,     title: "First Hour",      desc: "1 hour smoke-free!",                        icon: "⏱️" },
  { id: "first_day",    minutes: 1440,   title: "Day One Done",    desc: "Survived your first day!",                  icon: "🌅" },
  { id: "three_days",   minutes: 4320,   title: "3 Day Warrior",   desc: "Nicotine cravings peaking — you beat them!", icon: "⚔️" },
  { id: "one_week",     minutes: 10080,  title: "One Week Strong", desc: "A full week — incredible!",                 icon: "🌟" },
  { id: "two_weeks",    minutes: 20160,  title: "Two Week Hero",   desc: "Two weeks of freedom!",                     icon: "🦸" },
  { id: "one_month",    minutes: 43800,  title: "Monthly Master",  desc: "One month — you did it!",                   icon: "🏅" },
  { id: "three_months", minutes: 131400, title: "Quarter Champ",   desc: "3 months stronger!",                        icon: "🎖️" },
  { id: "six_months",   minutes: 262800, title: "Half Year Hero",  desc: "6 months — unstoppable!",                   icon: "💎" },
  { id: "one_year",     minutes: 525960, title: "Year Champion",   desc: "ONE FULL YEAR. Legend.",                    icon: "👑" },
];

const BREATHING_STEPS = [
  { label: "Inhale",  duration: 4, color: "#4ade80" },
  { label: "Hold",    duration: 4, color: "#facc15" },
  { label: "Exhale",  duration: 6, color: "#60a5fa" },
  { label: "Rest",    duration: 2, color: "#c084fc" },
];

const TIPS = [
  "Drink a full glass of cold water slowly 💧",
  "Do 10 jumping jacks right now 🏃",
  "Call or text someone you love 📱",
  "Chew gum or munch on snacks 🥜",
  "Count 5 things you see, 4 you hear, 3 you can touch 👀",
  "This craving will pass in 3–5 minutes — ride it out ⏱️",
  "Brush your teeth — smoke tastes awful after 🪥",
  "Write down WHY you're quitting ✍️",
  "Take a cold shower or splash water on your face 💦",
  "Go for a 5-minute walk outside 🚶",
  "NOT ONE PUFF — ever 🚫",
];

const MOTIVATIONS = [
  "Every hour without a cigarette is a victory. You're winning right now.",
  "The cravings get weaker every single day. Keep going.",
  "Your lungs are healing as you read this. Breathe deep.",
  "Think about the money staying in your pocket.",
  "One day at a time. One craving at a time. You've got this.",
  "Your future self will thank you every day for this.",
  "You've already proven you can do this. Keep proving it.",
];

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(totalMinutes) {
  const m = Math.floor(totalMinutes);
  if (m < 60)   return { big: m,                               unit: "minutes" };
  if (m < 1440) return { big: `${Math.floor(m/60)}h ${m%60}m`, unit: "today"   };
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return { big: d, unit: h > 0 ? `days, ${h}h` : "days" };
}

function pad(n) { return String(n).padStart(2, "0"); }

function toLocal(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const store = {
  async get(key) {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch { return null; }
  },
  async set(key, val) {
    try { localStorage.setItem(key, val); } catch {}
  },
  async del(key) {
    try { localStorage.removeItem(key); } catch {}
  },
};

// ── colours ──────────────────────────────────────────────────────────────────
const C = {
  bg:     "linear-gradient(160deg,#080812 0%,#0f0f1e 50%,#0a1628 100%)",
  purple: "#6366f1", violet: "#8b5cf6",
  green:  "#4ade80", gold:   "#fbbf24",
  red:    "#ef4444", muted:  "#475569",
  sub:    "rgba(255,255,255,0.05)",
  bdr:    "rgba(255,255,255,0.08)",
};
const card = (x={}) => ({ background:C.sub, border:`1px solid ${C.bdr}`, borderRadius:20, padding:18, marginBottom:12, ...x });

export default function App() {
  const [loading,     setLoading]     = useState(true);   // waiting for storage
  const [ready,       setReady]       = useState(false);  // has quit time been set
  const [setupInput,  setSetupInput]  = useState(toLocal(Date.now() - 9*60*60*1000));
  const [quitTs,      setQuitTs]      = useState(null);
  const [minutes,     setMinutes]     = useState(0);
  const [cigsPerDay,  setCigsPerDay]  = useState(12);
  const [packPrice,   setPackPrice]   = useState(40);
  const [goalK,       setGoalK]       = useState(500);
  const [tab,         setTab]         = useState("home");
  const [tip,         setTip]         = useState("");
  const [cravings,    setCravings]    = useState([]);
  const [showReset,   setShowReset]   = useState(false);
  const [breathIdx,   setBreathIdx]   = useState(0);
  const [breathOn,    setBreathOn]    = useState(false);
  const [breathProg,  setBreathProg]  = useState(0);
  const [newBadge,    setNewBadge]    = useState(null);
  const [badges,      setBadges]      = useState([]);
  const prevBadgesRef = useRef([]);
  const saveTimer     = useRef(null);

  // ── 1. LOAD from storage on mount ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const r = await store.get("qsapp");
      if (r?.value) {
        try {
          const d = JSON.parse(r.value);
          if (d.quitTs)    { setQuitTs(d.quitTs); setReady(true); }
          if (d.cigsPerDay)  setCigsPerDay(d.cigsPerDay);
          if (d.packPrice)   setPackPrice(d.packPrice);
          if (d.goalK)       setGoalK(d.goalK);
          if (d.cravings)    setCravings(d.cravings);
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  // ── 2. SAVE to storage (debounced) whenever key state changes ─────────────
  useEffect(() => {
    if (loading || !quitTs) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      store.set("qsapp", JSON.stringify({ quitTs, cigsPerDay, packPrice, goalK, cravings }));
    }, 500);
  }, [quitTs, cigsPerDay, packPrice, goalK, cravings, loading]);

  // ── 3. TICK every second ──────────────────────────────────────────────────
  useEffect(() => {
    if (!quitTs) return;
    const tick = () => setMinutes(Math.max(0, (Date.now() - quitTs) / 60000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quitTs]);

  // ── 4. BADGE unlock check (every minute boundary) ────────────────────────
  useEffect(() => {
    const earned = ACHIEVEMENTS.filter(a => minutes >= a.minutes).map(a => a.id);
    const newest = earned.find(id => !prevBadgesRef.current.includes(id));
    if (newest) {
      setNewBadge(ACHIEVEMENTS.find(a => a.id === newest));
      setTimeout(() => setNewBadge(null), 4000);
    }
    prevBadgesRef.current = earned;
    setBadges(earned);
  }, [Math.floor(minutes / 60)]);

  // ── 5. BREATHING timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (!breathOn) return;
    const step = BREATHING_STEPS[breathIdx];
    let elapsed = 0;
    const iv = setInterval(() => { elapsed += 100; setBreathProg((elapsed / (step.duration * 1000)) * 100); }, 100);
    const t  = setTimeout(() => { setBreathIdx(i => (i+1) % BREATHING_STEPS.length); setBreathProg(0); }, step.duration * 1000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, [breathIdx, breathOn]);

  // ── derived ───────────────────────────────────────────────────────────────
  const cigsAvoided = Math.floor((minutes / 1440) * cigsPerDay);
  const saved       = (cigsAvoided / 20) * packPrice;
  const lifeMin     = cigsAvoided * 11;
  const streak      = Math.floor(minutes / 1440);
  const nextMS      = HEALTH_MILESTONES.find(m => minutes < m.minutes);
  const msProg      = nextMS ? Math.min(100, (minutes / nextMS.minutes) * 100) : 100;
  const duration    = fmt(minutes);
  const goalPct     = Math.min(100, (saved / goalK) * 100);
  const motivation  = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length];
  const curStep     = BREATHING_STEPS[breathIdx];

  const TABS = [
    { id:"home",    icon:"🏠", label:"Home"    },
    { id:"health",  icon:"🫁", label:"Health"  },
    { id:"savings", icon:"💰", label:"Savings" },
    { id:"breathe", icon:"🌬️", label:"Breathe" },
    { id:"badges",  icon:"🏅", label:"Badges"  },
  ];

  const handleStart = () => {
    const ts = new Date(setupInput).getTime();
    if (isNaN(ts)) return;
    setQuitTs(ts);
    setReady(true);
  };

  const logCraving = () => {
    const entry = { time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), date: new Date().toLocaleDateString() };
    setCravings(prev => [entry, ...prev].slice(0, 30));
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  };

  const handleReset = () => {
    store.del("qsapp");
    setQuitTs(null); setReady(false); setMinutes(0);
    setCravings([]); setShowReset(false);
    setSetupInput(toLocal(Date.now()));
  };

  // ── render guards ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:40 }}>🚭</div>
    </div>
  );

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:28, fontFamily:"Georgia,serif", color:"#e2e8f0", maxWidth:480, margin:"0 auto", boxSizing:"border-box" }}>
      <div style={{ width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:60, marginBottom:10 }}>🚭</div>
        <div style={{ fontSize:26, fontWeight:"bold", color:"#f1f5f9", marginBottom:6 }}>When did you quit?</div>
        <div style={{ fontSize:14, color:C.muted, fontFamily:"sans-serif", marginBottom:28, lineHeight:1.6 }}>
          Set your last cigarette's date & time. You only do this once — your progress saves automatically.
        </div>
        <input
          type="datetime-local"
          value={setupInput}
          onChange={e => setSetupInput(e.target.value)}
          style={{ width:"100%", padding:"14px 16px", borderRadius:16, background:"rgba(255,255,255,0.07)", border:`1px solid ${C.bdr}`, color:"#f1f5f9", fontSize:16, fontFamily:"sans-serif", marginBottom:16, boxSizing:"border-box", colorScheme:"dark" }}
        />
        <button
          onClick={handleStart}
          style={{ width:"100%", padding:16, borderRadius:16, background:`linear-gradient(135deg,${C.purple},${C.violet})`, border:"none", color:"white", fontSize:17, fontWeight:"bold", cursor:"pointer", fontFamily:"sans-serif", boxShadow:"0 4px 24px rgba(99,102,241,0.4)" }}>
          Begin My Journey →
        </button>
        <div style={{ fontSize:12, color:"#2d3748", fontFamily:"sans-serif", marginTop:12 }}>Pre-set to 9 hours ago — just tap Begin!</div>
      </div>
    </div>
  );

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"Georgia,serif", color:"#e2e8f0", display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", position:"relative" }}>

      {/* ambient glow */}
      <div style={{ position:"fixed", top:-80, left:"50%", transform:"translateX(-50%)", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* badge toast */}
      {newBadge && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:999, background:"linear-gradient(135deg,rgba(251,191,36,0.97),rgba(245,158,11,0.97))", borderRadius:18, padding:"14px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(251,191,36,0.4)", maxWidth:320, width:"90%" }}>
          <span style={{ fontSize:28 }}>{newBadge.icon}</span>
          <div>
            <div style={{ fontWeight:"bold", color:"#1a1a1a", fontSize:14 }}>Achievement Unlocked!</div>
            <div style={{ color:"#451a03", fontSize:12, fontFamily:"sans-serif" }}>{newBadge.title} — {newBadge.desc}</div>
          </div>
        </div>
      )}

      {/* header */}
      <div style={{ padding:"22px 20px 10px", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:C.purple, textTransform:"uppercase", fontFamily:"sans-serif" }}>Smoke Free</div>
            <div style={{ fontSize:22, fontWeight:"bold", color:"#f1f5f9", marginTop:2 }}>Your Journey 🚭</div>
          </div>
          <div style={{ background:`linear-gradient(135deg,${C.purple},${C.violet})`, borderRadius:12, padding:"7px 13px", fontSize:13, fontFamily:"sans-serif", fontWeight:600 }}>🔥 {streak}d</div>
        </div>
      </div>

      {/* content */}
      <div style={{ flex:1, padding:"0 18px 110px", overflowY:"auto", zIndex:1 }}>

        {/* HOME */}
        {tab==="home" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.08))", border:"1px solid rgba(99,102,241,0.28)", borderRadius:24, padding:26, textAlign:"center", marginBottom:14 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#818cf8", textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:10 }}>Smoke-Free Time</div>
              <div style={{ fontSize:64, fontWeight:900, lineHeight:1, color:"#f1f5f9" }}>{duration.big}</div>
              <div style={{ fontSize:15, color:"#818cf8", marginTop:4, fontFamily:"sans-serif" }}>{duration.unit}</div>
              {nextMS && (
                <div style={{ marginTop:18 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, fontFamily:"sans-serif", marginBottom:6 }}>
                    <span>Next: {nextMS.icon} {nextMS.label}</span><span>{Math.round(msProg)}%</span>
                  </div>
                  <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${msProg}%`, background:"linear-gradient(90deg,#6366f1,#a78bfa)", borderRadius:99, transition:"width 1.5s ease" }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"Cigs Avoided",  value:cigsAvoided,   color:C.green },
                { label:"Kwacha Saved",  value:`K${saved.toFixed(0)}`, color:C.green },
                { label:"Life Regained", value:lifeMin>=60?`${Math.floor(lifeMin/60)}h ${lifeMin%60}m`:`${lifeMin}m`, color:C.gold },
                { label:"Badges",        value:`${badges.length}/${ACHIEVEMENTS.length}`, color:"#c084fc" },
              ].map(s => (
                <div key={s.label} style={{ ...card({ padding:"16px 14px", textAlign:"center", marginBottom:0 }) }}>
                  <div style={{ fontSize:22, fontWeight:"bold", color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ ...card({ background:"rgba(99,102,241,0.07)", borderColor:"rgba(99,102,241,0.2)" }) }}>
              <div style={{ fontSize:10, letterSpacing:2, color:C.purple, fontFamily:"sans-serif", marginBottom:6 }}>TODAY'S MOTIVATION</div>
              <div style={{ fontSize:13, lineHeight:1.7, fontStyle:"italic", color:"#cbd5e1", fontFamily:"sans-serif" }}>"{motivation}"</div>
            </div>

            <button onClick={logCraving} style={{ width:"100%", padding:14, borderRadius:16, background:"linear-gradient(135deg,#f59e0b,#ef4444)", border:"none", color:"white", fontSize:14, fontWeight:"bold", cursor:"pointer", fontFamily:"sans-serif", marginBottom:10, boxShadow:"0 4px 16px rgba(245,158,11,0.2)" }}>
              🚨 I'm Having a Craving
            </button>

            {tip && (
              <div style={{ ...card({ background:"rgba(74,222,128,0.07)", borderColor:"rgba(74,222,128,0.2)", fontSize:14, lineHeight:1.6, fontFamily:"sans-serif" }) }}>
                {tip}
                {cravings.length>0 && <div style={{ marginTop:8, paddingTop:8, borderTop:`1px solid ${C.bdr}`, fontSize:12, color:C.muted }}>
                  Logged {cravings[0].time} — {cravings.length} craving{cravings.length>1?"s":""} beaten 💪
                </div>}
              </div>
            )}

            <div style={card()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:13, fontFamily:"sans-serif", color:"#94a3b8" }}>Savings Goal</div>
                <div style={{ fontSize:13, fontWeight:"bold", color:C.green }}>K{saved.toFixed(0)} / K{goalK}</div>
              </div>
              <div style={{ height:7, background:"rgba(255,255,255,0.07)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${goalPct}%`, background:"linear-gradient(90deg,#4ade80,#22c55e)", borderRadius:99, transition:"width 1s ease" }} />
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
                <span style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif" }}>Goal (K):</span>
                <input type="number" value={goalK} onChange={e => setGoalK(+e.target.value)}
                  style={{ flex:1, padding:"6px 10px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:`1px solid ${C.bdr}`, color:"#f1f5f9", fontSize:13, fontFamily:"sans-serif" }} />
              </div>
            </div>

            {!showReset
              ? <button onClick={()=>setShowReset(true)} style={{ width:"100%", padding:12, borderRadius:14, background:"transparent", border:"1px solid rgba(239,68,68,0.25)", color:C.red, fontSize:13, cursor:"pointer", fontFamily:"sans-serif" }}>I slipped up — restart timer</button>
              : <div style={{ ...card({ background:"rgba(239,68,68,0.07)", borderColor:"rgba(239,68,68,0.25)", textAlign:"center" }) }}>
                  <p style={{ fontSize:13, fontFamily:"sans-serif", marginBottom:12, color:"#fca5a5" }}>It's okay — every attempt counts. Ready to restart?</p>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={()=>setShowReset(false)} style={{ flex:1, padding:11, borderRadius:11, background:"rgba(255,255,255,0.08)", border:"none", color:"white", cursor:"pointer", fontFamily:"sans-serif" }}>Keep Going 💪</button>
                    <button onClick={handleReset} style={{ flex:1, padding:11, borderRadius:11, background:C.red, border:"none", color:"white", cursor:"pointer", fontFamily:"sans-serif" }}>Restart</button>
                  </div>
                </div>
            }
          </div>
        )}

        {/* HEALTH */}
        {tab==="health" && (
          <div>
            <p style={{ fontSize:13, color:C.muted, fontFamily:"sans-serif", marginBottom:16 }}>Your body started healing the moment you stopped.</p>
            {HEALTH_MILESTONES.map((m,i) => {
              const done = minutes >= m.minutes;
              const here = !done && (i===0 || minutes >= HEALTH_MILESTONES[i-1].minutes);
              return (
                <div key={m.minutes} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 0", borderBottom:`1px solid ${C.bdr}`, opacity:done||here?1:0.3 }}>
                  <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, background:done?"rgba(74,222,128,0.12)":"rgba(255,255,255,0.04)", border:done?"1px solid rgba(74,222,128,0.35)":`1px solid ${C.bdr}` }}>{m.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:done?C.green:"#94a3b8", fontFamily:"sans-serif" }}>
                      {m.label} {here && <span style={{ color:C.gold, fontSize:11, fontWeight:"normal" }}>← you're here</span>}
                    </div>
                    <div style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif", marginTop:2 }}>{m.desc}</div>
                  </div>
                  {done && <span style={{ color:C.green }}>✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* SAVINGS */}
        {tab==="savings" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,rgba(74,222,128,0.14),rgba(16,185,129,0.04))", border:"1px solid rgba(74,222,128,0.22)", borderRadius:24, padding:26, textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:C.green, textTransform:"uppercase", fontFamily:"sans-serif", marginBottom:8 }}>Total Saved</div>
              <div style={{ fontSize:52, fontWeight:900, color:C.green, lineHeight:1 }}>K{saved.toFixed(2)}</div>
              <div style={{ fontSize:12, color:C.muted, fontFamily:"sans-serif", marginTop:8 }}>{cigsAvoided} cigarettes not bought</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"This Week",   value:`K${((cigsPerDay/20)*packPrice*Math.min(7,streak)).toFixed(0)}`  },
                { label:"This Month",  value:`K${((cigsPerDay/20)*packPrice*Math.min(30,streak)).toFixed(0)}` },
                { label:"Per Year",    value:`K${((cigsPerDay/20)*packPrice*365).toFixed(0)}`                 },
                { label:"Life Saved",  value:lifeMin>=60?`${Math.floor(lifeMin/60)}h ${lifeMin%60}m`:`${lifeMin}m` },
              ].map(s => (
                <div key={s.label} style={{ ...card({ padding:"14px", textAlign:"center", marginBottom:0 }) }}>
                  <div style={{ fontSize:20, fontWeight:"bold", color:C.green }}>{s.value}</div>
                  <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", marginTop:3 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {[
              { label:"Cigarettes per day", value:cigsPerDay, set:setCigsPerDay, min:1, max:60 },
              { label:"Pack price (K)",     value:packPrice,  set:setPackPrice,  min:5, max:500 },
            ].map(f => (
              <div key={f.label} style={card()}>
                <div style={{ fontSize:13, color:"#94a3b8", fontFamily:"sans-serif", marginBottom:10 }}>{f.label}</div>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <button onClick={()=>f.set(v=>Math.max(f.min,v-1))} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.08)", border:"none", color:"white", fontSize:20, cursor:"pointer" }}>−</button>
                  <div style={{ flex:1, textAlign:"center", fontSize:22, fontWeight:"bold" }}>{f.value}</div>
                  <button onClick={()=>f.set(v=>Math.min(f.max,v+1))} style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.08)", border:"none", color:"white", fontSize:20, cursor:"pointer" }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BREATHE */}
        {tab==="breathe" && (
          <div style={{ textAlign:"center" }}>
            <p style={{ fontSize:13, color:C.muted, fontFamily:"sans-serif", marginBottom:28 }}>Box breathing physically calms your nervous system within minutes.</p>
            <div style={{ position:"relative", width:200, height:200, margin:"0 auto 24px" }}>
              <svg width="200" height="200" style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                <circle cx="100" cy="100" r="88" fill="none"
                  stroke={breathOn ? curStep.color : "#1e293b"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*88}`}
                  strokeDashoffset={`${2*Math.PI*88*(1-breathProg/100)}`}
                  style={{ transition:"stroke-dashoffset 0.1s linear, stroke 0.4s" }}
                />
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                {breathOn
                  ? <><div style={{ fontSize:24, fontWeight:"bold", color:curStep.color }}>{curStep.label}</div><div style={{ fontSize:13, color:C.muted, fontFamily:"sans-serif", marginTop:4 }}>{curStep.duration}s</div></>
                  : <div style={{ fontSize:38 }}>🌬️</div>
                }
              </div>
            </div>

            <button onClick={()=>{ setBreathOn(a=>!a); setBreathProg(0); if(!breathOn) setBreathIdx(0); }}
              style={{ padding:"13px 44px", borderRadius:50, background:breathOn?"rgba(239,68,68,0.18)":`linear-gradient(135deg,${C.purple},${C.violet})`, border:breathOn?"1px solid rgba(239,68,68,0.4)":"none", color:"white", fontSize:16, fontWeight:"bold", cursor:"pointer", fontFamily:"sans-serif", marginBottom:24 }}>
              {breathOn ? "Stop" : "Begin"}
            </button>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {BREATHING_STEPS.map((s,i) => (
                <div key={s.label} style={{ padding:10, borderRadius:12, background:breathOn&&breathIdx===i?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.03)", border:`1px solid ${breathOn&&breathIdx===i?s.color+"70":C.bdr}`, textAlign:"center" }}>
                  <div style={{ fontSize:10, color:s.color, fontFamily:"sans-serif", marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:16, fontWeight:"bold" }}>{s.duration}s</div>
                </div>
              ))}
            </div>

            {cravings.length>0 && (
              <div style={{ ...card({ marginTop:20, textAlign:"left" }) }}>
                <div style={{ fontSize:10, letterSpacing:2, color:C.muted, fontFamily:"sans-serif", marginBottom:10 }}>CRAVING LOG</div>
                {cravings.slice(0,5).map((c,i) => (
                  <div key={i} style={{ fontSize:12, color:"#64748b", fontFamily:"sans-serif", padding:"5px 0", borderBottom:i<4?`1px solid ${C.bdr}`:"none" }}>
                    {c.date} at {c.time}
                  </div>
                ))}
                {cravings.length>5 && <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", marginTop:6 }}>+{cravings.length-5} more</div>}
              </div>
            )}
          </div>
        )}

        {/* BADGES */}
        {tab==="badges" && (
          <div>
            <p style={{ fontSize:13, color:C.muted, fontFamily:"sans-serif", marginBottom:16 }}>{badges.length} of {ACHIEVEMENTS.length} unlocked. Keep going!</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {ACHIEVEMENTS.map(a => {
                const done = badges.includes(a.id);
                return (
                  <div key={a.id} style={{ ...card({ marginBottom:0, textAlign:"center", padding:16, opacity:done?1:0.35, background:done?"rgba(251,191,36,0.07)":C.sub, borderColor:done?"rgba(251,191,36,0.3)":C.bdr }) }}>
                    <div style={{ fontSize:30, marginBottom:6 }}>{a.icon}</div>
                    <div style={{ fontSize:12, fontWeight:"bold", color:done?C.gold:"#94a3b8", fontFamily:"sans-serif" }}>{a.title}</div>
                    <div style={{ fontSize:11, color:C.muted, fontFamily:"sans-serif", marginTop:4, lineHeight:1.4 }}>{a.desc}</div>
                    {!done && <div style={{ fontSize:10, color:"#2d3748", fontFamily:"sans-serif", marginTop:6 }}>🔒 locked</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:"rgba(8,8,18,0.97)", backdropFilter:"blur(20px)", borderTop:`1px solid ${C.bdr}`, display:"grid", gridTemplateColumns:"repeat(5,1fr)", padding:"10px 0 16px", zIndex:100 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 0" }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:9, fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:1, color:tab===t.id?"#818cf8":"#374151", fontWeight:tab===t.id?700:400 }}>{t.label}</span>
            {tab===t.id && <div style={{ width:4, height:4, borderRadius:"50%", background:C.purple }} />}
          </button>
        ))}
      </div>
    </div>
  );
}