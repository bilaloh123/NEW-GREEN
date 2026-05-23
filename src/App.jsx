import { useState, useEffect } from "react";

// ─── SUPABASE ────────────────────────────────────────────────────────
const SUPA_URL = "https://kwcphyhmzogwehyvqugz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y3BoeWhtem9nd2VoeXZxdWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjcxNjMsImV4cCI6MjA5NDg0MzE2M30.eyqu1wk1DPyMfBxFM4qyql0d8ukToUi_V9abE6HxhyY";
const H = {"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"};
const db = {
  async getLots() { const r=await fetch(SUPA_URL+"/rest/v1/lots?select=*&order=created_at.desc",{headers:H}); const d=await r.json(); return Array.isArray(d)?d.map(x=>x.data):[]; },
  async saveLot(lot) { await fetch(SUPA_URL+"/rest/v1/lots",{method:"POST",headers:{...H,"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id:lot.id,data:lot})}); },
  async updateLot(lot) { await fetch(SUPA_URL+"/rest/v1/lots?id=eq."+lot.id,{method:"PATCH",headers:H,body:JSON.stringify({data:lot})}); },
};

// ─── CONFIG ──────────────────────────────────────────────────────────
const LOGO = null; // Logo will be added later
const FRIGOS = ["Ch. Négative 1","Ch. Négative 4","Ch. Négative 6","Ch. Négative 7"];
const PRODUITS = ["Fraises","Avocats","Fraises Bio","Avocats Bio","Autre"];
const ORIGINES = ["Ferme Al Manzeh","Ferme Ouled Mtaa","Ferme Gharb","Ferme Souss","Autre"];
const DESTINATIONS = ["France","Espagne","Allemagne","Pays-Bas","Belgique","Royaume-Uni","Autre"];
const TRANSPORTEURS = ["Transport Express","Froid Logistique","Euro Fret","Autre"];
const EC = {réception:"#10b981",lavage:"#3b82f6",découpage:"#f59e0b",congélation:"#6366f1",conditionnement:"#ec4899",stockage:"#8b5cf6",expédition:"#14b8a6","non_conforme":"#ef4444"};

const INITIAL_USERS = [
  {id:1,username:"admin",password:"admin123",role:"admin",nom:"Directeur",actif:true},
  {id:2,username:"reception",password:"recep123",role:"reception",nom:"Réception",actif:true},
  {id:3,username:"lavage",password:"lav123",role:"lavage",nom:"Lavage",actif:true},
  {id:4,username:"decoupe",password:"dec123",role:"decoupe",nom:"Découpage",actif:true},
  {id:5,username:"congelation",password:"cong123",role:"congelation",nom:"Congélation",actif:true},
  {id:6,username:"conditionnement",password:"cond123",role:"conditionnement",nom:"Conditionnement",actif:true},
  {id:7,username:"expedition",password:"exped123",role:"expedition",nom:"Expédition",actif:true},
];

const ROLE_ETAPES = {
  admin:["réception","lavage","découpage","congélation","conditionnement","stockage","expédition"],
  reception:["réception"],lavage:["lavage"],decoupe:["découpage"],
  congelation:["congélation"],conditionnement:["conditionnement","stockage"],expedition:["expédition"],
};

// ─── FACTURE ─────────────────────────────────────────────────────────
function printFacture(lot, num) {
  const ex=lot.expedition||{};
  const w=window.open("","_blank","width=900,height=750");
  const d=new Date().toLocaleDateString("fr-FR");
  const pertes=lot.etapesDetail||{};
  w.document.write(
    "<!DOCTYPE html><html><head><meta charset=UTF-8><title>Facture "+num+"</title>"+
    "<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;font-size:12px;color:#111}"+
    ".hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #10b981;padding-bottom:16px;margin-bottom:20px}"+
    ".logo{max-height:75px;background:#fff;padding:4px 10px;border-radius:8px}"+
    ".co{text-align:right}.co h2{margin:0;color:#10b981;font-size:17px}"+
    ".co p{margin:2px 0;font-size:11px}"+
    ".title{background:#10b981;color:#fff;text-align:center;padding:10px;font-size:17px;font-weight:bold;border-radius:6px;margin:16px 0}"+
    ".grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}"+
    ".box{background:#f0fdf4;padding:13px;border-radius:7px;border-left:4px solid #10b981}"+
    ".box h4{margin:0 0 8px;color:#065f46;font-size:11px;text-transform:uppercase}"+
    ".box p{margin:2px 0;font-size:11px}"+
    "table{width:100%;border-collapse:collapse;margin:12px 0}"+
    "th{background:#10b981;color:#fff;padding:9px 10px;font-size:11px;text-align:left}"+
    "td{padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:11px}"+
    "tr:nth-child(even){background:#f9fafb}"+
    ".tot{background:#10b981;color:#fff;padding:12px;border-radius:7px;text-align:right;font-size:14px;font-weight:bold;margin-top:8px}"+
    ".ftr{margin-top:36px;text-align:center;color:#9ca3af;font-size:10px;border-top:1px solid #e5e7eb;padding-top:12px}"+
    ".badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:bold}"+
    ".green{background:#d1fae5;color:#065f46}.red{background:#fee2e2;color:#991b1b}"+
    "@media print{.noprint{display:none}}</style></head><body>"+
    "<div class=hdr><img src="+LOGO+" class=logo alt=NEWGREEN>"+
    "<div class=co><h2>NEW GREEN Import Export</h2><p>Tel: +212 XXX XXX XXX</p><p>contact@newgreen.ma — Maroc</p></div></div>"+
    "<div class=title>FACTURE PROFORMA N° "+num+"</div>"+
    "<div class=grid2>"+
    "<div class=box><h4>Client</h4><p><b>"+( ex.client||"—")+"</b></p><p>Destination: "+(ex.destination||"—")+"</p><p>Date exp: "+(ex.date?new Date(ex.date).toLocaleDateString("fr-FR"):"—")+"</p></div>"+
    "<div class=box><h4>Transport</h4><p>Transporteur: "+(ex.transporteur||"—")+"</p><p>Camion: "+(ex.numCamion||"—")+"</p><p>Cartons: "+(ex.nbCartons||"—")+"</p><p>Temp: "+(ex.tempCamion?ex.tempCamion+"°C":"—")+"</p></div>"+
    "</div>"+
    "<table><tr><th>Lot N°</th><th>Produit</th><th>Ferme</th><th>Poids reçu</th><th>Pertes totales</th><th>Poids net</th><th>Conformité</th><th>Frigo</th></tr>"+
    "<tr><td><b>"+lot.id+"</b></td><td>"+lot.produit+(lot.variete?" — "+lot.variete:"")+"</td><td>"+lot.origine+"</td>"+
    "<td>"+lot.poidsReception+" kg</td>"+
    "<td>"+(lot.pertesTotales||0).toFixed(1)+" kg</td>"+
    "<td><b>"+(ex.poidsFinal||lot.poidsNet||lot.poidsReception)+" kg</b></td>"+
    "<td><span class='badge "+(lot.conformite==="conforme"?"green":"red")+"'>"+(lot.conformite==="conforme"?"✅ Conforme":"❌ Non Conforme")+"</span></td>"+
    "<td>"+(lot.frigo||"—")+"</td></tr></table>"+
    "<div class=tot>Poids expédié: "+(ex.poidsFinal||lot.poidsNet||lot.poidsReception)+" kg</div>"+
    "<div class=ftr><p>Généré le "+d+" — NEW GREEN Import Export</p><p>Document proforma — non contractuel</p></div>"+
    "<br><button class=noprint onclick=window.print() style=background:#10b981;color:#fff;border:none;padding:9px 22px;border-radius:6px;cursor:pointer;font-size:13px;display:block;margin:0 auto>🖨️ Imprimer</button>"+
    "</body></html>"
  );
  w.document.close();
}

// ─── APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [users,setUsers] = useState(INITIAL_USERS);
  const [lots,setLots] = useState([]);
  const [cu,setCu] = useState(null);
  const [page,setPage] = useState("dashboard");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{ db.getLots().then(d=>{setLots(d||[]);setLoading(false);}).catch(()=>setLoading(false)); },[]);

  const addLot = async (lot) => { setLots(p=>[...p,lot]); await db.saveLot(lot); };
  const updateLot = async (lot) => { setLots(p=>p.map(l=>l.id===lot.id?lot:l)); await db.updateLot(lot); };

  if(loading) return <div style={{minHeight:"100vh",background:"#080e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><div style={{fontSize:24,fontWeight:900,color:"#10b981",fontFamily:"Space Mono,monospace"}}>🌿 NEW GREEN</div><div style={{color:"#10b981",fontSize:16,fontFamily:"DM Sans,sans-serif"}}>Chargement...</div></div>;
  if(!cu) return <Login users={users} onLogin={setCu}/>;

  const isAdmin = cu.role==="admin";
  const nav = [
    {id:"dashboard",icon:"📊",label:"Tableau de bord"},
    {id:"reception",icon:"🚛",label:"Réception"},
    {id:"lavage",icon:"💧",label:"Lavage & Analyse"},
    {id:"decoupe",icon:"✂️",label:"Découpage"},
    {id:"congelation",icon:"❄️",label:"Congélation"},
    {id:"conditionnement",icon:"📦",label:"Conditionnement"},
    {id:"frigos",icon:"🧊",label:"Frigos 4-7"},
    {id:"expedition",icon:"🚛",label:"Expédition"},
    {id:"lots",icon:"🗂️",label:"Tous les lots"},
    {id:"factures",icon:"🧾",label:"Factures"},
    ...(isAdmin?[{id:"users",icon:"👥",label:"Utilisateurs"}]:[]),
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#080e1a",color:"#e2e8f0",fontFamily:"DM Sans,sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      {/* SIDEBAR */}
      <div style={{width:220,background:"rgba(255,255,255,0.02)",borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",padding:"16px 0",flexShrink:0}}>
        <div style={{padding:"0 14px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <img src={LOGO} alt="NEW GREEN" style={{width:"100%",height:48,objectFit:"contain",background:"rgba(255,255,255,0.92)",borderRadius:9,padding:"3px 8px"}}/>
        </div>
        <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>Connecté</div>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",marginTop:2}}>{cu.nom}</div>
          <span style={{display:"inline-block",marginTop:4,padding:"2px 8px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:20,fontSize:10,color:"#10b981",textTransform:"uppercase"}}>{cu.role}</span>
        </div>
        <nav style={{flex:1,padding:"8px",overflowY:"auto"}}>
          {nav.map(item=>{const a=page===item.id;return(
            <button key={item.id} onClick={()=>setPage(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,textAlign:"left",background:a?"rgba(16,185,129,0.11)":"transparent",color:a?"#10b981":"rgba(255,255,255,0.42)",fontSize:12,fontWeight:a?700:400,fontFamily:"inherit",borderLeft:a?"3px solid #10b981":"3px solid transparent"}}>
              <span style={{fontSize:13}}>{item.icon}</span>{item.label}
            </button>
          );})}
        </nav>
        <div style={{padding:"8px"}}>
          <button onClick={()=>setCu(null)} style={{width:"100%",padding:"8px",borderRadius:8,border:"1px solid rgba(239,68,68,0.18)",background:"rgba(239,68,68,0.06)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🚪 Déconnexion</button>
        </div>
      </div>
      {/* MAIN */}
      <div style={{flex:1,padding:"24px 28px",overflowY:"auto",maxHeight:"100vh"}}>
        {page==="dashboard" && <Dashboard lots={lots} user={cu}/>}
        {page==="reception" && <Reception lots={lots} addLot={addLot} user={cu}/>}
        {page==="lavage" && <Lavage lots={lots} updateLot={updateLot} user={cu}/>}
        {page==="decoupe" && <Decoupe lots={lots} updateLot={updateLot} user={cu}/>}
        {page==="congelation" && <Congelation lots={lots} updateLot={updateLot} user={cu}/>}
        {page==="conditionnement" && <Conditionnement lots={lots} updateLot={updateLot} user={cu}/>}
        {page==="frigos" && <Frigos lots={lots} updateLot={updateLot}/>}
        {page==="expedition" && <Expedition lots={lots} updateLot={updateLot} user={cu}/>}
        {page==="lots" && <Lots lots={lots}/>}
        {page==="factures" && <Factures lots={lots}/>}
        {page==="users" && isAdmin && <Users users={users} setUsers={setUsers}/>}
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────
function Login({users,onLogin}) {
  const [u,sU]=useState("");const [p,sP]=useState("");const [err,sErr]=useState("");
  const go=()=>{const f=users.find(x=>x.username===u&&x.password===p&&x.actif);f?onLogin(f):sErr("Identifiants incorrects");};
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#080e1a,#0d1f3c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"DM Sans,sans-serif"}}>
      <div style={{width:380,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"44px 40px",backdropFilter:"blur(20px)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <img src={LOGO} alt="NEW GREEN" style={{height:85,objectFit:"contain",background:"rgba(255,255,255,0.95)",borderRadius:12,padding:"6px 14px",marginBottom:10}}/>
          <p style={{margin:0,color:"rgba(255,255,255,0.35)",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Gestion & Traçabilité</p>
        </div>
        {[["Identifiant","text",u,sU],["Mot de passe","password",p,sP]].map(([lbl,type,val,set],i)=>(
          <div key={i} style={{marginBottom:12}}>
            <label style={{display:"block",fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{lbl}</label>
            <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} style={{width:"100%",padding:"12px 13px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:9,color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>
        ))}
        {err&&<div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#f87171",marginBottom:12,textAlign:"center"}}>{err}</div>}
        <button onClick={go} style={{width:"100%",padding:13,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Connexion →</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────
function Dashboard({lots,user}) {
  const totalRecu=lots.reduce((s,l)=>s+(l.poidsReception||0),0);
  const totalNet=lots.reduce((s,l)=>s+(l.poidsNet||l.poidsReception||0),0);
  const totalPertes=lots.reduce((s,l)=>s+(l.pertesTotales||0),0);
  const rend=totalRecu>0?((totalNet/totalRecu)*100).toFixed(1):0;
  const conformes=lots.filter(l=>l.conformite==="conforme").length;
  const nonConformes=lots.filter(l=>l.conformite==="non_conforme").length;

  const etapeCounts = ["réception","lavage","découpage","congélation","conditionnement","stockage","expédition","non_conforme"].reduce((acc,e)=>{
    acc[e]=lots.filter(l=>l.etapeActuelle===e).length; return acc;
  },{});

  return(
    <div>
      <PH title="Tableau de bord" sub={"Bonjour "+user.nom+" — "+new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        {[{label:"Total lots",value:lots.length,icon:"📦",color:"#10b981"},{label:"Kg reçus",value:totalRecu.toFixed(0)+" kg",icon:"⚖️",color:"#f59e0b"},{label:"Pertes totales",value:totalPertes.toFixed(1)+" kg",icon:"📉",color:"#f87171"},{label:"Rendement",value:rend+"%",icon:"✅",color:"#a78bfa"}].map((s,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,padding:18}}>
            <div style={{fontSize:22}}>{s.icon}</div><div style={{fontSize:22,fontWeight:800,color:s.color,marginTop:7}}>{s.value}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.38)",marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Conformité */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:22}}>
        <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:13,padding:18,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>✅</div><div><div style={{fontSize:22,fontWeight:800,color:"#10b981"}}>{conformes}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Lots Conformes</div></div>
        </div>
        <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:13,padding:18,display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:36}}>❌</div><div><div style={{fontSize:22,fontWeight:800,color:"#f87171"}}>{nonConformes}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Lots Non Conformes</div></div>
        </div>
      </div>
      {/* Pipeline */}
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:13,padding:18,marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",marginBottom:13,textTransform:"uppercase",letterSpacing:1}}>Pipeline de production</div>
        <div style={{display:"flex",gap:6,overflowX:"auto"}}>
          {Object.entries(etapeCounts).map(([e,c])=>(
            <div key={e} style={{flex:1,minWidth:70,textAlign:"center"}}>
              <div style={{height:44,background:(EC[e]||"#666")+"18",border:"1px solid "+(EC[e]||"#666")+"30",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:EC[e]||"#666"}}>{c}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:5,textTransform:"capitalize",wordBreak:"break-word"}}>{e}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Frigos summary */}
      <Card title="🧊 État des frigos">
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {FRIGOS.map(f=>{const lts=lots.filter(l=>l.frigo===f);const pal=lts.reduce((s,l)=>s+(l.nbPalettes||0),0);const kg=lts.reduce((s,l)=>s+(l.poidsNet||0),0);return(
            <div key={f} style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:14,textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:6}}>🧊</div>
              <div style={{fontSize:14,fontWeight:700,color:"#818cf8"}}>{f}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4}}>{lts.length} lots</div>
              <div style={{fontSize:12,color:"#a78bfa",fontWeight:600}}>{pal} palettes</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{kg.toFixed(0)} kg</div>
            </div>
          );})}
        </div>
      </Card>
    </div>
  );
}

// ─── RECEPTION ───────────────────────────────────────────────────────
function Reception({lots,addLot,user}) {
  const [f,sF]=useState({produit:"",variete:"",origine:"",poidsReception:"",temperature:"",observation:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const genId=()=>{const pfx=f.produit?.startsWith("Fraises")?"FR":f.produit?.startsWith("Avocats")?"AV":"PR";return pfx+"-"+new Date().toISOString().slice(2,10).replace(/-/g,"")+"-"+String(lots.length+1).padStart(4,"0");};
  const submit=()=>{
    if(!f.produit||!f.origine||!f.poidsReception)return;
    const id=genId(),now=new Date().toISOString(),kg=parseFloat(f.poidsReception);
    const lot={id,...f,poidsReception:kg,poidsNet:kg,pertesTotales:0,etapeActuelle:"réception",dateReception:now,
      etapesDetail:{},historique:[{etape:"réception",date:now,user:user.nom,poids:kg,note:f.observation}]};
    addLot(lot);
    sF({produit:"",variete:"",origine:"",poidsReception:"",temperature:"",observation:""});
    sOk("✅ Lot "+id+" enregistré!");setTimeout(()=>sOk(""),4000);
  };
  return(
    <div><PH title="🚛 Réception" sub="Enregistrement des matières premières"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title="Nouveau lot">
        <FL>Produit *</FL><FS value={f.produit} onChange={v=>upd("produit",v)} opts={PRODUITS} ph="Sélectionner..."/>
        <FL>Variété</FL><FI value={f.variete} onChange={v=>upd("variete",v)} ph="Ex: Gariguette, Hass..."/>
        <FL>Ferme / Origine *</FL><FS value={f.origine} onChange={v=>upd("origine",v)} opts={ORIGINES} ph="Sélectionner..."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><FL>Poids reçu (kg) *</FL><FI type="number" value={f.poidsReception} onChange={v=>upd("poidsReception",v)} ph="0.00"/></div>
          <div><FL>Température (°C)</FL><FI type="number" value={f.temperature} onChange={v=>upd("temperature",v)} ph="Ex: 4"/></div>
        </div>
        <FL>Observation</FL><FT value={f.observation} onChange={v=>upd("observation",v)} ph="Remarques..."/>
        <Btn color="#10b981" onClick={submit}>✅ Enregistrer</Btn>
      </Card>
      <Card title={"Lots en réception ("+lots.filter(l=>l.etapeActuelle==="réception").length+")"}>
        {lots.filter(l=>l.etapeActuelle==="réception").map(l=><LotMini key={l.id} lot={l}/>)}
        {lots.filter(l=>l.etapeActuelle==="réception").length===0&&<Empty txt="Aucun lot en attente"/>}
      </Card>
    </div></div>
  );
}

// ─── LAVAGE & ANALYSE ────────────────────────────────────────────────
function Lavage({lots,updateLot,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({pertesLavage:"",conformite:"",note:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const dispo=lots.filter(l=>l.etapeActuelle==="réception");

  const valider=()=>{
    if(!sel||!f.pertesLavage||!f.conformite)return;
    const now=new Date().toISOString();
    const pertes=parseFloat(f.pertesLavage);
    const poidsNet=(sel.poidsNet||sel.poidsReception)-pertes;
    const pertesTotales=(sel.pertesTotales||0)+pertes;
    const etape=f.conformite==="non_conforme"?"non_conforme":"lavage";
    const updated={...sel,etapeActuelle:etape,poidsNet,pertesTotales,conformite:f.conformite,
      etapesDetail:{...(sel.etapesDetail||{}),lavage:{pertes,poidsEntree:sel.poidsNet||sel.poidsReception,poidsSortie:poidsNet,conformite:f.conformite,date:now,user:user.nom}},
      historique:[...(sel.historique||[]),{etape:"lavage",date:now,user:user.nom,poids:poidsNet,pertes,conformite:f.conformite,note:f.note}]};
    updateLot(updated);
    sOk("✅ Lot "+sel.id+" — Lavage validé | Conformité: "+(f.conformite==="conforme"?"✅ Conforme":"❌ Non Conforme"));
    sSel(null);sF({pertesLavage:"",conformite:"",note:""});setTimeout(()=>sOk(""),5000);
  };

  return(
    <div><PH title="💧 Lavage & Analyse" sub="Contrôle qualité et analyse de conformité"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title={"Lots à laver ("+dispo.length+")"}>
        {dispo.length===0?<Empty txt="Aucun lot en attente"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF({pertesLavage:"",conformite:"",note:""}); }} style={{padding:12,borderRadius:9,marginBottom:6,cursor:"pointer",background:sel?.id===l.id?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(59,130,246,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — <b>{l.poidsNet||l.poidsReception} kg</b></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{l.origine}</div>
          </div>
        ))}
      </Card>
      <Card title={sel?"Lavage: "+sel.id:"Sélectionner un lot"}>
        {!sel?<Empty txt="← Cliquer sur un lot"/>:(
          <>
            <div style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:9,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#60a5fa"}}>Lot: {sel.id}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>{sel.produit} — Poids entrant: <b>{sel.poidsNet||sel.poidsReception} kg</b></div>
            </div>
            <FL>Pertes au lavage (kg) *</FL>
            <FI type="number" value={f.pertesLavage} onChange={v=>upd("pertesLavage",v)} ph="0.00"/>
            {f.pertesLavage&&<div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#fbbf24",marginBottom:12}}>
              Poids après lavage: <b>{((sel.poidsNet||sel.poidsReception)-parseFloat(f.pertesLavage||0)).toFixed(1)} kg</b>
            </div>}
            <FL>Résultat Analyse *</FL>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              <button onClick={()=>upd("conformite","conforme")} style={{flex:1,padding:"11px",borderRadius:9,border:"2px solid "+(f.conformite==="conforme"?"#10b981":"rgba(255,255,255,0.1)"),background:f.conformite==="conforme"?"rgba(16,185,129,0.15)":"transparent",color:f.conformite==="conforme"?"#10b981":"rgba(255,255,255,0.45)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>✅ Conforme</button>
              <button onClick={()=>upd("conformite","non_conforme")} style={{flex:1,padding:"11px",borderRadius:9,border:"2px solid "+(f.conformite==="non_conforme"?"#f87171":"rgba(255,255,255,0.1)"),background:f.conformite==="non_conforme"?"rgba(239,68,68,0.15)":"transparent",color:f.conformite==="non_conforme"?"#f87171":"rgba(255,255,255,0.45)",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>❌ Non Conforme</button>
            </div>
            {f.conformite==="non_conforme"&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#f87171",marginBottom:12}}>⚠️ Ce lot sera retiré du circuit de production</div>}
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Observations..."/>
            <Btn color={f.conformite==="non_conforme"?"#ef4444":"#3b82f6"} onClick={valider}>✅ Valider le lavage</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

// ─── DÉCOUPAGE ───────────────────────────────────────────────────────
function Decoupe({lots,updateLot,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({pertesDecoupe:"",nbBlocs:"",poidsBloc:"",poidsNette:"",note:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const dispo=lots.filter(l=>l.etapeActuelle==="lavage"&&l.conformite==="conforme");

  const valider=()=>{
    if(!sel||!f.pertesDecoupe)return;
    const now=new Date().toISOString();
    const pertes=parseFloat(f.pertesDecoupe);
    const poidsNet=(sel.poidsNet)-pertes;
    const pertesTotales=(sel.pertesTotales||0)+pertes;
    const updated={...sel,etapeActuelle:"découpage",poidsNet,pertesTotales,
      etapesDetail:{...(sel.etapesDetail||{}),decoupe:{pertes,poidsEntree:sel.poidsNet,poidsSortie:poidsNet,nbBlocs:parseInt(f.nbBlocs||0),poidsBloc:parseFloat(f.poidsBloc||0),poidsNette:parseFloat(f.poidsNette||poidsNet),date:now,user:user.nom}},
      historique:[...(sel.historique||[]),{etape:"découpage",date:now,user:user.nom,poids:poidsNet,pertes,note:f.note}]};
    updateLot(updated);
    sOk("✅ Lot "+sel.id+" — Découpage validé | "+pertes+" kg pertes");
    sSel(null);sF({pertesDecoupe:"",nbBlocs:"",poidsBloc:"",poidsNette:"",note:""});setTimeout(()=>sOk(""),4000);
  };

  return(
    <div><PH title="✂️ Découpage" sub="Tri et découpage — suivi des pertes et blocs"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title={"Lots à découper ("+dispo.length+")"}>
        {dispo.length===0?<Empty txt="Aucun lot conforme disponible"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF({pertesDecoupe:"",nbBlocs:"",poidsBloc:"",poidsNette:"",note:""});}} style={{padding:12,borderRadius:9,marginBottom:6,cursor:"pointer",background:sel?.id===l.id?"rgba(245,158,11,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(245,158,11,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — <b>{l.poidsNet} kg</b></div>
          </div>
        ))}
      </Card>
      <Card title={sel?"Découpage: "+sel.id:"Sélectionner un lot"}>
        {!sel?<Empty txt="← Cliquer sur un lot"/>:(
          <>
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:9,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#fbbf24"}}>Lot: {sel.id}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>Poids entrant: <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes au découpage (kg) *</FL><FI type="number" value={f.pertesDecoupe} onChange={v=>upd("pertesDecoupe",v)} ph="0.00"/>
            {f.pertesDecoupe&&<div style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#fbbf24",marginBottom:12}}>Poids après découpage: <b>{(sel.poidsNet-parseFloat(f.pertesDecoupe||0)).toFixed(1)} kg</b></div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>Nb. blocs</FL><FI type="number" value={f.nbBlocs} onChange={v=>upd("nbBlocs",v)} ph="0"/></div>
              <div><FL>Poids/bloc (kg)</FL><FI type="number" value={f.poidsBloc} onChange={v=>upd("poidsBloc",v)} ph="0.00"/></div>
            </div>
            <FL>Poids produit net (kg)</FL><FI type="number" value={f.poidsNette} onChange={v=>upd("poidsNette",v)} ph="Poids sélectionné..."/>
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Observations..."/>
            <Btn color="#f59e0b" onClick={valider}>✅ Valider le découpage</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

// ─── CONGÉLATION ─────────────────────────────────────────────────────
function Congelation({lots,updateLot,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({pertesCongelation:"",tempCongelation:"",note:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const dispo=lots.filter(l=>l.etapeActuelle==="découpage"&&l.conformite==="conforme");

  const valider=()=>{
    if(!sel||!f.pertesCongelation)return;
    const now=new Date().toISOString();
    const pertes=parseFloat(f.pertesCongelation);
    const poidsNet=sel.poidsNet-pertes;
    const pertesTotales=(sel.pertesTotales||0)+pertes;
    const updated={...sel,etapeActuelle:"congélation",poidsNet,pertesTotales,
      etapesDetail:{...(sel.etapesDetail||{}),congelation:{pertes,poidsEntree:sel.poidsNet,poidsSortie:poidsNet,temp:f.tempCongelation,date:now,user:user.nom}},
      historique:[...(sel.historique||[]),{etape:"congélation",date:now,user:user.nom,poids:poidsNet,pertes,note:f.note}]};
    updateLot(updated);
    sOk("✅ Lot "+sel.id+" — Congélation validée");
    sSel(null);sF({pertesCongelation:"",tempCongelation:"",note:""});setTimeout(()=>sOk(""),4000);
  };

  return(
    <div><PH title="❄️ Congélation" sub="Mise en congélation — suivi des pertes"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title={"Lots à congeler ("+dispo.length+")"}>
        {dispo.length===0?<Empty txt="Aucun lot disponible"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF({pertesCongelation:"",tempCongelation:"",note:""}); }} style={{padding:12,borderRadius:9,marginBottom:6,cursor:"pointer",background:sel?.id===l.id?"rgba(99,102,241,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — <b>{l.poidsNet} kg</b></div>
          </div>
        ))}
      </Card>
      <Card title={sel?"Congélation: "+sel.id:"Sélectionner un lot"}>
        {!sel?<Empty txt="← Cliquer sur un lot"/>:(
          <>
            <div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:9,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#818cf8"}}>Lot: {sel.id}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>Poids entrant: <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes à la congélation (kg) *</FL><FI type="number" value={f.pertesCongelation} onChange={v=>upd("pertesCongelation",v)} ph="0.00"/>
            {f.pertesCongelation&&<div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#818cf8",marginBottom:12}}>Poids après congélation: <b>{(sel.poidsNet-parseFloat(f.pertesCongelation||0)).toFixed(1)} kg</b></div>}
            <FL>Température de congélation (°C)</FL><FI type="number" value={f.tempCongelation} onChange={v=>upd("tempCongelation",v)} ph="Ex: -18"/>
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Observations..."/>
            <Btn color="#6366f1" onClick={valider}>✅ Valider la congélation</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

// ─── CONDITIONNEMENT ─────────────────────────────────────────────────
function Conditionnement({lots,updateLot,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({pertesCondi:"",produitFini:"",nbCartons:"",poidsCarton:"",note:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const dispo=lots.filter(l=>l.etapeActuelle==="congélation"&&l.conformite==="conforme");

  const valider=()=>{
    if(!sel||!f.produitFini)return;
    const now=new Date().toISOString();
    const pertes=parseFloat(f.pertesCondi||0);
    const poidsNet=parseFloat(f.produitFini);
    const pertesTotales=(sel.pertesTotales||0)+pertes;
    const updated={...sel,etapeActuelle:"conditionnement",poidsNet,pertesTotales,
      etapesDetail:{...(sel.etapesDetail||{}),conditionnement:{pertes,poidsEntree:sel.poidsNet,produitFini:poidsNet,nbCartons:parseInt(f.nbCartons||0),poidsCarton:parseFloat(f.poidsCarton||0),date:now,user:user.nom}},
      historique:[...(sel.historique||[]),{etape:"conditionnement",date:now,user:user.nom,poids:poidsNet,pertes,note:f.note}]};
    updateLot(updated);
    sOk("✅ Lot "+sel.id+" — Conditionnement validé | "+poidsNet+" kg produit fini");
    sSel(null);sF({pertesCondi:"",produitFini:"",nbCartons:"",poidsCarton:"",note:""});setTimeout(()=>sOk(""),4000);
  };

  return(
    <div><PH title="📦 Conditionnement" sub="Emballage et produit fini — prêt pour stockage"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title={"Lots à conditionner ("+dispo.length+")"}>
        {dispo.length===0?<Empty txt="Aucun lot disponible"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF({pertesCondi:"",produitFini:"",nbCartons:"",poidsCarton:"",note:""});}} style={{padding:12,borderRadius:9,marginBottom:6,cursor:"pointer",background:sel?.id===l.id?"rgba(236,72,153,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(236,72,153,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — <b>{l.poidsNet} kg</b></div>
          </div>
        ))}
      </Card>
      <Card title={sel?"Conditionnement: "+sel.id:"Sélectionner un lot"}>
        {!sel?<Empty txt="← Cliquer sur un lot"/>:(
          <>
            <div style={{background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)",borderRadius:9,padding:12,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#f472b6"}}>Lot: {sel.id}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>Poids entrant: <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes au conditionnement (kg)</FL><FI type="number" value={f.pertesCondi} onChange={v=>upd("pertesCondi",v)} ph="0.00"/>
            <FL>Poids produit fini / prêt stockage (kg) *</FL><FI type="number" value={f.produitFini} onChange={v=>upd("produitFini",v)} ph="0.00"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>Nb. cartons</FL><FI type="number" value={f.nbCartons} onChange={v=>upd("nbCartons",v)} ph="0"/></div>
              <div><FL>Poids/carton (kg)</FL><FI type="number" value={f.poidsCarton} onChange={v=>upd("poidsCarton",v)} ph="0.00"/></div>
            </div>
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Observations..."/>
            <Btn color="#ec4899" onClick={valider}>✅ Valider le conditionnement</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

// ─── FRIGOS 4-7 ──────────────────────────────────────────────────────
function Frigos({lots,updateLot}) {
  const [selFrigo,setSelFrigo]=useState(FRIGOS[0]);
  const [selLot,setSelLot]=useState(null);
  const [nbPal,setNbPal]=useState("");
  const [ok,setOk]=useState("");
  const dispo=lots.filter(l=>l.etapeActuelle==="conditionnement"&&l.conformite==="conforme");
  const inFrigo=(f)=>lots.filter(l=>l.frigo===f);

  const assigner=()=>{
    if(!selLot||!nbPal)return;
    const updated={...selLot,frigo:selFrigo,nbPalettes:parseInt(nbPal),dateFrigo:new Date().toISOString(),etapeActuelle:"stockage"};
    updateLot(updated);
    setOk("✅ Lot "+selLot.id+" → "+selFrigo+" ("+nbPal+" palettes)");
    setSelLot(null);setNbPal("");setTimeout(()=>setOk(""),4000);
  };

  return(
    <div><PH title="🧊 Frigos 4 — 7" sub="Stockage frigorifique — suivi des lots et palettes par frigo"/>
    {ok&&<Alert txt={ok}/>}
    {/* Vue frigos */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
      {FRIGOS.map(f=>{const lts=inFrigo(f);const pal=lts.reduce((s,l)=>s+(l.nbPalettes||0),0);const kg=lts.reduce((s,l)=>s+(l.poidsNet||0),0);return(
        <div key={f} onClick={()=>setSelFrigo(f)} style={{background:selFrigo===f?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.04)",border:"2px solid "+(selFrigo===f?"#6366f1":"rgba(255,255,255,0.07)"),borderRadius:14,padding:18,cursor:"pointer",transition:"all 0.2s",textAlign:"center"}}>
          <div style={{fontSize:34,marginBottom:8}}>🧊</div>
          <div style={{fontSize:15,fontWeight:800,color:selFrigo===f?"#818cf8":"#fff"}}>{f}</div>
          <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{lts.length} lot(s)</div>
            <div style={{fontSize:13,color:"#a78bfa",fontWeight:700}}>{pal} palettes</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{kg.toFixed(0)} kg</div>
          </div>
        </div>
      );})}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      {/* Assigner */}
      <Card title={"Entrer un lot dans "+selFrigo}>
        <FL>Lot conditionné disponible</FL>
        {dispo.length===0?<Empty txt="Aucun lot conditionné"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>setSelLot(l)} style={{padding:11,borderRadius:9,marginBottom:6,cursor:"pointer",background:selLot?.id===l.id?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.03)",border:"1px solid "+(selLot?.id===l.id?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — {l.poidsNet} kg</div>
            {l.frigo&&<div style={{fontSize:11,color:"#a78bfa",marginTop:2}}>📍 Déjà dans {l.frigo}</div>}
          </div>
        ))}
        {selLot&&(<><FL>Nombre de palettes *</FL><FI type="number" value={nbPal} onChange={v=>setNbPal(v)} ph="Ex: 10"/><Btn color="#6366f1" onClick={assigner}>🧊 Entrer dans {selFrigo}</Btn></>)}
      </Card>
      {/* Contenu frigo */}
      <Card title={"Contenu de "+selFrigo}>
        {inFrigo(selFrigo).length===0?<Empty txt="Frigo vide"/>:inFrigo(selFrigo).map(l=>{
          const h=l.dateFrigo?Math.floor((Date.now()-new Date(l.dateFrigo).getTime())/3600000):0;
          const j=Math.floor(h/24);const hr=h%24;
          return(
            <div key={l.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:13,marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <Mono clr="#818cf8">{l.id}</Mono>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:20}}>⏱️ {j>0?j+"j ":""}{hr}h</span>
              </div>
              <div style={{fontSize:12,color:"#e2e8f0",marginTop:4}}>{l.produit}</div>
              <div style={{display:"flex",gap:12,marginTop:5,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"#a78bfa",fontWeight:600}}>📦 {l.nbPalettes||0} palettes</span>
                <span style={{fontSize:11,color:"#60a5fa"}}>{l.poidsNet} kg</span>
                <span style={{fontSize:11,color:l.conformite==="conforme"?"#10b981":"#f87171"}}>{l.conformite==="conforme"?"✅ Conforme":"❌ N/C"}</span>
              </div>
              {l.dateFrigo&&<div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:3}}>Entrée: {new Date(l.dateFrigo).toLocaleString("fr-FR")}</div>}
            </div>
          );
        })}
      </Card>
    </div></div>
  );
}

// ─── EXPÉDITION ──────────────────────────────────────────────────────
function Expedition({lots,updateLot,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({client:"",destination:"",transporteur:"",numCamion:"",nbCartons:"",poidsFinal:"",tempCamion:"",note:""});
  const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const prets=lots.filter(l=>l.etapeActuelle==="stockage"&&l.conformite==="conforme");
  const selectLot=(l)=>{ sSel(l); sF({client:"",destination:"",transporteur:"",numCamion:"",nbCartons:String(l.nbPalettes||0),poidsFinal:String(l.poidsNet||l.poidsReception),tempCamion:"-18",note:""}); };

  const expedier=()=>{
    if(!sel||!f.destination||!f.poidsFinal)return;
    const now=new Date().toISOString(),kg=parseFloat(f.poidsFinal);
    const updated={...sel,etapeActuelle:"expédition",poidsNet:kg,expedition:{...f,date:now},
      historique:[...(sel.historique||[]),{etape:"expédition",date:now,user:user.nom,poids:kg,note:"→ "+f.destination+" | "+f.client+" | "+f.numCamion}]};
    updateLot(updated);
    const fn="FP-"+new Date().getFullYear()+"-"+String(new Date().getMonth()+1).padStart(2,"0")+"-"+updated.id.slice(-4);
    setTimeout(()=>printFacture(updated,fn),500);
    sOk("✅ Lot "+sel.id+" expédié — Facture "+fn+" générée !");
    sSel(null);sF({client:"",destination:"",transporteur:"",numCamion:"",nbCartons:"",poidsFinal:"",tempCamion:"",note:""});setTimeout(()=>sOk(""),6000);
  };

  return(
    <div><PH title="🚛 Expédition" sub="Chargement et livraison finale"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title={"Lots prêts ("+prets.length+")"}>
        {prets.length===0?<Empty txt="Aucun lot prêt — passer par Frigos d'abord"/>:prets.map(l=>(
          <div key={l.id} onClick={()=>selectLot(l)} style={{padding:12,borderRadius:9,marginBottom:6,cursor:"pointer",background:sel?.id===l.id?"rgba(20,184,166,0.12)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(20,184,166,0.4)":"rgba(255,255,255,0.06)"),transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono clr="#14b8a6">{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{l.produit} — <b>{l.poidsNet} kg</b></div>
            {l.frigo&&<div style={{fontSize:11,color:"#a78bfa",marginTop:2}}>📍 {l.frigo} — {l.nbPalettes} palettes</div>}
          </div>
        ))}
      </Card>
      <Card title="Bon d'expédition">
        {!sel?<Empty txt="← Sélectionner un lot"/>:(
          <>
            <div style={{background:"rgba(20,184,166,0.07)",border:"1px solid rgba(20,184,166,0.18)",borderRadius:9,padding:11,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#14b8a6"}}>Lot: {sel.id} | {sel.frigo||"—"} | {sel.nbPalettes||0} palettes</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{sel.produit} — {sel.poidsNet} kg — Pertes totales: {(sel.pertesTotales||0).toFixed(1)} kg</div>
            </div>
            {/* Info lot auto-rempli */}
            <div style={{background:"rgba(20,184,166,0.07)",border:"1px solid rgba(20,184,166,0.15)",borderRadius:9,padding:12,marginBottom:14,fontSize:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,color:"rgba(255,255,255,0.6)"}}>
                <div>📦 <b style={{color:"#fff"}}>{sel.produit}</b></div>
                <div>⚖️ <b style={{color:"#10b981"}}>{sel.poidsNet} kg</b></div>
                <div>🧊 <b style={{color:"#a78bfa"}}>{sel.frigo||"—"}</b></div>
                <div>📋 <b style={{color:"#fff"}}>{sel.nbPalettes||0} palettes</b></div>
                <div>📉 Pertes: <b style={{color:"#f87171"}}>{(sel.pertesTotales||0).toFixed(1)} kg</b></div>
                <div style={{color:sel.conformite==="conforme"?"#10b981":"#f87171"}}>{sel.conformite==="conforme"?"✅ Conforme":"❌ N/C"}</div>
              </div>
            </div>
            <FL>Client / Acheteur *</FL><FI value={f.client} onChange={v=>upd("client",v)} ph="Nom du client ou importateur..."/>
            <FL>Destination *</FL><FS value={f.destination} onChange={v=>upd("destination",v)} opts={DESTINATIONS} ph="Pays..."/>
            <FL>Transporteur</FL><FS value={f.transporteur} onChange={v=>upd("transporteur",v)} opts={TRANSPORTEURS} ph="Sélectionner..."/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>N° Camion</FL><FI value={f.numCamion} onChange={v=>upd("numCamion",v)} ph="AB-1234-CD"/></div>
              <div><FL>Nb. cartons</FL><FI type="number" value={f.nbCartons} onChange={v=>upd("nbCartons",v)} ph="0"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>Poids chargé (kg) *</FL><FI type="number" value={f.poidsFinal} onChange={v=>upd("poidsFinal",v)} ph="0.00"/></div>
              <div><FL>Temp. camion (°C)</FL><FI type="number" value={f.tempCamion} onChange={v=>upd("tempCamion",v)} ph="-18"/></div>
            </div>
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Remarques..."/>
            <Btn color="#14b8a6" onClick={expedier}>🚛 Valider & Générer Facture</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

// ─── TOUS LES LOTS ───────────────────────────────────────────────────
function Lots({lots}) {
  const [sel,sSel]=useState(null);
  const [search,sSearch]=useState("");
  const fil=lots.filter(l=>search===""||l.id.toLowerCase().includes(search.toLowerCase())||(l.expedition?.client||"").toLowerCase().includes(search.toLowerCase()));
  return(
    <div><PH title="🗂️ Tous les lots" sub={lots.length+" lots enregistrés"}/>
    <input value={search} onChange={e=>sSearch(e.target.value)} placeholder="🔍 Rechercher..."
      style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:13,outline:"none",marginBottom:16,boxSizing:"border-box",fontFamily:"inherit"}}/>
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:13,overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{["Lot","Produit","Ferme","Reçu","Pertes","Net","Conformité","Frigo","Étape","Date","⋯"].map(h=>(
          <th key={h} style={{textAlign:"left",padding:"9px 10px",color:"rgba(255,255,255,0.3)",fontWeight:600,fontSize:10,textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{h}</th>
        ))}</tr></thead>
        <tbody>{fil.length===0?<tr><td colSpan={11} style={{textAlign:"center",padding:36,color:"rgba(255,255,255,0.22)"}}>Aucun résultat</td></tr>:fil.map(l=>(
          <tr key={l.id} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
            <td style={{padding:"9px 10px"}}><Mono>{l.id}</Mono></td>
            <td style={{padding:"9px 10px",color:"#e2e8f0",fontSize:11}}>{l.produit}</td>
            <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.4)",fontSize:11}}>{l.origine}</td>
            <td style={{padding:"9px 10px",color:"#f59e0b",fontWeight:600}}>{l.poidsReception} kg</td>
            <td style={{padding:"9px 10px",color:"#f87171"}}>{(l.pertesTotales||0).toFixed(1)} kg</td>
            <td style={{padding:"9px 10px",color:"#60a5fa",fontWeight:600}}>{l.poidsNet} kg</td>
            <td style={{padding:"9px 10px"}}><span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:l.conformite==="conforme"?"rgba(16,185,129,0.15)":l.conformite==="non_conforme"?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.05)",color:l.conformite==="conforme"?"#10b981":l.conformite==="non_conforme"?"#f87171":"rgba(255,255,255,0.3)"}}>{l.conformite==="conforme"?"✅":l.conformite==="non_conforme"?"❌":"—"}</span></td>
            <td style={{padding:"9px 10px",color:"#a78bfa",fontSize:11}}>{l.frigo||"—"}</td>
            <td style={{padding:"9px 10px"}}><Badge etape={l.etapeActuelle}/></td>
            <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.35)",fontSize:11}}>{new Date(l.dateReception).toLocaleDateString("fr-FR")}</td>
            <td style={{padding:"9px 10px"}}><button onClick={()=>sSel(l)} style={{padding:"3px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.45)",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Voir</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
    {sel&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
        <div style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.09)",borderRadius:18,padding:28,width:"100%",maxWidth:600,maxHeight:"88vh",overflowY:"auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <h2 style={{margin:0,fontSize:16,fontWeight:800}}>📋 {sel.id}</h2>
            <button onClick={()=>sSel(null)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:7,color:"#fff",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
          </div>
          {/* Résumé */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[["Produit",sel.produit],["Ferme",sel.origine],["Poids reçu",sel.poidsReception+" kg"],["Pertes totales",(sel.pertesTotales||0).toFixed(1)+" kg"],["Poids net",sel.poidsNet+" kg"],["Conformité",sel.conformite||"—"],["Frigo",sel.frigo||"—"],["Palettes",(sel.nbPalettes||0)+""]].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:10}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.32)",textTransform:"uppercase"}}>{k}</div>
                <div style={{fontSize:13,fontWeight:600,color:"#fff",marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
          {/* Détail pertes par étape */}
          {sel.etapesDetail&&Object.keys(sel.etapesDetail).length>0&&(
            <div style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:14,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#fbbf24",marginBottom:10}}>📉 Détail des pertes par étape</div>
              {Object.entries(sel.etapesDetail).map(([etape,d])=>(
                <div key={etape} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:11}}>
                  <span style={{color:"rgba(255,255,255,0.6)",textTransform:"capitalize"}}>{etape}</span>
                  <span style={{color:"#f87171",fontWeight:600}}>{(d.pertes||0).toFixed(1)} kg pertes</span>
                  <span style={{color:"rgba(255,255,255,0.4)"}}>{(d.poidsSortie||d.produitFini||0).toFixed(1)} kg sortie</span>
                </div>
              ))}
            </div>
          )}
          {/* Historique */}
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Historique</div>
          {(sel.historique||[]).map((h,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:EC[h.etape]||"#666",marginTop:5,flexShrink:0}}/>
              <div style={{flex:1,background:"rgba(255,255,255,0.03)",borderRadius:7,padding:9}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,color:EC[h.etape]||"#fff",fontSize:12,textTransform:"capitalize"}}>{h.etape}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>{new Date(h.date).toLocaleString("fr-FR")}</span></div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{h.poids} kg — {h.user}{h.pertes>0?" — pertes: "+h.pertes+" kg":""}{h.conformite?" — "+(h.conformite==="conforme"?"✅ Conforme":"❌ Non Conforme"):""}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );
}

// ─── FACTURES ────────────────────────────────────────────────────────
function Factures({lots}) {
  const [search,sSearch]=useState("");
  const expedies=lots.filter(l=>l.etapeActuelle==="expédition");
  const fil=expedies.filter(l=>search===""||l.id.toLowerCase().includes(search.toLowerCase())||(l.expedition?.client||"").toLowerCase().includes(search.toLowerCase()));
  const genNum=(lot)=>{const d=new Date(lot.expedition?.date||lot.dateReception);return "FP-"+d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+lot.id.slice(-4);};
  const totalKg=expedies.reduce((s,l)=>s+(parseFloat(l.expedition?.poidsFinal||l.poidsNet||0)),0);
  return(
    <div><PH title="🧾 Factures Proforma" sub="Tableau de bord des factures"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      {[{label:"Total factures",value:expedies.length,icon:"🧾",color:"#10b981"},{label:"Kg expédiés",value:totalKg.toFixed(0)+" kg",icon:"⚖️",color:"#f59e0b"},{label:"Destinations",value:new Set(expedies.map(l=>l.expedition?.destination)).size,icon:"🌍",color:"#a78bfa"}].map((s,i)=>(
        <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,padding:18,textAlign:"center"}}>
          <div style={{fontSize:26}}>{s.icon}</div><div style={{fontSize:22,fontWeight:800,color:s.color,marginTop:6}}>{s.value}</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.38)",marginTop:3}}>{s.label}</div>
        </div>
      ))}
    </div>
    <input value={search} onChange={e=>sSearch(e.target.value)} placeholder="🔍 Rechercher par lot ou client..."
      style={{width:"100%",padding:"10px 13px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:13,outline:"none",marginBottom:16,boxSizing:"border-box",fontFamily:"inherit"}}/>
    <Card title="Tableau des factures">
      {fil.length===0?<Empty txt="Aucune facture"/>:(
        <Table headers={["N° Facture","Lot","Produit","Client","Destination","Conf.","Frigo","Palettes","Poids","Date","🖨️"]}
          rows={fil.map(l=>{const fn=genNum(l);return[
            <span style={{fontFamily:"Space Mono,monospace",fontSize:10,color:"#10b981",fontWeight:700}}>{fn}</span>,
            <Mono>{l.id}</Mono>,l.produit,
            <b style={{color:"#fff"}}>{l.expedition?.client||"—"}</b>,
            l.expedition?.destination||"—",
            <span style={{padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,background:l.conformite==="conforme"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",color:l.conformite==="conforme"?"#10b981":"#f87171"}}>{l.conformite==="conforme"?"✅":"❌"}</span>,
            l.frigo||"—",
            (l.nbPalettes||0)+" pal.",
            <span style={{color:"#f59e0b",fontWeight:600}}>{l.expedition?.poidsFinal||l.poidsNet} kg</span>,
            l.expedition?.date?new Date(l.expedition.date).toLocaleDateString("fr-FR"):"—",
            <button onClick={()=>printFacture(l,fn)} style={{padding:"4px 9px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#10b981,#059669)",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print</button>
          ];})}
        />
      )}
    </Card>
    </div>
  );
}

// ─── USERS ───────────────────────────────────────────────────────────
function Users({users,setUsers}) {
  const [f,sF]=useState({username:"",password:"",role:"",nom:""});const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const roles=Object.keys(ROLE_ETAPES);
  const add=()=>{
    if(!f.username||!f.password||!f.role||!f.nom)return;
    if(users.find(u=>u.username===f.username)){sOk("❌ Login déjà utilisé");setTimeout(()=>sOk(""),3000);return;}
    setUsers(p=>[...p,{id:Date.now(),...f,actif:true}]);
    sF({username:"",password:"",role:"",nom:""});sOk("✅ Utilisateur créé!");setTimeout(()=>sOk(""),3000);
  };
  return(
    <div><PH title="👥 Utilisateurs" sub="Gestion des accès"/>
    {ok&&<Alert txt={ok} err={ok.startsWith("❌")}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:18}}>
      <Card title="Nouvel utilisateur">
        <FL>Nom</FL><FI value={f.nom} onChange={v=>upd("nom",v)} ph="Mohamed Alami"/>
        <FL>Login</FL><FI value={f.username} onChange={v=>upd("username",v)} ph="m.alami"/>
        <FL>Mot de passe</FL><FI value={f.password} onChange={v=>upd("password",v)} ph="Min 6 chars"/>
        <FL>Rôle</FL><FS value={f.role} onChange={v=>upd("role",v)} opts={roles} ph="Sélectionner..."/>
        <Btn color="#6366f1" onClick={add}>➕ Créer</Btn>
      </Card>
      <Card title={"Utilisateurs ("+users.length+")"}>
        <Table headers={["Nom","Login","Rôle","Statut","Actions"]} rows={users.map(u=>[
          <b style={{color:"#fff"}}>{u.nom}</b>,<Mono>{u.username}</Mono>,
          <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,background:"rgba(99,102,241,0.1)",color:"#818cf8"}}>{u.role}</span>,
          <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,background:u.actif?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:u.actif?"#10b981":"#f87171"}}>{u.actif?"Actif":"Inactif"}</span>,
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,actif:!x.actif}:x))} style={{padding:"3px 7px",borderRadius:5,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{u.actif?"Désact.":"Activer"}</button>
            {u.id!==1&&<button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{padding:"3px 7px",borderRadius:5,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.08)",color:"#f87171",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Suppr.</button>}
          </div>
        ])}/>
      </Card>
    </div></div>
  );
}

// ─── UI ATOMS ────────────────────────────────────────────────────────
const PH=({title,sub})=><div style={{marginBottom:20}}><h2 style={{margin:0,fontSize:20,fontWeight:800,color:"#fff",letterSpacing:"-0.3px"}}>{title}</h2>{sub&&<p style={{margin:"4px 0 0",color:"rgba(255,255,255,0.36)",fontSize:12}}>{sub}</p>}</div>;
const Card=({title,children})=><div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:18}}><h3 style={{margin:"0 0 13px",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.6)"}}>{title}</h3>{children}</div>;
const Alert=({txt,err})=><div style={{background:err?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(err?"rgba(239,68,68,0.22)":"rgba(16,185,129,0.22)"),borderRadius:9,padding:"10px 15px",marginBottom:16,color:err?"#f87171":"#10b981",fontWeight:600,fontSize:13}}>{txt}</div>;
const Empty=({txt})=><div style={{textAlign:"center",padding:"32px 0",color:"rgba(255,255,255,0.2)",fontSize:12}}>{txt}</div>;
const Mono=({children,clr="#10b981"})=><span style={{fontFamily:"Space Mono,monospace",fontSize:11,fontWeight:700,color:clr}}>{children}</span>;
const Badge=({etape})=>{const c=EC[etape]||"#94a3b8";return <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:c+"16",color:c,border:"1px solid "+c+"30",textTransform:"capitalize"}}>{etape}</span>;};
const LotMini=({lot})=><div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:9,padding:11,marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Mono>{lot.id}</Mono><Badge etape={lot.etapeActuelle}/></div><div style={{fontSize:12,color:"#e2e8f0",marginTop:3}}>{lot.produit} — <b>{lot.poidsReception} kg</b></div><div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>{lot.origine}</div></div>;
const Table=({headers,rows})=><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr>{headers.map(h=><th key={h} style={{textAlign:"left",padding:"7px 9px",color:"rgba(255,255,255,0.28)",fontWeight:600,fontSize:10,textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{row.map((cell,j)=><td key={j} style={{padding:"9px 9px",color:"rgba(255,255,255,0.58)"}}>{cell}</td>)}</tr>)}</tbody></table>;
const Btn=({children,onClick,color})=><button onClick={onClick} style={{width:"100%",padding:12,background:"linear-gradient(135deg,"+color+","+color+"cc)",border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>{children}</button>;
const FL=({children})=><p style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:600,marginBottom:5,marginTop:2,textTransform:"uppercase",letterSpacing:0.7}}>{children}</p>;
const FI=({value,onChange,ph,type="text"})=><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}/>;
const FS=({value,onChange,opts,ph})=><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"9px 11px",background:"#1e293b",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:value?"#fff":"rgba(255,255,255,0.28)",fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box",fontFamily:"inherit"}}><option value="">{ph}</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
const FT=({value,onChange,ph})=><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={2} style={{width:"100%",padding:"9px 11px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:12,outline:"none",marginBottom:10,boxSizing:"border-box",resize:"none",fontFamily:"inherit"}}/>;
