import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ═══════════════════════════════════════════════════════════════════
//  NEW GREEN — Smart Quality System (SQS)
//  Gestion, Traçabilité & Management de la Qualité
//  Production • Non-conformités • Réclamations • Actions • Risques
//  Audits • Documentation • Flash Report
// ═══════════════════════════════════════════════════════════════════

// ─── SUPABASE (stockage générique : lots + entités qualité) ─────────
const SUPA_URL = "https://kwcphyhmzogwehyvqugz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3Y3BoeWhtem9nd2VoeXZxdWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjcxNjMsImV4cCI6MjA5NDg0MzE2M30.eyqu1wk1DPyMfBxFM4qyql0d8ukToUi_V9abE6HxhyY";
const H = { apikey: SUPA_KEY, Authorization: "Bearer " + SUPA_KEY, "Content-Type": "application/json" };
const db = {
  async getAll() { try { const r = await fetch(SUPA_URL + "/rest/v1/lots?select=*&order=created_at.desc", { headers: H }); const d = await r.json(); return Array.isArray(d) ? d.map(x => x.data).filter(Boolean) : []; } catch (e) { return []; } },
  async save(id, data) { try { await fetch(SUPA_URL + "/rest/v1/lots", { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id, data }) }); } catch (e) {} },
  async update(id, data) { try { await fetch(SUPA_URL + "/rest/v1/lots?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: H, body: JSON.stringify({ data }) }); } catch (e) {} },
  async remove(id) { try { await fetch(SUPA_URL + "/rest/v1/lots?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: H }); } catch (e) {} },
};

// ─── CONFIG ──────────────────────────────────────────────────────────
const FRIGOS = ["Ch. Négative 1", "Ch. Négative 4", "Ch. Négative 6", "Ch. Négative 7"];
const PRODUITS = ["Fraises", "Avocats", "Fraises Bio", "Avocats Bio", "Autre"];
const ORIGINES = ["Ferme Al Manzeh", "Ferme Ouled Mtaa", "Ferme Gharb", "Ferme Souss", "Autre"];
const DESTINATIONS = ["France", "Espagne", "Allemagne", "Pays-Bas", "Belgique", "Royaume-Uni", "Autre"];
const TRANSPORTEURS = ["Transport Express", "Froid Logistique", "Euro Fret", "Autre"];
const EC = { réception: "#10b981", lavage: "#3b82f6", découpage: "#f59e0b", congélation: "#6366f1", conditionnement: "#ec4899", stockage: "#8b5cf6", expédition: "#14b8a6", non_conforme: "#ef4444" };

// SQS — référentiels qualité
const GRAVITES = ["Faible", "Moyen", "Fort"];
const GCOLOR = { Faible: "#10b981", Moyen: "#f59e0b", Fort: "#ef4444" };
const NATURES_RECLAMATION = ["Délai de Livraison", "Délai ou Disponibilité", "Écart de Quantité", "Qualité de Service", "Qualité du Produit", "Autre"];
const REFERENTIELS = ["ISO 9001", "ISO 22000", "IFS", "BRC", "HACCP", "GlobalG.A.P", "Audit interne"];
const DOC_CATS = ["Procédure", "Instruction", "Formulaire", "Enregistrement", "Manuel Qualité", "Plan HACCP"];
const SOURCES_NC = ["Réception", "Lavage & Analyse", "Découpage", "Congélation", "Conditionnement", "Stockage", "Expédition", "Audit", "Réclamation client", "Autre"];
const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#ef4444", "#a78bfa"];

const INITIAL_USERS = [
  { id: "U-1", username: "admin", password: "admin123", role: "admin", nom: "Directeur", actif: true },
  { id: "U-2", username: "qualite", password: "qual123", role: "qualite", nom: "Resp. Qualité", actif: true },
  { id: "U-3", username: "reception", password: "recep123", role: "reception", nom: "Réception", actif: true },
  { id: "U-4", username: "lavage", password: "lav123", role: "lavage", nom: "Lavage", actif: true },
  { id: "U-5", username: "decoupe", password: "dec123", role: "decoupe", nom: "Découpage", actif: true },
  { id: "U-6", username: "congelation", password: "cong123", role: "congelation", nom: "Congélation", actif: true },
  { id: "U-7", username: "conditionnement", password: "cond123", role: "conditionnement", nom: "Conditionnement", actif: true },
  { id: "U-8", username: "expedition", password: "exped123", role: "expedition", nom: "Expédition", actif: true },
];

const ROLE_PAGES = {
  admin: "all",
  qualite: ["dashboard", "qdash", "nc", "reclamations", "actions", "risques", "audits", "documents", "flash", "lots"],
  reception: ["dashboard", "reception", "lots"],
  lavage: ["dashboard", "lavage", "lots"],
  decoupe: ["dashboard", "decoupe", "lots"],
  congelation: ["dashboard", "congelation", "lots"],
  conditionnement: ["dashboard", "conditionnement", "frigos", "lots"],
  expedition: ["dashboard", "expedition", "factures", "lots"],
};

const uid = (p) => p + "-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
const fdate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const fdatetime = (d) => d ? new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";

const exportCSV = (headers, rows, name) => {
  const all = [headers, ...rows];
  const csv = all.map(r => r.map(c => '"' + String(c ?? "").replace(/"/g, '""') + '"').join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
};

// ─── FACTURE ─────────────────────────────────────────────────────────
function printFacture(lot, num) {
  const ex = lot.expedition || {};
  const w = window.open("", "_blank", "width=900,height=750");
  const d = new Date().toLocaleDateString("fr-FR");
  w.document.write(
    "<!DOCTYPE html><html><head><meta charset=UTF-8><title>Facture " + num + "</title>" +
    "<style>body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:12px;color:#111}" +
    ".hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #10b981;padding-bottom:16px;margin-bottom:20px}" +
    ".brand{font-size:24px;font-weight:800;color:#065f46;letter-spacing:1px}" +
    ".brand span{color:#10b981}" +
    ".co{text-align:right}.co h2{margin:0;color:#10b981;font-size:17px}" +
    ".co p{margin:2px 0;font-size:11px}" +
    ".title{background:#10b981;color:#fff;text-align:center;padding:10px;font-size:17px;font-weight:bold;border-radius:6px;margin:16px 0}" +
    ".grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:16px 0}" +
    ".box{background:#f0fdf4;padding:13px;border-radius:7px;border-left:4px solid #10b981}" +
    ".box h4{margin:0 0 8px;color:#065f46;font-size:11px;text-transform:uppercase}" +
    ".box p{margin:2px 0;font-size:11px}" +
    "table{width:100%;border-collapse:collapse;margin:12px 0}" +
    "th{background:#10b981;color:#fff;padding:9px 10px;font-size:11px;text-align:left}" +
    "td{padding:8px 10px;border-bottom:1px solid #e5e7eb;font-size:11px}" +
    "tr:nth-child(even){background:#f9fafb}" +
    ".tot{background:#10b981;color:#fff;padding:12px;border-radius:7px;text-align:right;font-size:14px;font-weight:bold;margin-top:8px}" +
    ".ftr{margin-top:36px;text-align:center;color:#9ca3af;font-size:10px;border-top:1px solid #e5e7eb;padding-top:12px}" +
    ".badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:bold}" +
    ".green{background:#d1fae5;color:#065f46}.red{background:#fee2e2;color:#991b1b}" +
    "@media print{.noprint{display:none}}</style></head><body>" +
    "<div class=hdr><div class=brand>NEW<span>GREEN</span></div>" +
    "<div class=co><h2>NEW GREEN Import Export</h2><p>Tel: +212 XXX XXX XXX</p><p>contact@newgreen.ma — Maroc</p></div></div>" +
    "<div class=title>FACTURE PROFORMA N° " + num + "</div>" +
    "<div class=grid2>" +
    "<div class=box><h4>Client</h4><p><b>" + (ex.client || "—") + "</b></p><p>Destination: " + (ex.destination || "—") + "</p><p>Date exp: " + (ex.date ? new Date(ex.date).toLocaleDateString("fr-FR") : "—") + "</p></div>" +
    "<div class=box><h4>Transport</h4><p>Transporteur: " + (ex.transporteur || "—") + "</p><p>Camion: " + (ex.numCamion || "—") + "</p><p>Cartons: " + (ex.nbCartons || "—") + "</p><p>Temp: " + (ex.tempCamion ? ex.tempCamion + "°C" : "—") + "</p></div>" +
    "</div>" +
    "<table><tr><th>Lot N°</th><th>Produit</th><th>Ferme</th><th>Poids reçu</th><th>Pertes totales</th><th>Poids net</th><th>Conformité</th></tr>" +
    "<tr><td><b>" + lot.id + "</b></td><td>" + lot.produit + (lot.variete ? " — " + lot.variete : "") + "</td><td>" + lot.origine + "</td>" +
    "<td>" + lot.poidsReception + " kg</td>" +
    "<td>" + (lot.pertesTotales || 0).toFixed(1) + " kg</td>" +
    "<td><b>" + (ex.poidsFinal || lot.poidsNet || lot.poidsReception) + " kg</b></td>" +
    "<td><span class='badge " + (lot.conformite === "conforme" ? "green" : "red") + "'>" + (lot.conformite === "conforme" ? "Conforme" : "Non Conforme") + "</span></td></tr></table>" +
    "<div class=tot>Poids expédié: " + (ex.poidsFinal || lot.poidsNet || lot.poidsReception) + " kg</div>" +
    "<div class=ftr><p>Généré le " + d + " — NEW GREEN Import Export — Système SQS</p><p>Document proforma — non contractuel</p></div>" +
    "<br><button class=noprint onclick=window.print() style=background:#10b981;color:#fff;border:none;padding:9px_22px;border-radius:6px;cursor:pointer;font-size:13px;display:block;margin:0_auto>Imprimer</button>" +
    "</body></html>"
  );
  w.document.close();
}

// ═══════════════════════════════════════════════════════════════════
//  APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [rows, setRows] = useState([]);
  const [cu, setCu] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => { db.getAll().then(d => { setRows(d || []); setLoading(false); }).catch(() => setLoading(false)); }, []);

  // Collections dérivées
  const lots = useMemo(() => rows.filter(r => !r.type || r.type === "lot"), [rows]);
  const ncs = useMemo(() => rows.filter(r => r.type === "nc"), [rows]);
  const recls = useMemo(() => rows.filter(r => r.type === "reclamation"), [rows]);
  const actions = useMemo(() => rows.filter(r => r.type === "action"), [rows]);
  const risques = useMemo(() => rows.filter(r => r.type === "risque"), [rows]);
  const audits = useMemo(() => rows.filter(r => r.type === "audit"), [rows]);
  const docs = useMemo(() => rows.filter(r => r.type === "document"), [rows]);
  const dbUsers = useMemo(() => rows.filter(r => r.type === "user"), [rows]);
  const users = useMemo(() => {
    const merged = [...INITIAL_USERS];
    dbUsers.forEach(u => { const i = merged.findIndex(m => m.username === u.username); if (i >= 0) merged[i] = u; else merged.push(u); });
    return merged;
  }, [dbUsers]);

  const addItem = async (item) => { setRows(p => [item, ...p]); await db.save(item.id, item); };
  const updateItem = async (item) => { setRows(p => p.map(r => r.id === item.id ? item : r)); await db.update(item.id, item); };
  const removeItem = async (id) => { setRows(p => p.filter(r => r.id !== id)); await db.remove(id); };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#080e1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "DM Sans,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <BrandMark size={44} />
      <div style={{ color: "#10b981", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>Chargement du système...</div>
    </div>
  );
  if (!cu) return <Login users={users} onLogin={setCu} />;

  const access = ROLE_PAGES[cu.role] || ["dashboard"];
  const can = (id) => access === "all" || access.includes(id);

  const SECTIONS = [
    { title: "Production", items: [
      { id: "dashboard", icon: "📊", label: "Tableau de bord" },
      { id: "reception", icon: "🚛", label: "Réception" },
      { id: "lavage", icon: "💧", label: "Lavage & Analyse" },
      { id: "decoupe", icon: "✂️", label: "Découpage" },
      { id: "congelation", icon: "❄️", label: "Congélation" },
      { id: "conditionnement", icon: "📦", label: "Conditionnement" },
      { id: "frigos", icon: "🧊", label: "Frigos 4-7" },
      { id: "expedition", icon: "🚢", label: "Expédition" },
      { id: "lots", icon: "🗂️", label: "Tous les lots" },
      { id: "factures", icon: "🧾", label: "Factures" },
    ]},
    { title: "Qualité — SQS", items: [
      { id: "qdash", icon: "🎯", label: "Pilotage Qualité" },
      { id: "nc", icon: "⚠️", label: "Non-conformités" },
      { id: "reclamations", icon: "📣", label: "Réclamations client" },
      { id: "actions", icon: "🛠️", label: "Plan d'action" },
      { id: "risques", icon: "🧮", label: "Évaluation risques" },
      { id: "audits", icon: "🔍", label: "Plan d'audit" },
      { id: "documents", icon: "📚", label: "Documentation" },
      { id: "flash", icon: "⚡", label: "Flash Report" },
    ]},
    { title: "Administration", items: [{ id: "users", icon: "👥", label: "Utilisateurs" }] },
  ];

  const props = { lots, ncs, recls, actions, risques, audits, docs, users, user: cu, addItem, updateItem, removeItem };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080e1a", color: "#e2e8f0", fontFamily: "DM Sans,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      {/* SIDEBAR */}
      <div style={{ width: 232, background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: "16px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <BrandMark size={26} />
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: 2, textTransform: "uppercase", marginTop: 5 }}>Smart Quality System</div>
        </div>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Connecté</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginTop: 2 }}>{cu.nom}</div>
          <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, fontSize: 10, color: "#10b981", textTransform: "uppercase" }}>{cu.role}</span>
        </div>
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {SECTIONS.map(sec => {
            const items = sec.items.filter(i => can(i.id));
            if (!items.length) return null;
            return (
              <div key={sec.title} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: 1.5, padding: "8px 10px 4px" }}>{sec.title}</div>
                {items.map(item => { const a = page === item.id; return (
                  <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 1, textAlign: "left", background: a ? "rgba(16,185,129,0.11)" : "transparent", color: a ? "#10b981" : "rgba(255,255,255,0.42)", fontSize: 12, fontWeight: a ? 700 : 400, fontFamily: "inherit", borderLeft: a ? "3px solid #10b981" : "3px solid transparent" }}>
                    <span style={{ fontSize: 13 }}>{item.icon}</span>{item.label}
                  </button>
                ); })}
              </div>
            );
          })}
        </nav>
        <div style={{ padding: "8px" }}>
          <button onClick={() => setCu(null)} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(239,68,68,0.06)", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🚪 Déconnexion</button>
        </div>
      </div>
      {/* MAIN */}
      <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto", maxHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard {...props} />}
        {page === "reception" && <Reception {...props} />}
        {page === "lavage" && <Lavage {...props} />}
        {page === "decoupe" && <Decoupe {...props} />}
        {page === "congelation" && <Congelation {...props} />}
        {page === "conditionnement" && <Conditionnement {...props} />}
        {page === "frigos" && <Frigos {...props} />}
        {page === "expedition" && <Expedition {...props} />}
        {page === "lots" && <Lots {...props} />}
        {page === "factures" && <Factures {...props} />}
        {page === "qdash" && <QualiteDashboard {...props} />}
        {page === "nc" && <NonConformites {...props} />}
        {page === "reclamations" && <Reclamations {...props} />}
        {page === "actions" && <PlanAction {...props} />}
        {page === "risques" && <Risques {...props} />}
        {page === "audits" && <Audits {...props} />}
        {page === "documents" && <Documentation {...props} />}
        {page === "flash" && <FlashReport {...props} />}
        {page === "users" && can("users") && <Users users={users} addItem={addItem} updateItem={updateItem} />}
      </div>
    </div>
  );
}

// ─── BRAND ───────────────────────────────────────────────────────────
function BrandMark({ size = 24 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: size + 8, height: size + 8, borderRadius: 8, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.6 }}>🌿</div>
      <div style={{ fontSize: size * 0.72, fontWeight: 800, letterSpacing: 1, color: "#fff" }}>NEW<span style={{ color: "#10b981" }}>GREEN</span></div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────
function Login({ users, onLogin }) {
  const [u, sU] = useState(""); const [p, sP] = useState(""); const [err, sErr] = useState("");
  const go = () => { const f = users.find(x => x.username === u && x.password === p && x.actif); f ? onLogin(f) : sErr("Identifiants incorrects"); };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#080e1a,#0d1f3c)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Sans,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ width: 380, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "44px 40px", backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <BrandMark size={30} />
          <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Gestion · Traçabilité · Smart Quality System</p>
        </div>
        {[["Identifiant", "text", u, sU], ["Mot de passe", "password", p, sP]].map(([lbl, type, val, set], i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 }}>{lbl}</label>
            <input type={type} value={val} onChange={e => set(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} style={{ width: "100%", padding: "12px 13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
        ))}
        {err && <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#f87171", marginBottom: 12, textAlign: "center" }}>{err}</div>}
        <button onClick={go} style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>Connexion →</button>
      </div>
    </div>
  );
}

// ─── UI PARTAGÉE ─────────────────────────────────────────────────────
const PH = ({ title, sub, right }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
    <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>{title}</h1>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{sub}</p>}</div>
    {right}
  </div>
);
const Card = ({ title, right, children, style }) => (
  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 13, padding: 18, marginBottom: 18, ...style }}>
    {(title || right) && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>{right}
    </div>}
    {children}
  </div>
);
const FL = ({ children }) => <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", margin: "10px 0 5px", textTransform: "uppercase", letterSpacing: 1 }}>{children}</label>;
const inputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const FI = ({ value, onChange, type = "text", ph }) => <input type={type} value={value} placeholder={ph} onChange={e => onChange(e.target.value)} style={inputStyle} />;
const FS = ({ value, onChange, opts, ph }) => (
  <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
    <option value="" style={{ background: "#0d1526" }}>{ph || "Sélectionner..."}</option>
    {opts.map(o => <option key={o} value={o} style={{ background: "#0d1526" }}>{o}</option>)}
  </select>
);
const FT = ({ value, onChange, ph }) => <textarea value={value} placeholder={ph} onChange={e => onChange(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />;
const Btn = ({ color = "#10b981", onClick, children, small }) => (
  <button onClick={onClick} style={{ width: small ? "auto" : "100%", padding: small ? "6px 12px" : "12px", marginTop: small ? 0 : 14, background: color, border: "none", borderRadius: 9, color: "#fff", fontWeight: 700, fontSize: small ? 11 : 13, cursor: "pointer", fontFamily: "inherit" }}>{children}</button>
);
const GhostBtn = ({ onClick, children, color = "rgba(255,255,255,0.5)" }) => (
  <button onClick={onClick} style={{ padding: "5px 11px", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{children}</button>
);
const Alert = ({ txt }) => <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 9, padding: "10px 14px", fontSize: 12, color: "#34d399", marginBottom: 14 }}>{txt}</div>;
const Empty = ({ txt }) => <div style={{ padding: "26px 12px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12 }}>{txt}</div>;
const Mono = ({ children }) => <span style={{ fontFamily: "Space Mono,monospace", fontSize: 11, color: "#10b981", fontWeight: 700 }}>{children}</span>;
const Badge = ({ etape }) => <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: (EC[etape] || "#666") + "22", color: EC[etape] || "#999", textTransform: "capitalize" }}>{etape?.replace("_", " ")}</span>;
const Pill = ({ txt, color }) => <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: color + "22", color, border: "1px solid " + color + "44" }}>{txt}</span>;
const Stat = ({ icon, value, label, color }) => (
  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: 18 }}>
    <div style={{ fontSize: 22 }}>{icon}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 7 }}>{value}</div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{label}</div>
  </div>
);
const LotMini = ({ lot }) => (
  <div style={{ padding: 12, borderRadius: 9, marginBottom: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}><Mono>{lot.id}</Mono><Badge etape={lot.etapeActuelle} /></div>
    <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 3 }}>{lot.produit} — <b>{lot.poidsNet || lot.poidsReception} kg</b></div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{lot.origine} · {fdatetime(lot.dateReception)}</div>
  </div>
);
const SelectableLot = ({ lot, selected, onClick, color }) => (
  <div onClick={onClick} style={{ padding: 12, borderRadius: 9, marginBottom: 6, cursor: "pointer", background: selected ? color + "1f" : "rgba(255,255,255,0.03)", border: "1px solid " + (selected ? color + "66" : "rgba(255,255,255,0.06)"), transition: "all 0.15s" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}><Mono>{lot.id}</Mono><Badge etape={lot.etapeActuelle} /></div>
    <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 3 }}>{lot.produit} — <b>{lot.poidsNet || lot.poidsReception} kg</b></div>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{lot.origine}</div>
  </div>
);
const chartTooltip = { contentStyle: { background: "#0d1526", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 12, color: "#fff" } };

// ═══════════════════════════════════════════════════════════════════
//  PRODUCTION
// ═══════════════════════════════════════════════════════════════════

// ─── DASHBOARD ───────────────────────────────────────────────────────
function Dashboard({ lots, ncs, user }) {
  const totalRecu = lots.reduce((s, l) => s + (l.poidsReception || 0), 0);
  const totalNet = lots.reduce((s, l) => s + (l.poidsNet || l.poidsReception || 0), 0);
  const totalPertes = lots.reduce((s, l) => s + (l.pertesTotales || 0), 0);
  const rend = totalRecu > 0 ? ((totalNet / totalRecu) * 100).toFixed(1) : 0;
  const conformes = lots.filter(l => l.conformite === "conforme").length;
  const nonConformes = lots.filter(l => l.conformite === "non_conforme").length;
  const etapes = ["réception", "lavage", "découpage", "congélation", "conditionnement", "stockage", "expédition", "non_conforme"];
  const etapeCounts = etapes.reduce((acc, e) => { acc[e] = lots.filter(l => l.etapeActuelle === e).length; return acc; }, {});

  return (
    <div>
      <PH title="Tableau de bord" sub={"Bonjour " + user.nom + " — " + new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        <Stat icon="📦" value={lots.length} label="Total lots" color="#10b981" />
        <Stat icon="⚖️" value={totalRecu.toFixed(0) + " kg"} label="Kg reçus" color="#f59e0b" />
        <Stat icon="📉" value={totalPertes.toFixed(1) + " kg"} label="Pertes totales" color="#f87171" />
        <Stat icon="✅" value={rend + "%"} label="Rendement" color="#a78bfa" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>
        <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 13, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>✅</div><div><div style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>{conformes}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Lots conformes</div></div>
        </div>
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 13, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>❌</div><div><div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{nonConformes}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Lots non conformes</div></div>
        </div>
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 13, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>⚠️</div><div><div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24" }}>{ncs.filter(n => n.statut === "ouverte").length}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>NC ouvertes (SQS)</div></div>
        </div>
      </div>
      <Card title="Pipeline de production">
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
          {Object.entries(etapeCounts).map(([e, c]) => (
            <div key={e} style={{ flex: 1, minWidth: 70, textAlign: "center" }}>
              <div style={{ height: 44, background: (EC[e] || "#666") + "18", border: "1px solid " + (EC[e] || "#666") + "30", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: EC[e] || "#666" }}>{c}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 5, textTransform: "capitalize", wordBreak: "break-word" }}>{e.replace("_", " ")}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="🧊 État des frigos">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {FRIGOS.map(f => { const lts = lots.filter(l => l.frigo === f); const pal = lts.reduce((s, l) => s + (l.nbPalettes || 0), 0); const kg = lts.reduce((s, l) => s + (l.poidsNet || 0), 0); return (
            <div key={f} style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🧊</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#818cf8" }}>{f}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{lts.length} lots</div>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{pal} palettes</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{kg.toFixed(0)} kg</div>
            </div>
          ); })}
        </div>
      </Card>
    </div>
  );
}

// ─── RÉCEPTION ───────────────────────────────────────────────────────
function Reception({ lots, addItem, user }) {
  const [f, sF] = useState({ produit: "", variete: "", origine: "", poidsReception: "", temperature: "", observation: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const genId = () => { const pfx = f.produit?.startsWith("Fraises") ? "FR" : f.produit?.startsWith("Avocats") ? "AV" : "PR"; return pfx + "-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + String(lots.length + 1).padStart(4, "0"); };
  const submit = () => {
    if (!f.produit || !f.origine || !f.poidsReception) return;
    const id = genId(), now = new Date().toISOString(), kg = parseFloat(f.poidsReception);
    addItem({ id, type: "lot", ...f, poidsReception: kg, poidsNet: kg, pertesTotales: 0, etapeActuelle: "réception", dateReception: now,
      etapesDetail: {}, historique: [{ etape: "réception", date: now, user: user.nom, poids: kg, note: f.observation }] });
    sF({ produit: "", variete: "", origine: "", poidsReception: "", temperature: "", observation: "" });
    sOk("Lot " + id + " enregistré ✓"); setTimeout(() => sOk(""), 4000);
  };
  return (
    <div><PH title="🚛 Réception" sub="Enregistrement des matières premières" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="Nouveau lot">
          <FL>Produit *</FL><FS value={f.produit} onChange={v => upd("produit", v)} opts={PRODUITS} />
          <FL>Variété</FL><FI value={f.variete} onChange={v => upd("variete", v)} ph="Ex: Gariguette, Hass..." />
          <FL>Ferme / Origine *</FL><FS value={f.origine} onChange={v => upd("origine", v)} opts={ORIGINES} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><FL>Poids reçu (kg) *</FL><FI type="number" value={f.poidsReception} onChange={v => upd("poidsReception", v)} ph="0.00" /></div>
            <div><FL>Température (°C)</FL><FI type="number" value={f.temperature} onChange={v => upd("temperature", v)} ph="Ex: 4" /></div>
          </div>
          <FL>Observation</FL><FT value={f.observation} onChange={v => upd("observation", v)} ph="Remarques..." />
          <Btn onClick={submit}>Enregistrer le lot</Btn>
        </Card>
        <Card title={"Lots en réception (" + lots.filter(l => l.etapeActuelle === "réception").length + ")"}>
          {lots.filter(l => l.etapeActuelle === "réception").map(l => <LotMini key={l.id} lot={l} />)}
          {lots.filter(l => l.etapeActuelle === "réception").length === 0 && <Empty txt="Aucun lot en attente" />}
        </Card>
      </div></div>
  );
}

// ─── LAVAGE & ANALYSE (crée une NC automatique si non conforme) ─────
function Lavage({ lots, updateItem, addItem, user }) {
  const [sel, sSel] = useState(null);
  const [f, sF] = useState({ pertesLavage: "", conformite: "", note: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const dispo = lots.filter(l => l.etapeActuelle === "réception");
  const valider = () => {
    if (!sel || !f.pertesLavage || !f.conformite) return;
    const now = new Date().toISOString();
    const pertes = parseFloat(f.pertesLavage);
    const poidsNet = (sel.poidsNet || sel.poidsReception) - pertes;
    const pertesTotales = (sel.pertesTotales || 0) + pertes;
    const etape = f.conformite === "non_conforme" ? "non_conforme" : "lavage";
    updateItem({ ...sel, etapeActuelle: etape, poidsNet, pertesTotales, conformite: f.conformite,
      etapesDetail: { ...(sel.etapesDetail || {}), lavage: { pertes, poidsEntree: sel.poidsNet || sel.poidsReception, poidsSortie: poidsNet, conformite: f.conformite, date: now, user: user.nom } },
      historique: [...(sel.historique || []), { etape: "lavage", date: now, user: user.nom, poids: poidsNet, pertes, conformite: f.conformite, note: f.note }] });
    if (f.conformite === "non_conforme") {
      addItem({ id: uid("NC"), type: "nc", titre: "Analyse non conforme — Lot " + sel.id, lotId: sel.id, source: "Lavage & Analyse", gravite: "Fort", description: f.note || "Résultat d'analyse non conforme au lavage.", statut: "ouverte", date: now, user: user.nom });
    }
    sOk("Lot " + sel.id + " — lavage validé · " + (f.conformite === "conforme" ? "Conforme ✓" : "Non conforme → NC créée automatiquement dans le module SQS"));
    sSel(null); sF({ pertesLavage: "", conformite: "", note: "" }); setTimeout(() => sOk(""), 5000);
  };
  return (
    <div><PH title="💧 Lavage & Analyse" sub="Contrôle qualité et analyse de conformité — toute non-conformité génère une fiche NC" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Lots à laver (" + dispo.length + ")"}>
          {dispo.length === 0 ? <Empty txt="Aucun lot en attente" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={sel?.id === l.id} color="#3b82f6" onClick={() => { sSel(l); sF({ pertesLavage: "", conformite: "", note: "" }); }} />
          ))}
        </Card>
        <Card title={sel ? "Lavage : " + sel.id : "Sélectionner un lot"}>
          {!sel ? <Empty txt="← Cliquer sur un lot" /> : (<>
            <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 9, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>Lot : {sel.id}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sel.produit} — poids entrant : <b>{sel.poidsNet || sel.poidsReception} kg</b></div>
            </div>
            <FL>Pertes au lavage (kg) *</FL>
            <FI type="number" value={f.pertesLavage} onChange={v => upd("pertesLavage", v)} ph="0.00" />
            {f.pertesLavage && <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fbbf24", margin: "10px 0" }}>
              Poids après lavage : <b>{((sel.poidsNet || sel.poidsReception) - parseFloat(f.pertesLavage || 0)).toFixed(1)} kg</b></div>}
            <FL>Résultat analyse *</FL>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              <button onClick={() => upd("conformite", "conforme")} style={{ flex: 1, padding: "11px", borderRadius: 9, border: "2px solid " + (f.conformite === "conforme" ? "#10b981" : "rgba(255,255,255,0.1)"), background: f.conformite === "conforme" ? "rgba(16,185,129,0.15)" : "transparent", color: f.conformite === "conforme" ? "#10b981" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>✅ Conforme</button>
              <button onClick={() => upd("conformite", "non_conforme")} style={{ flex: 1, padding: "11px", borderRadius: 9, border: "2px solid " + (f.conformite === "non_conforme" ? "#f87171" : "rgba(255,255,255,0.1)"), background: f.conformite === "non_conforme" ? "rgba(239,68,68,0.15)" : "transparent", color: f.conformite === "non_conforme" ? "#f87171" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>❌ Non conforme</button>
            </div>
            {f.conformite === "non_conforme" && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#f87171", marginBottom: 6 }}>⚠️ Le lot sera retiré du circuit et une fiche NC sera ouverte automatiquement.</div>}
            <FL>Note</FL><FT value={f.note} onChange={v => upd("note", v)} ph="Observations d'analyse..." />
            <Btn color={f.conformite === "non_conforme" ? "#ef4444" : "#3b82f6"} onClick={valider}>Valider le lavage</Btn>
          </>)}
        </Card>
      </div></div>
  );
}

// ─── DÉCOUPAGE ───────────────────────────────────────────────────────
function Decoupe({ lots, updateItem, user }) {
  const [sel, sSel] = useState(null);
  const [f, sF] = useState({ pertesDecoupe: "", nbBlocs: "", poidsBloc: "", note: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const dispo = lots.filter(l => l.etapeActuelle === "lavage" && l.conformite === "conforme");
  const valider = () => {
    if (!sel || !f.pertesDecoupe) return;
    const now = new Date().toISOString();
    const pertes = parseFloat(f.pertesDecoupe);
    const poidsNet = sel.poidsNet - pertes;
    updateItem({ ...sel, etapeActuelle: "découpage", poidsNet, pertesTotales: (sel.pertesTotales || 0) + pertes,
      etapesDetail: { ...(sel.etapesDetail || {}), decoupe: { pertes, poidsEntree: sel.poidsNet, poidsSortie: poidsNet, nbBlocs: parseInt(f.nbBlocs || 0), poidsBloc: parseFloat(f.poidsBloc || 0), date: now, user: user.nom } },
      historique: [...(sel.historique || []), { etape: "découpage", date: now, user: user.nom, poids: poidsNet, pertes, note: f.note }] });
    sOk("Lot " + sel.id + " — découpage validé (" + pertes + " kg pertes)");
    sSel(null); sF({ pertesDecoupe: "", nbBlocs: "", poidsBloc: "", note: "" }); setTimeout(() => sOk(""), 4000);
  };
  return (
    <div><PH title="✂️ Découpage" sub="Tri et découpage — suivi des pertes et blocs" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Lots à découper (" + dispo.length + ")"}>
          {dispo.length === 0 ? <Empty txt="Aucun lot conforme disponible" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={sel?.id === l.id} color="#f59e0b" onClick={() => { sSel(l); sF({ pertesDecoupe: "", nbBlocs: "", poidsBloc: "", note: "" }); }} />
          ))}
        </Card>
        <Card title={sel ? "Découpage : " + sel.id : "Sélectionner un lot"}>
          {!sel ? <Empty txt="← Cliquer sur un lot" /> : (<>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 9, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24" }}>Lot : {sel.id}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Poids entrant : <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes au découpage (kg) *</FL><FI type="number" value={f.pertesDecoupe} onChange={v => upd("pertesDecoupe", v)} ph="0.00" />
            {f.pertesDecoupe && <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fbbf24", margin: "10px 0" }}>Poids après découpage : <b>{(sel.poidsNet - parseFloat(f.pertesDecoupe || 0)).toFixed(1)} kg</b></div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><FL>Nb. blocs</FL><FI type="number" value={f.nbBlocs} onChange={v => upd("nbBlocs", v)} ph="0" /></div>
              <div><FL>Poids/bloc (kg)</FL><FI type="number" value={f.poidsBloc} onChange={v => upd("poidsBloc", v)} ph="0.00" /></div>
            </div>
            <FL>Note</FL><FT value={f.note} onChange={v => upd("note", v)} ph="Observations..." />
            <Btn color="#f59e0b" onClick={valider}>Valider le découpage</Btn>
          </>)}
        </Card>
      </div></div>
  );
}

// ─── CONGÉLATION ─────────────────────────────────────────────────────
function Congelation({ lots, updateItem, user }) {
  const [sel, sSel] = useState(null);
  const [f, sF] = useState({ pertesCongelation: "", tempCongelation: "", note: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const dispo = lots.filter(l => l.etapeActuelle === "découpage" && l.conformite === "conforme");
  const valider = () => {
    if (!sel || !f.pertesCongelation) return;
    const now = new Date().toISOString();
    const pertes = parseFloat(f.pertesCongelation);
    const poidsNet = sel.poidsNet - pertes;
    updateItem({ ...sel, etapeActuelle: "congélation", poidsNet, pertesTotales: (sel.pertesTotales || 0) + pertes,
      etapesDetail: { ...(sel.etapesDetail || {}), congelation: { pertes, poidsEntree: sel.poidsNet, poidsSortie: poidsNet, temp: f.tempCongelation, date: now, user: user.nom } },
      historique: [...(sel.historique || []), { etape: "congélation", date: now, user: user.nom, poids: poidsNet, pertes, note: f.note }] });
    sOk("Lot " + sel.id + " — congélation validée");
    sSel(null); sF({ pertesCongelation: "", tempCongelation: "", note: "" }); setTimeout(() => sOk(""), 4000);
  };
  return (
    <div><PH title="❄️ Congélation" sub="Mise en congélation — suivi des pertes et températures" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Lots à congeler (" + dispo.length + ")"}>
          {dispo.length === 0 ? <Empty txt="Aucun lot disponible" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={sel?.id === l.id} color="#6366f1" onClick={() => { sSel(l); sF({ pertesCongelation: "", tempCongelation: "", note: "" }); }} />
          ))}
        </Card>
        <Card title={sel ? "Congélation : " + sel.id : "Sélectionner un lot"}>
          {!sel ? <Empty txt="← Cliquer sur un lot" /> : (<>
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 9, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#818cf8" }}>Lot : {sel.id}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Poids entrant : <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes à la congélation (kg) *</FL><FI type="number" value={f.pertesCongelation} onChange={v => upd("pertesCongelation", v)} ph="0.00" />
            {f.pertesCongelation && <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#818cf8", margin: "10px 0" }}>Poids après congélation : <b>{(sel.poidsNet - parseFloat(f.pertesCongelation || 0)).toFixed(1)} kg</b></div>}
            <FL>Température de congélation (°C)</FL><FI type="number" value={f.tempCongelation} onChange={v => upd("tempCongelation", v)} ph="Ex: -18" />
            <FL>Note</FL><FT value={f.note} onChange={v => upd("note", v)} ph="Observations..." />
            <Btn color="#6366f1" onClick={valider}>Valider la congélation</Btn>
          </>)}
        </Card>
      </div></div>
  );
}

// ─── CONDITIONNEMENT ─────────────────────────────────────────────────
function Conditionnement({ lots, updateItem, user }) {
  const [sel, sSel] = useState(null);
  const [f, sF] = useState({ pertesCondi: "", produitFini: "", nbCartons: "", poidsCarton: "", note: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const dispo = lots.filter(l => l.etapeActuelle === "congélation" && l.conformite === "conforme");
  const valider = () => {
    if (!sel || !f.produitFini) return;
    const now = new Date().toISOString();
    const pertes = parseFloat(f.pertesCondi || 0);
    const poidsNet = parseFloat(f.produitFini);
    updateItem({ ...sel, etapeActuelle: "conditionnement", poidsNet, pertesTotales: (sel.pertesTotales || 0) + pertes,
      etapesDetail: { ...(sel.etapesDetail || {}), conditionnement: { pertes, poidsEntree: sel.poidsNet, produitFini: poidsNet, nbCartons: parseInt(f.nbCartons || 0), poidsCarton: parseFloat(f.poidsCarton || 0), date: now, user: user.nom } },
      historique: [...(sel.historique || []), { etape: "conditionnement", date: now, user: user.nom, poids: poidsNet, pertes, note: f.note }] });
    sOk("Lot " + sel.id + " — conditionnement validé (" + poidsNet + " kg produit fini)");
    sSel(null); sF({ pertesCondi: "", produitFini: "", nbCartons: "", poidsCarton: "", note: "" }); setTimeout(() => sOk(""), 4000);
  };
  return (
    <div><PH title="📦 Conditionnement" sub="Emballage et produit fini — prêt pour stockage" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Lots à conditionner (" + dispo.length + ")"}>
          {dispo.length === 0 ? <Empty txt="Aucun lot disponible" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={sel?.id === l.id} color="#ec4899" onClick={() => { sSel(l); sF({ pertesCondi: "", produitFini: "", nbCartons: "", poidsCarton: "", note: "" }); }} />
          ))}
        </Card>
        <Card title={sel ? "Conditionnement : " + sel.id : "Sélectionner un lot"}>
          {!sel ? <Empty txt="← Cliquer sur un lot" /> : (<>
            <div style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 9, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f472b6" }}>Lot : {sel.id}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Poids entrant : <b>{sel.poidsNet} kg</b></div>
            </div>
            <FL>Pertes au conditionnement (kg)</FL><FI type="number" value={f.pertesCondi} onChange={v => upd("pertesCondi", v)} ph="0.00" />
            <FL>Poids produit fini (kg) *</FL><FI type="number" value={f.produitFini} onChange={v => upd("produitFini", v)} ph="0.00" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><FL>Nb. cartons</FL><FI type="number" value={f.nbCartons} onChange={v => upd("nbCartons", v)} ph="0" /></div>
              <div><FL>Poids/carton (kg)</FL><FI type="number" value={f.poidsCarton} onChange={v => upd("poidsCarton", v)} ph="0.00" /></div>
            </div>
            <FL>Note</FL><FT value={f.note} onChange={v => upd("note", v)} ph="Observations..." />
            <Btn color="#ec4899" onClick={valider}>Valider le conditionnement</Btn>
          </>)}
        </Card>
      </div></div>
  );
}

// ─── FRIGOS 4-7 ──────────────────────────────────────────────────────
function Frigos({ lots, updateItem }) {
  const [selFrigo, setSelFrigo] = useState(FRIGOS[0]);
  const [selLot, setSelLot] = useState(null);
  const [nbPal, setNbPal] = useState("");
  const [ok, setOk] = useState("");
  const dispo = lots.filter(l => l.etapeActuelle === "conditionnement" && l.conformite === "conforme");
  const inFrigo = (f) => lots.filter(l => l.frigo === f && l.etapeActuelle === "stockage");
  const assigner = () => {
    if (!selLot || !nbPal) return;
    updateItem({ ...selLot, frigo: selFrigo, nbPalettes: parseInt(nbPal), dateFrigo: new Date().toISOString(), etapeActuelle: "stockage",
      historique: [...(selLot.historique || []), { etape: "stockage", date: new Date().toISOString(), note: selFrigo + " — " + nbPal + " palettes" }] });
    setOk("Lot " + selLot.id + " → " + selFrigo + " (" + nbPal + " palettes)");
    setSelLot(null); setNbPal(""); setTimeout(() => setOk(""), 4000);
  };
  return (
    <div><PH title="🧊 Frigos 4 — 7" sub="Stockage frigorifique — suivi des lots et palettes par frigo" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {FRIGOS.map(f => { const lts = inFrigo(f); const pal = lts.reduce((s, l) => s + (l.nbPalettes || 0), 0); const kg = lts.reduce((s, l) => s + (l.poidsNet || 0), 0); return (
          <div key={f} onClick={() => setSelFrigo(f)} style={{ background: selFrigo === f ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", border: "1px solid " + (selFrigo === f ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"), borderRadius: 12, padding: 16, textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🧊</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: selFrigo === f ? "#a5b4fc" : "#818cf8" }}>{f}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>{lts.length} lots · {pal} pal.</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{kg.toFixed(0)} kg</div>
          </div>
        ); })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Affecter un lot à " + selFrigo}>
          {dispo.length === 0 ? <Empty txt="Aucun lot conditionné en attente" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={selLot?.id === l.id} color="#8b5cf6" onClick={() => setSelLot(l)} />
          ))}
          {selLot && (<>
            <FL>Nombre de palettes *</FL><FI type="number" value={nbPal} onChange={setNbPal} ph="0" />
            <Btn color="#8b5cf6" onClick={assigner}>Affecter à {selFrigo}</Btn>
          </>)}
        </Card>
        <Card title={"Contenu — " + selFrigo + " (" + inFrigo(selFrigo).length + " lots)"}>
          {inFrigo(selFrigo).length === 0 ? <Empty txt="Frigo vide" /> : inFrigo(selFrigo).map(l => (
            <div key={l.id} style={{ padding: 12, borderRadius: 9, marginBottom: 6, background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><Mono>{l.id}</Mono><Pill txt={(l.nbPalettes || 0) + " palettes"} color="#a78bfa" /></div>
              <div style={{ fontSize: 12, color: "#e2e8f0", marginTop: 3 }}>{l.produit} — <b>{l.poidsNet} kg</b></div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Entré le {fdatetime(l.dateFrigo)}</div>
            </div>
          ))}
        </Card>
      </div></div>
  );
}

// ─── EXPÉDITION ──────────────────────────────────────────────────────
function Expedition({ lots, updateItem, user }) {
  const [sel, sSel] = useState(null);
  const [f, sF] = useState({ client: "", destination: "", transporteur: "", numCamion: "", nbCartons: "", tempCamion: "", poidsFinal: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const dispo = lots.filter(l => (l.etapeActuelle === "stockage" || l.etapeActuelle === "conditionnement") && l.conformite === "conforme");
  const valider = () => {
    if (!sel || !f.client || !f.destination) return;
    const now = new Date().toISOString();
    const numFacture = "FAC-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + String(lots.filter(l => l.numFacture).length + 1).padStart(3, "0");
    updateItem({ ...sel, etapeActuelle: "expédition", numFacture, frigo: null,
      expedition: { ...f, poidsFinal: parseFloat(f.poidsFinal || sel.poidsNet), date: now, user: user.nom },
      historique: [...(sel.historique || []), { etape: "expédition", date: now, user: user.nom, note: f.client + " → " + f.destination }] });
    sOk("Lot " + sel.id + " expédié · Facture " + numFacture + " générée");
    sSel(null); sF({ client: "", destination: "", transporteur: "", numCamion: "", nbCartons: "", tempCamion: "", poidsFinal: "" }); setTimeout(() => sOk(""), 5000);
  };
  return (
    <div><PH title="🚢 Expédition" sub="Sortie des lots — client, transport et facturation" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title={"Lots prêts à expédier (" + dispo.length + ")"}>
          {dispo.length === 0 ? <Empty txt="Aucun lot en stockage" /> : dispo.map(l => (
            <SelectableLot key={l.id} lot={l} selected={sel?.id === l.id} color="#14b8a6" onClick={() => { sSel(l); sF(x => ({ ...x, poidsFinal: String(l.poidsNet || "") })); }} />
          ))}
        </Card>
        <Card title={sel ? "Expédition : " + sel.id : "Sélectionner un lot"}>
          {!sel ? <Empty txt="← Cliquer sur un lot" /> : (<>
            <FL>Client *</FL><FI value={f.client} onChange={v => upd("client", v)} ph="Nom du client" />
            <FL>Destination *</FL><FS value={f.destination} onChange={v => upd("destination", v)} opts={DESTINATIONS} />
            <FL>Transporteur</FL><FS value={f.transporteur} onChange={v => upd("transporteur", v)} opts={TRANSPORTEURS} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><FL>N° camion</FL><FI value={f.numCamion} onChange={v => upd("numCamion", v)} ph="Ex: 12345-A-6" /></div>
              <div><FL>Temp. camion (°C)</FL><FI type="number" value={f.tempCamion} onChange={v => upd("tempCamion", v)} ph="-18" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><FL>Nb. cartons</FL><FI type="number" value={f.nbCartons} onChange={v => upd("nbCartons", v)} ph="0" /></div>
              <div><FL>Poids expédié (kg)</FL><FI type="number" value={f.poidsFinal} onChange={v => upd("poidsFinal", v)} ph="0.00" /></div>
            </div>
            <Btn color="#14b8a6" onClick={valider}>Valider l'expédition + générer la facture</Btn>
          </>)}
        </Card>
      </div></div>
  );
}

// ─── TOUS LES LOTS ───────────────────────────────────────────────────
function Lots({ lots }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const filtered = lots.filter(l => !q || l.id.toLowerCase().includes(q.toLowerCase()) || (l.produit || "").toLowerCase().includes(q.toLowerCase()) || (l.origine || "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div><PH title="🗂️ Tous les lots" sub={lots.length + " lots — traçabilité complète, historique par étape"}
      right={<GhostBtn onClick={() => exportCSV(["Lot", "Produit", "Origine", "Poids reçu", "Poids net", "Pertes", "Étape", "Conformité", "Date réception"], lots.map(l => [l.id, l.produit, l.origine, l.poidsReception, l.poidsNet, l.pertesTotales, l.etapeActuelle, l.conformite || "—", fdate(l.dateReception)]), "lots.csv")}>⬇ Export CSV</GhostBtn>} />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔎 Rechercher par lot, produit, ferme..." style={{ ...inputStyle, marginBottom: 14 }} />
      {filtered.length === 0 ? <Empty txt="Aucun lot trouvé" /> : filtered.map(l => (
        <div key={l.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
          <div onClick={() => setOpen(open === l.id ? null : l.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mono>{l.id}</Mono>
              <span style={{ fontSize: 12 }}>{l.produit}{l.variete ? " — " + l.variete : ""}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{l.origine}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{l.poidsNet || l.poidsReception} kg</span>
              {l.conformite && <Pill txt={l.conformite === "conforme" ? "Conforme" : "Non conf."} color={l.conformite === "conforme" ? "#10b981" : "#ef4444"} />}
              <Badge etape={l.etapeActuelle} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{open === l.id ? "▲" : "▼"}</span>
            </div>
          </div>
          {open === l.id && (
            <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Historique de traçabilité</div>
              {(l.historique || []).map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: EC[h.etape] || "#666", marginTop: 4, flexShrink: 0 }} />
                  <div style={{ fontSize: 12 }}>
                    <b style={{ textTransform: "capitalize", color: EC[h.etape] || "#ccc" }}>{h.etape?.replace("_", " ")}</b>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}> · {fdatetime(h.date)}{h.user ? " · " + h.user : ""}</span>
                    {h.poids != null && <span style={{ color: "rgba(255,255,255,0.6)" }}> · {h.poids} kg</span>}
                    {h.pertes != null && <span style={{ color: "#fbbf24" }}> · pertes {h.pertes} kg</span>}
                    {h.note && <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{h.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── FACTURES ────────────────────────────────────────────────────────
function Factures({ lots }) {
  const expedies = lots.filter(l => l.etapeActuelle === "expédition");
  return (
    <div><PH title="🧾 Factures" sub={expedies.length + " expéditions facturées"}
      right={<GhostBtn onClick={() => exportCSV(["Facture", "Lot", "Client", "Destination", "Poids (kg)", "Date"], expedies.map(l => [l.numFacture, l.id, l.expedition?.client, l.expedition?.destination, l.expedition?.poidsFinal, fdate(l.expedition?.date)]), "factures.csv")}>⬇ Export CSV</GhostBtn>} />
      {expedies.length === 0 ? <Empty txt="Aucune expédition facturée" /> : expedies.map(l => (
        <div key={l.id} style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.18)", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Mono>{l.numFacture}</Mono><span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Lot {l.id}</span></div>
            <div style={{ fontSize: 12, marginTop: 4 }}><b>{l.expedition?.client}</b> → {l.expedition?.destination} · {l.expedition?.poidsFinal || l.poidsNet} kg · {fdate(l.expedition?.date)}</div>
          </div>
          <Btn small color="#14b8a6" onClick={() => printFacture(l, l.numFacture || "—")}>🖨️ Imprimer</Btn>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  QUALITÉ — SQS (Smart Quality System)
// ═══════════════════════════════════════════════════════════════════

// ─── PILOTAGE QUALITÉ ────────────────────────────────────────────────
function QualiteDashboard({ lots, ncs, recls, actions, audits }) {
  const ncOuv = ncs.filter(n => n.statut === "ouverte").length;
  const ncClo = ncs.filter(n => n.statut === "clôturée").length;
  const rcOuv = recls.filter(r => r.statut === "ouverte").length;
  const rcClo = recls.filter(r => r.statut === "clôturée").length;
  const acEnCours = actions.filter(a => a.statut !== "réalisée").length;
  const acFait = actions.filter(a => a.statut === "réalisée").length;
  const auditsPlan = audits.filter(a => a.statut === "planifié").length;

  const confParFerme = ORIGINES.filter(o => o !== "Autre").map(o => ({
    name: o.replace("Ferme ", ""),
    Conforme: lots.filter(l => l.origine === o && l.conformite === "conforme").length,
    "Non conforme": lots.filter(l => l.origine === o && l.conformite === "non_conforme").length,
  }));
  const ncParGravite = GRAVITES.map(g => ({ name: g, value: ncs.filter(n => n.gravite === g).length })).filter(d => d.value > 0);
  const rcParNature = NATURES_RECLAMATION.map(n => ({ name: n, value: recls.filter(r => r.nature === n).length })).filter(d => d.value > 0);

  const KpiBox = ({ label, done, open, doneLabel, openLabel, color }) => (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div><div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{done}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{doneLabel}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 24, fontWeight: 800, color }}>{open}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{openLabel}</div></div>
      </div>
    </div>
  );

  return (
    <div>
      <PH title="🎯 Pilotage Qualité — SQS" sub="Préparation organisée des éléments de sortie · indicateurs de performance qualité en temps réel" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        <KpiBox label="Non-conformités" done={ncClo} open={ncOuv} doneLabel="Clôturées" openLabel="Non clôturées" color="#ef4444" />
        <KpiBox label="Réclamations client" done={rcClo} open={rcOuv} doneLabel="Clôturées" openLabel="Non clôturées" color="#f59e0b" />
        <KpiBox label="Plan d'action" done={acFait} open={acEnCours} doneLabel="Réalisées" openLabel="Non réalisées" color="#3b82f6" />
        <KpiBox label="Audits" done={audits.filter(a => a.statut !== "planifié").length} open={auditsPlan} doneLabel="Réalisés" openLabel="Planifiés" color="#a78bfa" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card title="Conformité / Non-conformité par ferme">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confParFerme}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <Tooltip {...chartTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Conforme" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Non conforme" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Réclamations par nature">
          <div style={{ height: 260 }}>
            {rcParNature.length === 0 ? <Empty txt="Aucune réclamation enregistrée" /> :
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rcParNature} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {rcParNature.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>}
          </div>
        </Card>
      </div>
      <Card title="Non-conformités par gravité">
        <div style={{ height: 200 }}>
          {ncParGravite.length === 0 ? <Empty txt="Aucune NC enregistrée" /> :
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ncParGravite} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} width={70} />
                <Tooltip {...chartTooltip} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {ncParGravite.map((d, i) => <Cell key={i} fill={GCOLOR[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>}
        </div>
      </Card>
    </div>
  );
}

// ─── NON-CONFORMITÉS ─────────────────────────────────────────────────
function NonConformites({ ncs, lots, addItem, updateItem, user }) {
  const [f, sF] = useState({ titre: "", source: "", lotId: "", gravite: "", description: "" });
  const [filtre, setFiltre] = useState("toutes");
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.titre || !f.gravite || !f.source) return;
    addItem({ id: uid("NC"), type: "nc", ...f, statut: "ouverte", date: new Date().toISOString(), user: user.nom });
    sF({ titre: "", source: "", lotId: "", gravite: "", description: "" });
    sOk("Non-conformité enregistrée ✓"); setTimeout(() => sOk(""), 4000);
  };
  const cloturer = (n) => updateItem({ ...n, statut: "clôturée", dateCloture: new Date().toISOString(), clotureePar: user.nom });
  const rouvrir = (n) => updateItem({ ...n, statut: "ouverte", dateCloture: null });
  const list = ncs.filter(n => filtre === "toutes" || n.statut === filtre);
  return (
    <div><PH title="⚠️ Non-conformités" sub="Suivi des non-conformités — détection, traitement et clôture"
      right={<GhostBtn onClick={() => exportCSV(["ID", "Titre", "Source", "Lot", "Gravité", "Statut", "Date", "Description"], ncs.map(n => [n.id, n.titre, n.source, n.lotId || "—", n.gravite, n.statut, fdate(n.date), n.description]), "non_conformites.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Déclarer une non-conformité">
          <FL>Titre *</FL><FI value={f.titre} onChange={v => upd("titre", v)} ph="Ex: Température hors limite" />
          <FL>Source *</FL><FS value={f.source} onChange={v => upd("source", v)} opts={SOURCES_NC} />
          <FL>Lot concerné (optionnel)</FL><FS value={f.lotId} onChange={v => upd("lotId", v)} opts={lots.map(l => l.id)} ph="Aucun lot" />
          <FL>Gravité *</FL>
          <div style={{ display: "flex", gap: 8 }}>
            {GRAVITES.map(g => (
              <button key={g} onClick={() => upd("gravite", g)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "2px solid " + (f.gravite === g ? GCOLOR[g] : "rgba(255,255,255,0.1)"), background: f.gravite === g ? GCOLOR[g] + "22" : "transparent", color: f.gravite === g ? GCOLOR[g] : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{g}</button>
            ))}
          </div>
          <FL>Description</FL><FT value={f.description} onChange={v => upd("description", v)} ph="Description de l'écart constaté..." />
          <Btn color="#ef4444" onClick={creer}>Déclarer la NC</Btn>
        </Card>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["toutes", "ouverte", "clôturée"].map(s => (
              <button key={s} onClick={() => setFiltre(s)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid " + (filtre === s ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.1)"), background: filtre === s ? "rgba(16,185,129,0.12)" : "transparent", color: filtre === s ? "#10b981" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>{s} ({s === "toutes" ? ncs.length : ncs.filter(n => n.statut === s).length})</button>
            ))}
          </div>
          {list.length === 0 ? <Empty txt="Aucune non-conformité" /> : list.map(n => (
            <div key={n.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid " + (n.statut === "ouverte" ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"), borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Mono>{n.id}</Mono>
                    <Pill txt={n.gravite} color={GCOLOR[n.gravite] || "#999"} />
                    <Pill txt={n.statut} color={n.statut === "ouverte" ? "#ef4444" : "#10b981"} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{n.titre}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                    Source : {n.source}{n.lotId ? " · Lot " + n.lotId : ""} · {fdate(n.date)} · par {n.user}
                    {n.statut === "clôturée" && n.dateCloture && " · clôturée le " + fdate(n.dateCloture)}
                  </div>
                  {n.description && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 5 }}>{n.description}</div>}
                </div>
                {n.statut === "ouverte"
                  ? <Btn small color="#10b981" onClick={() => cloturer(n)}>Clôturer</Btn>
                  : <GhostBtn onClick={() => rouvrir(n)}>Rouvrir</GhostBtn>}
              </div>
            </div>
          ))}
        </div>
      </div></div>
  );
}

// ─── RÉCLAMATIONS CLIENT ─────────────────────────────────────────────
function Reclamations({ recls, addItem, updateItem, user }) {
  const [f, sF] = useState({ client: "", nature: "", description: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.client || !f.nature) return;
    addItem({ id: uid("RC"), type: "reclamation", ...f, statut: "ouverte", date: new Date().toISOString(), user: user.nom });
    sF({ client: "", nature: "", description: "" });
    sOk("Réclamation enregistrée ✓"); setTimeout(() => sOk(""), 4000);
  };
  const cloturer = (r, ferme) => updateItem({ ...r, statut: ferme ? "clôturée" : "ouverte", dateCloture: ferme ? new Date().toISOString() : null });
  return (
    <div><PH title="📣 Réclamations client" sub="Enregistrement et traitement des réclamations — par nature et par client"
      right={<GhostBtn onClick={() => exportCSV(["ID", "Client", "Nature", "Statut", "Date", "Description"], recls.map(r => [r.id, r.client, r.nature, r.statut, fdate(r.date), r.description]), "reclamations.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Nouvelle réclamation">
          <FL>Client *</FL><FI value={f.client} onChange={v => upd("client", v)} ph="Nom du client" />
          <FL>Nature *</FL><FS value={f.nature} onChange={v => upd("nature", v)} opts={NATURES_RECLAMATION} />
          <FL>Description</FL><FT value={f.description} onChange={v => upd("description", v)} ph="Détail de la réclamation..." />
          <Btn color="#f59e0b" onClick={creer}>Enregistrer</Btn>
        </Card>
        <div>
          {recls.length === 0 ? <Empty txt="Aucune réclamation" /> : recls.map(r => (
            <div key={r.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid " + (r.statut === "ouverte" ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.06)"), borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Mono>{r.id}</Mono>
                  <Pill txt={r.nature} color="#f59e0b" />
                  <Pill txt={r.statut} color={r.statut === "ouverte" ? "#ef4444" : "#10b981"} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{r.client}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{fdate(r.date)} · par {r.user}</div>
                {r.description && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 5 }}>{r.description}</div>}
              </div>
              {r.statut === "ouverte"
                ? <Btn small color="#10b981" onClick={() => cloturer(r, true)}>Clôturer</Btn>
                : <GhostBtn onClick={() => cloturer(r, false)}>Rouvrir</GhostBtn>}
            </div>
          ))}
        </div>
      </div></div>
  );
}

// ─── PLAN D'ACTION ───────────────────────────────────────────────────
function PlanAction({ actions, ncs, recls, addItem, updateItem, user }) {
  const [f, sF] = useState({ titre: "", typeAction: "", responsable: "", echeance: "", liee: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const refs = [...ncs.map(n => n.id + " — " + n.titre), ...recls.map(r => r.id + " — " + r.client)];
  const creer = () => {
    if (!f.titre || !f.typeAction || !f.responsable) return;
    addItem({ id: uid("AC"), type: "action", ...f, statut: "en cours", date: new Date().toISOString(), user: user.nom });
    sF({ titre: "", typeAction: "", responsable: "", echeance: "", liee: "" });
    sOk("Action ajoutée au plan ✓"); setTimeout(() => sOk(""), 4000);
  };
  const toggler = (a) => updateItem({ ...a, statut: a.statut === "réalisée" ? "en cours" : "réalisée", dateRealisation: a.statut === "réalisée" ? null : new Date().toISOString() });
  const enRetard = (a) => a.statut !== "réalisée" && a.echeance && new Date(a.echeance) < new Date();
  return (
    <div><PH title="🛠️ Plan d'action" sub="Gestion des actions correctives et préventives — responsables et échéances"
      right={<GhostBtn onClick={() => exportCSV(["ID", "Titre", "Type", "Responsable", "Échéance", "Statut", "Liée à"], actions.map(a => [a.id, a.titre, a.typeAction, a.responsable, fdate(a.echeance), a.statut, a.liee || "—"]), "plan_action.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Nouvelle action">
          <FL>Intitulé *</FL><FI value={f.titre} onChange={v => upd("titre", v)} ph="Ex: Recalibrer la sonde du frigo 4" />
          <FL>Type *</FL>
          <div style={{ display: "flex", gap: 8 }}>
            {["Corrective", "Préventive"].map(t => (
              <button key={t} onClick={() => upd("typeAction", t)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "2px solid " + (f.typeAction === t ? "#3b82f6" : "rgba(255,255,255,0.1)"), background: f.typeAction === t ? "rgba(59,130,246,0.15)" : "transparent", color: f.typeAction === t ? "#60a5fa" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
            ))}
          </div>
          <FL>Responsable *</FL><FI value={f.responsable} onChange={v => upd("responsable", v)} ph="Nom du responsable" />
          <FL>Échéance</FL><FI type="date" value={f.echeance} onChange={v => upd("echeance", v)} />
          <FL>Liée à (NC / Réclamation)</FL><FS value={f.liee} onChange={v => upd("liee", v)} opts={refs} ph="Aucune" />
          <Btn color="#3b82f6" onClick={creer}>Ajouter au plan</Btn>
        </Card>
        <div>
          {actions.length === 0 ? <Empty txt="Aucune action planifiée" /> : actions.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid " + (enRetard(a) ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)"), borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Mono>{a.id}</Mono>
                  <Pill txt={a.typeAction} color={a.typeAction === "Corrective" ? "#f59e0b" : "#3b82f6"} />
                  <Pill txt={a.statut} color={a.statut === "réalisée" ? "#10b981" : "#f59e0b"} />
                  {enRetard(a) && <Pill txt="En retard" color="#ef4444" />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, textDecoration: a.statut === "réalisée" ? "line-through" : "none", opacity: a.statut === "réalisée" ? 0.6 : 1 }}>{a.titre}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                  Responsable : {a.responsable} · Échéance : {fdate(a.echeance)}{a.liee ? " · Liée à " + a.liee.split(" — ")[0] : ""}
                </div>
              </div>
              <Btn small color={a.statut === "réalisée" ? "#64748b" : "#10b981"} onClick={() => toggler(a)}>{a.statut === "réalisée" ? "Annuler" : "Marquer réalisée"}</Btn>
            </div>
          ))}
        </div>
      </div></div>
  );
}

// ─── ÉVALUATION DES RISQUES ──────────────────────────────────────────
function Risques({ risques, addItem, removeItem, user }) {
  const [f, sF] = useState({ criticite: "", gravite: "", recurrence: "", probabilite: "", mesures: "" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.criticite || !f.gravite) return;
    addItem({ id: uid("RQ"), type: "risque", ...f, date: new Date().toISOString(), user: user.nom });
    sF({ criticite: "", gravite: "", recurrence: "", probabilite: "", mesures: "" });
    sOk("Risque évalué et enregistré ✓"); setTimeout(() => sOk(""), 4000);
  };
  const Sel3 = ({ label, k }) => (<>
    <FL>{label}{k === "gravite" ? " *" : ""}</FL>
    <div style={{ display: "flex", gap: 8 }}>
      {GRAVITES.map(g => (
        <button key={g} onClick={() => upd(k, g)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: "2px solid " + (f[k] === g ? GCOLOR[g] : "rgba(255,255,255,0.1)"), background: f[k] === g ? GCOLOR[g] + "22" : "transparent", color: f[k] === g ? GCOLOR[g] : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{g}</button>
      ))}
    </div>
  </>);
  const cell = (v) => v ? <span style={{ display: "inline-block", minWidth: 66, textAlign: "center", padding: "4px 12px", borderRadius: 6, fontSize: 10, fontWeight: 800, background: GCOLOR[v], color: "#fff" }}>{v}</span> : <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>;
  return (
    <div><PH title="🧮 Évaluation des risques" sub="Analyse de risques — criticité, gravité, récurrence et probabilité"
      right={<GhostBtn onClick={() => exportCSV(["ID", "Criticité", "Gravité", "Récurrence", "Probabilité", "Mesures", "Date"], risques.map(r => [r.id, r.criticite, r.gravite, r.recurrence, r.probabilite, r.mesures, fdate(r.date)]), "risques.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Évaluer un risque">
          <FL>Description du risque *</FL><FI value={f.criticite} onChange={v => upd("criticite", v)} ph="Ex: Rupture de la chaîne du froid" />
          <Sel3 label="Gravité" k="gravite" />
          <Sel3 label="Récurrence" k="recurrence" />
          <Sel3 label="Probabilité" k="probabilite" />
          <FL>Mesures de maîtrise</FL><FT value={f.mesures} onChange={v => upd("mesures", v)} ph="Actions de prévention / maîtrise..." />
          <Btn color="#8b5cf6" onClick={creer}>Enregistrer l'évaluation</Btn>
        </Card>
        <Card title={"Registre des risques (" + risques.length + ")"}>
          {risques.length === 0 ? <Empty txt="Aucun risque évalué" /> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr>
                  {["Criticité", "Gravité", "Récurrence", "Probabilité", ""].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {risques.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "10px" }}>
                        <div style={{ fontWeight: 600 }}>{r.criticite}</div>
                        {r.mesures && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>↳ {r.mesures}</div>}
                      </td>
                      <td style={{ padding: "10px" }}>{cell(r.gravite)}</td>
                      <td style={{ padding: "10px" }}>{cell(r.recurrence)}</td>
                      <td style={{ padding: "10px" }}>{cell(r.probabilite)}</td>
                      <td style={{ padding: "10px" }}><GhostBtn color="#f87171" onClick={() => removeItem(r.id)}>🗑</GhostBtn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div></div>
  );
}

// ─── PLAN D'AUDIT ────────────────────────────────────────────────────
function Audits({ audits, addItem, updateItem, user }) {
  const [f, sF] = useState({ titre: "", typeAudit: "", referentiel: "", auditeur: "", datePlan: "" });
  const [constat, setConstat] = useState({});
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.titre || !f.typeAudit || !f.datePlan) return;
    addItem({ id: uid("AU"), type: "audit", ...f, statut: "planifié", date: new Date().toISOString(), user: user.nom });
    sF({ titre: "", typeAudit: "", referentiel: "", auditeur: "", datePlan: "" });
    sOk("Audit planifié ✓"); setTimeout(() => sOk(""), 4000);
  };
  const avancer = (a) => {
    const next = a.statut === "planifié" ? "réalisé" : "clôturé";
    updateItem({ ...a, statut: next, constats: constat[a.id] !== undefined ? constat[a.id] : a.constats, ["date" + next]: new Date().toISOString() });
  };
  const SCOLOR = { planifié: "#3b82f6", réalisé: "#f59e0b", clôturé: "#10b981" };
  return (
    <div><PH title="🔍 Plan d'audit" sub="Planification, réalisation et suivi des audits internes et externes"
      right={<GhostBtn onClick={() => exportCSV(["ID", "Titre", "Type", "Référentiel", "Auditeur", "Date", "Statut", "Constats"], audits.map(a => [a.id, a.titre, a.typeAudit, a.referentiel, a.auditeur, fdate(a.datePlan), a.statut, a.constats || "—"]), "audits.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Planifier un audit">
          <FL>Intitulé *</FL><FI value={f.titre} onChange={v => upd("titre", v)} ph="Ex: Audit interne HACCP T3" />
          <FL>Type *</FL>
          <div style={{ display: "flex", gap: 8 }}>
            {["Interne", "Externe"].map(t => (
              <button key={t} onClick={() => upd("typeAudit", t)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "2px solid " + (f.typeAudit === t ? "#a78bfa" : "rgba(255,255,255,0.1)"), background: f.typeAudit === t ? "rgba(167,139,250,0.15)" : "transparent", color: f.typeAudit === t ? "#a78bfa" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
            ))}
          </div>
          <FL>Référentiel</FL><FS value={f.referentiel} onChange={v => upd("referentiel", v)} opts={REFERENTIELS} />
          <FL>Auditeur</FL><FI value={f.auditeur} onChange={v => upd("auditeur", v)} ph="Nom de l'auditeur / organisme" />
          <FL>Date prévue *</FL><FI type="date" value={f.datePlan} onChange={v => upd("datePlan", v)} />
          <Btn color="#a78bfa" onClick={creer}>Planifier</Btn>
        </Card>
        <div>
          {audits.length === 0 ? <Empty txt="Aucun audit planifié" /> : audits.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Mono>{a.id}</Mono>
                    <Pill txt={a.typeAudit} color="#a78bfa" />
                    {a.referentiel && <Pill txt={a.referentiel} color="#818cf8" />}
                    <Pill txt={a.statut} color={SCOLOR[a.statut]} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{a.titre}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Auditeur : {a.auditeur || "—"} · Prévu le {fdate(a.datePlan)}</div>
                  {a.statut !== "planifié" && a.constats && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 5 }}>Constats : {a.constats}</div>}
                  {a.statut === "planifié" && (
                    <input value={constat[a.id] || ""} onChange={e => setConstat(c => ({ ...c, [a.id]: e.target.value }))} placeholder="Constats / conclusions de l'audit..." style={{ ...inputStyle, marginTop: 8, fontSize: 12, padding: "8px 10px" }} />
                  )}
                </div>
                {a.statut !== "clôturé" && <Btn small color={a.statut === "planifié" ? "#f59e0b" : "#10b981"} onClick={() => avancer(a)}>{a.statut === "planifié" ? "Marquer réalisé" : "Clôturer"}</Btn>}
              </div>
            </div>
          ))}
        </div>
      </div></div>
  );
}

// ─── DOCUMENTATION ───────────────────────────────────────────────────
function Documentation({ docs, addItem, updateItem, user }) {
  const [f, sF] = useState({ code: "", titre: "", categorie: "", version: "1.0" });
  const [ok, sOk] = useState("");
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.code || !f.titre || !f.categorie) return;
    addItem({ id: uid("DOC"), type: "document", ...f, statut: "en vigueur", date: new Date().toISOString(), user: user.nom });
    sF({ code: "", titre: "", categorie: "", version: "1.0" });
    sOk("Document référencé ✓"); setTimeout(() => sOk(""), 4000);
  };
  const nouvelleVersion = (d) => {
    const v = parseFloat(d.version || "1.0") + 1;
    updateItem({ ...d, version: v.toFixed(1), date: new Date().toISOString(), statut: "en vigueur" });
  };
  const toggle = (d) => updateItem({ ...d, statut: d.statut === "en vigueur" ? "obsolète" : "en vigueur" });
  return (
    <div><PH title="📚 Documentation" sub="Optimisation et centralisation du système documentaire — codes, versions et statuts"
      right={<GhostBtn onClick={() => exportCSV(["Code", "Titre", "Catégorie", "Version", "Statut", "Mise à jour"], docs.map(d => [d.code, d.titre, d.categorie, d.version, d.statut, fdate(d.date)]), "documentation.csv")}>⬇ Export CSV</GhostBtn>} />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Référencer un document">
          <FL>Code *</FL><FI value={f.code} onChange={v => upd("code", v)} ph="Ex: PR-QUA-001" />
          <FL>Titre *</FL><FI value={f.titre} onChange={v => upd("titre", v)} ph="Ex: Procédure de maîtrise des NC" />
          <FL>Catégorie *</FL><FS value={f.categorie} onChange={v => upd("categorie", v)} opts={DOC_CATS} />
          <FL>Version</FL><FI value={f.version} onChange={v => upd("version", v)} ph="1.0" />
          <Btn color="#14b8a6" onClick={creer}>Référencer</Btn>
        </Card>
        <div>
          {docs.length === 0 ? <Empty txt="Aucun document référencé" /> : docs.map(d => (
            <div key={d.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: d.statut === "obsolète" ? 0.5 : 1 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <Mono>{d.code}</Mono>
                  <Pill txt={d.categorie} color="#14b8a6" />
                  <Pill txt={"v" + d.version} color="#818cf8" />
                  <Pill txt={d.statut} color={d.statut === "en vigueur" ? "#10b981" : "#64748b"} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{d.titre}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Mis à jour le {fdate(d.date)} · par {d.user}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <GhostBtn onClick={() => nouvelleVersion(d)} color="#818cf8">＋ Version</GhostBtn>
                <GhostBtn onClick={() => toggle(d)} color={d.statut === "en vigueur" ? "#f87171" : "#10b981"}>{d.statut === "en vigueur" ? "Rendre obsolète" : "Réactiver"}</GhostBtn>
              </div>
            </div>
          ))}
        </div>
      </div></div>
  );
}

// ─── FLASH REPORT ────────────────────────────────────────────────────
function FlashReport({ lots, ncs, recls, actions }) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const [d1, setD1] = useState(monthAgo);
  const [d2, setD2] = useState(today);
  const inRange = (d) => d && d.slice(0, 10) >= d1 && d.slice(0, 10) <= d2;

  const lotsR = lots.filter(l => inRange(l.dateReception));
  const exps = lots.filter(l => inRange(l.expedition?.date));
  const ncsR = ncs.filter(n => inRange(n.date));
  const rclsR = recls.filter(r => inRange(r.date));
  const controles = lotsR.length + lots.reduce((s, l) => s + (l.historique || []).filter(h => inRange(h.date)).length, 0);
  const kgRecus = lotsR.reduce((s, l) => s + (l.poidsReception || 0), 0);
  const kgExp = exps.reduce((s, l) => s + (l.expedition?.poidsFinal || l.poidsNet || 0), 0);

  const ferms = ORIGINES.filter(o => o !== "Autre");
  const tableRows = ferms.map(o => {
    const ls = lotsR.filter(l => l.origine === o);
    return { ferme: o, controles: ls.length, conf: ls.filter(l => l.conformite === "conforme").length, nc: ls.filter(l => l.conformite === "non_conforme").length, kg: ls.reduce((s, l) => s + (l.poidsReception || 0), 0) };
  }).filter(r => r.controles > 0);

  const exporter = () => exportCSV(
    ["Ferme", "Contrôles effectués", "Conformes", "Non conformes", "Kg reçus"],
    tableRows.map(r => [r.ferme, r.controles, r.conf, r.nc, r.kg.toFixed(1)]),
    "flash_report_" + d1 + "_" + d2 + ".csv"
  );

  return (
    <div><PH title="⚡ Flash Report" sub="Reporting journalier, hebdomadaire et mensuel — par ferme, par période"
      right={<Btn small color="#f59e0b" onClick={exporter}>⬇ Export</Btn>} />
      <Card title="Période d'analyse">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><FL>Date début</FL><FI type="date" value={d1} onChange={setD1} /></div>
          <div><FL>Date fin</FL><FI type="date" value={d2} onChange={setD2} /></div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
        <Stat icon="🧪" value={controles} label="Contrôles effectués" color="#10b981" />
        <Stat icon="⚖️" value={kgRecus.toFixed(0) + " kg"} label="Kg reçus (période)" color="#f59e0b" />
        <Stat icon="🚢" value={kgExp.toFixed(0) + " kg"} label="Kg expédiés (période)" color="#14b8a6" />
        <Stat icon="⚠️" value={ncsR.length + " / " + rclsR.length} label="NC / Réclamations" color="#f87171" />
      </div>
      <Card title="Données sur les contrôles effectués et les non-conformités — par ferme">
        {tableRows.length === 0 ? <Empty txt="Aucune donnée sur cette période" /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>
              {["Ferme", "Contrôles effectués", "Conformes", "Non conformes", "Kg reçus"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 10px", fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {tableRows.map(r => (
                <tr key={r.ferme} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600 }}>{r.ferme}</td>
                  <td style={{ padding: "10px" }}>{r.controles}</td>
                  <td style={{ padding: "10px", color: "#10b981", fontWeight: 700 }}>{r.conf}</td>
                  <td style={{ padding: "10px", color: r.nc > 0 ? "#f87171" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>{r.nc}</td>
                  <td style={{ padding: "10px" }}>{r.kg.toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <Card title={"Non-conformités de la période (" + ncsR.length + ")"}>
        {ncsR.length === 0 ? <Empty txt="Aucune NC sur la période" /> : ncsR.map(n => (
          <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12 }}>
            <div><Mono>{n.id}</Mono> <span style={{ marginLeft: 8 }}>{n.titre}</span></div>
            <div style={{ display: "flex", gap: 8 }}>
              <Pill txt={n.gravite} color={GCOLOR[n.gravite] || "#999"} />
              <Pill txt={n.statut} color={n.statut === "ouverte" ? "#ef4444" : "#10b981"} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── UTILISATEURS ────────────────────────────────────────────────────
function Users({ users, addItem, updateItem }) {
  const [f, sF] = useState({ nom: "", username: "", password: "", role: "" });
  const [ok, sOk] = useState("");
  const roles = Object.keys(ROLE_PAGES);
  const upd = (k, v) => sF(x => ({ ...x, [k]: v }));
  const creer = () => {
    if (!f.nom || !f.username || !f.password || !f.role) return;
    if (users.some(u => u.username === f.username)) { sOk("⚠️ Ce nom d'utilisateur existe déjà"); setTimeout(() => sOk(""), 4000); return; }
    addItem({ id: uid("U"), type: "user", ...f, actif: true });
    sF({ nom: "", username: "", password: "", role: "" });
    sOk("Utilisateur créé ✓"); setTimeout(() => sOk(""), 4000);
  };
  const toggle = (u) => {
    const updated = { ...u, actif: !u.actif, type: "user", id: u.id.startsWith("U-") && u.id.length < 6 ? uid("U") : u.id };
    u.type === "user" ? updateItem(updated) : addItem(updated);
  };
  return (
    <div><PH title="👥 Utilisateurs" sub="Gestion des comptes et des rôles d'accès par étape" />
      {ok && <Alert txt={ok} />}
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18 }}>
        <Card title="Nouvel utilisateur">
          <FL>Nom complet *</FL><FI value={f.nom} onChange={v => upd("nom", v)} ph="Ex: Resp. Réception" />
          <FL>Identifiant *</FL><FI value={f.username} onChange={v => upd("username", v)} ph="identifiant" />
          <FL>Mot de passe *</FL><FI type="password" value={f.password} onChange={v => upd("password", v)} ph="••••••" />
          <FL>Rôle *</FL><FS value={f.role} onChange={v => upd("role", v)} opts={roles} />
          <Btn onClick={creer}>Créer le compte</Btn>
        </Card>
        <Card title={"Comptes (" + users.length + ")"}>
          {users.map(u => (
            <div key={u.username} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)", opacity: u.actif ? 1 : 0.45 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{u.nom} <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>@{u.username}</span></div>
                <Pill txt={u.role} color="#10b981" />
              </div>
              <GhostBtn color={u.actif ? "#f87171" : "#10b981"} onClick={() => toggle(u)}>{u.actif ? "Désactiver" : "Activer"}</GhostBtn>
            </div>
          ))}
        </Card>
      </div></div>
  );
}
