import type { Report } from "../types";
import { STATUS_META, categoryLabel, timeAgo } from "../data";
import { CategoryGlyph, Icon } from "./Icons";
import { StatusBadge } from "./ReportDrawer";

export default function ReportsList({
  reports,
  totalAll,
  onSelect,
  onResetFilters,
}: {
  reports: Report[];
  totalAll: number;
  onSelect: (id: string) => void;
  onResetFilters: () => void;
}) {
  const exportCsv = () => {
    const rows = [
      ["Номер", "Статус", "Район", "Адрес", "Тип", "Описание", "Автор", "Исполнитель", "Создана", "Обновлена"],
      ...reports.map((r) => [
        `ЧГ-${r.num}`,
        STATUS_META[r.status].label,
        r.district,
        r.address,
        categoryLabel(r.category),
        r.description.replace(/[\n;]/g, " "),
        r.author,
        r.assignee ?? "—",
        new Date(r.createdAt).toLocaleString("ru-RU"),
        new Date(r.updatedAt).toLocaleString("ru-RU"),
      ]),
    ];
    const csv =
      "\uFEFF" +
      rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chistograd-reestr.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-ink-400">ЕДИНЫЙ РЕЕСТР</div>
            <h1 className="mt-1 font-display text-[26px] font-extrabold leading-none text-ink-900 sm:text-[30px]">
              Заявки на устранение
            </h1>
            <p className="mt-2 text-[13px] text-ink-500">
              Показано <b className="text-ink-900">{reports.length}</b> из {totalAll} · сортировка по последнему обновлению
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-lg border border-mist-300 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-ink-700 shadow-sm transition-all hover:-translate-y-px hover:border-leaf-600 hover:text-leaf-700 hover:shadow"
          >
            <Icon name="download" className="w-4 h-4" /> Экспорт CSV
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="anim-pop mt-16 mx-auto max-w-sm rounded-xl border border-mist-200 bg-white px-6 py-10 text-center">
            <Icon name="filter" className="mx-auto w-6 h-6 text-ink-400" />
            <p className="mt-3 text-[14px] font-bold text-ink-900">Ничего не найдено</p>
            <p className="mt-1 text-[12.5px] text-ink-500">По выбранным фильтрам заявок нет. Попробуйте расширить условия.</p>
            <button
              onClick={onResetFilters}
              className="mt-4 rounded-lg bg-pine-900 px-4 py-2 text-[12.5px] font-bold text-mist-50 transition-colors hover:bg-pine-800"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reports.map((r, i) => {
              const m = STATUS_META[r.status];
              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className="reveal group relative overflow-hidden rounded-xl border border-mist-200 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-mist-300 hover:shadow-lg"
                  style={{ animationDelay: `${Math.min(i * 45, 500)}ms`, borderLeft: `4px solid ${m.color}` }}
                >
                  <div className="flex items-center gap-2 px-4 pt-3.5">
                    <span className="font-mono text-[12px] font-bold text-pine-800">ЧГ-{r.num}</span>
                    <StatusBadge status={r.status} size="sm" />
                    <span className="ml-auto font-mono text-[9.5px] text-ink-400">{timeAgo(r.updatedAt)}</span>
                  </div>
                  <div className="px-4 pt-2.5">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
                      <CategoryGlyph id={r.category} className="w-4 h-4 text-leaf-600" />
                      {categoryLabel(r.category)}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-ink-500">
                      <Icon name="pin" className="w-3 h-3 shrink-0" />
                      <span className="truncate">{r.district} · {r.address}</span>
                    </div>
                  </div>
                  <p className="mt-2 px-4 text-[12px] leading-relaxed text-ink-500 line-clamp-2">{r.description}</p>
                  <div className="mt-3 flex items-center gap-3 border-t border-mist-100 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-500">
                      <Icon name="user" className="w-3 h-3" /> {r.author}
                    </span>
                    {r.assignee && (
                      <span className="flex items-center gap-1.5 truncate text-[10.5px] font-semibold text-st-work">
                        <Icon name="truck" className="w-3 h-3 shrink-0" /> {r.assignee}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-2 text-ink-400">
                      {r.photoBefore && <Icon name="camera" className="w-3 h-3" />}
                      <span className="flex items-center gap-1 text-[10.5px] font-semibold">
                        <Icon name="chat" className="w-3 h-3" /> {r.comments.length}
                      </span>
                      <Icon name="arrowRight" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:text-leaf-600" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
