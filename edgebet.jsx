import { useState, useEffect, useCallback, useRef } from "react";

const ODDS_KEY = "511b2edd9216293f9b5b4cb604ddd98e";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07090e;
    --bg2: #0c1018;
    --card: #111520;
    --border: #1c2540;
    --green: #0dff8c;
    --green-dim: #0a7a44;
    --yellow: #f5c518;
    --red: #ff4560;
    --blue: #4da6ff;
    --text: #dce6f5;
    --muted: #5a6a8a;
    --font: 'Syne', sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg2); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .app { min-height: 100vh; background: var(--bg); }

  /* HEADER */
  .header {
    background: linear-gradient(135deg, #0c1018 0%, #0f1628 100%);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    height: 60px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { font-size: 22px; }
  .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #fff; }
  .logo-text span { color: var(--green); }
  .live-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(13,255,140,0.08); border: 1px solid rgba(13,255,140,0.2);
    padding: 4px 10px; border-radius: 20px; font-size: 11px;
    font-family: var(--mono); color: var(--green); font-weight: 500;
  }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .requests-badge { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .refresh-btn {
    background: rgba(77,166,255,0.1); border: 1px solid rgba(77,166,255,0.25);
    color: var(--blue); padding: 6px 14px; border-radius: 6px;
    font-family: var(--font); font-size: 12px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .refresh-btn:hover { background: rgba(77,166,255,0.2); }

  /* TABS */
  .tabs { display: flex; gap: 4px; padding: 16px 24px 0; border-bottom: 1px solid var(--border); }
  .tab {
    padding: 10px 20px; border-radius: 8px 8px 0 0; font-size: 13px; font-weight: 600;
    cursor: pointer; border: 1px solid transparent; border-bottom: none;
    transition: all 0.2s; color: var(--muted); letter-spacing: 0.3px;
  }
  .tab.active { background: var(--card); border-color: var(--border); color: var(--text); }
  .tab:hover:not(.active) { color: var(--text); }

  /* CONTENT */
  .content { padding: 20px 24px; max-width: 1400px; margin: 0 auto; }

  /* FILTERS */
  .filters {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    padding: 14px 18px; background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; margin-bottom: 20px;
  }
  .filter-label { font-size: 11px; color: var(--muted); font-family: var(--mono); text-transform: uppercase; }
  .filter-select {
    background: var(--bg2); border: 1px solid var(--border); color: var(--text);
    padding: 6px 12px; border-radius: 6px; font-size: 12px; font-family: var(--font);
    cursor: pointer; outline: none;
  }
  .prob-filter { display: flex; align-items: center; gap: 10px; margin-left: auto; }
  .prob-slider { accent-color: var(--green); width: 120px; cursor: pointer; }
  .prob-val { font-family: var(--mono); font-size: 13px; color: var(--green); font-weight: 700; min-width: 36px; }
  .filter-stats { display: flex; gap: 16px; margin-left: auto; }
  .fstat { font-size: 11px; font-family: var(--mono); }
  .fstat-num { color: var(--green); font-weight: 700; }
  .fstat-lbl { color: var(--muted); }

  /* HIGHLIGHT SECTION */
  .section-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .section-title { font-size: 15px; font-weight: 700; letter-spacing: 0.5px; }
  .section-badge {
    background: rgba(245,197,24,0.1); border: 1px solid rgba(245,197,24,0.25);
    color: var(--yellow); font-size: 10px; font-family: var(--mono);
    padding: 2px 8px; border-radius: 10px; font-weight: 600;
  }
  .section-badge.green {
    background: rgba(13,255,140,0.08); border-color: rgba(13,255,140,0.2); color: var(--green);
  }

  /* MATCH CARDS GRID */
  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; margin-bottom: 28px; }

  .match-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; transition: border-color 0.2s, transform 0.15s;
    cursor: pointer;
  }
  .match-card:hover { border-color: rgba(77,166,255,0.3); transform: translateY(-1px); }
  .match-card.high-value { border-color: rgba(245,197,24,0.3); }
  .match-card.high-conf { border-color: rgba(13,255,140,0.3); }

  .card-header { padding: 12px 16px 10px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .card-league { font-size: 10px; color: var(--muted); font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.8px; }
  .card-time { font-size: 11px; font-family: var(--mono); color: var(--blue); font-weight: 500; }

  .card-teams { padding: 14px 16px 10px; }
  .teams-row { display: flex; justify-content: space-between; align-items: center; }
  .team-name { font-size: 14px; font-weight: 700; max-width: 130px; line-height: 1.2; }
  .team-name.home { color: var(--text); }
  .team-name.away { text-align: right; color: var(--text); }
  .vs-badge { font-size: 10px; font-family: var(--mono); color: var(--muted); background: var(--bg2); padding: 3px 8px; border-radius: 4px; }

  .card-odds { padding: 10px 16px; display: flex; gap: 8px; }
  .odd-box {
    flex: 1; text-align: center; background: var(--bg2); border-radius: 8px; padding: 8px 6px;
    border: 1px solid var(--border); transition: border-color 0.2s;
  }
  .odd-box.best { border-color: rgba(13,255,140,0.4); background: rgba(13,255,140,0.04); }
  .odd-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-family: var(--mono); }
  .odd-value { font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--text); }
  .odd-prob { font-size: 9px; color: var(--muted); font-family: var(--mono); margin-top: 2px; }
  .odd-box.best .odd-value { color: var(--green); }

  .card-footer { padding: 10px 16px 12px; display: flex; justify-content: space-between; align-items: center; }
  .rec-pill {
    font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px;
    background: rgba(13,255,140,0.1); color: var(--green); border: 1px solid rgba(13,255,140,0.2);
    font-family: var(--mono);
  }
  .ev-badge { font-size: 11px; font-family: var(--mono); font-weight: 700; }
  .ev-badge.pos { color: var(--green); }
  .ev-badge.neg { color: var(--muted); }
  .ev-badge.high { color: var(--yellow); }
  .ai-btn {
    font-size: 11px; padding: 4px 10px; border-radius: 6px;
    background: rgba(77,166,255,0.1); border: 1px solid rgba(77,166,255,0.2);
    color: var(--blue); cursor: pointer; font-family: var(--font); font-weight: 600;
    transition: all 0.2s;
  }
  .ai-btn:hover { background: rgba(77,166,255,0.2); }
  .ai-btn.loading { opacity: 0.6; cursor: wait; }

  /* AI ANALYSIS PANEL */
  .ai-panel {
    margin: 0 0 14px; background: rgba(77,166,255,0.04); border: 1px solid rgba(77,166,255,0.2);
    border-radius: 10px; padding: 16px; animation: slideDown 0.2s ease;
  }
  @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  .ai-panel-title { font-size: 11px; color: var(--blue); font-family: var(--mono); margin-bottom: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .ai-block { background: var(--bg2); border-radius: 8px; padding: 10px 12px; }
  .ai-block-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; font-family: var(--mono); }
  .ai-block-val { font-size: 12px; color: var(--text); line-height: 1.5; }
  .ai-block.full { grid-column: 1/-1; }
  .ai-confidence { display: flex; align-items: center; gap: 8px; }
  .conf-dots { display: flex; gap: 3px; }
  .conf-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); }
  .conf-dot.filled { background: var(--green); }
  .conf-num { font-family: var(--mono); font-size: 13px; color: var(--green); font-weight: 700; }
  .ai-warning { background: rgba(255,69,96,0.08); border: 1px solid rgba(255,69,96,0.2); border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #ff8099; margin-top: 8px; }
  .ai-loading { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; padding: 8px 0; }
  .spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* MATCH TABLE */
  .table-wrap { background: var(--card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { background: var(--bg2); padding: 10px 14px; text-align: left; font-size: 10px; color: var(--muted); font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; border-bottom: 1px solid var(--border); }
  .table td { padding: 11px 14px; border-bottom: 1px solid rgba(28,37,64,0.5); font-size: 13px; vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: rgba(77,166,255,0.03); }
  .td-match { display: flex; flex-direction: column; gap: 2px; }
  .td-home { font-weight: 600; font-size: 13px; }
  .td-away { font-size: 11px; color: var(--muted); }
  .td-league { font-size: 10px; color: var(--muted); font-family: var(--mono); }
  .td-odds { font-family: var(--mono); font-size: 13px; font-weight: 600; }
  .td-odds.best-odd { color: var(--green); }
  .td-prob { font-family: var(--mono); font-size: 12px; }
  .td-prob.high { color: var(--green); font-weight: 700; }
  .td-prob.med { color: var(--yellow); }
  .td-ev.pos { color: var(--green); font-family: var(--mono); font-size: 12px; }
  .td-ev.neg { color: var(--muted); font-family: var(--mono); font-size: 12px; }
  .td-ev.hot { color: var(--yellow); font-family: var(--mono); font-size: 12px; font-weight: 700; }
  .rec-tag { font-size: 11px; font-family: var(--mono); padding: 2px 8px; border-radius: 4px; background: rgba(13,255,140,0.08); color: var(--green); white-space: nowrap; }

  /* PROB BAR */
  .prob-bar { display: flex; height: 4px; border-radius: 2px; overflow: hidden; width: 80px; }
  .pb-home { background: var(--green); }
  .pb-draw { background: var(--yellow); }
  .pb-away { background: var(--red); }

  /* COUPON TAB */
  .coupon-page { display: flex; gap: 20px; }
  .coupon-left { flex: 1; }
  .coupon-right { width: 380px; }
  .risk-buttons { display: flex; gap: 12px; margin-bottom: 20px; }
  .risk-btn {
    flex: 1; padding: 16px 12px; border-radius: 12px; border: 1px solid var(--border);
    background: var(--card); cursor: pointer; text-align: center; transition: all 0.2s;
  }
  .risk-btn:hover { transform: translateY(-2px); }
  .risk-btn.low { border-color: rgba(13,255,140,0.3); }
  .risk-btn.low.active { background: rgba(13,255,140,0.08); border-color: var(--green); }
  .risk-btn.medium { border-color: rgba(245,197,24,0.3); }
  .risk-btn.medium.active { background: rgba(245,197,24,0.06); border-color: var(--yellow); }
  .risk-btn.high { border-color: rgba(255,69,96,0.3); }
  .risk-btn.high.active { background: rgba(255,69,96,0.06); border-color: var(--red); }
  .risk-icon { font-size: 22px; margin-bottom: 6px; }
  .risk-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .risk-title.low { color: var(--green); }
  .risk-title.med { color: var(--yellow); }
  .risk-title.high { color: var(--red); }
  .risk-desc { font-size: 11px; color: var(--muted); }

  .coupon-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    overflow: hidden; animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from {opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
  .coupon-card-header { padding: 16px 20px; border-bottom: 1px solid var(--border); background: var(--bg2); }
  .coupon-card-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .coupon-card-sub { font-size: 11px; color: var(--muted); }
  .coupon-matches { padding: 4px 0; }
  .coupon-match { padding: 12px 20px; border-bottom: 1px solid rgba(28,37,64,0.5); display: flex; justify-content: space-between; align-items: center; }
  .coupon-match:last-child { border-bottom: none; }
  .cm-num { width: 22px; height: 22px; border-radius: 50%; background: var(--border); font-size: 10px; font-family: var(--mono); font-weight: 700; display: flex; align-items: center; justify-content: center; color: var(--muted); margin-right: 12px; flex-shrink: 0; }
  .cm-info { flex: 1; }
  .cm-teams { font-size: 13px; font-weight: 600; }
  .cm-bet { font-size: 11px; color: var(--green); font-family: var(--mono); margin-top: 2px; }
  .cm-odds { font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--text); }
  .cm-row { display: flex; align-items: center; }

  .coupon-footer { padding: 16px 20px; background: var(--bg2); border-top: 1px solid var(--border); }
  .coupon-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .cstat { text-align: center; }
  .cstat-val { font-family: var(--mono); font-size: 18px; font-weight: 700; }
  .cstat-val.green { color: var(--green); }
  .cstat-val.yellow { color: var(--yellow); }
  .cstat-lbl { font-size: 10px; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
  .potential-row { background: rgba(13,255,140,0.06); border: 1px solid rgba(13,255,140,0.2); border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .pot-label { font-size: 12px; color: var(--muted); }
  .pot-values { display: flex; gap: 16px; }
  .pot-item { text-align: right; }
  .pot-amount { font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--green); }
  .pot-stake { font-size: 10px; color: var(--muted); }

  .copy-btn {
    width: 100%; padding: 12px; border-radius: 8px; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: var(--font); border: none;
    background: linear-gradient(135deg, #0dff8c, #00c46a); color: #000;
    transition: all 0.2s; letter-spacing: 0.3px;
  }
  .copy-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(13,255,140,0.3); }
  .copy-btn:active { transform: translateY(0); }

  /* STATS CARDS */
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px 18px; }
  .stat-card-val { font-family: var(--mono); font-size: 24px; font-weight: 700; color: var(--green); margin-bottom: 4px; }
  .stat-card-lbl { font-size: 11px; color: var(--muted); }

  /* EMPTY / LOADING */
  .loading-state { text-align: center; padding: 60px 0; color: var(--muted); }
  .loading-spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
  .error-state { background: rgba(255,69,96,0.08); border: 1px solid rgba(255,69,96,0.2); border-radius: 10px; padding: 20px; color: #ff8099; font-size: 13px; }
  .empty-state { text-align: center; padding: 40px; color: var(--muted); font-size: 13px; }

  /* VALUE INDICATOR */
  .value-star { font-size: 9px; margin-left: 4px; }

  /* SCROLLABLE TABLE */
  .table-scroll { overflow-x: auto; }
`;

function ProbBar({ home, draw, away }) {
  return (
    <div className="prob-bar">
      <div className="pb-home" style={{ width: `${home}%` }} />
      <div className="pb-draw" style={{ width: `${draw}%` }} />
      <div className="pb-away" style={{ width: `${away}%` }} />
    </div>
  );
}

function ConfDots({ val }) {
  return (
    <div className="ai-confidence">
      <div className="conf-dots">
        {[1,2,3,4,5,6,7,8,9,10].map(i => (
          <div key={i} className={`conf-dot ${i <= val ? 'filled' : ''}`} />
        ))}
      </div>
      <span className="conf-num">{val}/10</span>
    </div>
  );
}

export default function EdgeBetAI() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("matches");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [minProb, setMinProb] = useState(54);
  const [coupon, setCoupon] = useState(null);
  const [couponRisk, setCouponRisk] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState(null);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [remaining, setRemaining] = useState("—");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchOdds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${ODDS_KEY}&regions=eu&markets=h2h&oddsFormat=decimal&dateFormat=iso`
      );
      const rem = res.headers.get('x-requests-remaining');
      if (rem) setRemaining(rem);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${res.status}`);
      }
      const data = await res.json();

      const processed = data.map(m => {
        const books = m.bookmakers || [];
        if (!books.length) return null;
        const h2h = books.map(b => b.markets?.find(mk => mk.key === 'h2h')).filter(Boolean);
        if (!h2h.length) return null;

        const avgOdds = (name) => {
          const prices = h2h.flatMap(mk => mk.outcomes).filter(o => o.name === name).map(o => o.price).filter(p => p > 1);
          return prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
        };

        const hO = avgOdds(m.home_team);
        const aO = avgOdds(m.away_team);
        const dO = avgOdds("Draw");
        if (!hO || !aO) return null;

        const hI = 1/hO, aI = 1/aO, dI = dO ? 1/dO : 0.27;
        const tot = hI + aI + dI;
        const hP = Math.round((hI/tot)*100);
        const aP = Math.round((aI/tot)*100);
        const dP = Math.round((dI/tot)*100);

        let rec, rO, rP;
        if (hP >= aP && hP >= dP) { rec = `${m.home_team} Kazanır`; rO = hO; rP = hP; }
        else if (aP >= hP && aP >= dP) { rec = `${m.away_team} Kazanır`; rO = aO; rP = aP; }
        else { rec = "Beraberlik"; rO = dO || 3.5; rP = dP; }

        const ev = ((rP/100)*rO - 1) * 100;
        const commence = new Date(m.commence_time);

        return {
          id: m.id,
          home: m.home_team,
          away: m.away_team,
          league: m.sport_title,
          commenceTime: m.commence_time,
          display: commence.toLocaleString('tr-TR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
          hO: Math.round(hO*100)/100,
          aO: Math.round(aO*100)/100,
          dO: dO ? Math.round(dO*100)/100 : null,
          hP, aP, dP,
          maxProb: rP,
          rec, rO: Math.round(rO*100)/100,
          ev: Math.round(ev*10)/10,
          isValue: ev > 5,
          isHot: ev > 12,
          books: books.length,
        };
      }).filter(Boolean).sort((a, b) => b.maxProb - a.maxProb);

      setMatches(processed);
      setLastUpdated(new Date().toLocaleTimeString('tr-TR'));
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOdds(); }, [fetchOdds]);

  const generateCoupon = useCallback((risk) => {
    let pool = [...matches];
    let count, label, color, desc;

    if (risk === "low") {
      pool = pool.filter(m => m.maxProb >= 62).sort((a,b) => b.maxProb - a.maxProb);
      count = 3; label = "DÜŞÜK RİSK"; color = "green";
      desc = "En güvenli 3 maç — Yüksek kazanma olasılığı";
    } else if (risk === "medium") {
      pool = pool.filter(m => m.maxProb >= 57 && m.ev > 2).sort((a,b) => (b.ev + b.maxProb/3) - (a.ev + a.maxProb/3));
      count = 4; label = "ORTA RİSK"; color = "yellow";
      desc = "Value + olasılık dengeli — 4 maç kombinasyon";
    } else {
      pool = pool.filter(m => m.maxProb >= 51).sort((a,b) => b.ev - a.ev);
      const top = pool.slice(0, Math.min(12, pool.length));
      pool = top.sort(() => Math.random() - 0.25);
      count = Math.min(5, pool.length);
      label = "YÜKSEK RİSK"; color = "red";
      desc = "Yüksek getiri hedefli cesur seçimler";
    }

    const sel = pool.slice(0, Math.min(count, pool.length));
    if (sel.length < 2) { alert("Yeterli maç yok. Filtre kriterlerini genişletin."); return; }

    const totalOdds = sel.reduce((a, m) => a * m.rO, 1);
    const winProb = sel.reduce((a, m) => a * (m.maxProb/100), 1) * 100;
    const ev = (totalOdds*(winProb/100) - 1)*100;

    setCoupon({
      risk, label, color, desc,
      matches: sel,
      totalOdds: Math.round(totalOdds*100)/100,
      winProb: Math.round(winProb*10)/10,
      ev: Math.round(ev*10)/10,
      p100: Math.round(totalOdds*100),
      p500: Math.round(totalOdds*500),
      ts: new Date().toLocaleTimeString('tr-TR'),
    });
    setCouponRisk(risk);
    setActiveTab("coupon");
  }, [matches]);

  const analyzeMatch = useCallback(async (match) => {
    if (expandedMatch === match.id) { setExpandedMatch(null); return; }
    setExpandedMatch(match.id);
    if (aiAnalysis[match.id]) return;
    setLoadingAnalysis(match.id);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: `Sen dünya sınıfı bir futbol bahis analistsin. Verilen oranları ve olasılıkları çok zeki şekilde yorumla. SADECE JSON döndür: {"ozet":"2 cümle net özet","ev_gucu":"ev sahibi gücü (1 cümle)","dep_gucu":"deplasman gücü (1 cümle)","onerilen":"Net bahis önerisi — örn: Ev Kazanır, 2.5 Üst, KG Var, İlk Yarı 1","guven":7,"uyari":null,"beklenti":"Beklenen skor"}`,
          messages: [{ role: "user", content: `Maç: ${match.home} vs ${match.away}\nLig: ${match.league}\nTarih: ${match.display}\n1xBet Oranları: Ev ${match.hO} | Beraberlik ${match.dO||'—'} | Deplasman ${match.aO}\nHesaplanan Olasılıklar: Ev %${match.hP} | Beraberlik %${match.dP} | Deplasman %${match.aP}\nValue: ${match.ev>0?'+':''}${match.ev}%\nBookmaker sayısı: ${match.books}\n\nAnaliz et.` }]
        })
      });
      const data = await res.json();
      const txt = data.content[0].text;
      const parsed = JSON.parse(txt.replace(/```json|```/g,'').trim());
      setAiAnalysis(prev => ({ ...prev, [match.id]: parsed }));
    } catch(e) {
      setAiAnalysis(prev => ({ ...prev, [match.id]: { ozet: "Analiz yüklenemedi. Tekrar deneyin.", onerilen: match.rec, guven: 5, uyari: null, beklenti: "—" } }));
    }
    setLoadingAnalysis(null);
  }, [expandedMatch, aiAnalysis]);

  const copyCoupon = () => {
    if (!coupon) return;
    const lines = [
      `⚽ EdgeBet AI — ${coupon.label} KUPON`,
      `📅 ${coupon.ts}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ...coupon.matches.map((m, i) => `${i+1}. ${m.home} vs ${m.away}\n   ${m.rec} @ ${m.rO}`),
      `━━━━━━━━━━━━━━━━━━━━`,
      `🎯 Toplam Oran: ${coupon.totalOdds}`,
      `📊 Kazanma İhtimali: %${coupon.winProb}`,
      `💰 100 TL → ${coupon.p100} TL`,
    ].join('\n');
    navigator.clipboard.writeText(lines).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const leagues = ["all", ...new Set(matches.map(m => m.league))];
  const filtered = matches.filter(m => {
    if (selectedLeague !== "all" && m.league !== selectedLeague) return false;
    if (m.maxProb < minProb) return false;
    return true;
  });
  const highConf = filtered.filter(m => m.maxProb >= 65);
  const valueMatches = filtered.filter(m => m.isValue || m.isHot);

  return (
    <div className="app">
      <style>{css}</style>

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Edge<span>Bet</span> AI</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {loading && <div className="spinner" style={{width:16,height:16,borderWidth:2}} />}
          <div className="live-badge">
            <div className="live-dot" />
            {lastUpdated ? `Güncellendi: ${lastUpdated}` : 'Yükleniyor...'}
          </div>
        </div>
        <div className="header-right">
          <span className="requests-badge">API: {remaining} istek kaldı</span>
          <button className="refresh-btn" onClick={fetchOdds}>⟳ Yenile</button>
        </div>
      </header>

      {/* TABS */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', display:'flex', gap:4 }}>
          {[
            { key:'matches', label:'🔍 Maçlar & Oranlar' },
            { key:'table', label:'📋 Tüm Maçlar' },
            { key:'coupon', label:'🎯 Kupon Oluştur' },
          ].map(t => (
            <button key={t.key} className={`tab ${activeTab===t.key?'active':''}`}
              onClick={() => setActiveTab(t.key)} style={{cursor:'pointer', background:'none', border:'none', fontFamily:'var(--font)'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="content">
        {error && <div className="error-state">❌ API Hatası: {error} — Key limitini veya bağlantıyı kontrol edin.</div>}

        {/* === MATCHES TAB === */}
        {activeTab === 'matches' && (
          <>
            {/* STATS */}
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-card-val">{matches.length}</div>
                <div className="stat-card-lbl">Toplam Maç</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-val">{highConf.length}</div>
                <div className="stat-card-lbl">%65+ Yüksek Olasılık</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-val">{valueMatches.length}</div>
                <div className="stat-card-lbl">Value Bet Fırsatı</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-val">{new Set(matches.map(m=>m.league)).size}</div>
                <div className="stat-card-lbl">Aktif Lig</div>
              </div>
            </div>

            {/* FILTERS */}
            <div className="filters">
              <span className="filter-label">Lig:</span>
              <select className="filter-select" value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)}>
                {leagues.map(l => <option key={l} value={l}>{l === 'all' ? 'Tüm Ligler' : l}</option>)}
              </select>
              <div className="prob-filter">
                <span className="filter-label">Min Olasılık:</span>
                <input type="range" className="prob-slider" min={45} max={80} value={minProb} onChange={e => setMinProb(Number(e.target.value))} />
                <span className="prob-val">%{minProb}</span>
              </div>
              <div className="filter-stats">
                <div className="fstat">
                  <span className="fstat-num">{filtered.length} </span>
                  <span className="fstat-lbl">maç gösteriliyor</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <div>The Odds API'den gerçek veriler yükleniyor...</div>
              </div>
            ) : (
              <>
                {/* HIGH CONF CARDS */}
                {highConf.length > 0 && (
                  <>
                    <div className="section-header">
                      <span className="section-title">🔥 Yüksek Güvenli Maçlar</span>
                      <span className="section-badge green">%65+ KAZANMA İHTİMALİ</span>
                    </div>
                    <div className="cards-grid">
                      {highConf.slice(0, 8).map(m => (
                        <div key={m.id}>
                          <div className={`match-card high-conf ${m.isHot ? 'high-value' : ''}`} onClick={() => analyzeMatch(m)}>
                            <div className="card-header">
                              <span className="card-league">{m.league}</span>
                              <span className="card-time">{m.display}</span>
                            </div>
                            <div className="card-teams">
                              <div className="teams-row">
                                <span className="team-name home">{m.home}</span>
                                <span className="vs-badge">VS</span>
                                <span className="team-name away">{m.away}</span>
                              </div>
                            </div>
                            <div className="card-odds">
                              <div className={`odd-box ${m.hP >= m.aP && m.hP >= m.dP ? 'best' : ''}`}>
                                <div className="odd-label">Ev</div>
                                <div className="odd-value">{m.hO}</div>
                                <div className="odd-prob">%{m.hP}</div>
                              </div>
                              {m.dO && (
                                <div className={`odd-box ${m.dP >= m.hP && m.dP >= m.aP ? 'best' : ''}`}>
                                  <div className="odd-label">Beraberlik</div>
                                  <div className="odd-value">{m.dO}</div>
                                  <div className="odd-prob">%{m.dP}</div>
                                </div>
                              )}
                              <div className={`odd-box ${m.aP > m.hP && m.aP >= m.dP ? 'best' : ''}`}>
                                <div className="odd-label">Dep</div>
                                <div className="odd-value">{m.aO}</div>
                                <div className="odd-prob">%{m.aP}</div>
                              </div>
                            </div>
                            <div style={{padding:'0 16px 8px'}}>
                              <ProbBar home={m.hP} draw={m.dP} away={m.aP} />
                            </div>
                            <div className="card-footer">
                              <span className="rec-pill">{m.rec}</span>
                              <span className={`ev-badge ${m.isHot?'high':m.isValue?'pos':'neg'}`}>
                                EV: {m.ev > 0 ? '+' : ''}{m.ev}%
                              </span>
                              <button className={`ai-btn ${loadingAnalysis===m.id?'loading':''}`}
                                onClick={e => { e.stopPropagation(); analyzeMatch(m); }}>
                                {loadingAnalysis===m.id ? '⟳ Analiz...' : expandedMatch===m.id ? '▲ Kapat' : '🧠 AI Analiz'}
                              </button>
                            </div>
                          </div>
                          {expandedMatch === m.id && (
                            <div className="ai-panel">
                              {loadingAnalysis === m.id ? (
                                <div className="ai-loading"><div className="spinner" />Claude AI analiz yapıyor...</div>
                              ) : aiAnalysis[m.id] ? (
                                <>
                                  <div className="ai-panel-title">🧠 AI Tahmin Analizi — {m.home} vs {m.away}</div>
                                  <div className="ai-grid">
                                    <div className="ai-block full">
                                      <div className="ai-block-label">Genel Analiz</div>
                                      <div className="ai-block-val">{aiAnalysis[m.id].ozet}</div>
                                    </div>
                                    <div className="ai-block">
                                      <div className="ai-block-label">Ev Sahibi Gücü</div>
                                      <div className="ai-block-val" style={{color:'var(--green)'}}>{aiAnalysis[m.id].ev_gucu}</div>
                                    </div>
                                    <div className="ai-block">
                                      <div className="ai-block-label">Deplasman Gücü</div>
                                      <div className="ai-block-val" style={{color:'var(--blue)'}}>{aiAnalysis[m.id].dep_gucu}</div>
                                    </div>
                                    <div className="ai-block">
                                      <div className="ai-block-label">Önerilen Bahis</div>
                                      <div className="ai-block-val" style={{color:'var(--yellow)', fontWeight:700, fontFamily:'var(--mono)'}}>{aiAnalysis[m.id].onerilen}</div>
                                    </div>
                                    <div className="ai-block">
                                      <div className="ai-block-label">Güven Skoru</div>
                                      <ConfDots val={aiAnalysis[m.id].guven || 7} />
                                    </div>
                                    <div className="ai-block">
                                      <div className="ai-block-label">Beklenti</div>
                                      <div className="ai-block-val" style={{fontFamily:'var(--mono)'}}>{aiAnalysis[m.id].beklenti}</div>
                                    </div>
                                  </div>
                                  {aiAnalysis[m.id].uyari && (
                                    <div className="ai-warning">⚠️ {aiAnalysis[m.id].uyari}</div>
                                  )}
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* VALUE BETS */}
                {valueMatches.length > 0 && (
                  <>
                    <div className="section-header" style={{marginTop:8}}>
                      <span className="section-title">💎 Value Bet Fırsatları</span>
                      <span className="section-badge">EV &gt; +5%</span>
                    </div>
                    <div className="cards-grid">
                      {valueMatches.filter(m => !highConf.includes(m)).slice(0, 4).map(m => (
                        <div key={m.id}>
                          <div className={`match-card ${m.isHot?'high-value':''}`} onClick={() => analyzeMatch(m)}>
                            <div className="card-header">
                              <span className="card-league">{m.league}</span>
                              <span className="card-time">{m.display}</span>
                            </div>
                            <div className="card-teams">
                              <div className="teams-row">
                                <span className="team-name home">{m.home}</span>
                                <span className="vs-badge">VS</span>
                                <span className="team-name away">{m.away}</span>
                              </div>
                            </div>
                            <div className="card-odds">
                              <div className={`odd-box ${m.hP>=m.aP&&m.hP>=m.dP?'best':''}`}>
                                <div className="odd-label">Ev</div>
                                <div className="odd-value">{m.hO}</div>
                                <div className="odd-prob">%{m.hP}</div>
                              </div>
                              {m.dO && <div className={`odd-box ${m.dP>=m.hP&&m.dP>=m.aP?'best':''}`}>
                                <div className="odd-label">Ber</div>
                                <div className="odd-value">{m.dO}</div>
                                <div className="odd-prob">%{m.dP}</div>
                              </div>}
                              <div className={`odd-box ${m.aP>m.hP&&m.aP>=m.dP?'best':''}`}>
                                <div className="odd-label">Dep</div>
                                <div className="odd-value">{m.aO}</div>
                                <div className="odd-prob">%{m.aP}</div>
                              </div>
                            </div>
                            <div style={{padding:'0 16px 8px'}}><ProbBar home={m.hP} draw={m.dP} away={m.aP} /></div>
                            <div className="card-footer">
                              <span className="rec-pill">{m.rec}</span>
                              <span className={`ev-badge ${m.isHot?'high':'pos'}`}>🔥 EV: +{m.ev}%</span>
                              <button className={`ai-btn ${loadingAnalysis===m.id?'loading':''}`} onClick={e=>{e.stopPropagation();analyzeMatch(m);}}>
                                {loadingAnalysis===m.id?'⟳ Analiz...':expandedMatch===m.id?'▲ Kapat':'🧠 AI Analiz'}
                              </button>
                            </div>
                          </div>
                          {expandedMatch===m.id && (
                            <div className="ai-panel">
                              {loadingAnalysis===m.id ? (
                                <div className="ai-loading"><div className="spinner"/>Claude AI analiz yapıyor...</div>
                              ) : aiAnalysis[m.id] ? (
                                <>
                                  <div className="ai-panel-title">🧠 AI Tahmin Analizi</div>
                                  <div className="ai-grid">
                                    <div className="ai-block full"><div className="ai-block-label">Analiz</div><div className="ai-block-val">{aiAnalysis[m.id].ozet}</div></div>
                                    <div className="ai-block"><div className="ai-block-label">Önerilen</div><div className="ai-block-val" style={{color:'var(--yellow)',fontWeight:700,fontFamily:'var(--mono)'}}>{aiAnalysis[m.id].onerilen}</div></div>
                                    <div className="ai-block"><div className="ai-block-label">Güven</div><ConfDots val={aiAnalysis[m.id].guven||7}/></div>
                                  </div>
                                  {aiAnalysis[m.id].uyari && <div className="ai-warning">⚠️ {aiAnalysis[m.id].uyari}</div>}
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {filtered.length === 0 && !loading && (
                  <div className="empty-state">Bu kriterlere uyan maç bulunamadı. Minimum olasılığı düşürün.</div>
                )}

                {/* QUICK COUPON BUTTONS */}
                <div style={{marginTop:24, padding:'18px 20px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
                  <div>
                    <div style={{fontSize:13, fontWeight:700, marginBottom:4}}>⚡ Hızlı Kupon Oluştur</div>
                    <div style={{fontSize:11, color:'var(--muted)'}}>Gerçek verilerden anlık akıllı kupon</div>
                  </div>
                  <div style={{display:'flex', gap:10, marginLeft:'auto', flexWrap:'wrap'}}>
                    <button onClick={() => generateCoupon('low')} style={{padding:'10px 20px', borderRadius:8, border:'1px solid rgba(13,255,140,0.3)', background:'rgba(13,255,140,0.06)', color:'var(--green)', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer'}}>🟢 Düşük Risk (3 Maç)</button>
                    <button onClick={() => generateCoupon('medium')} style={{padding:'10px 20px', borderRadius:8, border:'1px solid rgba(245,197,24,0.3)', background:'rgba(245,197,24,0.04)', color:'var(--yellow)', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer'}}>🟡 Orta Risk (4 Maç)</button>
                    <button onClick={() => generateCoupon('high')} style={{padding:'10px 20px', borderRadius:8, border:'1px solid rgba(255,69,96,0.3)', background:'rgba(255,69,96,0.04)', color:'var(--red)', fontFamily:'var(--font)', fontSize:13, fontWeight:700, cursor:'pointer'}}>🔴 Yüksek Risk (5 Maç)</button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* === TABLE TAB === */}
        {activeTab === 'table' && (
          <>
            <div className="filters">
              <span className="filter-label">Lig:</span>
              <select className="filter-select" value={selectedLeague} onChange={e => setSelectedLeague(e.target.value)}>
                {leagues.map(l => <option key={l} value={l}>{l==='all'?'Tüm Ligler':l}</option>)}
              </select>
              <div className="prob-filter">
                <span className="filter-label">Min Olasılık:</span>
                <input type="range" className="prob-slider" min={40} max={80} value={minProb} onChange={e=>setMinProb(Number(e.target.value))}/>
                <span className="prob-val">%{minProb}</span>
              </div>
              <span style={{marginLeft:'auto', fontSize:12, color:'var(--muted)', fontFamily:'var(--mono)'}}>{filtered.length} maç</span>
            </div>

            {loading ? (
              <div className="loading-state"><div className="loading-spinner"/><div>Yükleniyor...</div></div>
            ) : (
              <div className="table-wrap table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Maç</th>
                      <th>Lig</th>
                      <th>Tarih</th>
                      <th>1xBet Ev</th>
                      <th>Beraberlik</th>
                      <th>Deplasman</th>
                      <th>Olasılık</th>
                      <th>EV</th>
                      <th>Öneri</th>
                      <th>AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => (
                      <>
                        <tr key={m.id}>
                          <td>
                            <div className="td-match">
                              <div className="td-home">{m.home}</div>
                              <div className="td-away">vs {m.away}</div>
                            </div>
                          </td>
                          <td><span className="td-league">{m.league}</span></td>
                          <td><span style={{fontSize:11, fontFamily:'var(--mono)'}}>{m.display}</span></td>
                          <td><span className={`td-odds ${m.hP>=m.aP&&m.hP>=m.dP?'best-odd':''}`}>{m.hO}</span></td>
                          <td><span className="td-odds">{m.dO||'—'}</span></td>
                          <td><span className={`td-odds ${m.aP>m.hP&&m.aP>=m.dP?'best-odd':''}`}>{m.aO}</span></td>
                          <td>
                            <div style={{display:'flex',flexDirection:'column',gap:4}}>
                              <ProbBar home={m.hP} draw={m.dP} away={m.aP}/>
                              <span className={`td-prob ${m.maxProb>=65?'high':m.maxProb>=57?'med':''}`}>%{m.maxProb}</span>
                            </div>
                          </td>
                          <td><span className={`td-ev ${m.isHot?'hot':m.isValue?'pos':'neg'}`}>{m.ev>0?'+':''}{m.ev}%</span></td>
                          <td><span className="rec-tag">{m.rec}</span></td>
                          <td>
                            <button className="ai-btn" style={{fontSize:10, padding:'3px 8px'}} onClick={() => analyzeMatch(m)}>
                              {loadingAnalysis===m.id ? '⟳' : expandedMatch===m.id ? '▲' : '🧠'}
                            </button>
                          </td>
                        </tr>
                        {expandedMatch===m.id && (
                          <tr key={`${m.id}-ai`}>
                            <td colSpan={10} style={{padding:'0 14px 14px'}}>
                              <div className="ai-panel">
                                {loadingAnalysis===m.id ? (
                                  <div className="ai-loading"><div className="spinner"/>Claude AI analiz yapıyor...</div>
                                ) : aiAnalysis[m.id] ? (
                                  <>
                                    <div className="ai-panel-title">🧠 AI Analizi — {m.home} vs {m.away}</div>
                                    <div className="ai-grid">
                                      <div className="ai-block full"><div className="ai-block-label">Analiz</div><div className="ai-block-val">{aiAnalysis[m.id].ozet}</div></div>
                                      <div className="ai-block"><div className="ai-block-label">Önerilen Bahis</div><div className="ai-block-val" style={{color:'var(--yellow)',fontWeight:700,fontFamily:'var(--mono)'}}>{aiAnalysis[m.id].onerilen}</div></div>
                                      <div className="ai-block"><div className="ai-block-label">Beklenti</div><div className="ai-block-val" style={{fontFamily:'var(--mono)'}}>{aiAnalysis[m.id].beklenti}</div></div>
                                      <div className="ai-block full"><div className="ai-block-label">Güven</div><ConfDots val={aiAnalysis[m.id].guven||7}/></div>
                                    </div>
                                    {aiAnalysis[m.id].uyari && <div className="ai-warning">⚠️ {aiAnalysis[m.id].uyari}</div>}
                                  </>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="empty-state">Maç bulunamadı.</div>}
              </div>
            )}
          </>
        )}

        {/* === COUPON TAB === */}
        {activeTab === 'coupon' && (
          <div className="coupon-page">
            <div className="coupon-left">
              <div style={{marginBottom:20}}>
                <div className="section-header">
                  <span className="section-title">🎯 Risk Seviyesi Seç</span>
                </div>
                <div className="risk-buttons">
                  <button className={`risk-btn low ${couponRisk==='low'?'active':''}`} onClick={() => generateCoupon('low')}>
                    <div className="risk-icon">🟢</div>
                    <div className="risk-title low">DÜŞÜK RİSK</div>
                    <div className="risk-desc">3 maç • %62+ olasılık</div>
                    <div style={{marginTop:8, fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)'}}>Toplam Oran ~3x–8x</div>
                  </button>
                  <button className={`risk-btn medium ${couponRisk==='medium'?'active':''}`} onClick={() => generateCoupon('medium')}>
                    <div className="risk-icon">🟡</div>
                    <div className="risk-title med">ORTA RİSK</div>
                    <div className="risk-desc">4 maç • Value odaklı</div>
                    <div style={{marginTop:8, fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)'}}>Toplam Oran ~8x–20x</div>
                  </button>
                  <button className={`risk-btn high ${couponRisk==='high'?'active':''}`} onClick={() => generateCoupon('high')}>
                    <div className="risk-icon">🔴</div>
                    <div className="risk-title high">YÜKSEK RİSK</div>
                    <div className="risk-desc">5 maç • Cesur seçim</div>
                    <div style={{marginTop:8, fontSize:10, color:'var(--muted)', fontFamily:'var(--mono)'}}>Toplam Oran ~20x–60x</div>
                  </button>
                </div>
                <div style={{fontSize:11, color:'var(--muted)', textAlign:'center', padding:'8px 0'}}>
                  Her basışta farklı kombinasyon üretilir — Veriler The Odds API'den gerçek zamanlı
                </div>
              </div>

              {!coupon && (
                <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:40, textAlign:'center', color:'var(--muted)'}}>
                  <div style={{fontSize:32, marginBottom:12}}>🎯</div>
                  <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>Kupon oluşturmak için risk seviyesi seç</div>
                  <div style={{fontSize:12}}>Gerçek oranlar ve AI olasılık hesabıyla en iyi kombinasyonlar</div>
                </div>
              )}
            </div>

            <div className="coupon-right">
              {coupon && (
                <div className="coupon-card">
                  <div className="coupon-card-header">
                    <div className="coupon-card-title" style={{color: coupon.color==='green'?'var(--green)':coupon.color==='yellow'?'var(--yellow)':'var(--red)'}}>
                      {coupon.label} — {coupon.matches.length} MAÇLI KUPON
                    </div>
                    <div className="coupon-card-sub">{coupon.desc}</div>
                    <div style={{fontSize:10, color:'var(--muted)', marginTop:4, fontFamily:'var(--mono)'}}>Oluşturuldu: {coupon.ts}</div>
                  </div>

                  <div className="coupon-matches">
                    {coupon.matches.map((m, i) => (
                      <div key={m.id} className="coupon-match">
                        <div className="cm-row">
                          <div className="cm-num">{i+1}</div>
                          <div className="cm-info">
                            <div className="cm-teams">{m.home} vs {m.away}</div>
                            <div className="cm-bet">{m.rec}</div>
                            <div style={{fontSize:9, color:'var(--muted)', fontFamily:'var(--mono)', marginTop:2}}>{m.league}</div>
                          </div>
                        </div>
                        <div className="cm-odds">{m.rO}</div>
                      </div>
                    ))}
                  </div>

                  <div className="coupon-footer">
                    <div className="coupon-stats">
                      <div className="cstat">
                        <div className={`cstat-val ${coupon.color==='green'?'green':coupon.color==='yellow'?'yellow':''}`} style={coupon.color==='red'?{color:'var(--red)'}:{}}>{coupon.totalOdds}x</div>
                        <div className="cstat-lbl">Toplam Oran</div>
                      </div>
                      <div className="cstat">
                        <div className="cstat-val green">%{coupon.winProb}</div>
                        <div className="cstat-lbl">Kazanma İhtimali</div>
                      </div>
                      <div className="cstat">
                        <div className={`cstat-val ${coupon.ev>0?'green':''}`}>{coupon.ev>0?'+':''}{coupon.ev}%</div>
                        <div className="cstat-lbl">Beklenen Getiri</div>
                      </div>
                    </div>

                    <div className="potential-row">
                      <div className="pot-label">Potansiyel Kazanç</div>
                      <div className="pot-values">
                        <div className="pot-item">
                          <div className="pot-amount">{coupon.p100} TL</div>
                          <div className="pot-stake">100 TL için</div>
                        </div>
                        <div className="pot-item">
                          <div className="pot-amount">{coupon.p500} TL</div>
                          <div className="pot-stake">500 TL için</div>
                        </div>
                      </div>
                    </div>

                    <button className="copy-btn" onClick={copyCoupon}>
                      {copied ? '✅ Kopyalandı!' : '📋 Kuponu Kopyala (1xBet için)'}
                    </button>

                    <div style={{marginTop:10, fontSize:10, color:'var(--muted)', textAlign:'center'}}>
                      ⚠️ Bahis her zaman risk içerir. Sorumlu oynayın. Bu uygulama tahmin aracıdır.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
