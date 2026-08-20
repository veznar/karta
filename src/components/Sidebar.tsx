import type { Filters, Report, View } from "../types";
import {
  CATEGORIES,
  DEFAULT_FILTERS,
  DISTRICTS,
  STATUS_META,
  STATUS_ORDER,
  fmtDay,
  plural,
} from "../data";
import { CategoryGlyph, Icon } from "./Icons";

export default function Sidebar({
  open,
  onClose,
  filters,
  onChange,
  reports,
  visibleCount,
  onOpenView,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  reports: Report[];
  visibleCount: number;
  onOpenView: (v: View) => void;
}) {
  const byStatus = STATUS_ORDER.map((s) => ({
    s,
    n: reports.filter((r) => r.status === s).length,
  }));
  const active =
    reports.filter((r) => r.status === "new" || r.status === "work").length;
  const done = reports.filter((r) => r.status === "done");
  const avgDays = done.length
    ? done.reduce(
        (a, r) => a + ((r.resolvedAt ?? r.updatedAt) - r.createdAt) / 864e5,
        0
      ) / done.length
    : 0;

  // последние 14 дней — новые заявки
  const days14 = Array.from({ length: 14 }, (_, i) => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const start = dayStart.getTime() - (13 - i) * 864e5;
    return {
      start,
      n: reports.filter(
        (r) => r.createdAt >= start && r.createdAt < start + 864e5
      ).length,
    };
  });
  const maxDay = Math.max(1, ...days14.map((d) => d.n));

  const toggleStatus = (s: (typeof STATUS_ORDER)[number]) => {
    const has = filters.statuses.includes(s);
    onChange({
      ...filters,
      statuses: has
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    });
  };
  const toggleCat = (c: (typeof CATEGORIES)[number]["id"]) => {
    const has = filters.categories.includes(c);
    onChange({
      ...filters,
      categories: has
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c],
    });
  };

  const isDefault =
    filters.statuses.length === 4 &&
    filters.categories.length === 6 &&
    filters.district === "all";

  const body = (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* бренд */}
      <div className="px-5 pt-5 pb-4 border-b border-pine-800">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-leaf-600 text-pine-950">
            <Icon name="leaf" className="w-5.5 h-5.5" strokeWidth={2} />
          </span>
          <div>
            <div className="font-display text-lg font-extrabold leading-none text-mist-50">
              ЧИСТО<span className="text-leaf-400">ГРАД</span>
            </div>
            <div className="font-mono text-[9.5px] tracking-[0.18em] text-mist-400 mt-1">
              ЕДИНАЯ ДИСПЕТЧЕРСКАЯ
            </div>
          </div>
        </div>
        <p className="mt-3.5 text-[12px] leading-relaxed text-mist-300">
          Жители отмечают свалки на карте, службы устраняют и отчитываются —
          каждый шаг виден в общем реестре.
        </p>
      </div>

      {/* статусы */}
      <div className="px-5 py-4 border-b border-pine-800">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-mist-400">
            СТАТУСЫ
          </h3>
          <span className="font-mono text-[10.5px] text-mist-400">
            видно {visibleCount} из {reports.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {byStatus.map(({ s, n }) => {
            const on = filters.statuses.includes(s);
            const m = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                  on
                    ? "border-pine-700 bg-pine-850 hover:bg-pine-800"
                    : "border-transparent bg-pine-900/60 opacity-45 hover:opacity-75"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: m.color }}
                />
                <span className="min-w-0">
                  <span className="block text-[11.5px] font-semibold text-mist-100 leading-tight">
                    {m.label}
                  </span>
                  <span className="font-mono text-[10px] text-mist-400">{n}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* категории */}
      <div className="px-5 py-4 border-b border-pine-800">
        <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-mist-400 mb-2.5">
          ТИП ОТХОДОВ
        </h3>
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => {
            const on = filters.categories.includes(c.id);
            const n = reports.filter((r) => r.category === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => toggleCat(c.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-all ${
                  on ? "text-mist-100 hover:bg-pine-850" : "text-mist-400 opacity-50 hover:opacity-80"
                }`}
              >
                <CategoryGlyph id={c.id} className="w-4 h-4 shrink-0 text-leaf-400" />
                <span className="flex-1 text-[12.5px] font-medium">{c.label}</span>
                <span className="font-mono text-[10.5px] text-mist-400">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* район */}
      <div className="px-5 py-4 border-b border-pine-800">
        <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-mist-400 mb-2.5">
          РАЙОН
        </h3>
        <select
          value={filters.district}
          onChange={(e) => onChange({ ...filters, district: e.target.value })}
          className="w-full rounded-lg border border-pine-700 bg-pine-850 px-3 py-2 text-[12.5px] font-medium text-mist-100 outline-none focus:border-leaf-500 transition-colors"
        >
          <option value="all">Все районы</option>
          {DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        {!isDefault && (
          <button
            onClick={() => onChange({ ...DEFAULT_FILTERS })}
            className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-leaf-400 hover:text-leaf-500 transition-colors"
          >
            <Icon name="undo" className="w-3.5 h-3.5" />
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* оперативная сводка */}
      <div className="px-5 py-4 border-b border-pine-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-leaf-400 live-dot" />
          <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-mist-400">
            ОПЕРАТИВНАЯ СВОДКА
          </h3>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display text-[34px] font-extrabold leading-none text-mist-50">
              {active}
            </div>
            <div className="text-[11px] text-mist-400 mt-1">
              {plural(active, ["заявка", "заявки", "заявок"])} в работе и новых
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[15px] font-bold text-leaf-400">
              {avgDays.toFixed(1)} дн
            </div>
            <div className="text-[10px] text-mist-400">среднее устранение</div>
          </div>
        </div>
        <div className="mt-3 flex items-end gap-[3px] h-9">
          {days14.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${fmtDay(d.start)}: ${d.n}`}>
              <div
                className={`w-full rounded-sm transition-all ${d.n ? "bg-leaf-500" : "bg-pine-800"}`}
                style={{ height: `${Math.max(12, (d.n / maxDay) * 100)}%`, opacity: d.n ? 0.45 + (d.n / maxDay) * 0.55 : 1 }}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-mist-400">
          <span>{fmtDay(days14[0].start)}</span>
          <span>новые заявки · 14 дней</span>
          <span>{fmtDay(days14[13].start)}</span>
        </div>
        <button
          onClick={() => { onOpenView("stats"); onClose(); }}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-pine-700 bg-pine-850 px-3 py-2 text-[12px] font-semibold text-mist-100 hover:border-leaf-600 hover:text-leaf-400 transition-colors"
        >
          Подробная статистика
          <Icon name="arrowRight" className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* как это работает */}
      <div className="px-5 py-4 mt-auto">
        <h3 className="font-mono text-[10.5px] font-bold tracking-[0.2em] text-mist-400 mb-2.5">
          КАК ЭТО РАБОТАЕТ
        </h3>
        <ol className="space-y-2.5">
          {[
            "Житель кликает по карте — свалка получает номер и метку",
            "Служба берёт заявку в работу и выезжает на место",
            "После уборки служба прикладывает фотоотчёт — статус «Устранена»",
          ].map((t, i) => (
            <li key={i} className="flex gap-2.5 text-[11.5px] leading-snug text-mist-300">
              <span className="grid place-items-center w-5 h-5 shrink-0 rounded-full bg-pine-800 font-mono text-[10px] font-bold text-leaf-400">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-4 font-mono text-[9.5px] text-mist-400/70">
          демо-данные · хранятся локально в браузере
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* desktop */}
      <aside className="hidden lg:block w-[300px] shrink-0 bg-pine-900 text-mist-100 border-r border-pine-800">
        {body}
      </aside>
      {/* mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-pine-950/60" onClick={onClose} />
          <aside className="anim-drawer-left absolute left-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-pine-900 text-mist-100 border-r border-pine-800">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-md p-2 text-mist-300 hover:bg-pine-800"
              aria-label="Закрыть"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}
