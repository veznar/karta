import { useEffect, useRef, useState } from "react";
import type { Report } from "../types";
import {
  CATEGORIES,
  DISTRICTS,
  STATUS_META,
  STATUS_ORDER,
  fmtDay,
  plural,
} from "../data";
import { CategoryGlyph, Icon } from "./Icons";

function useCountUp(target: number) {
  const [val, setVal] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    const from = ref.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 680);
      const e = 1 - Math.pow(1 - k, 3);
      setVal(from + (target - from) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else ref.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

function Kpi({
  label,
  value,
  suffix,
  sub,
  icon,
  tone,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  sub: string;
  icon: React.ReactNode;
  tone: string;
  delay: number;
}) {
  const v = useCountUp(value);
  const shown = suffix === "дн" ? v.toFixed(1) : String(Math.round(v));
  return (
    <div
      className="reveal relative overflow-hidden rounded-xl border border-mist-200 bg-white p-4 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg ${tone}`}>{icon}</div>
      <div className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">{label}</div>
      <div className="mt-1.5 font-display text-[32px] font-extrabold leading-none text-ink-900 tabular-nums">
        {shown}
        {suffix && suffix !== "дн" && <span className="text-[18px] text-ink-400"> {suffix}</span>}
        {suffix === "дн" && <span className="text-[15px] font-bold text-ink-400"> дн</span>}
      </div>
      <div className="mt-1.5 text-[11.5px] font-medium text-ink-500">{sub}</div>
    </div>
  );
}

export default function StatsView({ reports }: { reports: Report[] }) {
  const total = reports.length;
  const byStatus = STATUS_ORDER.map((s) => ({ s, n: reports.filter((r) => r.status === s).length }));
  const doneN = byStatus.find((b) => b.s === "done")?.n ?? 0;
  const activeN =
    (byStatus.find((b) => b.s === "new")?.n ?? 0) + (byStatus.find((b) => b.s === "work")?.n ?? 0);
  const doneList = reports.filter((r) => r.status === "done" && r.resolvedAt);
  const avgDays = doneList.length
    ? doneList.reduce((a, r) => a + ((r.resolvedAt as number) - r.createdAt) / 864e5, 0) / doneList.length
    : 0;
  const rate = total ? Math.round((doneN / total) * 100) : 0;

  /* донат */
  const R = 52;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const segs = byStatus.map(({ s, n }) => {
    const frac = total ? n / total : 0;
    const seg = { s, n, frac, offset: acc };
    acc += frac;
    return seg;
  });

  /* по районам и типам */
  const byDistrict = DISTRICTS.map((d) => ({
    name: d.name,
    n: reports.filter((r) => r.district === d.name).length,
  })).sort((a, b) => b.n - a.n);
  const maxDistrict = Math.max(1, ...byDistrict.map((d) => d.n));

  const byCat = CATEGORIES.map((c) => ({
    ...c,
    n: reports.filter((r) => r.category === c.id).length,
  })).sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...byCat.map((c) => c.n));

  /* недели */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = today.getTime() - (7 - i) * 7 * 864e5;
    return {
      start,
      n: reports.filter((r) => r.createdAt >= start && r.createdAt < start + 7 * 864e5).length,
    };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.n));

  /* исполнители */
  const orgs = [...new Set(reports.filter((r) => r.assignee).map((r) => r.assignee as string))];
  const board = orgs
    .map((o) => ({
      o,
      done: reports.filter((r) => r.assignee === o && r.status === "done").length,
      all: reports.filter((r) => r.assignee === o).length,
    }))
    .sort((a, b) => b.done - a.done);
  const maxOrg = Math.max(1, ...board.map((b) => b.done));

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-400">АНАЛИТИКА</div>
            <h1 className="mt-1 font-display text-[26px] font-extrabold leading-none text-ink-900 sm:text-[30px]">
              Статистика по городу
            </h1>
          </div>
          <span className="flex items-center gap-2 rounded-lg border border-mist-300 bg-white px-3 py-2 font-mono text-[10.5px] font-bold text-ink-500">
            <span className="w-1.5 h-1.5 rounded-full bg-leaf-500 live-dot" />
            ОБНОВЛЯЕТСЯ В РЕАЛЬНОМ ВРЕМЕНИ
          </span>
        </div>

        {/* KPI */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="ВСЕГО ЗАЯВОК" value={total} sub="за всё время наблюдения" tone="bg-pine-900 text-mist-50" icon={<Icon name="pin" className="w-4 h-4" />} delay={0} />
          <Kpi label="ТРЕБУЮТ РЕАКЦИИ" value={activeN} sub="новые и в работе" tone="bg-st-new-soft text-st-new" icon={<Icon name="alert" className="w-4 h-4" />} delay={60} />
          <Kpi label="УСТРАНЕНО" value={rate} suffix="%" sub={`${doneN} ${plural(doneN, ["свалка", "свалки", "свалок"])} ликвидировано`} tone="bg-st-done-soft text-st-done" icon={<Icon name="checkCircle" className="w-4 h-4" />} delay={120} />
          <Kpi label="СРЕДНИЙ СРОК" value={avgDays} suffix="дн" sub="от заявки до отчёта" tone="bg-st-work-soft text-st-work" icon={<Icon name="clock" className="w-4 h-4" />} delay={180} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          {/* донат */}
          <section className="reveal rounded-xl border border-mist-200 bg-white p-5 shadow-sm lg:col-span-2" style={{ animationDelay: "120ms" }}>
            <h2 className="font-display text-[13px] font-extrabold text-ink-900">Статусы заявок</h2>
            <div className="mt-4 flex items-center gap-6">
              <div className="relative shrink-0">
                <svg viewBox="0 0 140 140" className="w-[150px] h-[150px] -rotate-90">
                  <circle cx="70" cy="70" r={R} fill="none" stroke="#edf2ea" strokeWidth="17" />
                  {segs.map(
                    ({ s, n, frac, offset }) =>
                      n > 0 && (
                        <circle
                          key={s}
                          cx="70"
                          cy="70"
                          r={R}
                          fill="none"
                          stroke={STATUS_META[s].color}
                          strokeWidth="17"
                          strokeDasharray={`${Math.max(frac * C - 2.5, 0.5)} ${C}`}
                          strokeDashoffset={-offset * C}
                          className="transition-all duration-700"
                        />
                      )
                  )}
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center rotate-0">
                    <div className="font-display text-[26px] font-extrabold leading-none text-ink-900">{total}</div>
                    <div className="font-mono text-[8.5px] tracking-[0.18em] text-ink-400">ЗАЯВОК</div>
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-2">
                {segs.map(({ s, n }) => (
                  <li key={s} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: STATUS_META[s].color }} />
                    <span className="font-semibold text-ink-700">{STATUS_META[s].label}</span>
                    <span className="ml-auto font-mono text-[11.5px] font-bold text-ink-900">{n}</span>
                    <span className="font-mono text-[10px] text-ink-400 w-9 text-right">
                      {total ? Math.round((n / total) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* динамика */}
          <section className="reveal rounded-xl border border-mist-200 bg-white p-5 shadow-sm lg:col-span-3" style={{ animationDelay: "180ms" }}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[13px] font-extrabold text-ink-900">Новые заявки по неделям</h2>
              <span className="font-mono text-[10px] text-ink-400">8 недель</span>
            </div>
            <div className="mt-5 flex h-[150px] items-end gap-2 sm:gap-3">
              {weeks.map((w, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5" title={`${fmtDay(w.start)}: ${w.n}`}>
                  <span className={`font-mono text-[10px] font-bold ${w.n ? "text-ink-700" : "text-ink-400"}`}>{w.n || ""}</span>
                  <div
                    className={`anim-grow w-full max-w-[46px] rounded-t-md ${i === weeks.length - 1 ? "bg-leaf-600" : "bg-leaf-500/45"}`}
                    style={{ height: `${Math.max(4, (w.n / maxWeek) * 100)}%`, animationDelay: `${i * 60}ms` }}
                  />
                  <span className="font-mono text-[8.5px] text-ink-400">{fmtDay(w.start)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {/* районы */}
          <section className="reveal rounded-xl border border-mist-200 bg-white p-5 shadow-sm" style={{ animationDelay: "240ms" }}>
            <h2 className="font-display text-[13px] font-extrabold text-ink-900">По районам</h2>
            <ul className="mt-4 space-y-3">
              {byDistrict.map((d, i) => (
                <li key={d.name}>
                  <div className="flex items-baseline justify-between text-[12.5px]">
                    <span className="font-semibold text-ink-700">{d.name}</span>
                    <span className="font-mono text-[11.5px] font-bold text-ink-900">{d.n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className="anim-grow h-full rounded-full bg-pine-800"
                      style={{ width: `${(d.n / maxDistrict) * 100}%`, animationDelay: `${i * 70}ms`, opacity: 0.55 + (d.n / maxDistrict) * 0.45 }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* типы */}
          <section className="reveal rounded-xl border border-mist-200 bg-white p-5 shadow-sm" style={{ animationDelay: "300ms" }}>
            <h2 className="font-display text-[13px] font-extrabold text-ink-900">По типам отходов</h2>
            <ul className="mt-4 space-y-3">
              {byCat.map((c, i) => (
                <li key={c.id}>
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <CategoryGlyph id={c.id} className="w-3.5 h-3.5 text-leaf-600" />
                    <span className="font-semibold text-ink-700">{c.label}</span>
                    <span className="ml-auto font-mono text-[11.5px] font-bold text-ink-900">{c.n}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist-100">
                    <div
                      className="anim-grow h-full rounded-full bg-leaf-500"
                      style={{ width: `${(c.n / maxCat) * 100}%`, animationDelay: `${i * 70}ms`, opacity: 0.5 + (c.n / maxCat) * 0.5 }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* исполнители */}
        <section className="reveal mt-4 rounded-xl border border-mist-200 bg-white p-5 shadow-sm" style={{ animationDelay: "340ms" }}>
          <h2 className="font-display text-[13px] font-extrabold text-ink-900">Рейтинг служб</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {board.map((b, i) => (
              <div key={b.o} className="rounded-xl border border-mist-200 bg-mist-50 p-4">
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-8 w-8 place-items-center rounded-lg font-display text-[13px] font-extrabold ${i === 0 ? "bg-leaf-600 text-white" : "bg-pine-900 text-mist-50"}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-bold text-ink-900">{b.o}</div>
                    <div className="font-mono text-[10px] text-ink-400">всего заявок: {b.all}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist-200">
                    <div className="anim-grow h-full rounded-full bg-leaf-500" style={{ width: `${(b.done / maxOrg) * 100}%`, animationDelay: `${i * 80}ms` }} />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-leaf-700">{b.done} <span className="text-ink-400 font-medium">устранено</span></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-5 pb-2 text-center font-mono text-[9.5px] tracking-[0.14em] text-ink-400">
          ДАННЫЕ ДЕМО-СЕРВИСА · ЧИСТОГРАД · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
