// Small dependency-free SVG charts used by the dashboard preview.

export function AreaChart({ labels = [], series = [], height = 240 }) {
  const w = 640;
  const h = height;
  const pad = { top: 18, right: 16, bottom: 28, left: 16 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const allValues = series.flatMap((s) => s.data);
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;

  const pointsFor = (data) =>
    data.map((v, i) => {
      const x = pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
      const y = pad.top + innerH - ((v - min) / range) * innerH;
      return [x, y];
    });

  const linePath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => pad.top + innerH * t);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={i} id={`areaGrad${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {gridLines.map((y, i) => (
        <line key={i} x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="var(--border-color)" strokeWidth="1" />
      ))}

      {series.map((s, i) => {
        const pts = pointsFor(s.data);
        const line = linePath(pts);
        const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${pad.top + innerH} L${pts[0][0].toFixed(1)},${pad.top + innerH} Z`;
        return (
          <g key={i}>
            {i === 0 && <path d={area} fill={`url(#areaGrad${i})`} />}
            <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, j) => (
              <circle key={j} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        );
      })}

      {labels.map((label, i) => {
        const x = pad.left + (labels.length === 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
        return (
          <text key={i} x={x} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export function DonutChart({ segments = [], size = 168 }) {
  const r = 56;
  const stroke = 18;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  const arcs = segments.map((seg, i) => {
    const len = (seg.value / total) * c;
    const offset = segments
      .slice(0, i)
      .reduce((sum, prev) => sum + (prev.value / total) * c, 0);
    return { ...seg, dash: len, gap: c - len, offset };
  });

  return (
    <svg viewBox="0 0 160 160" style={{ width: size, height: size }}>
      <g transform="rotate(-90 80 80)">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--bg-muted)" strokeWidth={stroke} />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={stroke}
            strokeDasharray={`${a.dash} ${a.gap}`}
            strokeDashoffset={-a.offset}
            strokeLinecap="butt"
          />
        ))}
      </g>
      <text x="80" y="74" textAnchor="middle" fontSize="26" fontWeight="800" fill="var(--text-primary)">
        {total.toLocaleString()}
      </text>
      <text x="80" y="94" textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
        Total
      </text>
    </svg>
  );
}
