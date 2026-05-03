import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const fmt = (n) => n >= 10000 ? `${(n / 10000).toFixed(0)}万` : `${n.toFixed(0)}`;
const fmtM = (n) => `${(n / 10000).toFixed(0)}万円`;

const SLIDER = ({ label, value, min, max, step, onChange, unit, color }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: color || "#38bdf8", fontVariantNumeric: "tabular-nums" }}>
        {typeof value === "number" && value >= 10000 ? fmtM(value) : value}{unit}
      </span>
    </div>
    <div style={{ position: "relative" }}>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: "100%", height: 4, appearance: "none", background: `linear-gradient(to right, ${color || "#38bdf8"} 0%, ${color || "#38bdf8"} ${((value - min) / (max - min)) * 100}%, #1e293b ${((value - min) / (max - min)) * 100}%, #1e293b 100%)`,
          borderRadius: 2, outline: "none", cursor: "pointer"
        }}
      />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
      <span style={{ fontSize: 10, color: "#475569" }}>{min >= 10000 ? fmtM(min) : min}{unit}</span>
      <span style={{ fontSize: 10, color: "#475569" }}>{max >= 10000 ? fmtM(max) : max}{unit}</span>
    </div>
  </div>
);

const CARD = ({ title, value, sub, color, icon }) => (
  <div style={{
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    border: `1px solid ${color}30`,
    borderRadius: 16, padding: "18px 20px",
    boxShadow: `0 4px 24px ${color}15`
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em" }}>{title}</span>
    </div>
    <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, padding: "12px 16px", fontSize: 12 }}>
      <div style={{ color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>{label}年後</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: 4 }}>
          {p.name}：<strong>{fmtM(p.value)}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Simulator() {
  const [currentIncome, setCurrentIncome] = useState(400000);
  const [sideIncome, setSideIncome] = useState(50000);
  const [sideGrowth, setSideGrowth] = useState(20);
  const [investBase, setInvestBase] = useState(30000);
  const [returnRate, setReturnRate] = useState(7);
  const [years, setYears] = useState(20);
  const [currentAssets, setCurrentAssets] = useState(1000000);

  const data = useMemo(() => {
    const result = [];
    let assets = currentAssets;
    let side = sideIncome;

    for (let y = 0; y <= years; y++) {
      const totalMonthly = investBase + Math.min(side, side);
      const yearlyInvest = totalMonthly * 12;
      const assetWithSide = assets;

      // 副業なし（本業収入のみで積立）
      let noSideAssets = y === 0 ? currentAssets : result[y - 1].noSide;
      noSideAssets = y === 0 ? currentAssets : noSideAssets * (1 + returnRate / 100) + investBase * 12;

      // 副業あり
      let withSideAssets = y === 0 ? currentAssets : result[y - 1].withSide;
      const sideAtYear = sideIncome * Math.pow(1 + sideGrowth / 100, y);
      const monthlyInvestWithSide = investBase + Math.min(sideAtYear, sideAtYear * 0.7);
      withSideAssets = y === 0 ? currentAssets : withSideAssets * (1 + returnRate / 100) + monthlyInvestWithSide * 12;

      result.push({
        year: y,
        noSide: Math.round(noSideAssets),
        withSide: Math.round(withSideAssets),
        sideMonthly: Math.round(sideAtYear),
        diff: Math.round(withSideAssets - noSideAssets),
      });
    }
    return result;
  }, [currentIncome, sideIncome, sideGrowth, investBase, returnRate, years, currentAssets]);

  const final = data[data.length - 1];
  const fireTarget = currentIncome * 12 / (returnRate / 100);
  const fireYear = data.findIndex(d => d.withSide >= fireTarget);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#020817",
      backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, #0ea5e920, transparent)",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      color: "#e2e8f0",
      padding: "32px 16px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #38bdf8; cursor: pointer; box-shadow: 0 0 8px #38bdf880; }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", color: "#38bdf8", marginBottom: 12 }}>SIDE INCOME × INVESTMENT SIMULATOR</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 800, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            副業収入<span style={{ color: "#38bdf8" }}>×</span>投資<br />
            <span style={{ color: "#34d399" }}>資産シミュレーター</span>
          </h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 12 }}>副業で入金力を高めると、資産形成はどう変わる？</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

          {/* Left: Inputs */}
          <div style={{ background: "linear-gradient(135deg, #0f172a, #0a1628)", border: "1px solid #1e293b", borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#38bdf8", marginBottom: 24 }}>▎ 基本情報</div>

            <SLIDER label="現在の月収" value={currentIncome} min={200000} max={1000000} step={10000} onChange={setCurrentIncome} unit="" color="#94a3b8" />
            <SLIDER label="現在の資産" value={currentAssets} min={0} max={10000000} step={100000} onChange={setCurrentAssets} unit="" color="#94a3b8" />
            <SLIDER label="月の積立投資額（本業分）" value={investBase} min={10000} max={200000} step={5000} onChange={setInvestBase} unit="" color="#38bdf8" />

            <div style={{ borderTop: "1px solid #1e293b", margin: "24px 0" }} />
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#f59e0b", marginBottom: 24 }}>▎ 副業設定</div>

            <SLIDER label="副業の初月収入" value={sideIncome} min={10000} max={300000} step={5000} onChange={setSideIncome} unit="" color="#f59e0b" />
            <SLIDER label="副業の年間成長率" value={sideGrowth} min={0} max={100} step={5} onChange={setSideGrowth} unit="%" color="#f59e0b" />

            <div style={{ borderTop: "1px solid #1e293b", margin: "24px 0" }} />
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#34d399", marginBottom: 24 }}>▎ 投資設定</div>

            <SLIDER label="年間投資リターン" value={returnRate} min={3} max={12} step={0.5} onChange={setReturnRate} unit="%" color="#34d399" />
            <SLIDER label="シミュレーション期間" value={years} min={5} max={40} step={1} onChange={setYears} unit="年" color="#34d399" />
          </div>

          {/* Right: Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <CARD title={`${years}年後の資産（副業あり）`} value={fmtM(final.withSide)} sub={`副業なしの場合：${fmtM(final.noSide)}`} color="#34d399" icon="🏦" />
            <CARD title="副業による資産の上乗せ効果" value={`+${fmtM(final.diff)}`} sub={`${years}年間の複利効果込み`} color="#f59e0b" icon="⚡" />
            <CARD title={`${years}年後の副業月収`} value={fmtM(final.sideMonthly)} sub={`年間成長率 ${sideGrowth}% 継続の場合`} color="#38bdf8" icon="📈" />

            {/* FIRE判定 */}
            <div style={{
              background: fireYear > 0 ? "linear-gradient(135deg, #064e3b, #065f46)" : "linear-gradient(135deg, #1e1b4b, #1e293b)",
              border: fireYear > 0 ? "1px solid #34d39940" : "1px solid #334155",
              borderRadius: 16, padding: "18px 20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <span style={{ fontSize: 11, color: "#64748b", letterSpacing: "0.08em" }}>FIRE達成予測</span>
              </div>
              {fireYear > 0 ? (
                <>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#34d399" }}>{fireYear}年後</div>
                  <div style={{ fontSize: 11, color: "#6ee7b7", marginTop: 4 }}>目標資産 {fmtM(fireTarget)} 達成見込み</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8" }}>{years}年以内は難しい</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>副業成長率を上げるか期間を延ばしてみて</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: "linear-gradient(135deg, #0f172a, #0a1628)", border: "1px solid #1e293b", borderRadius: 20, padding: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#94a3b8", marginBottom: 24 }}>▎ 資産推移グラフ</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} tickFormatter={v => `${v}年`} />
              <YAxis stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#64748b", paddingTop: 16 }} />
              {fireYear > 0 && <ReferenceLine x={fireYear} stroke="#34d39950" strokeDasharray="4 4" label={{ value: "FIRE", fill: "#34d399", fontSize: 11 }} />}
              <Line type="monotone" dataKey="noSide" name="副業なし" stroke="#475569" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="withSide" name="副業あり" stroke="#34d399" strokeWidth={3} dot={false} strokeShadowColor="#34d399" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom note */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#334155", lineHeight: 1.8 }}>
          ※ 本シミュレーターは参考値です。実際の投資には元本割れリスクがあります。<br />
          副業収入の70%を追加投資に回す前提で計算しています。
        </div>
      </div>
    </div>
  );
}
