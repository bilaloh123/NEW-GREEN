import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────────────
const SUPA_URL = "https://kwcphyhmzogwehyvqugz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y3BoeWhtem9nd2VoeXZxdWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjcxNjMsImV4cCI6MjA5NDg0MzE2M30.eyqu1wk1DPyMfBxFM4qyql0d8ukToUi_V9abE6HxhyY";

const db = {
  async getLots() {
    const r = await fetch(SUPA_URL+"/rest/v1/lots?select=*&order=created_at.desc", {headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY}});
    const data = await r.json();
    return data.map(row => row.data);
  },
  async saveLot(lot) {
    await fetch(SUPA_URL+"/rest/v1/lots", {method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id:lot.id,data:lot})});
  },
  async updateLot(lot) {
    await fetch(SUPA_URL+"/rest/v1/lots?id=eq."+lot.id, {method:"PATCH",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"},body:JSON.stringify({data:lot})});
  },
  async saveMouvement(mv) {
    await fetch(SUPA_URL+"/rest/v1/mouvements", {method:"POST",headers:{"apikey":SUPA_KEY,"Authorization":"Bearer "+SUPA_KEY,"Content-Type":"application/json"},body:JSON.stringify({lot_id:mv.lotId,data:mv})});
  }
};

const APP_NAME = "NEW GREEN";
const INITIAL_USERS = [
  { id:1, username:"admin",           password:"admin123", role:"admin",           nom:"Directeur",       actif:true },
  { id:2, username:"reception",       password:"recep123", role:"reception",       nom:"Réception",       actif:true },
  { id:3, username:"lavage",          password:"lav123",   role:"lavage",          nom:"Lavage",          actif:true },
  { id:4, username:"congelation",     password:"cong123",  role:"congelation",     nom:"Congélation",     actif:true },
  { id:5, username:"conditionnement", password:"cond123",  role:"conditionnement", nom:"Conditionnement", actif:true },
  { id:6, username:"expedition",      password:"exped123", role:"expedition",      nom:"Expédition",      actif:true },
];
const ETAPES       = ["réception","lavage","découpage","congélation","conditionnement","stockage","expédition"];
const PRODUITS     = ["Fraises","Avocats","Fraises Bio","Avocats Bio","Autre"];
const ORIGINES     = ["Ferme Al Manzeh","Ferme Ouled Mtaa","Ferme Gharb","Ferme Souss","Autre"];
const DESTINATIONS = ["France","Espagne","Allemagne","Pays-Bas","Belgique","Royaume-Uni","Autre"];
const TRANSPORTEURS= ["Transport Express","Froid Logistique","Euro Fret","Autre"];
const ROLE_ETAPES  = { admin:ETAPES, reception:["réception"], lavage:["lavage"], congelation:["congélation"], conditionnement:["découpage","conditionnement"], expedition:["stockage","expédition"] };
const EC = { réception:"#10b981", lavage:"#3b82f6", découpage:"#f59e0b", congélation:"#6366f1", conditionnement:"#ec4899", stockage:"#8b5cf6", expédition:"#14b8a6" };

function exportCSV(lots) {
  if(!lots.length) return;
  const h = ["N° Lot","Produit","Variété","Ferme","Poids Reçu(kg)","Poids Net(kg)","Pertes(kg)","Pertes(%)","Étape","Date Réception","Client","Destination","N° Camion","Transporteur","Nb Cartons","Temp Camion(°C)","Date Expédition","Note Expédition"];
  const rows = lots.map(l=>{
    const p=(l.poidsReception-(l.poidsNet||l.poidsReception)).toFixed(2);
    const pct=l.poidsReception>0?((p/l.poidsReception)*100).toFixed(1):"0";
    const ex=l.expedition||{};
    return [l.id,l.produit,l.variete||"",l.origine,l.poidsReception,l.poidsNet||l.poidsReception,p,pct,l.etapeActuelle,new Date(l.dateReception).toLocaleDateString("fr-FR"),ex.client||"",ex.destination||"",ex.numCamion||"",ex.transporteur||"",ex.nbCartons||"",ex.tempCamion||"",ex.date?new Date(ex.date).toLocaleDateString("fr-FR"):"",ex.note||""]
      .map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(",");
  });
  const csv="\uFEFF"+[h.join(","),...rows].join("\n");
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
  a.download="NEW_GREEN_"+new Date().toISOString().slice(0,10)+".csv"; a.click();
}

export default function App() {
  const [users,setUsers]           = useState(INITIAL_USERS);
  const [lots,setLots]             = useState([]);
  const [mouvements,setMouvements] = useState([]);
  const [cu,setCu]                 = useState(null);
  const [page,setPage]             = useState("dashboard");
  const [loading,setLoading]       = useState(true);

  useEffect(()=>{
    db.getLots().then(data=>{ setLots(data||[]); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  const addLot = async (lot) => { setLots(p=>[...p,lot]); await db.saveLot(lot); };
  const updateLot = async (lot) => { setLots(p=>p.map(l=>l.id===lot.id?lot:l)); await db.updateLot(lot); };
  const addMouvement = async (mv) => { setMouvements(p=>[...p,mv]); await db.saveMouvement(mv); };

  if(loading) return <div style={{minHeight:"100vh",background:"#080e1a",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981",fontSize:20,fontFamily:"DM Sans,sans-serif"}}>🌿 Chargement NEW GREEN...</div>;
  if(!cu) return <Login users={users} onLogin={setCu}/>;
  const isAdmin = cu.role==="admin";
  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#080e1a",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <Sidebar user={cu} page={page} setPage={setPage} isAdmin={isAdmin} onLogout={()=>setCu(null)}/>
      <div style={{flex:1,padding:"26px 30px",overflowY:"auto",maxHeight:"100vh"}}>
        {page==="dashboard"  && <Dashboard lots={lots} user={cu}/>}
        {page==="reception"  && <Reception lots={lots} addLot={addLot} addMouvement={addMouvement} user={cu}/>}
        {page==="traitement" && <Traitement lots={lots} updateLot={updateLot} addMouvement={addMouvement} user={cu}/>}
        {page==="expedition" && <Expedition lots={lots} updateLot={updateLot} addMouvement={addMouvement} user={cu}/>}
        {page==="lots"       && <Lots lots={lots}/>}
        {page==="analyse"    && <Analyse lots={lots}/>}
        {page==="rapports"   && <Rapports lots={lots}/>}
        {page==="users" && isAdmin && <Users users={users} setUsers={setUsers}/>}
      </div>
    </div>
  );
}

function Login({users,onLogin}) {
  const [u,sU]=useState(""); const [p,sP]=useState(""); const [err,sErr]=useState("");
  const go=()=>{ const f=users.find(x=>x.username===u&&x.password===p&&x.actif); f?onLogin(f):sErr("Identifiants incorrects ou compte désactivé"); };
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#080e1a,#0d1f3c,#080e1a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Mono:wght@700&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",top:"10%",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.07),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"12%",right:"8%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(99,102,241,0.08),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:400,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:28,padding:"46px 42px",backdropFilter:"blur(24px)",boxShadow:"0 40px 100px rgba(0,0,0,0.7)"}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{width:42,height:42,borderRadius:11,background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🌿</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Space Mono,monospace",letterSpacing:"-0.5px"}}>{APP_NAME}</div>
              <div style={{fontSize:10,color:"#10b981",letterSpacing:2,textTransform:"uppercase"}}>Traçabilité Agri</div>
            </div>
          </div>
          <p style={{margin:0,color:"rgba(255,255,255,0.32)",fontSize:13}}>Système de Gestion & Traçabilité</p>
        </div>
        {[["Identifiant","text",u,sU],["Mot de passe","password",p,sP]].map(([lbl,type,val,set],i)=>(
          <div key={i} style={{marginBottom:13}}>
            <label style={{display:"block",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.4)",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>{lbl}</label>
            <input type={type} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}
              style={{width:"100%",padding:"13px 14px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          </div>
        ))}
        {err&&<div style={{background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:9,padding:"10px 14px",fontSize:13,color:"#f87171",marginBottom:14,textAlign:"center"}}>{err}</div>}
        <button onClick={go} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:11,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>Connexion →</button>
        <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.15)",marginTop:18,marginBottom:0}}>Accès réservé au personnel autorisé</p>
      </div>
    </div>
  );
}

function Sidebar({user,page,setPage,isAdmin,onLogout}) {
  const nav=[{id:"dashboard",icon:"📊",label:"Tableau de bord"},{id:"reception",icon:"🚛",label:"Réception"},{id:"traitement",icon:"⚙️",label:"Traitement"},{id:"expedition",icon:"📦",label:"Expédition"},{id:"lots",icon:"🗂️",label:"Tous les lots"},{id:"analyse",icon:"📈",label:"Analyse"},{id:"rapports",icon:"📋",label:"Rapports"},...(isAdmin?[{id:"users",icon:"👥",label:"Utilisateurs"}]:[])];
  return (
    <div style={{width:225,background:"rgba(255,255,255,0.02)",borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",padding:"18px 0",flexShrink:0}}>
      <div style={{padding:"0 16px 18px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#10b981,#059669)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🌿</div>
          <div><div style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:"Space Mono,monospace"}}>{APP_NAME}</div><div style={{fontSize:10,color:"#10b981",letterSpacing:1}}>TRAÇABILITÉ</div></div>
        </div>
      </div>
      <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Connecté</div>
        <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{user.nom}</div>
        <span style={{display:"inline-block",marginTop:5,padding:"2px 9px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.22)",borderRadius:20,fontSize:10,color:"#10b981",textTransform:"uppercase",letterSpacing:0.5}}>{user.role}</span>
      </div>
      <nav style={{flex:1,padding:"8px"}}>
        {nav.map(item=>{const a=page===item.id;return(
          <button key={item.id} onClick={()=>setPage(item.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 11px",borderRadius:8,border:"none",cursor:"pointer",marginBottom:1,textAlign:"left",background:a?"rgba(16,185,129,0.11)":"transparent",color:a?"#10b981":"rgba(255,255,255,0.42)",fontSize:13,fontWeight:a?700:400,fontFamily:"inherit",borderLeft:a?"3px solid #10b981":"3px solid transparent"}}>
            <span style={{fontSize:14}}>{item.icon}</span>{item.label}
          </button>
        );})}
      </nav>
      <div style={{padding:"8px"}}>
        <button onClick={onLogout} style={{width:"100%",padding:"9px",borderRadius:8,border:"1px solid rgba(239,68,68,0.18)",background:"rgba(239,68,68,0.06)",color:"#f87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🚪 Déconnexion</button>
      </div>
    </div>
  );
}

function Dashboard({lots,user}) {
  const today=new Date().toDateString();
  const lotsToday=lots.filter(l=>new Date(l.dateReception).toDateString()===today);
  const totalRecu=lots.reduce((s,l)=>s+(l.poidsReception||0),0);
  const totalNet=lots.reduce((s,l)=>s+(l.poidsNet||l.poidsReception||0),0);
  const rend=totalRecu>0?(totalNet/totalRecu*100).toFixed(1):0;
  const stats=[{label:"Lots aujourd'hui",value:lotsToday.length,icon:"📦",color:"#10b981"},{label:"En cours",value:lots.filter(l=>l.etapeActuelle!=="expédition").length,icon:"⚙️",color:"#3b82f6"},{label:"Kg reçus",value:""+(totalRecu.toFixed(0))+" kg",icon:"⚖️",color:"#f59e0b"},{label:"Rendement",value:""+(rend)+"%",icon:"✅",color:"#a78bfa"}];
  return (
    <div>
      <PH title="Tableau de bord" sub={"Bonjour, "+user.nom+" — "+new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:24}}>
        {stats.map((s,i)=><div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:20}}><div style={{fontSize:24}}>{s.icon}</div><div style={{fontSize:24,fontWeight:800,color:s.color,marginTop:8}}>{s.value}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.38)",marginTop:3}}>{s.label}</div></div>)}
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,padding:20,marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Pipeline de production</div>
        <div style={{display:"flex",gap:7}}>
          {ETAPES.map(e=>{const c=lots.filter(l=>l.etapeActuelle===e).length;return(<div key={e} style={{flex:1,textAlign:"center"}}><div style={{height:46,background:""+(EC[e])+"15",border:"1px solid "+(EC[e])+"30",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:EC[e]}}>{c}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:5,textTransform:"capitalize"}}>{e}</div></div>);})}
        </div>
      </div>
      <Card title="🕐 Derniers lots">
        {lots.length===0?<Empty txt="Aucun lot enregistré"/>:<Table headers={["Lot N°","Produit","Ferme","Poids","Étape","Date"]} rows={[...lots].reverse().slice(0,8).map(l=>[<Mono>{l.id}</Mono>,l.produit,l.origine,<span style={{color:"#f59e0b",fontWeight:600}}>{l.poidsReception} kg</span>,<Badge etape={l.etapeActuelle}/>,new Date(l.dateReception).toLocaleDateString("fr-FR")])}/>}
      </Card>
    </div>
  );
}

function Reception({lots,addLot,addMouvement,user}) {
  const [f,sF]=useState({produit:"",variete:"",origine:"",poidsReception:"",temperature:"",observation:""});
  const [ok,sOk]=useState(""); const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const genId=()=>{const pfx=f.produit?.startsWith("Fraises")?"FR":f.produit?.startsWith("Avocats")?"AV":"PR";return ""+(pfx)+"-"+(new Date().toISOString().slice(2,10).replace(/-/g,""))+"-"+(String(lots.length+1).padStart(4,"0"))+"";};
  const submit=()=>{
    if(!f.produit||!f.origine||!f.poidsReception)return;
    const id=genId(),now=new Date().toISOString();
    const lot={id,...f,poidsReception:parseFloat(f.poidsReception),poidsNet:parseFloat(f.poidsReception),etapeActuelle:"réception",dateReception:now,historique:[{etape:"réception",date:now,user:user.nom,poids:parseFloat(f.poidsReception),note:f.observation}]};
    addLot(lot); addMouvement({id:Date.now(),lotId:id,etape:"réception",date:now,user:user.nom,poids:parseFloat(f.poidsReception)});
    sF({produit:"",variete:"",origine:"",poidsReception:"",temperature:"",observation:""}); sOk("✅ Lot "+(id)+" enregistré !"); setTimeout(()=>sOk(""),4000);
  };
  return (
    <div><PH title="🚛 Réception" sub="Enregistrement des matières premières"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card title="Nouveau lot">
        <FL>Produit *</FL><FS value={f.produit} onChange={v=>upd("produit",v)} opts={PRODUITS} ph="Sélectionner..."/>
        <FL>Variété</FL><FI value={f.variete} onChange={v=>upd("variete",v)} ph="Ex: Gariguette, Hass..."/>
        <FL>Ferme / Origine *</FL><FS value={f.origine} onChange={v=>upd("origine",v)} opts={ORIGINES} ph="Sélectionner..."/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><FL>Poids reçu (kg) *</FL><FI type="number" value={f.poidsReception} onChange={v=>upd("poidsReception",v)} ph="0.00"/></div>
          <div><FL>Température (°C)</FL><FI type="number" value={f.temperature} onChange={v=>upd("temperature",v)} ph="Ex: 4"/></div>
        </div>
        <FL>Observation</FL><FT value={f.observation} onChange={v=>upd("observation",v)} ph="État général, remarques..."/>
        <Btn color="#10b981" onClick={submit}>✅ Enregistrer le lot</Btn>
      </Card>
      <Card title={"Lots en réception ("+lots.filter(l=>l.etapeActuelle==="réception").length+")"}>
        {lots.filter(l=>l.etapeActuelle==="réception").length===0?<Empty txt="Aucun lot"/>:lots.filter(l=>l.etapeActuelle==="réception").map(l=><LotMini key={l.id} lot={l}/>)}
      </Card>
    </div></div>
  );
}

function Traitement({lots,updateLot,addMouvement,user}) {
  const [sel,sSel]=useState(null); const [f,sF]=useState({etape:"",poids:"",pertes:"",note:""}); const [ok,sOk]=useState("");
  const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const etapesOk=user.role==="admin"?ETAPES:(ROLE_ETAPES[user.role]||[]);
  const dispo=lots.filter(l=>l.etapeActuelle!=="expédition"&&l.etapeActuelle!=="stockage");
  const valider=()=>{
    if(!sel||!f.etape||!f.poids)return;
    const now=new Date().toISOString(),kg=parseFloat(f.poids),pertes=parseFloat(f.pertes||0);
    const updated={...sel,etapeActuelle:f.etape,poidsNet:kg,historique:[...(sel.historique||[]),{etape:f.etape,date:now,user:user.nom,poids:kg,pertes,note:f.note}]};
    updateLot(updated); addMouvement({id:Date.now(),lotId:sel.id,etape:f.etape,date:now,user:user.nom,poids:kg,pertes});
    sOk("✅ Lot "+(sel.id)+" → "+(f.etape)+""); sSel(null); sF({etape:"",poids:"",pertes:"",note:""}); setTimeout(()=>sOk(""),4000);
  };
  return (
    <div><PH title="⚙️ Traitement" sub="Suivi des étapes de transformation"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card title="Lots à traiter">
        {dispo.length===0?<Empty txt="Aucun lot disponible"/>:dispo.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF({etape:"",poids:String(l.poidsNet||l.poidsReception),pertes:"",note:""}); }}
            style={{padding:13,borderRadius:10,marginBottom:7,cursor:"pointer",background:sel?.id===l.id?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(16,185,129,0.35)":"rgba(255,255,255,0.06)")+"",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Mono>{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:4}}>{l.produit} — {l.poidsNet||l.poidsReception} kg</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>{l.origine}</div>
          </div>
        ))}
      </Card>
      <Card title={sel?"Traitement: "+(sel.id)+"":"Sélectionner un lot"}>
        {!sel?<Empty txt="← Cliquer sur un lot"/>:(
          <>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:9,padding:11,marginBottom:14}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.38)"}}>Lot sélectionné</div>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginTop:3}}>{sel.produit} — {sel.origine}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>Poids actuel: {sel.poidsNet||sel.poidsReception} kg</div>
            </div>
            <FL>Nouvelle étape *</FL><FS value={f.etape} onChange={v=>upd("etape",v)} opts={etapesOk} ph="Sélectionner..."/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>Poids sortant (kg) *</FL><FI type="number" value={f.poids} onChange={v=>upd("poids",v)} ph="0.00"/></div>
              <div><FL>Pertes (kg)</FL><FI type="number" value={f.pertes} onChange={v=>upd("pertes",v)} ph="0.00"/></div>
            </div>
            <FL>Note</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Observations..."/>
            <Btn color="#3b82f6" onClick={valider}>✅ Valider l'étape</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

function Expedition({lots,updateLot,addMouvement,user}) {
  const [sel,sSel]=useState(null);
  const [f,sF]=useState({client:"",destination:"",transporteur:"",numCamion:"",nbCartons:"",poidsFinal:"",tempCamion:"",note:""});
  const [ok,sOk]=useState(""); const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const prets=lots.filter(l=>l.etapeActuelle==="stockage"||l.etapeActuelle==="conditionnement");
  const expedier=()=>{
    if(!sel||!f.destination||!f.poidsFinal)return;
    const now=new Date().toISOString(),kg=parseFloat(f.poidsFinal);
    setLots(p=>p.map(l=>l.id===sel.id?{...l,etapeActuelle:"expédition",poidsNet:kg,expedition:{...f,date:now},historique:[...(l.historique||[]),{etape:"expédition",date:now,user:user.nom,poids:kg,note:"→ "+(f.destination)+" | "+(f.client)+" | "+(f.numCamion)+""}]}:l));
    setMouvements(p=>[...p,{id:Date.now(),lotId:sel.id,etape:"expédition",date:now,user:user.nom,poids:kg}]);
    sOk("✅ Lot "+(sel.id)+" expédié → "+(f.destination)+" — Client: "+(f.client)+"");
    sSel(null); sF({client:"",destination:"",transporteur:"",numCamion:"",nbCartons:"",poidsFinal:"",tempCamion:"",note:""}); setTimeout(()=>sOk(""),5000);
  };
  return (
    <div><PH title="📦 Expédition" sub="Bons d'expédition & chargements"/>
    {ok&&<Alert txt={ok}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card title={"Lots prêts ("+prets.length+")"}>
        {prets.length===0?<Empty txt="Aucun lot prêt — passer par Stockage"/>:prets.map(l=>(
          <div key={l.id} onClick={()=>{sSel(l);sF(x=>({...x,poidsFinal:String(l.poidsNet||l.poidsReception)}));}}
            style={{padding:13,borderRadius:10,marginBottom:7,cursor:"pointer",background:sel?.id===l.id?"rgba(20,184,166,0.1)":"rgba(255,255,255,0.03)",border:"1px solid "+(sel?.id===l.id?"rgba(20,184,166,0.35)":"rgba(255,255,255,0.06)")+"",transition:"all 0.15s"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><Mono clr="#14b8a6">{l.id}</Mono><Badge etape={l.etapeActuelle}/></div>
            <div style={{fontSize:12,color:"#e2e8f0",marginTop:4}}>{l.produit} — <b>{l.poidsNet||l.poidsReception} kg</b></div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>{l.origine}</div>
          </div>
        ))}
      </Card>
      <Card title="Bon d'expédition">
        {!sel?<Empty txt="← Sélectionner un lot"/>:(
          <>
            <div style={{background:"rgba(20,184,166,0.07)",border:"1px solid rgba(20,184,166,0.18)",borderRadius:9,padding:11,marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:"#14b8a6"}}>Lot: {sel.id}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",marginTop:2}}>{sel.produit} — {sel.origine} — {sel.poidsNet||sel.poidsReception} kg</div>
            </div>
            <FL>Client / Acheteur *</FL><FI value={f.client} onChange={v=>upd("client",v)} ph="Nom du client ou importateur..."/>
            <FL>Destination *</FL><FS value={f.destination} onChange={v=>upd("destination",v)} opts={DESTINATIONS} ph="Pays..."/>
            <FL>Transporteur</FL><FS value={f.transporteur} onChange={v=>upd("transporteur",v)} opts={TRANSPORTEURS} ph="Sélectionner..."/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>N° Camion</FL><FI value={f.numCamion} onChange={v=>upd("numCamion",v)} ph="AB-1234-CD"/></div>
              <div><FL>Nb. cartons</FL><FI type="number" value={f.nbCartons} onChange={v=>upd("nbCartons",v)} ph="0"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><FL>Poids final (kg) *</FL><FI type="number" value={f.poidsFinal} onChange={v=>upd("poidsFinal",v)} ph="0.00"/></div>
              <div><FL>Temp. camion (°C)</FL><FI type="number" value={f.tempCamion} onChange={v=>upd("tempCamion",v)} ph="Ex: -18"/></div>
            </div>
            <FL>Note de voyage</FL><FT value={f.note} onChange={v=>upd("note",v)} ph="Instructions, remarques..."/>
            <Btn color="#14b8a6" onClick={expedier}>🚛 Valider l'expédition</Btn>
          </>
        )}
      </Card>
    </div></div>
  );
}

function Lots({lots}) {
  const [search,sSearch]=useState(""); const [fE,sFE]=useState(""); const [fP,sFP]=useState(""); const [sel,sSel]=useState(null);
  const fil=lots.filter(l=>(search===""||l.id.toLowerCase().includes(search.toLowerCase())||l.origine?.toLowerCase().includes(search.toLowerCase())||l.expedition?.client?.toLowerCase().includes(search.toLowerCase()))&&(fE===""||l.etapeActuelle===fE)&&(fP===""||l.produit===fP));
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PH title="🗂️ Tous les lots" sub={""+(lots.length)+" lots enregistrés"}/>
        <button onClick={()=>exportCSV(fil)} style={{padding:"10px 16px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>⬇️ Export CSV ({fil.length})</button>
      </div>
      <div style={{display:"flex",gap:9,marginBottom:18}}>
        <input value={search} onChange={e=>sSearch(e.target.value)} placeholder="🔍 Rechercher lot, ferme, client..." style={{flex:1,padding:"10px 13px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <select value={fE} onChange={e=>sFE(e.target.value)} style={{padding:"10px 11px",background:"#1e293b",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:12,outline:"none"}}>
          <option value="">Toutes étapes</option>{ETAPES.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
        <select value={fP} onChange={e=>sFP(e.target.value)} style={{padding:"10px 11px",background:"#1e293b",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:12,outline:"none"}}>
          <option value="">Tous produits</option>{PRODUITS.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:13,overflow:"hidden"}}>
        <Table headers={["Lot N°","Produit","Ferme","Reçu","Net","Pertes","Client","Destination","Étape","Date","⋯"]}
          rows={fil.length===0?[[<td colSpan={11} style={{textAlign:"center",padding:36,color:"rgba(255,255,255,0.22)"}}>Aucun résultat</td>]]:fil.map(l=>{
            const p=l.poidsReception-(l.poidsNet||l.poidsReception),pct=l.poidsReception>0?(p/l.poidsReception*100).toFixed(1):0;
            return [<Mono>{l.id}</Mono>,l.produit,l.origine,<span style={{color:"#f59e0b",fontWeight:600}}>{l.poidsReception} kg</span>,<span style={{color:"#60a5fa",fontWeight:600}}>{l.poidsNet||l.poidsReception} kg</span>,<span style={{color:p>0?"#f87171":"rgba(255,255,255,0.22)"}}>{p>0?"-"+(p.toFixed(1))+"kg ("+(pct)+"%)":"—"}</span>,<b style={{color:"#e2e8f0"}}>{l.expedition?.client||"—"}</b>,l.expedition?.destination||"—",<Badge etape={l.etapeActuelle}/>,new Date(l.dateReception).toLocaleDateString("fr-FR"),<button onClick={()=>sSel(l)} style={{padding:"4px 9px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Voir</button>];
          })}
        />
      </div>
      {sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
          <div style={{background:"#0f172a",border:"1px solid rgba(255,255,255,0.09)",borderRadius:20,padding:30,width:"100%",maxWidth:570,maxHeight:"88vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{margin:0,fontSize:17,fontWeight:800}}>📋 {sel.id}</h2>
              <button onClick={()=>sSel(null)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:7,color:"#fff",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:18}}>
              {[["Produit",sel.produit],["Variété",sel.variete||"—"],["Ferme",sel.origine],["Poids reçu",""+(sel.poidsReception)+" kg"],["Poids net",""+(sel.poidsNet||sel.poidsReception)+" kg"],["Étape",sel.etapeActuelle],["Température",sel.temperature?""+(sel.temperature)+"°C":"—"],["Date réception",new Date(sel.dateReception).toLocaleString("fr-FR")]].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.32)",marginBottom:3,textTransform:"uppercase"}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{v}</div>
                </div>
              ))}
            </div>
            {sel.expedition&&(
              <div style={{background:"rgba(20,184,166,0.07)",border:"1px solid rgba(20,184,166,0.18)",borderRadius:11,padding:14,marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:700,color:"#14b8a6",marginBottom:10}}>🚛 Expédition</div>
                <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"5px 14px",fontSize:12}}>
                  {[["Client",sel.expedition.client],["Destination",sel.expedition.destination],["Transporteur",sel.expedition.transporteur],["N° Camion",sel.expedition.numCamion],["Cartons",sel.expedition.nbCartons],["Temp. camion",sel.expedition.tempCamion?""+(sel.expedition.tempCamion)+"°C":"—"],["Poids chargé",""+(sel.expedition.poidsFinal||sel.poidsNet)+" kg"],["Date",sel.expedition.date?new Date(sel.expedition.date).toLocaleString("fr-FR"):"—"]].map(([k,v])=>[
                    <span key={k+"k"} style={{color:"rgba(255,255,255,0.38)"}}>{k}:</span>,
                    <span key={k+"v"} style={{color:"#e2e8f0",fontWeight:500}}>{v||"—"}</span>
                  ])}
                </div>
                {sel.expedition.note&&<div style={{marginTop:9,padding:8,background:"rgba(255,255,255,0.04)",borderRadius:7,fontSize:12,color:"rgba(255,255,255,0.45)",fontStyle:"italic"}}>{sel.expedition.note}</div>}
              </div>
            )}
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Historique</div>
            {(sel.historique||[]).map((h,i)=>(
              <div key={i} style={{display:"flex",gap:9,marginBottom:7}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:EC[h.etape]||"#666",marginTop:5,flexShrink:0}}/>
                <div style={{flex:1,background:"rgba(255,255,255,0.03)",borderRadius:7,padding:9}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,color:EC[h.etape]||"#fff",fontSize:12,textTransform:"capitalize"}}>{h.etape}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>{new Date(h.date).toLocaleString("fr-FR")}</span></div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{h.poids} kg — par {h.user}{h.pertes>0&&<span style={{color:"#f87171"}}> — pertes: {h.pertes} kg</span>}</div>
                  {h.note&&<div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2,fontStyle:"italic"}}>{h.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Analyse({lots}) {
  const totalRecu=lots.reduce((s,l)=>s+(l.poidsReception||0),0);
  const totalNet=lots.reduce((s,l)=>s+(l.poidsNet||l.poidsReception||0),0);
  const rend=totalRecu>0?(totalNet/totalRecu*100).toFixed(1):0;
  const parProd=PRODUITS.reduce((acc,p)=>{const ls=lots.filter(l=>l.produit===p);if(ls.length>0)acc[p]={count:ls.length,recu:ls.reduce((s,l)=>s+l.poidsReception,0),net:ls.reduce((s,l)=>s+(l.poidsNet||l.poidsReception),0)};return acc;},{});
  const parDest=lots.filter(l=>l.expedition?.destination).reduce((acc,l)=>{const d=l.expedition.destination;if(!acc[d])acc[d]={kg:0,count:0,clients:new Set()};acc[d].kg+=(l.poidsNet||0);acc[d].count++;if(l.expedition.client)acc[d].clients.add(l.expedition.client);return acc;},{});
  const parFerme=lots.reduce((acc,l)=>{if(!acc[l.origine])acc[l.origine]={count:0,recu:0};acc[l.origine].count++;acc[l.origine].recu+=l.poidsReception||0;return acc;},{});
  const parClient=lots.filter(l=>l.expedition?.client).reduce((acc,l)=>{const c=l.expedition.client;if(!acc[c])acc[c]={count:0,kg:0};acc[c].count++;acc[c].kg+=(l.poidsNet||0);return acc;},{});
  return (
    <div><PH title="📈 Analyse" sub="Tableaux de bord analytiques & performance"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:22}}>
      {[{label:"Total lots",value:lots.length,icon:"📦",color:"#10b981"},{label:"Kg reçus",value:""+(totalRecu.toFixed(0))+" kg",icon:"⚖️",color:"#f59e0b"},{label:"Pertes",value:""+((totalRecu-totalNet).toFixed(0))+" kg",icon:"📉",color:"#f87171"},{label:"Rendement",value:""+(rend)+"%",icon:"✅",color:"#a78bfa"}].map((s,i)=>(
        <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:20}}><div style={{fontSize:22}}>{s.icon}</div><div style={{fontSize:22,fontWeight:800,color:s.color,marginTop:7}}>{s.value}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.36)",marginTop:3}}>{s.label}</div></div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
      <Card title="🍓 Par produit">
        {Object.keys(parProd).length===0?<Empty txt="Aucune donnée"/>:Object.entries(parProd).map(([p,d])=>{const r=d.recu>0?(d.net/d.recu*100).toFixed(1):0;return(<div key={p} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}><span style={{fontWeight:600}}>{p}</span><span style={{color:"rgba(255,255,255,0.4)"}}>{d.count} lots — {r}% rend.</span></div><div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:totalRecu>0?""+(Math.max(4,(d.recu/totalRecu*100)).toFixed(0))+"%":"4%",background:p.includes("Fraises")?"#f43f5e":"#84cc16",borderRadius:3}}/></div></div>);})}
      </Card>
      <Card title="🌾 Par ferme">
        {Object.keys(parFerme).length===0?<Empty txt="Aucune donnée"/>:Object.entries(parFerme).sort((a,b)=>b[1].recu-a[1].recu).map(([f,d])=>(
          <div key={f} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:12,fontWeight:500}}>🌿 {f}</span><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:"#10b981"}}>{d.recu.toFixed(0)} kg</div><div style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>{d.count} lots</div></div></div>
        ))}
      </Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
      <Card title="🌍 Par destination">
        {Object.keys(parDest).length===0?<Empty txt="Aucune expédition"/>:Object.entries(parDest).sort((a,b)=>b[1].kg-a[1].kg).map(([dest,d])=>(
          <div key={dest} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:12,fontWeight:500}}>🌍 {dest}</span><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:"#14b8a6"}}>{d.kg.toFixed(0)} kg</div><div style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>{d.count} lots — {d.clients.size} client(s)</div></div></div>
        ))}
      </Card>
      <Card title="🤝 Top clients">
        {Object.keys(parClient).length===0?<Empty txt="Aucun client"/>:Object.entries(parClient).sort((a,b)=>b[1].kg-a[1].kg).map(([c,d])=>(
          <div key={c} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><span style={{fontSize:12,fontWeight:500}}>👤 {c}</span><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:700,color:"#a78bfa"}}>{d.kg.toFixed(0)} kg</div><div style={{fontSize:10,color:"rgba(255,255,255,0.32)"}}>{d.count} livraison(s)</div></div></div>
        ))}
      </Card>
    </div></div>
  );
}

function Rapports({lots}) {
  const expedies=lots.filter(l=>l.etapeActuelle==="expédition");
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <PH title="📋 Rapports" sub="Export des données de production"/>
        <button onClick={()=>exportCSV(lots)} style={{padding:"10px 16px",background:"linear-gradient(135deg,#10b981,#059669)",border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>⬇️ Export complet CSV</button>
      </div>
      <Card title="📦 Récapitulatif expéditions">
        {expedies.length===0?<Empty txt="Aucune expédition"/>:<Table headers={["Lot","Produit","Client","Destination","N° Camion","Cartons","Kg chargés","Date exp."]} rows={expedies.map(l=>[<Mono clr="#14b8a6">{l.id}</Mono>,l.produit,<b style={{color:"#fff"}}>{l.expedition?.client||"—"}</b>,l.expedition?.destination||"—",l.expedition?.numCamion||"—",l.expedition?.nbCartons||"—",<span style={{color:"#10b981",fontWeight:700}}>{l.expedition?.poidsFinal||l.poidsNet||l.poidsReception} kg</span>,l.expedition?.date?new Date(l.expedition.date).toLocaleDateString("fr-FR"):"—"])}/>}
      </Card>
    </div>
  );
}

function Users({users,setUsers}) {
  const [f,sF]=useState({username:"",password:"",role:"",nom:""}); const [ok,sOk]=useState(""); const upd=(k,v)=>sF(x=>({...x,[k]:v}));
  const roles=["admin","reception","lavage","congelation","conditionnement","expedition"];
  const add=()=>{
    if(!f.username||!f.password||!f.role||!f.nom)return;
    if(users.find(u=>u.username===f.username)){sOk("❌ Identifiant déjà utilisé");setTimeout(()=>sOk(""),3000);return;}
    setUsers(p=>[...p,{id:Date.now(),...f,actif:true}]); sF({username:"",password:"",role:"",nom:""}); sOk("✅ Utilisateur créé !"); setTimeout(()=>sOk(""),3000);
  };
  return (
    <div><PH title="👥 Utilisateurs" sub="Gestion des accès et permissions"/>
    {ok&&<Alert txt={ok} err={ok.startsWith("❌")}/>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:20}}>
      <Card title="Nouvel utilisateur">
        <FL>Nom complet</FL><FI value={f.nom} onChange={v=>upd("nom",v)} ph="Ex: Mohamed Alami"/>
        <FL>Identifiant</FL><FI value={f.username} onChange={v=>upd("username",v)} ph="Ex: m.alami"/>
        <FL>Mot de passe</FL><FI value={f.password} onChange={v=>upd("password",v)} ph="Min 6 caractères"/>
        <FL>Rôle</FL><FS value={f.role} onChange={v=>upd("role",v)} opts={roles} ph="Sélectionner..."/>
        <Btn color="#6366f1" onClick={add}>➕ Créer l'utilisateur</Btn>
      </Card>
      <Card title={"Utilisateurs ("+users.length+")"}>
        <Table headers={["Nom","Login","Rôle","Statut","Actions"]} rows={users.map(u=>[
          <b style={{color:"#fff"}}>{u.nom}</b>,<Mono>{u.username}</Mono>,
          <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,background:"rgba(99,102,241,0.1)",color:"#818cf8",border:"1px solid rgba(99,102,241,0.22)"}}>{u.role}</span>,
          <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,background:u.actif?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",color:u.actif?"#10b981":"#f87171"}}>{u.actif?"Actif":"Inactif"}</span>,
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>setUsers(p=>p.map(x=>x.id===u.id?{...x,actif:!x.actif}:x))} style={{padding:"4px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{u.actif?"Désactiver":"Activer"}</button>
            {u.id!==1&&<button onClick={()=>setUsers(p=>p.filter(x=>x.id!==u.id))} style={{padding:"4px 8px",borderRadius:6,border:"1px solid rgba(239,68,68,0.22)",background:"rgba(239,68,68,0.07)",color:"#f87171",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Suppr.</button>}
          </div>
        ])}/>
      </Card>
    </div></div>
  );
}

// UI ATOMS
const PH=({title,sub})=><div style={{marginBottom:20}}><h2 style={{margin:0,fontSize:21,fontWeight:800,color:"#fff",letterSpacing:"-0.3px"}}>{title}</h2>{sub&&<p style={{margin:"4px 0 0",color:"rgba(255,255,255,0.36)",fontSize:13}}>{sub}</p>}</div>;
const Card=({title,children})=><div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,padding:20}}><h3 style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.65)"}}>{title}</h3>{children}</div>;
const Alert=({txt,err})=><div style={{background:err?"rgba(239,68,68,0.1)":"rgba(16,185,129,0.1)",border:"1px solid "+(err?"rgba(239,68,68,0.22)":"rgba(16,185,129,0.22)")+"",borderRadius:9,padding:"11px 16px",marginBottom:18,color:err?"#f87171":"#10b981",fontWeight:600,fontSize:13}}>{txt}</div>;
const Empty=({txt})=><div style={{textAlign:"center",padding:"34px 0",color:"rgba(255,255,255,0.2)",fontSize:13}}>{txt}</div>;
const Mono=({children,clr="#10b981"})=><span style={{fontFamily:"Space Mono,monospace",fontSize:12,fontWeight:700,color:clr}}>{children}</span>;
const Badge=({etape})=>{const c=EC[etape]||"#94a3b8";return <span style={{padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:""+(c)+"16",color:c,border:"1px solid "+(c)+"30",textTransform:"capitalize"}}>{etape}</span>;};
const LotMini=({lot})=><div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:9,padding:11,marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Mono>{lot.id}</Mono><Badge etape={lot.etapeActuelle}/></div><div style={{fontSize:12,color:"#e2e8f0",marginTop:4}}>{lot.produit} — <b>{lot.poidsReception} kg</b></div><div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginTop:2}}>{lot.origine}</div></div>;
const Table=({headers,rows})=><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr>{headers.map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",color:"rgba(255,255,255,0.28)",fontWeight:600,fontSize:10,textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>{row.map((cell,j)=><td key={j} style={{padding:"10px 10px",color:"rgba(255,255,255,0.58)"}}>{cell}</td>)}</tr>)}</tbody></table>;
const Btn=({children,onClick,color})=><button onClick={onClick} style={{width:"100%",padding:12,background:"linear-gradient(135deg,"+(color)+","+(color)+"cc)",border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginTop:5}}>{children}</button>;
const FL=({children})=><p style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontWeight:600,marginBottom:5,marginTop:2,textTransform:"uppercase",letterSpacing:0.7}}>{children}</p>;
const FI=({value,onChange,ph,type="text"})=><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:13,outline:"none",marginBottom:11,boxSizing:"border-box",fontFamily:"inherit"}}/>;
const FS=({value,onChange,opts,ph})=><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"10px 12px",background:"#1e293b",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:value?"#fff":"rgba(255,255,255,0.28)",fontSize:13,outline:"none",marginBottom:11,boxSizing:"border-box",fontFamily:"inherit"}}><option value="">{ph}</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>;
const FT=({value,onChange,ph})=><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} rows={3} style={{width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,color:"#fff",fontSize:13,outline:"none",marginBottom:11,boxSizing:"border-box",resize:"none",fontFamily:"inherit"}}/>;
