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
const LOGO = "data:image/jpeg;base64,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";
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

  if(loading) return <div style={{minHeight:"100vh",background:"#080e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><img src={LOGO} style={{height:80,background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"6px 14px"}}/><div style={{color:"#10b981",fontSize:16,fontFamily:"DM Sans,sans-serif"}}>Chargement...</div></div>;
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
        <div key={f} onClick={()=>setSelFrigo(f)} style={{background:selFrigo===f?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.04)",
