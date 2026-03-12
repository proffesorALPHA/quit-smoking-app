import { useState, useEffect, useRef } from "react";

// ── STORAGE ───────────────────────────────────────────────────────────────────
const store = {
  get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

// ── CAMO PALETTE ──────────────────────────────────────────────────────────────
const C = {
  dark1:  "#141a0e", dark2: "#1c2414", dark3: "#243018",
  mid1:   "#2e3d1c", mid2:  "#3a4e22", mid3:  "#485f2b",
  light1: "#5a7234", light2:"#6b864",
  tan1:   "#7a6840", tan2:  "#9a8558",
  accent: "#8fc43a",
  gold:   "#c9a227",
  alert:  "#c0392b",
  muted:  "#5a6640",
  text:   "#cfd8a8",
  dim:    "#7a8860",
  border: "rgba(143,196,58,0.13)",
  sub:    "rgba(46,61,28,0.55)",
  glass:  "rgba(20,26,14,0.92)",
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const HEALTH_MILESTONES = [
  { minutes:20,     label:"20 minutes", desc:"Heart rate & blood pressure drop",  icon:"❤️" },
  { minutes:480,    label:"8 hours",    desc:"Carbon monoxide normalises",         icon:"🫁" },
  { minutes:1440,   label:"24 hours",   desc:"Heart attack risk begins to fall",   icon:"🛡️" },
  { minutes:2880,   label:"48 hours",   desc:"Taste & smell returning",            icon:"👃" },
  { minutes:10080,  label:"1 week",     desc:"Nicotine fully leaves your body",    icon:"✨" },
  { minutes:20160,  label:"2 weeks",    desc:"Circulation improving",              icon:"🫀" },
  { minutes:43800,  label:"1 month",    desc:"Coughing & breathlessness ease",     icon:"💪" },
  { minutes:131400, label:"3 months",   desc:"Lung function up by 10%",            icon:"🌱" },
  { minutes:262800, label:"6 months",   desc:"Cravings almost gone",               icon:"⭐" },
  { minutes:525960, label:"1 year",     desc:"Heart disease risk halved",          icon:"🏆" },
];

const ACHIEVEMENTS = [
  { id:"first_hour",   minutes:60,     title:"First Hour",      icon:"⏱️" },
  { id:"first_day",    minutes:1440,   title:"Day One Done",    icon:"🌅" },
  { id:"three_days",   minutes:4320,   title:"3 Day Warrior",   icon:"⚔️" },
  { id:"one_week",     minutes:10080,  title:"One Week Strong", icon:"🌟" },
  { id:"two_weeks",    minutes:20160,  title:"Two Week Hero",   icon:"🦸" },
  { id:"one_month",    minutes:43800,  title:"Monthly Master",  icon:"🏅" },
  { id:"three_months", minutes:131400, title:"Quarter Champ",   icon:"🎖️" },
  { id:"six_months",   minutes:262800, title:"Half Year",       icon:"💎" },
  { id:"one_year",     minutes:525960, title:"Year Champion",   icon:"👑" },
];

const BREATH_STEPS = [
  { label:"Inhale",  duration:4, color:C.accent },
  { label:"Hold",    duration:4, color:C.gold   },
  { label:"Exhale",  duration:6, color:C.tan2   },
  { label:"Rest",    duration:2, color:C.dim     },
];

const TIPS = [
  "Drink a full glass of cold water slowly 💧",
  "Do 10 jumping jacks right now 🏃",
  "A soldier endures — this craving passes in 3–5 min ⏱️",
  "Call or text someone you trust 📱",
  "Brush your teeth — smoke tastes awful after 🪥",
  "Step outside and breathe clean air 🌿",
  "NOT ONE PUFF — ever. Hold the line 🚫",
];

const PILLARS = [
  {
    id:"spirit", label:"SPIRIT", icon:"✝️", color:C.gold,
    verse:"\"Be strong and courageous. Do not be afraid.\" — Joshua 1:9",
    habits:[
      { id:"prayer",    label:"Prayer / Meditation",  desc:"5–15 min morning or night" },
      { id:"scripture", label:"Scripture Reading",     desc:"One passage daily" },
      { id:"reflect",   label:"Nightly Reflection",    desc:"What went well, what to improve" },
    ],
  },
  {
    id:"discipline", label:"DISCIPLINE", icon:"⚔️", color:C.alert,
    verse:"\"Discipline is the soul of an army.\" — George Washington",
    habits:[
      { id:"rise",     label:"Early Rising",       desc:"No snooze — own the morning" },
      { id:"pt",       label:"Physical Training",   desc:"Run, strength, endurance" },
      { id:"strategy", label:"Strategic Study",     desc:"Military strategy & leadership" },
    ],
  },
  {
    id:"engineer", label:"ENGINEER", icon:"⚙️", color:"#4a9eff",
    verse:"\"An engineer solves problems others cannot see coming.\"",
    habits:[
      { id:"learning", label:"Technical Learning",   desc:"Maths, physics, electronics" },
      { id:"build",    label:"Build / Fix Project",  desc:"Create or repair something" },
      { id:"notebook", label:"Engineering Notebook", desc:"Capture ideas & designs" },
    ],
  },
  {
    id:"family", label:"FAMILY", icon:"🏡", color:C.accent,
    verse:"\"A man who leads his family well, leads well everywhere.\"",
    habits:[
      { id:"presence", label:"Intentional Presence",  desc:"Full attention, no distractions" },
      { id:"calm",     label:"Calm Communication",    desc:"Speak with patience & clarity" },
    ],
  },
];

const IDENTITY_Qs = [
  "What would the commander I'm becoming do right now?",
  "Am I living with military discipline today?",
  "Did I lead my family with strength and love?",
  "Did I grow as an engineer today?",
  "Did I strengthen my spirit today?",
  "Would my future self be proud of today's mission?",
];

const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DAY_NAMES   = ["S","M","T","W","T","F","S"];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function pad(n){ return String(n).padStart(2,"0"); }
function dateKey(d=new Date()){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function toLocal(ts){ const d=new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fmtTime(mins){
  const m=Math.floor(mins);
  if(m<60) return {big:m, unit:"minutes"};
  if(m<1440) return {big:`${Math.floor(m/60)}h ${m%60}m`, unit:"today"};
  const d=Math.floor(m/1440), h=Math.floor((m%1440)/60);
  return {big:d, unit:h>0?`days, ${h}h`:"days"};
}
function daysInMonth(y,mo){ return new Date(y,mo+1,0).getDate(); }
function firstDay(y,mo){ return new Date(y,mo,1).getDay(); }

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded,      setLoaded]      = useState(false);
  const [tab,         setTab]         = useState("command");

  // smoke
  const [quitTs,      setQuitTs]      = useState(null);
  const [setupInput,  setSetupInput]  = useState(toLocal(Date.now()-9*3600000));
  const [minutes,     setMinutes]     = useState(0);
  const [cigsPerDay,  setCigsPerDay]  = useState(12);
  const [packPrice,   setPackPrice]   = useState(40);
  const [goalK,       setGoalK]       = useState(500);
  const [tip,         setTip]         = useState("");
  const [cravings,    setCravings]    = useState([]);
  const [showReset,   setShowReset]   = useState(false);
  const [breathIdx,   setBreathIdx]   = useState(0);
  const [breathOn,    setBreathOn]    = useState(false);
  const [breathProg,  setBreathProg]  = useState(0);
  const [badges,      setBadges]      = useState([]);
  const [newBadge,    setNewBadge]    = useState(null);
  const [smokeTab,    setSmokeTab]    = useState("timer");

  // blueprint
  const [habitLog,       setHabitLog]       = useState({});
  const [activePillar,   setActivePillar]   = useState("spirit");
  const [idxQ,           setIdxQ]           = useState(0);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalText,    setJournalText]    = useState("");
  const [notebookEntries,setNotebookEntries]= useState([]);
  const [notebookText,   setNotebookText]   = useState("");

  // calendar
  const [calMonth,    setCalMonth]    = useState(new Date().getMonth());
  const [calYear,     setCalYear]     = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const prevBadgesRef = useRef([]);
  const saveTimer     = useRef(null);
  const today         = dateKey();

  // ── LOAD ──
  useEffect(()=>{
    const d = store.get("elisha_v3");
    if(d){
      if(d.quitTs)          setQuitTs(d.quitTs);
      if(d.cigsPerDay)      setCigsPerDay(d.cigsPerDay);
      if(d.packPrice)       setPackPrice(d.packPrice);
      if(d.goalK)           setGoalK(d.goalK);
      if(d.cravings)        setCravings(d.cravings);
      if(d.habitLog)        setHabitLog(d.habitLog);
      if(d.journalEntries)  setJournalEntries(d.journalEntries);
      if(d.notebookEntries) setNotebookEntries(d.notebookEntries);
    }
    setLoaded(true);
  },[]);

  // ── SAVE ──
  useEffect(()=>{
    if(!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(()=>{
      store.set("elisha_v3",{quitTs,cigsPerDay,packPrice,goalK,cravings,habitLog,journalEntries,notebookEntries});
    },600);
  },[quitTs,cigsPerDay,packPrice,goalK,cravings,habitLog,journalEntries,notebookEntries,loaded]);

  // ── TIMER ──
  useEffect(()=>{
    if(!quitTs) return;
    const tick=()=>setMinutes(Math.max(0,(Date.now()-quitTs)/60000));
    tick();
    const id=setInterval(tick,1000);
    return()=>clearInterval(id);
  },[quitTs]);

  // ── BADGES ──
  useEffect(()=>{
    const earned=ACHIEVEMENTS.filter(a=>minutes>=a.minutes).map(a=>a.id);
    const newest=earned.find(id=>!prevBadgesRef.current.includes(id));
    if(newest){ setNewBadge(ACHIEVEMENTS.find(a=>a.id===newest)); setTimeout(()=>setNewBadge(null),4000); }
    prevBadgesRef.current=earned;
    setBadges(earned);
  },[Math.floor(minutes/60)]);

  // ── BREATHING ──
  useEffect(()=>{
    if(!breathOn) return;
    const step=BREATH_STEPS[breathIdx];
    let elapsed=0;
    const iv=setInterval(()=>{elapsed+=100;setBreathProg((elapsed/(step.duration*1000))*100);},100);
    const t=setTimeout(()=>{setBreathIdx(i=>(i+1)%BREATH_STEPS.length);setBreathProg(0);},step.duration*1000);
    return()=>{clearInterval(iv);clearTimeout(t);};
  },[breathIdx,breathOn]);

  // ── IDENTITY ──
  useEffect(()=>{
    const id=setInterval(()=>setIdxQ(i=>(i+1)%IDENTITY_Qs.length),8000);
    return()=>clearInterval(id);
  },[]);

  // ── DERIVED ──
  const cigsAvoided = Math.floor((minutes/1440)*cigsPerDay);
  const saved       = (cigsAvoided/20)*packPrice;
  const lifeMin     = cigsAvoided*11;
  const streak      = Math.floor(minutes/1440);
  const nextMS      = HEALTH_MILESTONES.find(m=>minutes<m.minutes);
  const msProg      = nextMS?Math.min(100,(minutes/nextMS.minutes)*100):100;
  const duration    = fmtTime(minutes);
  const goalPct     = Math.min(100,(saved/goalK)*100);
  const curStep     = BREATH_STEPS[breathIdx];
  const totalHabits = PILLARS.reduce((s,p)=>s+p.habits.length,0);
  const todayH      = habitLog[today]||{};
  const doneHabits  = Object.values(todayH).filter(Boolean).length;
  const dailyScore  = Math.round((doneHabits/totalHabits)*100);
  const pillar      = PILLARS.find(p=>p.id===activePillar);

  const toggleHabit=(id)=>setHabitLog(prev=>({...prev,[today]:{...(prev[today]||{}),[id]:!(prev[today]||{})[id]}}));
  const addJournal=()=>{ if(!journalText.trim()) return; setJournalEntries(prev=>[{text:journalText,date:new Date().toLocaleString(),dayKey:today},...prev].slice(0,100)); setJournalText(""); };
  const addNotebook=()=>{ if(!notebookText.trim()) return; setNotebookEntries(prev=>[{text:notebookText,date:new Date().toLocaleString(),dayKey:today},...prev].slice(0,100)); setNotebookText(""); };

  // ── CALENDAR ──
  const getDayScore=(key)=>{ const h=habitLog[key]||{}; const done=Object.values(h).filter(Boolean).length; return totalHabits>0?Math.round((done/totalHabits)*100):0; };
  const getDayBg=(score)=>{ if(score===0) return "rgba(255,255,255,0.03)"; if(score<40) return `rgba(192,57,43,0.35)`; if(score<70) return `rgba(201,162,39,0.4)`; return `rgba(143,196,58,0.45)`; };

  const TABS = [
    {id:"command",  icon:"⚡", label:"OPS"},
    {id:"smoke",    icon:"🚭", label:"SMOKE"},
    {id:"mission",  icon:"📋", label:"MISSION"},
    {id:"calendar", icon:"📅", label:"LOG"},
    {id:"intel",    icon:"📓", label:"INTEL"},
  ];

  if(!loaded) return (
    <div style={{minHeight:"100vh",background:C.dark1,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontSize:10,letterSpacing:5,color:C.accent,fontFamily:"'Courier New',monospace"}}>LOADING...</div>
    </div>
  );

  const BG = `repeating-linear-gradient(
    45deg,
    ${C.dark1} 0px, ${C.dark1} 18px,
    ${C.dark2} 18px, ${C.dark2} 36px,
    ${C.mid1} 36px, ${C.mid1} 44px,
    ${C.dark3} 44px, ${C.dark3} 62px,
    ${C.dark1} 62px, ${C.dark1} 80px
  )`;

  const BOX = (extra={})=>({background:C.sub,border:`1px solid ${C.border}`,borderRadius:8,padding:13,marginBottom:9,...extra});
  const BTN = (bg,clr,extra={})=>({padding:"10px 0",borderRadius:6,background:bg,border:`1px solid ${clr}40`,color:clr,fontSize:10,fontWeight:"bold",cursor:"pointer",letterSpacing:3,fontFamily:"'Courier New',monospace",...extra});

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Courier New',Courier,monospace",color:C.text,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto",position:"relative"}}>

      {/* overlay for readability */}
      <div style={{position:"fixed",inset:0,background:"rgba(12,16,8,0.78)",pointerEvents:"none",zIndex:0}}/>

      {/* BADGE TOAST */}
      {newBadge&&(
        <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:999,background:`linear-gradient(135deg,${C.gold},#8a6c18)`,borderRadius:8,padding:"11px 18px",display:"flex",alignItems:"center",gap:10,boxShadow:`0 6px 24px rgba(201,162,39,0.45)`,maxWidth:300,width:"90%",border:`1px solid ${C.gold}`}}>
          <span style={{fontSize:24}}>{newBadge.icon}</span>
          <div><div style={{fontWeight:"bold",color:C.dark1,fontSize:11,letterSpacing:2}}>COMMENDATION EARNED</div><div style={{color:C.dark2,fontSize:10,marginTop:2}}>{newBadge.title.toUpperCase()}</div></div>
        </div>
      )}

      {/* HEADER */}
      <div style={{position:"relative",zIndex:1,background:C.glass,backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`}}>
        <div style={{height:3,background:`linear-gradient(90deg,${C.dark3},${C.mid2},${C.tan1},${C.light1},${C.mid1},${C.dark2})`}}/>
        <div style={{padding:"12px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:7,letterSpacing:5,color:C.muted,marginBottom:3}}>FIELD COMMAND · ZAMBIA</div>
            <div style={{fontSize:17,fontWeight:"bold",color:C.accent,letterSpacing:3}}>ELISHA PHIRI</div>
            <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginTop:2}}>COMMANDER · ENGINEER · FATHER</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:7,letterSpacing:3,color:C.muted}}>DAILY SCORE</div>
            <div style={{fontSize:26,fontWeight:900,letterSpacing:1,color:dailyScore>=80?C.accent:dailyScore>=50?C.gold:C.alert}}>{dailyScore}%</div>
            <div style={{fontSize:7,color:C.muted,letterSpacing:2}}>{doneHabits}/{totalHabits} OBJ</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,padding:"0 14px 100px",overflowY:"auto",position:"relative",zIndex:1}}>

        {/* ═══ OPS / COMMAND ═══ */}
        {tab==="command"&&(
          <div>
            {/* identity directive */}
            <div style={{...BOX({background:"rgba(201,162,39,0.07)",borderColor:"rgba(201,162,39,0.22)",borderLeft:`3px solid ${C.gold}`,marginTop:12})}}>
              <div style={{fontSize:7,letterSpacing:4,color:C.gold,marginBottom:5}}>IDENTITY DIRECTIVE</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.8,fontStyle:"italic"}}>"{IDENTITY_Qs[idxQ]}"</div>
            </div>

            {/* mission bar */}
            <div style={BOX()}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <div style={{fontSize:7,letterSpacing:4,color:C.muted}}>TODAY'S MISSION</div>
                <div style={{fontSize:9,color:C.accent}}>{doneHabits}/{totalHabits} COMPLETE</div>
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${dailyScore}%`,background:`linear-gradient(90deg,${C.mid2},${C.accent})`,transition:"width 1s ease"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${totalHabits},1fr)`,gap:2,marginTop:7}}>
                {Array.from({length:totalHabits}).map((_,i)=>(
                  <div key={i} style={{height:3,borderRadius:1,background:i<doneHabits?C.accent:"rgba(255,255,255,0.05)"}}/>
                ))}
              </div>
            </div>

            {/* pillar grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:9}}>
              {PILLARS.map(p=>{
                const done=p.habits.filter(h=>(habitLog[today]||{})[h.id]).length;
                const pct=Math.round((done/p.habits.length)*100);
                return(
                  <div key={p.id} onClick={()=>{setActivePillar(p.id);setTab("mission");}}
                    style={{...BOX({cursor:"pointer",marginBottom:0,padding:"11px 10px",borderTop:`2px solid ${p.color}`})}}>
                    <div style={{fontSize:17,marginBottom:3}}>{p.icon}</div>
                    <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginBottom:2}}>{p.label}</div>
                    <div style={{fontSize:20,fontWeight:900,color:pct===100?C.accent:C.text}}>{pct}%</div>
                    <div style={{height:2,background:"rgba(255,255,255,0.05)",marginTop:5,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:p.color}}/>
                    </div>
                    <div style={{fontSize:8,color:C.muted,marginTop:4}}>{done}/{p.habits.length} tasks</div>
                  </div>
                );
              })}
            </div>

            {/* smoke summary */}
            {quitTs?(
              <div onClick={()=>setTab("smoke")} style={{...BOX({background:"rgba(143,196,58,0.06)",borderColor:"rgba(143,196,58,0.18)",cursor:"pointer"})}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:7,letterSpacing:4,color:C.muted,marginBottom:4}}>SMOKE-FREE OPERATION</div>
                    <div style={{fontSize:28,fontWeight:900,color:C.accent,lineHeight:1}}>{duration.big}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2,letterSpacing:1}}>{duration.unit}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:7,letterSpacing:3,color:C.muted}}>SAVED</div>
                    <div style={{fontSize:22,fontWeight:900,color:C.accent}}>K{saved.toFixed(0)}</div>
                    <div style={{fontSize:8,color:C.muted,marginTop:2}}>🔥 {streak}d STREAK</div>
                  </div>
                </div>
              </div>
            ):(
              <div onClick={()=>setTab("smoke")} style={{...BOX({background:"rgba(192,57,43,0.07)",borderColor:"rgba(192,57,43,0.2)",cursor:"pointer",textAlign:"center"})}}>
                <div style={{fontSize:10,color:"#e07060",letterSpacing:3}}>🚭 SET QUIT TIME → TAP HERE</div>
              </div>
            )}

            {/* last journal */}
            {journalEntries.length>0&&(
              <div style={{...BOX({background:"rgba(201,162,39,0.04)",borderColor:"rgba(201,162,39,0.12)"})}}>
                <div style={{fontSize:7,letterSpacing:4,color:C.muted,marginBottom:5}}>LAST FIELD REPORT</div>
                <div style={{fontSize:11,color:C.dim,fontStyle:"italic",lineHeight:1.7}}>"{journalEntries[0].text.slice(0,110)}{journalEntries[0].text.length>110?"...":""}"</div>
                <div style={{fontSize:8,color:C.muted,marginTop:5}}>{journalEntries[0].date}</div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SMOKE ═══ */}
        {tab==="smoke"&&(
          <div>
            <div style={{display:"flex",gap:4,margin:"10px 0",overflowX:"auto",paddingBottom:2}}>
              {["timer","health","savings","breathe","badges"].map(st=>(
                <button key={st} onClick={()=>setSmokeTab(st)} style={{padding:"5px 10px",borderRadius:3,background:smokeTab===st?`${C.mid2}90`:"rgba(255,255,255,0.02)",border:smokeTab===st?`1px solid ${C.accent}`:`1px solid ${C.border}`,color:smokeTab===st?C.accent:C.muted,fontSize:8,cursor:"pointer",letterSpacing:2,whiteSpace:"nowrap",fontFamily:"'Courier New',monospace"}}>
                  {st.toUpperCase()}
                </button>
              ))}
            </div>

            {/* TIMER */}
            {smokeTab==="timer"&&(
              !quitTs?(
                <div style={{...BOX({textAlign:"center",marginTop:8})}}>
                  <div style={{fontSize:28,marginBottom:8}}>🚭</div>
                  <div style={{fontSize:13,letterSpacing:3,color:C.text,marginBottom:4}}>SET QUIT TIME</div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:14,letterSpacing:1}}>Saved permanently on your device</div>
                  <input type="datetime-local" value={setupInput} onChange={e=>setSetupInput(e.target.value)}
                    style={{width:"100%",padding:"9px 10px",borderRadius:5,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,color:C.text,fontSize:12,fontFamily:"'Courier New',monospace",boxSizing:"border-box",colorScheme:"dark",marginBottom:10}}/>
                  <button onClick={()=>{const ts=new Date(setupInput).getTime();if(!isNaN(ts))setQuitTs(ts);}}
                    style={{...BTN(`linear-gradient(135deg,${C.mid2},${C.mid3})`,C.accent,{width:"100%",padding:12})}}>
                    BEGIN OPERATION →
                  </button>
                </div>
              ):(
                <div>
                  <div style={{...BOX({background:"rgba(46,61,28,0.7)",borderColor:"rgba(143,196,58,0.25)",textAlign:"center",marginTop:8})}}>
                    <div style={{fontSize:8,letterSpacing:5,color:C.muted,marginBottom:7}}>SMOKE-FREE TIME</div>
                    <div style={{fontSize:54,fontWeight:900,color:C.accent,lineHeight:1,letterSpacing:2}}>{duration.big}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:4,letterSpacing:3}}>{duration.unit}</div>
                    {nextMS&&(
                      <div style={{marginTop:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.muted,letterSpacing:1,marginBottom:4}}>
                          <span>NEXT: {nextMS.icon} {nextMS.label.toUpperCase()}</span><span>{Math.round(msProg)}%</span>
                        </div>
                        <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${msProg}%`,background:`linear-gradient(90deg,${C.mid2},${C.accent})`,transition:"width 1.5s ease"}}/>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:9}}>
                    {[
                      {label:"CIGS AVOIDED", value:cigsAvoided,color:C.accent},
                      {label:"KWACHA SAVED", value:`K${saved.toFixed(0)}`,color:C.accent},
                      {label:"LIFE REGAINED",value:lifeMin>=60?`${Math.floor(lifeMin/60)}h${lifeMin%60}m`:`${lifeMin}m`,color:C.gold},
                      {label:"BADGES",       value:`${badges.length}/${ACHIEVEMENTS.length}`,color:C.tan2},
                    ].map(s=>(
                      <div key={s.label} style={{...BOX({padding:"11px 10px",textAlign:"center",marginBottom:0})}}>
                        <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.value}</div>
                        <div style={{fontSize:7,color:C.muted,marginTop:3,letterSpacing:2}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setCravings(p=>[{time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),date:new Date().toLocaleDateString()},...p].slice(0,30));setTip(TIPS[Math.floor(Math.random()*TIPS.length)]);}}
                    style={{...BTN(`linear-gradient(135deg,${C.tan1},${C.alert})`,C.text,{width:"100%",marginBottom:8,padding:11})}}>
                    🚨 CRAVING — HOLD THE LINE
                  </button>
                  {tip&&(
                    <div style={{...BOX({background:"rgba(143,196,58,0.06)",borderColor:"rgba(143,196,58,0.18)",fontSize:12,lineHeight:1.8})}}>
                      {tip}
                      {cravings.length>0&&<div style={{marginTop:5,fontSize:8,color:C.muted,letterSpacing:2}}>{cravings.length} CRAVINGS DEFEATED 💪</div>}
                    </div>
                  )}
                  <div style={BOX()}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:8,color:C.muted,letterSpacing:2}}>SAVINGS OBJECTIVE</span>
                      <span style={{fontSize:9,fontWeight:"bold",color:C.accent}}>K{saved.toFixed(0)} / K{goalK}</span>
                    </div>
                    <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${goalPct}%`,background:`linear-gradient(90deg,${C.mid3},${C.accent})`}}/>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:7,marginTop:8}}>
                      <span style={{fontSize:8,color:C.muted,letterSpacing:1}}>GOAL (K):</span>
                      <input type="number" value={goalK} onChange={e=>setGoalK(+e.target.value)}
                        style={{flex:1,padding:"4px 8px",borderRadius:4,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,color:C.text,fontSize:12,fontFamily:"'Courier New',monospace"}}/>
                    </div>
                  </div>
                  {!showReset
                    ?<button onClick={()=>setShowReset(true)} style={{...BTN("transparent",C.alert,{width:"100%",borderColor:`${C.alert}40`})}}>MISSION FAILED — RESTART</button>
                    :<div style={{...BOX({background:"rgba(192,57,43,0.07)",borderColor:"rgba(192,57,43,0.25)",textAlign:"center"})}}>
                      <p style={{fontSize:10,color:"#e07060",marginBottom:10,letterSpacing:1}}>EVERY ATTEMPT STRENGTHENS YOU. CONFIRM?</p>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>setShowReset(false)} style={{...BTN("rgba(255,255,255,0.05)",C.text,{flex:1})}}>HOLD POSITION 💪</button>
                        <button onClick={()=>{setQuitTs(null);setMinutes(0);setCravings([]);setShowReset(false);setSetupInput(toLocal(Date.now()));}} style={{...BTN(C.alert,"white",{flex:1})}}>RESTART</button>
                      </div>
                    </div>
                  }
                </div>
              )
            )}

            {/* HEALTH */}
            {smokeTab==="health"&&HEALTH_MILESTONES.map((m,i)=>{
              const done=minutes>=m.minutes;
              const here=!done&&(i===0||minutes>=HEALTH_MILESTONES[i-1].minutes);
              return(
                <div key={m.minutes} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${C.border}`,opacity:done||here?1:0.28}}>
                  <div style={{width:38,height:38,borderRadius:5,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:done?"rgba(143,196,58,0.1)":C.sub,border:done?`1px solid rgba(143,196,58,0.3)`:`1px solid ${C.border}`}}>{m.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:done?C.accent:C.muted,letterSpacing:1}}>
                      {m.label.toUpperCase()} {here&&<span style={{color:C.gold,fontSize:8}}>← YOU ARE HERE</span>}
                    </div>
                    <div style={{fontSize:9,color:C.dim,marginTop:2}}>{m.desc}</div>
                  </div>
                  {done&&<span style={{color:C.accent,fontSize:12}}>✓</span>}
                </div>
              );
            })}

            {/* SAVINGS */}
            {smokeTab==="savings"&&(
              <div>
                <div style={{...BOX({background:"rgba(143,196,58,0.07)",borderColor:"rgba(143,196,58,0.2)",textAlign:"center",marginTop:8})}}>
                  <div style={{fontSize:8,letterSpacing:4,color:C.accent,marginBottom:5}}>TOTAL SAVED</div>
                  <div style={{fontSize:44,fontWeight:900,color:C.accent}}>K{saved.toFixed(2)}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:4,letterSpacing:2}}>{cigsAvoided} CIGARETTES NOT BOUGHT</div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:9}}>
                  {[
                    {label:"THIS WEEK",  value:`K${((cigsPerDay/20)*packPrice*Math.min(7,streak)).toFixed(0)}`},
                    {label:"THIS MONTH", value:`K${((cigsPerDay/20)*packPrice*Math.min(30,streak)).toFixed(0)}`},
                    {label:"PER YEAR",   value:`K${((cigsPerDay/20)*packPrice*365).toFixed(0)}`},
                    {label:"LIFE BACK",  value:lifeMin>=60?`${Math.floor(lifeMin/60)}h`:`${lifeMin}m`},
                  ].map(s=>(
                    <div key={s.label} style={{...BOX({padding:"11px 10px",textAlign:"center",marginBottom:0})}}>
                      <div style={{fontSize:16,fontWeight:900,color:C.accent}}>{s.value}</div>
                      <div style={{fontSize:7,color:C.muted,marginTop:2,letterSpacing:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
                {[
                  {label:"CIGARETTES PER DAY",value:cigsPerDay,set:setCigsPerDay,min:1,max:60},
                  {label:"PACK PRICE (K)",     value:packPrice, set:setPackPrice, min:5,max:500},
                ].map(f=>(
                  <div key={f.label} style={BOX()}>
                    <div style={{fontSize:8,color:C.muted,letterSpacing:3,marginBottom:7}}>{f.label}</div>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <button onClick={()=>f.set(v=>Math.max(f.min,v-1))} style={{width:30,height:30,borderRadius:3,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,color:C.text,fontSize:16,cursor:"pointer"}}>−</button>
                      <div style={{flex:1,textAlign:"center",fontSize:20,fontWeight:900}}>{f.value}</div>
                      <button onClick={()=>f.set(v=>Math.min(f.max,v+1))} style={{width:30,height:30,borderRadius:3,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,color:C.text,fontSize:16,cursor:"pointer"}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BREATHE */}
            {smokeTab==="breathe"&&(
              <div style={{textAlign:"center",paddingTop:12}}>
                <div style={{fontSize:8,color:C.muted,letterSpacing:4,marginBottom:18}}>BOX BREATHING — TACTICAL CALM</div>
                <div style={{position:"relative",width:176,height:176,margin:"0 auto 18px"}}>
                  <svg width="176" height="176" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
                    <circle cx="88" cy="88" r="78" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6"/>
                    <circle cx="88" cy="88" r="78" fill="none"
                      stroke={breathOn?curStep.color:C.mid1} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*78}`}
                      strokeDashoffset={`${2*Math.PI*78*(1-breathProg/100)}`}
                      style={{transition:"stroke-dashoffset 0.1s linear,stroke 0.4s"}}
                    />
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    {breathOn
                      ?<><div style={{fontSize:18,fontWeight:"bold",color:curStep.color,letterSpacing:3}}>{curStep.label.toUpperCase()}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{curStep.duration}s</div></>
                      :<div style={{fontSize:30}}>🌬️</div>
                    }
                  </div>
                </div>
                <button onClick={()=>{setBreathOn(a=>!a);setBreathProg(0);if(!breathOn)setBreathIdx(0);}}
                  style={{...BTN(breathOn?`rgba(192,57,43,0.15)`:`linear-gradient(135deg,${C.mid2},${C.mid3})`,breathOn?C.alert:C.accent,{padding:"10px 34px"})}}>
                  {breathOn?"STAND DOWN":"BEGIN"}
                </button>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginTop:18}}>
                  {BREATH_STEPS.map((s,i)=>(
                    <div key={s.label} style={{padding:7,borderRadius:4,background:breathOn&&breathIdx===i?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",border:`1px solid ${breathOn&&breathIdx===i?s.color+"60":C.border}`,textAlign:"center"}}>
                      <div style={{fontSize:7,color:s.color,letterSpacing:1,marginBottom:2}}>{s.label.toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:"bold"}}>{s.duration}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BADGES */}
            {smokeTab==="badges"&&(
              <div>
                <div style={{fontSize:8,color:C.muted,letterSpacing:3,marginBottom:10,marginTop:8}}>{badges.length}/{ACHIEVEMENTS.length} COMMENDATIONS</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {ACHIEVEMENTS.map(a=>{
                    const done=badges.includes(a.id);
                    return(
                      <div key={a.id} style={{...BOX({marginBottom:0,textAlign:"center",padding:13,opacity:done?1:0.28,background:done?"rgba(201,162,39,0.07)":C.sub,borderColor:done?"rgba(201,162,39,0.3)":C.border})}}>
                        <div style={{fontSize:24,marginBottom:5}}>{a.icon}</div>
                        <div style={{fontSize:9,fontWeight:"bold",color:done?C.gold:C.muted,letterSpacing:1}}>{a.title.toUpperCase()}</div>
                        {!done&&<div style={{fontSize:8,color:C.muted,marginTop:3}}>🔒 LOCKED</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ MISSION / BLUEPRINT ═══ */}
        {tab==="mission"&&(
          <div>
            <div style={{display:"flex",gap:4,margin:"10px 0",overflowX:"auto",paddingBottom:2}}>
              {PILLARS.map(p=>(
                <button key={p.id} onClick={()=>setActivePillar(p.id)}
                  style={{padding:"5px 10px",borderRadius:3,background:activePillar===p.id?`${p.color}15`:"rgba(255,255,255,0.02)",border:activePillar===p.id?`1px solid ${p.color}50`:`1px solid ${C.border}`,color:activePillar===p.id?p.color:C.muted,fontSize:8,cursor:"pointer",letterSpacing:2,whiteSpace:"nowrap",fontFamily:"'Courier New',monospace"}}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            <div style={{...BOX({background:`${pillar.color}07`,borderColor:`${pillar.color}22`,borderLeft:`3px solid ${pillar.color}`})}}>
              <div style={{fontSize:11,fontStyle:"italic",color:C.dim,lineHeight:1.8}}>{pillar.verse}</div>
            </div>
            {pillar.habits.map(h=>{
              const done=!!(habitLog[today]||{})[h.id];
              return(
                <div key={h.id} onClick={()=>toggleHabit(h.id)}
                  style={{...BOX({display:"flex",alignItems:"center",gap:11,cursor:"pointer",marginBottom:7,background:done?`${pillar.color}0e`:C.sub,borderColor:done?`${pillar.color}38`:C.border})}}>
                  <div style={{width:22,height:22,borderRadius:4,background:done?pillar.color:"rgba(255,255,255,0.04)",border:`1px solid ${done?pillar.color:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:12,color:done?C.dark1:"transparent",fontWeight:"bold"}}>✓</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:done?C.text:C.muted,letterSpacing:1}}>{h.label}</div>
                    <div style={{fontSize:9,color:C.dim,marginTop:2}}>{h.desc}</div>
                  </div>
                </div>
              );
            })}
            <div style={{...BOX({textAlign:"center",marginTop:2})}}>
              <div style={{fontSize:8,letterSpacing:3,color:C.muted,marginBottom:3}}>PILLAR STATUS</div>
              <div style={{fontSize:26,fontWeight:900,color:pillar.color}}>{pillar.habits.filter(h=>(habitLog[today]||{})[h.id]).length}/{pillar.habits.length}</div>
              <div style={{fontSize:8,color:C.muted,letterSpacing:2}}>OBJECTIVES COMPLETE</div>
            </div>
          </div>
        )}

        {/* ═══ CALENDAR / LOG ═══ */}
        {tab==="calendar"&&(
          <div>
            {/* month nav */}
            <div style={{...BOX({display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12})}}>
              <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}} style={{background:"none",border:"none",color:C.accent,fontSize:16,cursor:"pointer",padding:"0 8px"}}>◀</button>
              <div style={{fontSize:12,letterSpacing:5,color:C.text,fontWeight:"bold"}}>{MONTH_NAMES[calMonth]} {calYear}</div>
              <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}} style={{background:"none",border:"none",color:C.accent,fontSize:16,cursor:"pointer",padding:"0 8px"}}>▶</button>
            </div>

            {/* legend */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"7px 10px",background:C.sub,border:`1px solid ${C.border}`,borderRadius:6,marginBottom:8}}>
              {[{c:`rgba(143,196,58,0.45)`,l:"80-100%"},{c:`rgba(201,162,39,0.4)`,l:"40-79%"},{c:`rgba(192,57,43,0.35)`,l:"1-39%"},{c:"rgba(255,255,255,0.03)",l:"No log"}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:9,height:9,borderRadius:2,background:x.c,border:`1px solid ${C.border}`}}/>
                  <span style={{fontSize:7,color:C.muted,letterSpacing:1}}>{x.l}</span>
                </div>
              ))}
            </div>

            {/* day headers */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
              {DAY_NAMES.map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:8,color:C.muted,letterSpacing:1,padding:"3px 0"}}>{d}</div>
              ))}
            </div>

            {/* days */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:11}}>
              {Array.from({length:firstDay(calYear,calMonth)}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:daysInMonth(calYear,calMonth)}).map((_,i)=>{
                const day=i+1;
                const key=`${calYear}-${pad(calMonth+1)}-${pad(day)}`;
                const score=getDayScore(key);
                const isToday=key===today;
                const isSel=selectedDay===key;
                return(
                  <div key={key} onClick={()=>setSelectedDay(isSel?null:key)}
                    style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:4,cursor:"pointer",background:getDayBg(score),border:isToday?`1px solid ${C.accent}`:isSel?`1px solid ${C.gold}`:`1px solid ${C.border}`}}>
                    <div style={{fontSize:10,fontWeight:isToday?"bold":"normal",color:isToday?C.accent:C.text}}>{day}</div>
                    {score>0&&<div style={{fontSize:6,color:isToday?C.accent:C.dim,marginTop:1}}>{score}%</div>}
                  </div>
                );
              })}
            </div>

            {/* day detail */}
            {selectedDay&&(()=>{
              const h=habitLog[selectedDay]||{};
              const allHabits=PILLARS.flatMap(p=>p.habits.map(hab=>({...hab,pillarLabel:p.label,pillarColor:p.color})));
              const completed=allHabits.filter(hab=>h[hab.id]);
              const missed=allHabits.filter(hab=>!h[hab.id]);
              const score=getDayScore(selectedDay);
              const dayJ=journalEntries.filter(e=>e.dayKey===selectedDay);
              const dayN=notebookEntries.filter(e=>e.dayKey===selectedDay);
              return(
                <div style={{...BOX({background:"rgba(201,162,39,0.05)",borderColor:"rgba(201,162,39,0.18)"})}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{fontSize:9,letterSpacing:3,color:C.gold}}>FIELD REPORT — {selectedDay}</div>
                    <div style={{fontSize:18,fontWeight:900,color:score>=80?C.accent:score>=40?C.gold:score>0?C.alert:C.muted}}>{score}%</div>
                  </div>

                  {completed.length>0&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:7,letterSpacing:3,color:C.accent,marginBottom:6}}>✓ COMPLETED</div>
                      {completed.map(hab=>(
                        <div key={hab.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                          <div style={{width:8,height:8,borderRadius:2,background:hab.pillarColor,flexShrink:0}}/>
                          <span style={{fontSize:10,color:C.text}}>{hab.label}</span>
                          <span style={{fontSize:7,color:C.muted,marginLeft:"auto",letterSpacing:1}}>{hab.pillarLabel}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {missed.length>0&&selectedDay===today&&(
                    <div style={{marginBottom:8}}>
                      <div style={{fontSize:7,letterSpacing:3,color:C.alert,marginBottom:6}}>✗ PENDING</div>
                      {missed.map(hab=>(
                        <div key={hab.id} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.border}`,opacity:0.5}}>
                          <div style={{width:8,height:8,borderRadius:2,background:"rgba(255,255,255,0.1)",flexShrink:0}}/>
                          <span style={{fontSize:10,color:C.muted}}>{hab.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {completed.length===0&&missed.length>0&&selectedDay!==today&&(
                    <div style={{fontSize:10,color:C.muted,textAlign:"center",padding:"10px 0",letterSpacing:2}}>NO OBJECTIVES LOGGED THIS DAY</div>
                  )}

                  {dayJ.length>0&&(
                    <div style={{marginTop:8}}>
                      <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginBottom:5}}>📓 JOURNAL</div>
                      {dayJ.map((e,i)=>(
                        <div key={i} style={{fontSize:10,color:C.dim,fontStyle:"italic",lineHeight:1.7,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>"{e.text}"</div>
                      ))}
                    </div>
                  )}
                  {dayN.length>0&&(
                    <div style={{marginTop:8}}>
                      <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginBottom:5}}>⚙️ NOTEBOOK</div>
                      {dayN.map((e,i)=>(
                        <div key={i} style={{fontSize:10,color:C.dim,lineHeight:1.7,padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>{e.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ INTEL / JOURNAL ═══ */}
        {tab==="intel"&&(
          <div>
            <div style={{fontSize:8,letterSpacing:4,color:C.gold,marginTop:12,marginBottom:8}}>NIGHTLY FIELD REPORT</div>
            <textarea value={journalText} onChange={e=>setJournalText(e.target.value)}
              placeholder="What went well today? What to improve? How did you live your identity?"
              style={{width:"100%",minHeight:108,padding:"9px 11px",borderRadius:6,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"'Courier New',monospace",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
            <button onClick={addJournal} style={{...BTN(`linear-gradient(135deg,${C.mid2},${C.tan1})`,C.gold,{width:"100%",marginTop:5,marginBottom:14})}}>SUBMIT REPORT</button>

            <div style={{fontSize:8,letterSpacing:4,color:"#4a9eff",marginBottom:8}}>⚙️ ENGINEERING NOTEBOOK</div>
            <textarea value={notebookText} onChange={e=>setNotebookText(e.target.value)}
              placeholder="New idea, design, technical thought, problem to solve..."
              style={{width:"100%",minHeight:88,padding:"9px 11px",borderRadius:6,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,color:C.text,fontSize:11,fontFamily:"'Courier New',monospace",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}/>
            <button onClick={addNotebook} style={{...BTN("rgba(74,158,255,0.1)","#4a9eff",{width:"100%",marginTop:5,marginBottom:16,borderColor:"rgba(74,158,255,0.3)"})}}>LOG TO NOTEBOOK</button>

            {journalEntries.length>0&&(
              <div>
                <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginBottom:7}}>PAST REPORTS</div>
                {journalEntries.slice(0,5).map((e,i)=>(
                  <div key={i} style={{...BOX({marginBottom:7})}}>
                    <div style={{fontSize:10,color:C.dim,fontStyle:"italic",lineHeight:1.7}}>"{e.text}"</div>
                    <div style={{fontSize:7,color:C.muted,marginTop:4,letterSpacing:1}}>{e.date}</div>
                  </div>
                ))}
              </div>
            )}
            {notebookEntries.length>0&&(
              <div style={{marginTop:6}}>
                <div style={{fontSize:7,letterSpacing:3,color:C.muted,marginBottom:7}}>NOTEBOOK ENTRIES</div>
                {notebookEntries.slice(0,5).map((e,i)=>(
                  <div key={i} style={{...BOX({marginBottom:7,background:"rgba(74,158,255,0.04)",borderColor:"rgba(74,158,255,0.13)"})}}>
                    <div style={{fontSize:10,color:C.dim,lineHeight:1.7}}>{e.text}</div>
                    <div style={{fontSize:7,color:C.muted,marginTop:4,letterSpacing:1}}>{e.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* BOTTOM NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:`rgba(14,18,9,0.97)`,backdropFilter:"blur(14px)",borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(5,1fr)",padding:"7px 0 14px",zIndex:100}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${C.dark3},${C.mid2},${C.tan1},${C.light1},${C.mid1},${C.dark2})`}}/>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"3px 0"}}>
            <span style={{fontSize:16}}>{t.icon}</span>
            <span style={{fontSize:7,letterSpacing:2,color:tab===t.id?C.accent:C.muted,fontWeight:tab===t.id?700:400}}>{t.label}</span>
            {tab===t.id&&<div style={{width:14,height:2,borderRadius:1,background:C.accent}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}
