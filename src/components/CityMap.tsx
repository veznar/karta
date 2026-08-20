import { useEffect, useRef, useState } from "react";
import type { Filters, Report, Status } from "../types";
import {
  BUILDINGS,
  ROUTES,
  STATUS_META,
  STATUS_ORDER,
  TREES,
  categoryLabel,
} from "../data";
import { Icon, categoryPaths } from "./Icons";

const VB_W = 1000;
const VB_H = 640;

interface VB {
  x: number;
  y: number;
  w: number;
  h: number;
}

function clampVb(vb: VB): VB {
  const w = Math.min(VB_W, Math.max(240, vb.w));
  const h = (w * VB_H) / VB_W;
  return {
    w,
    h,
    x: Math.min(VB_W - w, Math.max(0, vb.x)),
    y: Math.min(VB_H - h, Math.max(0, vb.y)),
  };
}

const STREETS: { d: string; w: number; label?: string; lx?: number; ly?: number; rot?: number }[] = [
  { d: "M30 430 H970", w: 9, label: "ПРОСПЕКТ ЛЕНИНА", lx: 210, ly: 421 },
  { d: "M30 210 H628", w: 7, label: "УЛ. МИРА", lx: 300, ly: 201 },
  { d: "M30 300 H970", w: 7, label: "УЛ. ГАГАРИНА", lx: 262, ly: 291 },
  { d: "M30 560 L640 588", w: 8, label: "ЮЖНОЕ ШОССЕ", lx: 400, ly: 566, rot: 2.6 },
  { d: "M190 40 V620", w: 7, label: "УЛ. ПРОМЫШЛЕННАЯ", lx: 181, ly: 480, rot: -90 },
  { d: "M470 40 V620", w: 8, label: "УЛ. ЦЕНТРАЛЬНАЯ", lx: 461, ly: 560, rot: -90 },
  { d: "M840 160 V560", w: 6, label: "УЛ. РЕЧНАЯ", lx: 831, ly: 520, rot: -90 },
  { d: "M690 300 H970", w: 7, label: "УЛ. ЗАРЕЧНАЯ", lx: 780, ly: 291 },
];

const DISTRICT_PATCHES = [
  "M60 100 h280 v330 h-280 z",
  "M360 40 h260 v185 h-260 z",
  "M340 300 h300 v205 h-300 z",
  "M120 500 h420 v125 h-420 z",
  "M700 160 h270 v305 h-270 z",
];

export default function CityMap({
  reports,
  selectedId,
  onSelect,
  addMode,
  onPickPoint,
  filters,
  onToggleStatus,
  statusCounts,
  total,
}: {
  reports: Report[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  addMode: boolean;
  onPickPoint: (x: number, y: number) => void;
  filters: Filters;
  onToggleStatus: (s: Status) => void;
  statusCounts: Record<Status, number>;
  total: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ px: number; py: number; vx: number; vy: number; moved: boolean } | null>(null);

  const [vb, setVb] = useState<VB>({ x: 0, y: 0, w: VB_W, h: VB_H });
  const [hover, setHover] = useState<Report | null>(null);
  const [panning, setPanning] = useState(false);
  const [tip, setTip] = useState<{ left: number; top: number } | null>(null);

  /* колесо мыши — зум к курсору */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      const factor = e.deltaY > 0 ? 1.16 : 1 / 1.16;
      setVb((prev) => {
        const w = Math.min(VB_W, Math.max(240, prev.w * factor));
        const k = w / prev.w;
        return clampVb({
          w,
          h: (w * VB_H) / VB_W,
          x: p.x - (p.x - prev.x) * k,
          y: p.y - (p.y - prev.y) * k,
        });
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /* позиция тултипа */
  useEffect(() => {
    if (!hover) {
      setTip(null);
      return;
    }
    const raf = requestAnimationFrame(() => {
      const svg = svgRef.current;
      const cont = containerRef.current;
      if (!svg || !cont) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(hover.x, hover.y - 17).matrixTransform(ctm);
      const r = cont.getBoundingClientRect();
      setTip({ left: p.x - r.left, top: p.y - r.top });
    });
    return () => cancelAnimationFrame(raf);
  }, [hover, vb]);

  const zoomAt = (factor: number, ax = vb.x + vb.w / 2, ay = vb.y + vb.h / 2) => {
    setVb((prev) => {
      const w = Math.min(VB_W, Math.max(240, prev.w * factor));
      const k = w / prev.w;
      return clampVb({ w, h: (w * VB_H) / VB_W, x: ax - (ax - prev.x) * k, y: ay - (ay - prev.y) * k });
    });
  };

  const svgPointFromEvent = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: Math.min(975, Math.max(25, p.x)), y: Math.min(615, Math.max(25, p.y)) };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { px: e.clientX, py: e.clientY, vx: vb.x, vy: vb.y, moved: false };
    setPanning(true);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (!d.moved) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scale = vb.w / rect.width;
    setVb((prev) => clampVb({ ...prev, x: d.vx - dx * scale, y: d.vy - dy * scale }));
  };
  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    setPanning(false);
    if (d?.moved) return;
    if (addMode) {
      const p = svgPointFromEvent(e);
      if (p) onPickPoint(p.x, p.y);
    } else {
      onSelect(null);
    }
  };

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-[#e9efe6] ${addMode ? "addmode" : panning ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          dragRef.current = null;
          setPanning(false);
        }}
        onDoubleClick={(e) => {
          const p = svgPointFromEvent(e);
          if (p) zoomAt(1 / 1.5, p.x, p.y);
        }}
      >
        <defs>
          <filter id="mkShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#17251d" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* подложка */}
        <rect x="-200" y="-200" width={VB_W + 400} height={VB_H + 400} fill="#e9efe6" />

        {/* районы */}
        {DISTRICT_PATCHES.map((d, i) => (
          <path key={i} d={d} fill={i % 2 ? "#e5ecdf" : "#e3eadb"} stroke="#d7e1d0" strokeWidth="1" opacity="0.85" />
        ))}

        {/* лесополоса и парки */}
        <path
          d="M300 70 C340 44 420 38 470 52 C520 40 556 58 560 86 C562 116 530 142 480 146 C420 154 340 150 310 128 C290 112 286 88 300 70 Z"
          fill="#cfe3c5" stroke="#bcd8b0" strokeWidth="1.5"
        />
        <path
          d="M440 462 C470 448 560 448 588 470 C606 486 600 522 578 538 C548 556 470 556 448 538 C428 522 424 480 440 462 Z"
          fill="#cfe3c5" stroke="#bcd8b0" strokeWidth="1.5"
        />
        <ellipse cx="880" cy="428" rx="36" ry="26" fill="#cfe3c5" stroke="#bcd8b0" strokeWidth="1.5" />
        {TREES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5.5} fill="#b9d6ac" stroke="#a3c795" strokeWidth="1" />
        ))}

        {/* озеро */}
        <ellipse cx="210" cy="610" rx="52" ry="21" fill="#c2dde6" stroke="#a9cdd8" strokeWidth="1.5" />
        <text x="210" y="583" textAnchor="middle" className="water-label" fontSize="8.5">ОЗ. КРУГЛОЕ</text>

        {/* железная дорога */}
        <path d="M0 74 L1000 42" stroke="#c3cbbe" strokeWidth="3.4" strokeDasharray="11 7" fill="none" />
        <text x="120" y="58" className="map-label" fontSize="8" transform="rotate(-2 120 58)">ЖД ЛИНИЯ</text>

        {/* река */}
        <path d="M690 -20 C 640 110, 628 210, 690 310 C 748 405, 718 520, 752 660" stroke="#a9cdd8" strokeWidth="56" fill="none" strokeLinecap="round" />
        <path d="M690 -20 C 640 110, 628 210, 690 310 C 748 405, 718 520, 752 660" stroke="#c2dde6" strokeWidth="46" fill="none" strokeLinecap="round" />
        <text x="742" y="130" className="water-label" fontSize="10" transform="rotate(76 742 130)">Р. БЫСТРИЦА</text>

        {/* улицы */}
        {STREETS.map((s, i) => (
          <g key={i}>
            <path d={s.d} stroke="#d9e3d3" strokeWidth={s.w + 3.5} fill="none" strokeLinecap="round" />
            <path d={s.d} stroke="#fbfdf9" strokeWidth={s.w} fill="none" strokeLinecap="round" />
            {s.label && (
              <text
                x={s.lx}
                y={s.ly}
                className="map-label"
                fontSize="8.5"
                transform={s.rot ? `rotate(${s.rot} ${s.lx} ${s.ly})` : undefined}
              >
                {s.label}
              </text>
            )}
          </g>
        ))}

        {/* маршруты патрулей */}
        {ROUTES.map((pts, i) => (
          <polyline
            key={i}
            points={pts}
            className="route"
            fill="none"
            stroke="#2aa763"
            strokeWidth="2.4"
            opacity="0.5"
            strokeLinecap="round"
          />
        ))}

        {/* здания */}
        {BUILDINGS.map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} rx="1.5" fill="#dce5d6" stroke="#c9d6c3" strokeWidth="0.9" />
        ))}

        {/* подписи районов */}
        {[
          ["ЗАВОДСКОЙ", 132, 118],
          ["СЕВЕРНЫЙ", 318, 182],
          ["ЦЕНТРАЛЬНЫЙ", 330, 370],
          ["ЗАРЕЧНЫЙ", 766, 168],
          ["ЮЖНЫЙ", 292, 505],
        ].map(([t, x, y], i) => (
          <text key={i} x={x as number} y={y as number} className="district-label" fontSize="13.5">
            {t as string}
          </text>
        ))}

        {/* компас */}
        <g transform="translate(952, 92)" opacity="0.75">
          <circle r="16" fill="#f2f6ef" stroke="#c9d6c3" strokeWidth="1.2" />
          <path d="M0 -10 L4 4 L0 1 L-4 4 Z" fill="#5d7265" />
          <text y="-19" textAnchor="middle" className="map-label" fontSize="8">С</text>
        </g>

        {/* маркеры */}
        {reports.map((r) => {
          const m = STATUS_META[r.status];
          const isSel = r.id === selectedId;
          return (
            <g
              key={r.id}
              className="mk"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(r.id);
              }}
              onMouseEnter={() => setHover(r)}
              onMouseLeave={() => setHover((h) => (h?.id === r.id ? null : h))}
            >
              {r.status === "new" && <circle className="mk-pulse" cx={r.x} cy={r.y} r="13" fill={m.color} />}
              {isSel && (
                <circle cx={r.x} cy={r.y} r="19" fill="none" stroke={m.color} strokeWidth="2" strokeDasharray="4 5" />
              )}
              <ellipse cx={r.x} cy={r.y + 13.5} rx="7" ry="2.6" fill="#17251d" opacity="0.18" />
              <circle cx={r.x} cy={r.y} r="12.5" fill={m.color} stroke="#ffffff" strokeWidth="2.6" filter="url(#mkShadow)" />
              <g
                transform={`translate(${r.x - 7}, ${r.y - 7}) scale(0.583)`}
                stroke="#ffffff"
                strokeWidth="2.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {categoryPaths(r.category)}
              </g>
            </g>
          );
        })}

        {/* выбранный маркер поверх */}
        {selected && (
          <circle cx={selected.x} cy={selected.y} r="26" fill="none" stroke={STATUS_META[selected.status].color} strokeWidth="1.4" opacity="0.5" />
        )}
      </svg>

      {/* чипы-фильтры по статусам */}
      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5 max-w-[calc(100%-6.5rem)]">
        <span className="flex items-center gap-1.5 rounded-lg bg-pine-950/90 px-2.5 py-1.5 font-mono text-[10.5px] font-bold text-mist-50 shadow-md backdrop-blur-sm">
          <Icon name="pin" className="w-3 h-3 text-leaf-400" />
          ВСЕГО {total}
        </span>
        {STATUS_ORDER.map((s) => {
          const on = filters.statuses.includes(s);
          const m = STATUS_META[s];
          return (
            <button
              key={s}
              onClick={() => onToggleStatus(s)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10.5px] font-bold shadow-md backdrop-blur-sm transition-all ${
                on ? "bg-pine-950/90 text-mist-50" : "bg-white/70 text-ink-500 opacity-70 hover:opacity-100"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: on ? m.color : "#c9d6c4", border: on ? "none" : `1.5px solid ${m.color}` }}
              />
              {m.label.toUpperCase()} {statusCounts[s]}
            </button>
          );
        })}
      </div>

      {/* зум */}
      <div className="absolute bottom-4 right-3 flex flex-col overflow-hidden rounded-xl border border-mist-300 bg-white shadow-lg">
        <button onClick={() => zoomAt(1 / 1.35)} className="grid h-9 w-9 place-items-center text-ink-700 transition-colors hover:bg-mist-100 active:bg-mist-200" title="Приблизить">
          <Icon name="plus" className="w-4 h-4" />
        </button>
        <button onClick={() => zoomAt(1.35)} className="grid h-9 w-9 place-items-center border-y border-mist-200 text-ink-700 transition-colors hover:bg-mist-100 active:bg-mist-200" title="Отдалить">
          <Icon name="minus" className="w-4 h-4" />
        </button>
        <button onClick={() => setVb({ x: 0, y: 0, w: VB_W, h: VB_H })} className="grid h-9 w-9 place-items-center text-ink-700 transition-colors hover:bg-mist-100 active:bg-mist-200" title="Показать весь город">
          <Icon name="target" className="w-4 h-4" />
        </button>
      </div>

      {/* масштаб и кредиты */}
      <div className="absolute bottom-4 left-3 hidden sm:flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="h-[3px] w-16 border-x border-b border-ink-500/60" />
          <span className="font-mono text-[9px] font-bold text-ink-500">200 м</span>
        </div>
        <span className="font-mono text-[8.5px] tracking-[0.12em] text-ink-400">
          © ЧИСТОГРАД · СХЕМАТИЧЕСКАЯ КАРТА
        </span>
      </div>

      {/* подсказка режима добавления */}
      {addMode && (
        <div className="anim-pop absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-pine-950/95 px-4 py-2.5 text-mist-50 shadow-xl border border-pine-700">
          <span className="relative grid place-items-center">
            <Icon name="pin" className="w-4.5 h-4.5 text-st-new" />
            <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-st-new live-dot" />
          </span>
          <span className="text-[12.5px] font-semibold whitespace-nowrap">
            Кликните место свалки на карте
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-mist-400">ESC — отмена</span>
        </div>
      )}

      {/* пусто по фильтрам */}
      {reports.length === 0 && !addMode && (
        <div className="anim-pop absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/95 px-5 py-4 text-center shadow-lg border border-mist-200">
          <Icon name="filter" className="w-5 h-5 mx-auto text-ink-400" />
          <p className="mt-2 text-[13px] font-semibold text-ink-700">Нет заявок по выбранным фильтрам</p>
          <p className="text-[11.5px] text-ink-500">Ослабьте условия в панели слева</p>
        </div>
      )}

      {/* тултип */}
      {hover && tip && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full"
          style={{ left: tip.left, top: tip.top - 6 }}
        >
          <div className="rounded-lg bg-pine-950/95 px-3 py-2 shadow-xl backdrop-blur-sm border border-pine-700">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10.5px] font-bold text-leaf-400">ЧГ-{hover.num}</span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_META[hover.status].color }} />
              <span className="font-mono text-[9.5px] font-bold uppercase" style={{ color: STATUS_META[hover.status].color }}>
                {STATUS_META[hover.status].label}
              </span>
            </div>
            <div className="mt-0.5 text-[11.5px] font-semibold text-mist-50">{categoryLabel(hover.category)}</div>
            <div className="max-w-[200px] truncate text-[10.5px] text-mist-300">
              {hover.district} · {hover.address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
