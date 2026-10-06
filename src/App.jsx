import React, { useState, useMemo, useEffect } from "react";
import { Search, MapPin, Phone, Heart, X, SlidersHorizontal, Navigation, Compass, Map as MapIcon, CalendarDays, User, Plus, ChevronLeft, ChevronRight, ClipboardList, BarChart3, Bell, Settings } from "lucide-react";

/* ============ 資料（全部為測試用 mock data，非真實院所） ============ */
// qualifiedSelfPayServices 目前為測試資料；未來以正式「合格自費名冊 PDF」更新。空陣列 = 尚未確認。
const areas = {
  "高雄市": ["三民區","左營區","鼓山區","苓雅區","前金區","新興區","楠梓區","鳳山區","前鎮區","小港區","岡山區","路竹區","橋頭區","大寮區","仁武區","鳥松區","大樹區","旗山區","美濃區","林園區","梓官區","茄萣區","永安區","彌陀區","湖內區","燕巢區","田寮區","阿蓮區","內門區","六龜區","甲仙區","杉林區","桃源區","那瑪夏區","茂林區"],
  "台南市": ["中西區","東區","南區","北區","安平區","安南區","永康區","歸仁區","新化區","左鎮區","玉井區","楠西區","南化區","仁德區","關廟區","龍崎區","官田區","麻豆區","佳里區","西港區","七股區","將軍區","學甲區","北門區","新營區","後壁區","白河區","東山區","六甲區","下營區","柳營區","鹽水區","善化區","大內區","山上區","新市區","安定區"],
};
const SERVICES = ["物理治療","職能治療","語言治療","心理治療","其他治療"];
// 資料結構保留「尚未確認」；前台篩選先只提供前三項
const MAIN_SERVICES = SERVICES.slice(0, 4); // 主要治療
const OTHER_SERVICES = ["音樂治療","到宅療育","ABA","其他療育"]; // 「其他治療」包含的項目
const PAYMENTS = ["健保給付","合格自費","純自費","尚未確認"]; // 依第二階段需求，篩選器也包含「尚未確認」
const PAY_STYLE = { "健保給付":"pay-nhi", "合格自費":"pay-q", "純自費":"pay-self", "尚未確認":"pay-unk" };
const T = { source:"mock", sourceType:"mock", lastVerifiedAt:null };
const c = (id,name,city,district,street,phone,latitude,longitude,services,otherServices,paymentTypes,description,qualifiedSelfPayServices=[]) =>
  ({ id,name,city,district,address:`${city}${district}${street}`,phone,latitude,longitude,services,otherServices,paymentTypes,qualifiedSelfPayServices,description,...T });

const clinics = [
  c(1,"【測試】範例綜合醫院兒童復健科","高雄市","三民區","測試路100號","07-0000-0001",22.648,120.311,["物理治療","職能治療","語言治療","心理治療"],[],["健保給付"],"前端測試用資料。"),
  c(2,"【測試】範例兒童復健診所","高雄市","三民區","範例街17號","07-0000-0002",22.641,120.303,["物理治療","職能治療"],[],["健保給付","合格自費"],"前端測試用資料。",["職能治療"]),
  c(3,"【測試】範例語言療育中心","高雄市","三民區","示範路88號","07-0000-0003",22.653,120.296,["語言治療"],["音樂治療"],["純自費"],"前端測試用資料。"),
  c(4,"【測試】範例職能治療所","高雄市","左營區","測試大道200號","07-0000-0004",22.689,120.296,["職能治療"],["ABA"],["合格自費"],"前端測試用資料。",["職能治療"]),
  c(5,"【測試】範例聯合診所","高雄市","左營區","範例路55號","07-0000-0005",22.697,120.31,["物理治療","職能治療","語言治療"],[],["健保給付"],"前端測試用資料。"),
  c(6,"【測試】範例海灣療育所","高雄市","鼓山區","示範街9號","07-0000-0006",22.656,120.277,["物理治療","心理治療"],["到宅療育"],["合格自費","純自費"],"前端測試用資料。",["物理治療"]),
  c(7,"【測試】範例兒童發展中心","高雄市","苓雅區","測試街36號","07-0000-0007",22.621,120.322,["職能治療","語言治療","心理治療"],["音樂治療","ABA"],["純自費"],"前端測試用資料。"),
  c(8,"【測試】範例大學附設醫院","高雄市","鳳山區","範例大道300號","07-0000-0008",22.627,120.358,["物理治療","職能治療","語言治療","心理治療"],[],["健保給付","合格自費"],"前端測試用資料。",["職能治療","語言治療"]),
  c(9,"【測試】範例到宅療育服務","高雄市","鳳山區","示範路12號","07-0000-0009",22.633,120.347,["物理治療","職能治療"],["到宅療育"],["尚未確認"],"前端測試用資料。給付狀態尚未確認。"),
  c(10,"【測試】範例復健診所","高雄市","楠梓區","測試路66號","07-0000-0010",22.728,120.327,["物理治療"],[],["健保給付"],"前端測試用資料。"),
  c(11,"【測試】範例語言治療所","高雄市","楠梓區","範例街71號","07-0000-0011",22.735,120.317,["語言治療","心理治療"],["其他療育"],["合格自費"],"前端測試用資料。",["語言治療"]),
  c(12,"【測試】範例台南兒童復健診所","台南市","東區","測試路20號","06-000-0012",22.98,120.225,["物理治療","職能治療","語言治療"],[],["健保給付","合格自費"],"前端測試用資料。",["語言治療"]),
  c(13,"【測試】範例永康療育中心","台南市","永康區","示範路45號","06-000-0013",23.025,120.256,["職能治療","心理治療"],["音樂治療"],["純自費"],"前端測試用資料。"),
  c(14,"【測試】範例安平復健所","台南市","安平區","範例路8號","06-000-0014",22.998,120.168,["物理治療","語言治療"],["ABA"],["合格自費"],"前端測試用資料。"),
];

/* ============ 篩選邏輯（集中於此，方便之後修改） ============ */
function filterClinics(list, { q, city, district, services, payments }) {
  const kw = q.trim().toLowerCase();
  return list.filter((x) => {
    if (kw && !(x.name + x.address + x.city + x.district + x.services.join("") + x.otherServices.join("")).toLowerCase().includes(kw)) return false;
    if (city && x.city !== city) return false;
    if (district && x.district !== district) return false;
    if (!services.every((s) => x.services.includes(s) || (s === "其他治療" && x.otherServices.length > 0))) return false; // 治療類型：AND
    if (payments.length && !payments.some((p) => x.paymentTypes.includes(p))) return false; // 費用：OR
    return true;
  });
}

/* ============ localStorage 收藏 ============ */
const FAV_KEY = "ei-favorites-v1";
function loadFavs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } }

/* ============ 元件 ============ */
function PayTag({ p }) { return <span className={`tag ${PAY_STYLE[p]}`}>{p}</span>; }

function ClinicCard({ x, active, fav, onSelect, onFav }) {
  return (
    <div className={`card ${active ? "active" : ""}`} onClick={() => onSelect(x.id)}>
      <div className="card-top">
        <div>
          <div className="card-name">{x.name}</div>
          <div className="card-sub"><MapPin size={13} /> {x.city}{x.district}</div>
        </div>
        <button className={`heart ${fav ? "on" : ""}`} aria-label={fav ? "取消最愛" : "加入最愛"} onClick={(e) => { e.stopPropagation(); onFav(x.id); }}>
          <Heart size={20} fill={fav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="addr">{x.address}</div>
      <div className="svc">{x.services.map((s) => s.replace("治療", "")).join("｜")}{x.otherServices.length ? `｜${x.otherServices.join("、")}` : ""}</div>
      <div className="tags">{x.paymentTypes.map((p) => <PayTag key={p} p={p} />)}</div>
    </div>
  );
}

function MapView({ items, selectedId, onSelect, onOpen }) {
  const b = useMemo(() => {
    if (!items.length) return { minLa: 22.55, maxLa: 22.75, minLo: 120.22, maxLo: 120.4 };
    const la = items.map((i) => i.latitude), lo = items.map((i) => i.longitude);
    let minLa = Math.min(...la), maxLa = Math.max(...la), minLo = Math.min(...lo), maxLo = Math.max(...lo);
    const sLa = Math.max(maxLa - minLa, 0.03), sLo = Math.max(maxLo - minLo, 0.03);
    const cLa = (maxLa + minLa) / 2, cLo = (maxLo + minLo) / 2;
    return { minLa: cLa - sLa * 0.65, maxLa: cLa + sLa * 0.65, minLo: cLo - sLo * 0.65, maxLo: cLo + sLo * 0.65 };
  }, [items]);
  const pos = (x) => ({ left: `${((x.longitude - b.minLo) / (b.maxLo - b.minLo)) * 100}%`, top: `${(1 - (x.latitude - b.minLa) / (b.maxLa - b.minLa)) * 100}%` });
  const sel = items.find((i) => i.id === selectedId);
  return (
    <div className="map" onClick={() => onSelect(null)}>
      <svg className="map-bg" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true">
        <rect width="400" height="300" fill="#EDEFE9" />
        <path d="M0 230 C80 200 120 260 220 240 S360 190 400 210 L400 300 L0 300Z" fill="#D6E4E8" />
        <rect x="270" y="30" width="80" height="55" rx="14" fill="#DCE8D2" />
        <rect x="30" y="60" width="60" height="40" rx="12" fill="#DCE8D2" />
        <g stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round">
          <path d="M-10 120 C100 110 200 150 410 100" /><path d="M150 -10 C170 100 130 200 160 310" /><path d="M300 -10 C280 90 330 190 290 310" />
        </g>
        <g stroke="#fff" strokeWidth="4" fill="none"><path d="M0 40 L400 70" /><path d="M0 180 L400 160" /><path d="M60 0 L40 300" /><path d="M230 0 L250 300" /></g>
      </svg>
      <div className="map-note">示意地圖（非真實底圖）</div>
      {items.map((x) => (
        <button key={x.id} className={`pin ${x.id === selectedId ? "sel" : ""}`} style={pos(x)} aria-label={x.name}
          onClick={(e) => { e.stopPropagation(); onSelect(x.id); }}>
          <MapPin size={x.id === selectedId ? 34 : 26} fill="currentColor" color="#fff" strokeWidth={1.5} />
        </button>
      ))}
      {!items.length && <div className="map-empty">沒有符合的院所可顯示</div>}
      {sel && (
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <div className="card-name">{sel.name}</div>
          <div className="card-sub">{sel.city}{sel.district}｜{sel.services.map((s) => s.replace("治療", "")).join("、")}</div>
          <button className="btn small" onClick={() => onOpen(sel.id)}>查看詳情</button>
        </div>
      )}
    </div>
  );
}

function ClinicDetail({ x, fav, onFav, onClose }) {
  const others = [...new Set([...OTHER_SERVICES, ...x.otherServices])];
  const hasQ = x.paymentTypes.includes("合格自費");
  const unconfirmed = x.paymentTypes.includes("尚未確認");
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{x.name}</h2>
          <button className="icon" aria-label="關閉" onClick={onClose}><X size={22} /></button>
        </div>
        <div className="sheet-body"><div className="banner">此為測試資料，未經驗證，請勿作為就醫依據。</div>
        <dl>
          <dt>行政區</dt><dd>{x.city}{x.district}</dd>
          <dt>地址</dt><dd>{x.address}</dd>
          <dt>電話</dt><dd>{x.phone}</dd>
          <dt>主要治療</dt>
          <dd className="tags">{MAIN_SERVICES.map((s) => { const on = x.services.includes(s); return <span key={s} className={`tag ${on ? "have" : "none"}`}>{on ? "✓" : "—"} {s}</span>; })}</dd>
          <dt>其他治療</dt>
          <dd className="tags">{others.map((s) => { const on = x.otherServices.includes(s); return <span key={s} className={`tag ${on ? "have" : "none"}`}>{on ? "✓" : "—"} {s}</span>; })}</dd>
          <dt>費用</dt>
          <dd className="tags">{x.paymentTypes.map((p) => <PayTag key={p} p={p} />)}</dd>
          {unconfirmed && <dd className="note">給付方式尚未驗證，不代表純自費。</dd>}
          {hasQ && (<>
            <dt>合格自費項目</dt>
            <dd>{x.qualifiedSelfPayServices.length
              ? <div className="tags">{x.qualifiedSelfPayServices.map((s) => <span key={s} className="tag pay-q">{s}</span>)}</div>
              : "尚未確認"}</dd>
          </>)}
          <dt>說明</dt><dd>{x.description}</dd>
        </dl>
        <div className="actions">
          <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${x.latitude},${x.longitude}`}><Navigation size={16} /> 開啟地圖</a>
          <a className="btn" href={`tel:${x.phone.replace(/-/g, "")}`}><Phone size={16} /> 撥打電話</a>
          <button className={`btn ${fav ? "fav-on" : ""}`} onClick={() => onFav(x.id)}><Heart size={16} fill={fav ? "currentColor" : "none"} /> {fav ? "已加入最愛" : "加入最愛"}</button>
        </div></div>
      </aside>
    </div>
  );
}

function Chip({ on, children, onClick }) {
  return <button className={`chip ${on ? "on" : ""}`} aria-pressed={on} onClick={onClick}>{children}</button>;
}

function MapPage({ favs, toggleFav }) {
  const [showFavs, setShowFavs] = useState(false);
  const [q, setQ] = useState("");
  const [city, setCity] = useState("高雄市");
  const [district, setDistrict] = useState("");
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);

  const openClinic = (id) => { setSelectedId(id); setDetailId(id); }; // 卡片：選取 + 開啟詳情
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((i) => i !== v) : [...arr, v]);
  const results = useMemo(() => filterClinics(clinics, { q, city, district, services, payments }), [q, city, district, services, payments]);
  const favList = clinics.filter((x) => favs.includes(x.id));
  const detail = clinics.find((x) => x.id === detailId);
  const activeCount = services.length + payments.length + (district ? 1 : 0);
  const reset = () => { setQ(""); setDistrict(""); setServices([]); setPayments([]); };

  const list = (items) => items.map((x) => (
    <ClinicCard key={x.id} x={x} active={x.id === selectedId} fav={favs.includes(x.id)}
      onSelect={openClinic} onFav={toggleFav} />
  ));

  return (
    <>
          <main className="screen">
        <div className="appbar">
          <div className="ttl"><h1>{APP_NAME}</h1><span>找附近的兒童復健與療育服務</span></div>
          <button className="iconbtn" aria-label="我的最愛" onClick={() => setShowFavs(true)}><Heart size={22} />{favs.length > 0 && <em className="badge">{favs.length}</em>}</button>
        </div>
        <div className="searchrow">
          <div className="searchbox"><Search size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋院所、行政區或治療項目" />{q && <button className="icon" aria-label="清除" onClick={() => setQ("")}><X size={18} /></button>}</div>
          <button className="iconbtn filled" aria-label="篩選" onClick={() => setShowFilters(true)}><SlidersHorizontal size={20} />{activeCount > 0 && <em className="badge">{activeCount}</em>}</button>
        </div>
        <div className="mapwrap"><MapView items={results} selectedId={selectedId} onSelect={setSelectedId} onOpen={setDetailId} /></div>
        <div className="count">{loading ? "搜尋中…" : `找到 ${results.length} 間符合條件的院所`}</div>
        <div className="results">{loading ? [1, 2, 3].map((i) => <div key={i} className="card skeleton" />)
          : results.length ? list(results)
          : (<div className="empty"><p>沒有符合條件的院所</p><p className="hint">試試放寬治療類型，或改選其他行政區。</p><button className="btn" onClick={reset}>清除篩選</button></div>)}</div>
      </main>
      {showFilters && (
        <div className="overlay" onClick={() => setShowFilters(false)}>
          <aside className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head"><h2>篩選</h2><button className="icon" aria-label="關閉" onClick={() => setShowFilters(false)}><X size={22} /></button></div>
            <div className="sheet-body">
              <div className="row2">
                <label>縣市<select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(""); }}><option value="">全部縣市</option>{Object.keys(areas).map((k) => <option key={k}>{k}</option>)}</select></label>
                <label>行政區<select value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!city}><option value="">全部行政區</option>{(areas[city] || []).map((d) => <option key={d}>{d}</option>)}</select></label>
              </div>
              <div className="field"><span className="lbl">治療類型（需同時提供）</span><div className="chips">{SERVICES.map((x) => <Chip key={x} on={services.includes(x)} onClick={() => toggle(services, setServices, x)}>{x}</Chip>)}</div></div>
              <div className="field"><span className="lbl">費用／給付方式（符合任一）</span><div className="chips">{PAYMENTS.map((p) => <Chip key={p} on={payments.includes(p)} onClick={() => toggle(payments, setPayments, p)}>{p}</Chip>)}</div></div>
            </div>
            <div className="sheet-foot"><button className="btn text" onClick={reset}>清除</button><button className="btn fav-on" onClick={() => setShowFilters(false)}>顯示 {results.length} 間</button></div>
          </aside>
        </div>
      )}

      {showFavs && (
        <div className="full">
          <div className="screen">
            <div className="appbar"><button className="iconbtn" aria-label="返回地圖" onClick={() => setShowFavs(false)}><ChevronLeft size={22} /></button><h1>我的最愛</h1></div>
            {favList.length ? favList.map((x) => <ClinicCard key={x.id} x={x} fav onSelect={(id) => { setShowFavs(false); openClinic(id); }} onFav={toggleFav} />)
              : <div className="empty"><p>還沒有收藏的早療機構</p><p className="hint">找到適合的機構後，可以點擊 ♡ 收藏</p><button className="btn" onClick={() => setShowFavs(false)}>回到地圖</button></div>}
          </div>
        </div>
      )}
      {detail && <ClinicDetail x={detail} fav={favs.includes(detail.id)} onFav={toggleFav} onClose={() => setDetailId(null)} />}
    </>
  );
}

/* ============ 樣式 ============ */
const CSS = `
.app{--bg:#FFFFFF;--surface:#F5F2ED;--ink:#2B2A28;--mute:#8A857E;--line:#EEEAE4;--pri:#4F7F7A;--pri-soft:#EAF1EF;--heart:#E07A6F;
font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;background:var(--bg);color:var(--ink);min-height:100vh;max-width:480px;margin:0 auto;font-size:16px;line-height:1.5;padding-bottom:calc(72px + env(safe-area-inset-bottom));overflow-x:hidden;position:relative}
.app *{box-sizing:border-box;min-width:0}.app button,.app select,.app input{font:inherit;color:inherit}.app button{-webkit-tap-highlight-color:transparent}
.notice{font-size:11px;color:var(--mute);padding:6px 20px 0;text-align:center}
.screen{padding:0 20px 24px;display:grid;gap:20px;align-content:start}
.appbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:8px;min-height:64px;padding-top:env(safe-area-inset-top);background:rgba(255,255,255,.94);backdrop-filter:blur(8px)}
.appbar h1,.ttl h1{flex:1;margin:0;font-size:28px;font-weight:700;letter-spacing:.5px;line-height:1.2}.ttl{flex:1}.ttl span{font-size:13px;color:var(--mute)}
.iconbtn{position:relative;width:44px;height:44px;border-radius:50%;border:0;background:none;display:grid;place-items:center;cursor:pointer;flex:none;color:var(--ink)}
.iconbtn.filled{background:var(--surface)}.iconbtn:active{background:var(--surface)}
.badge{position:absolute;top:4px;right:2px;min-width:16px;height:16px;border-radius:8px;background:var(--heart);color:#fff;font-size:10px;font-style:normal;display:grid;place-items:center;padding:0 4px}
.searchrow{display:flex;gap:8px}.searchbox{flex:1;display:flex;align-items:center;gap:8px;background:var(--surface);border-radius:12px;padding:0 14px;height:46px;color:var(--mute)}
.searchbox input{flex:1;border:0;outline:0;background:none;font-size:16px;height:auto;padding:0;color:var(--ink)}
.icon{border:0;background:none;cursor:pointer;display:flex;padding:8px;color:var(--mute)}
.mapwrap{height:300px;margin:0 -20px}.map{position:relative;width:100%;height:100%;overflow:hidden;background:#EDEFE9}
.map-bg{position:absolute;inset:0;width:100%;height:100%}.map-note{position:absolute;left:12px;bottom:8px;font-size:10px;color:#6f6c66;background:rgba(255,255,255,.8);padding:1px 8px;border-radius:999px}
.map-empty{position:absolute;inset:0;display:grid;place-items:center;color:var(--mute);font-size:14px}
.pin{position:absolute;transform:translate(-50%,-100%);border:0;background:none;padding:0;color:var(--pri);cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}.pin.sel{color:var(--heart);z-index:5}
.popup{position:absolute;left:16px;right:16px;bottom:28px;background:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 4px 18px rgba(0,0,0,.14);z-index:6;display:grid;gap:4px}
.count{font-size:13px;color:var(--mute);margin-bottom:-12px}
.results{display:grid}
.card{background:none;border:0;border-radius:0;padding:0;display:grid;gap:6px}
.results .card{padding:16px 20px;margin:0 -20px;border-bottom:1px solid var(--line);cursor:pointer}.results .card.active{background:#F8F6F2}
.card-top{display:flex;justify-content:space-between;gap:8px}.card-name{font-weight:600;font-size:16px}.card-sub{display:flex;align-items:center;gap:3px;color:var(--mute);font-size:13px}.svc{font-size:14px;color:#5b5750}.addr{font-size:13px;color:var(--mute)}
.heart{border:0;background:none;cursor:pointer;color:#C9C4BC;width:44px;height:44px;margin:-10px -10px 0 0;display:grid;place-items:center;flex:none}.heart.on{color:var(--heart)}
.tags,.chips{display:flex;flex-wrap:wrap;gap:8px}.tag{font-size:11px;padding:1px 8px;border-radius:6px;font-weight:500;line-height:1.7}
.pay-nhi{background:#E4F1E8;color:#2F6B47}.pay-q{background:#FBEFD5;color:#8A5E10}.pay-self{background:#ECEAF6;color:#524A93}.pay-unk{background:#EEECE8;color:#6b675f}
.tag.mock{background:#EEECE8;color:#7a766f}.tag.have{background:var(--pri-soft);color:var(--pri)}.tag.none{background:none;color:#B5B0A8}
.chip{border:1.5px solid transparent;background:var(--surface);border-radius:10px;min-height:42px;padding:0 16px;cursor:pointer;font-size:15px}.chip.on{background:var(--pri-soft);border-color:var(--pri);color:var(--pri);font-weight:600}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:0;background:var(--surface);color:var(--ink);border-radius:12px;min-height:48px;padding:0 20px;cursor:pointer;text-decoration:none;font-weight:500}
.btn.small{min-height:36px;padding:0 14px}.btn.fav-on{background:var(--pri);color:#fff;font-weight:600}.btn.text{background:none;color:var(--mute)}.btn:disabled{opacity:.4;cursor:not-allowed}
.mini{border:0;background:none;color:var(--pri);border-radius:8px;min-height:40px;padding:0 10px;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}
.mini.on{background:var(--pri-soft)}.mini.danger{color:var(--heart)}.nav3 .mini{font-size:22px;min-width:40px;justify-content:center;color:var(--ink)}
.skeleton{height:96px;background:linear-gradient(90deg,#F5F2ED,#FAF8F5,#F5F2ED);background-size:200% 100%;animation:sk 1.2s infinite;margin:8px 0;border-radius:12px}@keyframes sk{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.skeleton{animation:none}}
.empty{text-align:center;padding:40px 16px;display:grid;gap:8px;justify-items:center}.empty p{margin:0;font-weight:600}.empty .hint{font-weight:400}.empty .btn{margin-top:8px}
.hint{color:var(--mute);margin:0;font-size:13px}.banner{background:#FBF4E6;color:#7A5A12;border-radius:12px;padding:10px 14px;font-size:13px}
.full{position:fixed;top:0;bottom:calc(57px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);width:100%;max-width:480px;background:var(--bg);overflow:auto;z-index:25}
.overlay{position:fixed;inset:0;background:rgba(30,28,25,.35);z-index:50;display:flex;align-items:flex-end;justify-content:center}.overlay.center{align-items:center;padding:20px}
.sheet,.modal{background:#fff;width:100%;max-width:480px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 -4px 30px rgba(0,0,0,.1)}
.sheet{border-radius:20px 20px 0 0;max-height:90vh;padding-bottom:env(safe-area-inset-bottom)}.sheet::before{content:"";width:36px;height:4px;border-radius:2px;background:#DDD8D0;margin:8px auto 0;flex:none}
.modal{border-radius:20px;max-height:calc(100vh - 40px)}
.sheet-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 12px 4px 20px;flex:none}.sheet-head h2{margin:0;font-size:20px;font-weight:700}
.sheet-body{overflow:auto;padding:8px 20px 20px;display:grid;gap:20px;align-content:start;-webkit-overflow-scrolling:touch}
.sheet-foot{display:flex;gap:8px;padding:12px 20px;flex:none}.sheet-foot .btn{flex:1}.sheet-foot .btn.text{flex:0 0 auto}
.field{display:grid;gap:8px}.lbl{font-size:13px;color:var(--mute);font-weight:500}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.row2 label{display:grid;gap:6px;font-size:13px;color:var(--mute)}
.timerow{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}.timerow i{color:var(--mute);font-style:normal}
.sheet input,.sheet select,.inp{height:48px;border:0;border-radius:12px;padding:0 14px;background:var(--surface);width:100%;font-size:16px;color:var(--ink)}.sheet .searchbox input{height:auto;padding:0;background:none}
.pick{display:grid;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;padding:12px 0;min-height:56px;cursor:pointer;gap:2px;font-size:16px}.pick span{font-size:13px;color:var(--mute)}
.picked{display:flex;justify-content:space-between;align-items:center;gap:8px;background:var(--surface);border-radius:12px;padding:10px 14px}
dl{margin:0;display:grid;gap:2px}dt{font-size:12px;color:var(--mute);margin-top:14px}dd{margin:0}.note{font-size:13px;color:var(--mute)}.actions{display:grid;gap:8px}
.bottom{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:480px;z-index:30;display:grid;grid-template-columns:repeat(3,1fr);background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
.bottom button{position:relative;border:0;background:none;min-height:56px;display:grid;justify-items:center;align-content:center;gap:2px;font-size:11px;color:#A8A39B;cursor:pointer}.bottom button.on{color:var(--pri);font-weight:600}
.dot{position:absolute;top:8px;left:56%;width:8px;height:8px;border-radius:50%;background:var(--heart)}
.nav3{display:flex;align-items:center;gap:4px}.nav3.center{justify-content:center}.nav3 b{min-width:120px;text-align:center;font-size:17px;font-weight:600}
.calbar{display:grid;gap:12px}.seg{display:flex;background:var(--surface);border-radius:10px;padding:3px;width:fit-content}
.seg button{border:0;background:none;min-height:34px;padding:0 20px;border-radius:8px;cursor:pointer;color:var(--mute);font-size:14px}.seg button.on{background:#fff;color:var(--ink);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.1)}
.calcard{background:none;padding:0}.mgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:0}.mgrid.head{text-align:center;color:var(--mute);font-size:12px;padding-bottom:6px}
.cell{height:52px;border:0;background:none;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;font-size:16px}
.cell span{width:30px;height:30px;display:grid;place-items:center;border-radius:50%}.cell.dim{opacity:.3}.cell.sel{background:#F4F1EC}.cell.today span{background:var(--pri);color:#fff;font-weight:600}
.dots{display:flex;gap:3px;height:5px}.dots b{width:5px;height:5px;border-radius:50%;background:var(--pri)}.dots b.done{background:#7DB591}.dots b.missed,.dots b.cancelled{background:#CFCAC2}
.daysec{display:grid;gap:0}.daysec h3,.gtitle{margin:0;font-size:13px;color:var(--mute);font-weight:500}.daysec h3{padding-bottom:6px}.gtitle{margin:12px 0 -12px}
.course{display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--line)}.course.cancelled,.course.missed{opacity:.6}
.ctime{font-weight:600;font-size:16px;min-width:48px;line-height:1.3}.ctime small{display:block;font-size:12px;font-weight:400;color:var(--mute)}
.cbody{display:grid;gap:6px;flex:1}.crow{display:grid;gap:1px;cursor:pointer}.ctitle{font-weight:600;display:flex;gap:8px;align-items:center}.cact{display:flex;flex-wrap:wrap;gap:2px}.stack{display:grid;gap:4px}
.fab{position:fixed;right:max(20px,calc(50% - 220px));bottom:calc(76px + env(safe-area-inset-bottom));width:56px;height:56px;border-radius:50%;border:0;background:var(--pri);color:#fff;display:grid;place-items:center;box-shadow:0 6px 16px rgba(79,127,122,.4);cursor:pointer;z-index:25}
.list{display:grid}.row{display:flex;align-items:center;gap:14px;width:100%;min-height:60px;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;text-align:left;cursor:pointer}
.ico{color:var(--pri);display:grid;place-items:center;flex:none;width:24px}.tx{flex:1;font-size:16px}.tx small{display:block;color:var(--mute);font-size:13px}
.profile{display:flex;align-items:center;gap:14px;padding:4px 0 8px}.avatar{width:56px;height:56px;border-radius:50%;background:var(--pri-soft);color:var(--pri);display:grid;place-items:center;flex:none}
.stats{gap:0}.stats>div{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)}.stats .total{font-weight:700;border-bottom:0}
`;

/* ============ 第二階段：個人化早療管理（日曆／我的） ============ */
export const APP_NAME = "早早療", APP_VERSION = "0.4.0", VERSION_NAME = "視覺風格重製";
const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const WD = ["日","一","二","三","四","五","六"];
const STATUS = { done: "已完成", missed: "未完成", cancelled: "取消" };
const clinicOf = (id) => clinics.find((x) => x.id === id);
const typesOf = (x) => [...x.services, ...(x.otherServices.length ? ["其他治療"] : [])];

function usePersist(key, init) {
  const [v, setV] = useState(() => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : init; } catch { return init; } });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

// Google 日曆「新增事件連結」，不需登入 / OAuth
function gcalUrl(t, n = 1, step = 7) {
  const x = clinicOf(t.clinicId), ds = (d, tm) => d.replace(/-/g, "") + "T" + tm.replace(":", "") + "00";
  const p = new URLSearchParams({ action: "TEMPLATE", text: `${t.type}｜${x.name}`, dates: `${ds(t.date, t.start)}/${ds(t.date, t.end)}`,
    details: `${x.name}\n${x.address}${t.note ? "\n" + t.note : ""}`, location: x.address, ctz: "Asia/Taipei" });
  if (n > 1) p.set("recur", `RRULE:FREQ=WEEKLY;INTERVAL=${step / 7};COUNT=${n}`);
  return "https://calendar.google.com/calendar/render?" + p.toString();
}

// 補助申請「提醒」週期（僅提醒用途；不判定資格、不計算金額）
function reminderStatus(settings, sub) {
  const d = new Date(), m = d.getMonth() + 1, q = Math.floor((m - 1) / 3);
  const py = q === 0 ? d.getFullYear() - 1 : d.getFullYear(), pq = q === 0 ? 4 : q;
  const info = { key: `${py}-Q${pq}`, label: `${py}年${(pq - 1) * 3 + 1}–${pq * 3}月療育紀錄`, inWindow: [1, 4, 7, 10].includes(m) };
  const days = settings.reminderDays, submitted = !!sub[info.key]?.submitted;
  const status = submitted ? "已提交" : !info.inWindow ? "尚未到申請期間" : days.length && d.getDate() >= Math.min(...days) ? "提醒中" : "尚未到提醒日";
  return { info, status, submitted };
}

function CourseItem({ t, onStatus, onDelete }) {
  const x = clinicOf(t.clinicId), [open, setOpen] = useState(false);
  return (
    <div className={`course ${t.status}`}>
      <div className="ctime">{t.start}<small>{t.end}</small></div>
      <div className="cbody">
        <div className="crow" role="button" tabIndex={0} onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}>
          <div className="ctitle">{t.type}{t.status !== "scheduled" && <span className={`tag ${t.status === "done" ? "pay-nhi" : "mock"}`}>{STATUS[t.status]}</span>}</div>
          <div>{x.name}</div><div className="addr">{x.address}</div>
          {t.note && <div className="addr">備註：{t.note}</div>}
        </div>
        {open && <div className="cact">
          {Object.keys(STATUS).map((k) => <button key={k} className={`mini ${t.status === k ? "on" : ""}`} onClick={() => onStatus(t.id, t.status === k ? "scheduled" : k)}>{STATUS[k]}</button>)}
          <a className="mini" target="_blank" rel="noreferrer" href={gcalUrl(t)}>加入 Google 日曆</a>
          <button className="mini danger" onClick={() => onDelete(t.id)}>刪除</button>
        </div>}
      </div>
      <button className="mini" onClick={() => setOpen(!open)}>{open ? "收合" : "管理"}</button>
    </div>
  );
}

function CalendarPage({ therapies, setStatus, del, onAdd, weekStart, selDate, setSelDate }) {
  const today = fmt(new Date());
  const [view, setView] = useState("month");
  const cur = selDate, c = parse(cur);
  const byDate = useMemo(() => { const m = {}; therapies.forEach((t) => (m[t.date] = m[t.date] || []).push(t)); Object.values(m).forEach((a) => a.sort((p, q) => p.start.localeCompare(q.start))); return m; }, [therapies]);
  const shift = (n) => { const d = parse(cur); if (view === "month") d.setMonth(d.getMonth() + n); else d.setDate(d.getDate() + (view === "week" ? 7 * n : n)); setSelDate(fmt(d)); };
  const weekDays = (() => { const d = parse(cur); d.setDate(d.getDate() - ((d.getDay() - weekStart + 7) % 7)); return Array.from({ length: 7 }, (_, i) => { const e = new Date(d); e.setDate(d.getDate() + i); return fmt(e); }); })();
  const cells = (() => { const f = new Date(c.getFullYear(), c.getMonth(), 1); f.setDate(1 - ((f.getDay() - weekStart + 7) % 7)); return Array.from({ length: 42 }, (_, i) => { const e = new Date(f); e.setDate(f.getDate() + i); return fmt(e); }); })();
  const title = view === "month" ? `${c.getFullYear()} 年 ${c.getMonth() + 1} 月` : view === "week" ? `${weekDays[0].slice(5)} – ${weekDays[6].slice(5)}` : `${c.getMonth() + 1}/${c.getDate()}（${WD[c.getDay()]}）`;
  const Day = ({ date }) => { const d = parse(date), items = byDate[date] || []; return (
    <section className="daysec"><h3>{d.getMonth() + 1}/{d.getDate()}（{WD[d.getDay()]}）</h3>
      {items.length ? items.map((t) => <CourseItem key={t.id} t={t} onStatus={setStatus} onDelete={del} />) : <p className="hint">沒有課程</p>}</section>); };
  return (
    <main className="screen"><div className="appbar"><h1>我的療育行程</h1></div>
      <div className="calbar">
        <div className="seg">{[["month", "月"], ["week", "週"], ["day", "日"]].map(([k, l]) => <button key={k} className={view === k ? "on" : ""} onClick={() => setView(k)}>{l}</button>)}</div>
        <div className="nav3"><button className="mini" onClick={() => shift(-1)}>‹</button><b>{title}</b><button className="mini" onClick={() => shift(1)}>›</button><button className="mini" onClick={() => setSelDate(today)}>今天</button></div>
      </div>
      {view === "month" && (<>
        <div className="calcard"><div className="mgrid head">{[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i}>{WD[(i + weekStart) % 7]}</div>)}</div>
        <div className="mgrid">{cells.map((ds) => { const items = byDate[ds] || []; return (
          <button key={ds} className={`cell ${ds.slice(0, 7) !== cur.slice(0, 7) ? "dim" : ""} ${ds === today ? "today" : ""} ${ds === cur ? "sel" : ""}`} onClick={() => setSelDate(ds)}>
            <span>{parse(ds).getDate()}</span>
            <div className="dots">{items.slice(0, 3).map((t) => <b key={t.id} className={t.status} />)}</div>
          </button>); })}</div>
        </div>
        <Day date={cur} />
      </>)}
      {view === "week" && weekDays.map((d) => <Day key={d} date={d} />)}
      {view === "day" && <Day date={cur} />}
      <button className="fab" aria-label="新增課程" onClick={onAdd}><Plus size={26} /></button>
    </main>
  );
}

function AddCourse({ favs, defaultDate, onSave, onClose }) {
  const [other, setOther] = useState(false), [kw, setKw] = useState(""), [clinic, setClinic] = useState(null), [done, setDone] = useState(null);
  const [f, setF] = useState({ type: "", date: defaultDate, start: "14:00", end: "15:00", repeat: "none", count: 4, note: "" });
  const set = (p) => setF({ ...f, ...p });
  const found = kw.trim() ? clinics.filter((x) => (x.name + x.address).includes(kw.trim())) : []; // 只從機構資料搜尋
  const pickRow = (x) => <button className="pick" key={x.id} onClick={() => { setClinic(x); set({ type: "" }); }}><b>{favs.includes(x.id) ? "❤️ " : ""}{x.name}</b><span>{x.address}</span></button>;
  const valid = clinic && f.type && f.date && f.start < f.end;
  const save = () => {
    const step = f.repeat === "biweekly" ? 14 : 7, n = f.repeat === "none" ? 1 : Math.min(52, Math.max(2, Number(f.count) || 2)), sid = "s" + Date.now();
    const list = Array.from({ length: n }, (_, i) => { const d = parse(f.date); d.setDate(d.getDate() + i * step); return { id: `${sid}-${i}`, seriesId: sid, clinicId: clinic.id, type: f.type, date: fmt(d), start: f.start, end: f.end, note: f.note, status: "scheduled" }; });
    onSave(list); setDone({ first: list[0], n, step });
  };
  return (
    <div className="overlay center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head"><h2>新增課程</h2><button className="icon" aria-label="關閉" onClick={onClose}><X size={22} /></button></div>
        {done ? (<>
          <div className="sheet-body"><div className="banner">已建立 {done.n} 堂課。</div>
            <a className="btn" target="_blank" rel="noreferrer" href={gcalUrl(done.first, done.n, done.step)}><CalendarDays size={16} /> 加入 Google 日曆{done.n > 1 ? "（含重複）" : ""}</a></div>
          <div className="sheet-foot"><button className="btn fav-on" onClick={onClose}>完成</button></div>
        </>) : (<>
          <div className="sheet-body">
            <div className="field"><span className="lbl">機構</span>
              {clinic ? <div className="picked"><div><b>{clinic.name}</b><div className="addr">{clinic.address}</div></div><button className="mini" onClick={() => setClinic(null)}>更換</button></div>
                : other ? (<>
                  <div className="searchbox"><Search size={18} /><input autoFocus value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜尋機構名稱或地址" /></div>
                  {kw.trim() && (found.length ? found.map(pickRow) : <p className="hint">找不到符合的機構</p>)}
                  <button className="mini" onClick={() => setOther(false)}>返回我的最愛</button></>)
                : (<>
                  {favs.length ? clinics.filter((x) => favs.includes(x.id)).map(pickRow) : <p className="hint">還沒有收藏的機構</p>}
                  <button className="btn" onClick={() => setOther(true)}>其他機構</button></>)}
            </div>
            <div className="field"><span className="lbl">療育類型</span>
              {clinic ? <div className="chips">{typesOf(clinic).map((t) => <Chip key={t} on={f.type === t} onClick={() => set({ type: t })}>{t}</Chip>)}</div> : <p className="hint">請先選擇機構</p>}</div>
            <div className="field"><span className="lbl">日期</span><input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} />{f.date && <span className="hint">星期{WD[parse(f.date).getDay()]}</span>}</div>
            <div className="field"><span className="lbl">時間</span><div className="timerow"><input type="time" value={f.start} onChange={(e) => set({ start: e.target.value })} /><i>—</i><input type="time" value={f.end} onChange={(e) => set({ end: e.target.value })} /></div>{f.start >= f.end && <p className="hint">結束時間需晚於開始時間</p>}</div>
            <div className="field"><span className="lbl">重複</span>
              <div className="row2">
                <label>頻率<select value={f.repeat} onChange={(e) => set({ repeat: e.target.value })}><option value="none">單次</option><option value="weekly">每週</option><option value="biweekly">每兩週</option></select></label>
                {f.repeat !== "none" && <label>共幾次<input type="number" min="2" max="52" value={f.count} onChange={(e) => set({ count: e.target.value })} /></label>}
              </div></div>
            <div className="field"><span className="lbl">備註</span><input value={f.note} onChange={(e) => set({ note: e.target.value })} placeholder="選填" /></div>
          </div>
          <div className="sheet-foot"><button className="btn text" onClick={onClose}>取消</button><button className="btn fav-on" disabled={!valid} onClick={save}>新增課程</button></div>
        </>)}
      </div>
    </div>
  );
}

function Row({ icon: I, title, sub, onClick }) {
  return <button className="row" onClick={onClick}><span className="ico"><I size={18} /></span><span className="tx">{title}{sub && <small>{sub}</small>}</span><ChevronRight size={18} color="#9AA7A1" /></button>;
}
function SubPage({ title, onBack, children }) {
  return <main className="screen"><div className="appbar"><button className="iconbtn" aria-label="返回" onClick={onBack}><ChevronLeft size={22} /></button><h1>{title}</h1></div>{children}</main>;
}

function MePage({ settings, setSettings, records, sub, setSub, therapies, setStatus, del }) {
  const [pg, setPg] = useState(null);
  const today = fmt(new Date()), { info, status, submitted } = reminderStatus(settings, sub);
  const [month, setMonth] = useState(today.slice(0, 7));
  const shiftM = (n) => { const [y, m] = month.split("-").map(Number), d = new Date(y, m - 1 + n, 1); setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };
  const toggleDay = (d) => setSettings({ ...settings, reminderDays: settings.reminderDays.includes(d) ? settings.reminderDays.filter((i) => i !== d) : [...settings.reminderDays, d] });
  const mr = records.filter((r) => r.date.startsWith(month));
  const hist = therapies.filter((t) => t.date.startsWith(month) && t.status !== "scheduled").sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
  const upcoming = therapies.filter((t) => t.status === "scheduled").sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const back = () => setPg(null);
  const MonthNav = <div className="nav3 center"><button className="mini" aria-label="上個月" onClick={() => shiftM(-1)}>‹</button><b>{month.replace("-", "年")}月</b><button className="mini" aria-label="下個月" onClick={() => shiftM(1)}>›</button></div>;
  const Stats = <div className="card stats">{SERVICES.map((x) => <div key={x}><span>{x}</span><b>{mr.filter((r) => r.type === x).length} 次</b></div>)}<div className="total"><span>本月療育</span><b>{mr.length} 次</b></div></div>;

  if (pg === "courses") return <SubPage title="我的早療課程" onBack={back}>{upcoming.length ? upcoming.map((t) => <div key={t.id} className="stack"><div className="addr">{t.date.replace(/-/g, "/")}</div><CourseItem t={t} onStatus={setStatus} onDelete={del} /></div>) : <div className="empty"><p>目前沒有待上的課程</p><p className="hint">到日曆點「＋」新增課程。</p></div>}</SubPage>;
  if (pg === "records") return <SubPage title="療育紀錄" onBack={back}>{MonthNav}
    {hist.length ? hist.map((t) => <div key={t.id} className="course"><div className="ctime">{t.date.slice(5).replace("-", "/")}<br />{t.start}</div><div className="cbody"><b>{t.type}</b><div>{clinicOf(t.clinicId)?.name}</div></div><span className={`tag ${t.status === "done" ? "pay-nhi" : "mock"}`}>{STATUS[t.status]}</span></div>)
      : <div className="empty"><p>這個月還沒有療育紀錄</p><p className="hint">在日曆標記課程後會出現在這裡。</p></div>}</SubPage>;
  if (pg === "stats") return <SubPage title="療育次數統計" onBack={back}>{MonthNav}{Stats}<p className="hint">只統計已完成的療育次數。</p></SubPage>;
  if (pg === "reminder") return <SubPage title="早療補助申請提醒" onBack={back}>
    <div className="card"><b>{info.label}</b>
      <div>提醒狀態：<span className={`tag ${submitted ? "pay-nhi" : status === "提醒中" ? "pay-q" : "mock"}`}>{status}</span></div>
      <div>目前狀態：{submitted ? "已提交" : "尚未提交"}</div>
      {status === "提醒中" && <div className="banner">{info.label.replace("療育紀錄", "")}的早療補助申請期間到了，記得準備申請資料。</div>}
      {submitted ? <button className="btn" onClick={() => setSub({ ...sub, [info.key]: { submitted: false } })}>取消「已提交」</button>
        : <button className="btn fav-on" onClick={() => setSub({ ...sub, [info.key]: { submitted: true, at: today } })}>已提交</button>}</div>
    <p className="hint">僅提醒申請時間。本 App 不判定補助資格、不計算補助金額，請向承辦單位確認。</p></SubPage>;
  if (pg === "notify") return <SubPage title="通知／提醒設定" onBack={back}><div className="card"><span className="lbl">補助申請提醒時間（App 內提醒）</span>
    <div className="chips">{[[1, "月初"], [15, "月中"], [25, "接近月底"]].map(([d, l]) => <Chip key={d} on={settings.reminderDays.includes(d)} onClick={() => toggleDay(d)}>{l}</Chip>)}</div></div></SubPage>;
  if (pg === "general") return <SubPage title="一般設定" onBack={back}>
    <div className="card"><span className="lbl">暱稱</span><input className="inp" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} placeholder="選填" /></div>
    <div className="card"><span className="lbl">日曆每週從哪天開始</span><div className="chips">{[[1, "週一"], [0, "週日"]].map(([d, l]) => <Chip key={d} on={settings.weekStart === d} onClick={() => setSettings({ ...settings, weekStart: d })}>{l}</Chip>)}</div></div>
    <div className="card"><span className="lbl">帳號</span><div className="chips"><button className="btn" disabled>登入</button><button className="btn" disabled>註冊</button></div><p className="hint">帳號功能之後開放</p></div></SubPage>;

  return (
    <main className="screen">
      <div className="appbar"><h1>我的</h1></div>
      <div className="profile"><span className="avatar"><User size={26} /></span><div><b>{settings.name || "早早療使用者"}</b><div className="addr">{APP_NAME} v{APP_VERSION}｜{VERSION_NAME}</div></div></div>
      <div className="gtitle">療育</div>
      <div className="list"><Row icon={CalendarDays} title="我的早療課程" sub={`${upcoming.length} 堂待上`} onClick={() => setPg("courses")} />
        <Row icon={ClipboardList} title="療育紀錄" sub={`${month.replace("-", "年")}月`} onClick={() => setPg("records")} />
        <Row icon={BarChart3} title="療育次數統計" sub={`本月 ${records.filter((r) => r.date.startsWith(today.slice(0, 7))).length} 次`} onClick={() => setPg("stats")} /></div>
      <div className="gtitle">提醒</div>
      <div className="list"><Row icon={Bell} title="早療補助申請提醒" sub={status} onClick={() => setPg("reminder")} /></div>
      <div className="gtitle">設定</div>
      <div className="list"><Row icon={Settings} title="一般設定" onClick={() => setPg("general")} /><Row icon={Bell} title="通知／提醒設定" onClick={() => setPg("notify")} /></div>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("map");
  const [favs, setFavs] = usePersist(FAV_KEY, []);
  const [myTherapies, setMyTherapies] = usePersist("ei-myTherapies", []);
  const [therapyRecords, setRecords] = usePersist("ei-therapyRecords", []);
  const [subsidyReminders, setSub] = usePersist("ei-subsidyReminders", {});
  const [settings, setSettings] = usePersist("ei-settings", { name: "", weekStart: 1, reminderDays: [1, 15, 25] });
  const [adding, setAdding] = useState(false);
  const [selDate, setSelDate] = useState(fmt(new Date()));
  const toggleFav = (id) => setFavs((f) => (f.includes(id) ? f.filter((i) => i !== id) : [...f, id]));
  const setStatus = (id, status) => {
    const t = myTherapies.find((x) => x.id === id);
    setMyTherapies((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    setRecords((r) => { const rest = r.filter((x) => x.therapyId !== id); return status === "done" && t ? [...rest, { id: "r" + id, therapyId: id, clinicId: t.clinicId, type: t.type, date: t.date }] : rest; });
  };
  const del = (id) => { setMyTherapies((a) => a.filter((x) => x.id !== id)); setRecords((r) => r.filter((x) => x.therapyId !== id)); };
  const remind = reminderStatus(settings, subsidyReminders).status === "提醒中";
  return (
    <div className="app">
      <style>{CSS}</style>
      <div className="notice">測試資料・非真實院所資訊</div>
      {page === "map" && <MapPage favs={favs} toggleFav={toggleFav} />}
      {page === "cal" && <CalendarPage therapies={myTherapies} setStatus={setStatus} del={del} onAdd={() => setAdding(true)} weekStart={settings.weekStart} selDate={selDate} setSelDate={setSelDate} />}
      {page === "me" && <MePage settings={settings} setSettings={setSettings} records={therapyRecords} sub={subsidyReminders} setSub={setSub} therapies={myTherapies} setStatus={setStatus} del={del} />}
      {adding && <AddCourse favs={favs} defaultDate={selDate} onSave={(l) => setMyTherapies((a) => [...a, ...l])} onClose={() => setAdding(false)} />}
      <nav className="bottom">
        {[["map", "地圖", MapIcon], ["cal", "日曆", CalendarDays], ["me", "我的", User]].map(([k, l, I]) => (
          <button key={k} className={page === k ? "on" : ""} onClick={() => setPage(k)}><I size={22} />{l}{k === "me" && remind && <em className="dot" />}</button>))}
      </nav>
    </div>
  );
}
