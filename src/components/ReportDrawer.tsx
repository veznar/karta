import { useEffect, useState } from "react";
import type { Report, Role } from "../types";
import { ORGANIZATIONS, STATUS_META, categoryLabel, fmtDate, timeAgo } from "../data";
import { CategoryGlyph, Icon, type IconName } from "./Icons";

export function StatusBadge({ status, size = "md" }: { status: Report["status"]; size?: "sm" | "md" }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-bold uppercase tracking-wide ${
        size === "sm" ? "px-2 py-0.5 text-[9.5px]" : "px-2.5 py-1 text-[10.5px]"
      }`}
      style={{ background: m.soft, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

const TL_ICON: Record<string, { icon: IconName; cls: string }> = {
  created: { icon: "pin", cls: "bg-mist-200 text-ink-700" },
  work: { icon: "wrench", cls: "bg-st-work-soft text-st-work" },
  done: { icon: "checkCircle", cls: "bg-st-done-soft text-st-done" },
  rejected: { icon: "xCircle", cls: "bg-danger-soft text-danger" },
  reopened: { icon: "undo", cls: "bg-amber-soft text-amber-deep" },
};

const ROLE_TAG: Record<Role, { label: string; cls: string }> = {
  resident: { label: "житель", cls: "bg-mist-200 text-ink-700" },
  service: { label: "служба", cls: "bg-st-work-soft text-st-work" },
  admin: { label: "админ", cls: "bg-pine-900 text-mist-100" },
};

type FormMode = null | "resolve" | "reject" | "org-take" | "org-reassign";

export default function ReportDrawer({
  report,
  role,
  userName,
  onClose,
  onTake,
  onResolve,
  onReject,
  onReopen,
  onWithdraw,
  onReassign,
  onComment,
}: {
  report: Report | null;
  role: Role;
  userName: string;
  onClose: () => void;
  onTake: (id: string, org: string) => void;
  onResolve: (id: string, note: string, withPhoto: boolean) => void;
  onReject: (id: string, reason: string) => void;
  onReopen: (id: string) => void;
  onWithdraw: (id: string) => void;
  onReassign: (id: string, org: string) => void;
  onComment: (id: string, text: string) => void;
}) {
  const [mode, setMode] = useState<FormMode>(null);
  const [text, setText] = useState("");
  const [org, setOrg] = useState(ORGANIZATIONS[0]);
  const [withPhoto, setWithPhoto] = useState(true);
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setMode(null);
    setText("");
    setComment("");
    setErr("");
    setOrg(ORGANIZATIONS[0]);
    setWithPhoto(true);
  }, [report?.id]);

  if (!report) return null;
  const r = report;

  const canTake = (role === "service" || role === "admin") && r.status === "new";
  const canResolve = (role === "service" || role === "admin") && r.status === "work";
  const canReject = role === "admin" && (r.status === "new" || r.status === "work");
  const canReopen = role === "admin" && r.status === "rejected";
  const canWithdraw = role === "resident" && r.author === userName && r.status === "new";

  const submitForm = () => {
    if (mode === "resolve") {
      if (text.trim().length < 10) return setErr("Опишите выполненные работы (минимум 10 символов)");
      onResolve(r.id, text.trim(), withPhoto);
      setMode(null);
    } else if (mode === "reject") {
      if (text.trim().length < 5) return setErr("Укажите причину отклонения");
      onReject(r.id, text.trim());
      setMode(null);
    } else if (mode === "org-take") {
      onTake(r.id, org);
      setMode(null);
    } else if (mode === "org-reassign") {
      onReassign(r.id, org);
      setMode(null);
    }
    setErr("");
    setText("");
  };

  const sendComment = () => {
    const t = comment.trim();
    if (!t) return;
    onComment(r.id, t);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-pine-950/35" onClick={onClose} />
      <aside className="anim-drawer absolute right-0 top-0 bottom-0 flex w-full flex-col bg-mist-50 shadow-2xl sm:w-[440px] sm:border-l sm:border-mist-300">
        {/* шапка */}
        <div className="flex items-center gap-3 border-b border-mist-200 bg-white px-5 py-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] font-bold text-pine-800">ЧГ-{r.num}</span>
              <StatusBadge status={r.status} size="sm" />
            </div>
            <div className="mt-0.5 text-[11px] text-ink-500">
              создана {fmtDate(r.createdAt)} · {timeAgo(r.createdAt)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-ink-500 transition-colors hover:bg-mist-100 hover:text-ink-900"
            aria-label="Закрыть"
          >
            <Icon name="close" className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* фотофиксация */}
          <div className="px-5 pt-4">
            {r.photoBefore || r.photoAfter ? (
              <div className={`grid gap-2 ${r.photoAfter ? "grid-cols-2" : "grid-cols-1"}`}>
                {r.photoBefore && (
                  <figure>
                    <img src={r.photoBefore} alt="Фото заявителя" className="h-32 w-full rounded-lg border border-mist-300 object-cover" loading="lazy" />
                    <figcaption className="mt-1 font-mono text-[9px] font-bold tracking-[0.14em] text-ink-400">ДО · ФОТО ЗАЯВИТЕЛЯ</figcaption>
                  </figure>
                )}
                {r.photoAfter && (
                  <figure>
                    <img src={r.photoAfter} alt="Фото после устранения" className="h-32 w-full rounded-lg border border-leaf-500/50 object-cover" loading="lazy" />
                    <figcaption className="mt-1 font-mono text-[9px] font-bold tracking-[0.14em] text-leaf-600">ПОСЛЕ · ОТЧЁТ СЛУЖБЫ</figcaption>
                  </figure>
                )}
              </div>
            ) : (
              <div className="grid h-24 place-items-center rounded-lg border border-dashed border-mist-300 bg-white text-ink-400">
                <div className="flex items-center gap-2 text-[11.5px] font-medium">
                  <Icon name="camera" className="w-4 h-4" /> Фотофиксация не приложена
                </div>
              </div>
            )}
          </div>

          {/* мета */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-xl border border-mist-200 bg-white p-4">
              <div>
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">РАЙОН</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink-900">{r.district}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">АДРЕС / ОРИЕНТИР</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink-900">{r.address}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">ТИП ОТХОДОВ</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
                  <CategoryGlyph id={r.category} className="w-3.5 h-3.5 text-leaf-600" />
                  {categoryLabel(r.category)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">АВТОР</div>
                <div className="mt-0.5 text-[13px] font-semibold text-ink-900">{r.author}</div>
              </div>
              <div className="col-span-2">
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">КООРДИНАТЫ · OPENSTREETMAP</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] font-bold text-ink-900">
                    {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                  </span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-md bg-mist-100 px-1.5 py-0.5 text-[10.5px] font-bold text-leaf-700 transition-colors hover:bg-leaf-100"
                  >
                    открыть в OSM <Icon name="arrowRight" className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="col-span-2">
                <div className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-400">ИСПОЛНИТЕЛЬ</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
                  {r.assignee ? (
                    <>
                      <Icon name="truck" className="w-3.5 h-3.5 text-st-work" /> {r.assignee}
                    </>
                  ) : (
                    <span className="text-ink-400 font-medium">не назначен</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* описание */}
          <div className="px-5 pt-4">
            <h3 className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">ОПИСАНИЕ</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">{r.description}</p>
          </div>

          {/* резолюции */}
          {r.rejectReason && (
            <div className="mx-5 mt-4 rounded-lg border border-danger/25 bg-danger-soft px-4 py-3">
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold tracking-[0.16em] text-danger">
                <Icon name="xCircle" className="w-3.5 h-3.5" /> ПРИЧИНА ОТКЛОНЕНИЯ
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700">{r.rejectReason}</p>
            </div>
          )}
          {r.resolveNote && (
            <div className="mx-5 mt-4 rounded-lg border border-leaf-500/30 bg-st-done-soft px-4 py-3">
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold tracking-[0.16em] text-leaf-700">
                <Icon name="checkCircle" className="w-3.5 h-3.5" /> ОТЧЁТ ОБ УСТРАНЕНИИ
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-700">{r.resolveNote}</p>
            </div>
          )}

          {/* действия */}
          <div className="px-5 pt-4">
            {(canTake || canResolve || canReject || canReopen || canWithdraw || r.status === "work") && (
              <div className="flex flex-wrap gap-2">
                {role === "service" && canTake && (
                  <button
                    onClick={() => onTake(r.id, ORGANIZATIONS[0])}
                    className="flex items-center gap-2 rounded-lg bg-st-work px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-st-work/30 transition-all hover:-translate-y-px hover:shadow-lg active:translate-y-0"
                  >
                    <Icon name="wrench" className="w-4 h-4" strokeWidth={2.2} /> Взять в работу
                  </button>
                )}
                {role === "admin" && canTake && (
                  <button
                    onClick={() => setMode(mode === "org-take" ? null : "org-take")}
                    className="flex items-center gap-2 rounded-lg bg-st-work px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-st-work/30 transition-all hover:-translate-y-px active:translate-y-0"
                  >
                    <Icon name="wrench" className="w-4 h-4" strokeWidth={2.2} /> Назначить службу
                  </button>
                )}
                {canResolve && (
                  <button
                    onClick={() => setMode(mode === "resolve" ? null : "resolve")}
                    className="flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-leaf-600/30 transition-all hover:-translate-y-px hover:shadow-lg active:translate-y-0"
                  >
                    <Icon name="checkCircle" className="w-4 h-4" strokeWidth={2.2} /> Отчёт об устранении
                  </button>
                )}
                {role === "admin" && r.status === "work" && (
                  <button
                    onClick={() => setMode(mode === "org-reassign" ? null : "org-reassign")}
                    className="flex items-center gap-2 rounded-lg border border-mist-300 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-ink-700 transition-colors hover:border-st-work hover:text-st-work"
                  >
                    <Icon name="truck" className="w-4 h-4" /> Переназначить
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => setMode(mode === "reject" ? null : "reject")}
                    className="flex items-center gap-2 rounded-lg border border-danger/30 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Icon name="xCircle" className="w-4 h-4" /> Отклонить
                  </button>
                )}
                {canReopen && (
                  <button
                    onClick={() => onReopen(r.id)}
                    className="flex items-center gap-2 rounded-lg bg-amber px-4 py-2.5 text-[13px] font-bold text-pine-950 shadow-md shadow-amber/30 transition-all hover:-translate-y-px active:translate-y-0"
                  >
                    <Icon name="undo" className="w-4 h-4" strokeWidth={2.2} /> Вернуть в работу
                  </button>
                )}
                {canWithdraw && (
                  <button
                    onClick={() => onWithdraw(r.id)}
                    className="flex items-center gap-2 rounded-lg border border-mist-300 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-ink-500 transition-colors hover:border-danger hover:text-danger"
                  >
                    <Icon name="close" className="w-4 h-4" /> Отозвать заявку
                  </button>
                )}
              </div>
            )}

            {/* формы действий */}
            {mode && (
              <div className="anim-pop mt-3 rounded-xl border border-mist-300 bg-white p-4">
                {mode === "resolve" && (
                  <>
                    <div className="flex items-center gap-2 text-[12.5px] font-bold text-ink-900">
                      <Icon name="checkCircle" className="w-4 h-4 text-leaf-600" /> Отчёт об устранении
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={3}
                      placeholder="Что сделано: объём вывезенного, техника, обработка площадки…"
                      className="mt-2.5 w-full resize-none rounded-lg border border-mist-300 bg-mist-50 px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-leaf-500"
                    />
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink-700">
                      <input type="checkbox" checked={withPhoto} onChange={(e) => setWithPhoto(e.target.checked)} className="accent-[#1f9253]" />
                      Приложить фото «после» (демо-фотофиксация)
                    </label>
                  </>
                )}
                {mode === "reject" && (
                  <>
                    <div className="flex items-center gap-2 text-[12.5px] font-bold text-ink-900">
                      <Icon name="xCircle" className="w-4 h-4 text-danger" /> Причина отклонения
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={2}
                      placeholder="Например: при осмотре факт не подтвердился…"
                      className="mt-2.5 w-full resize-none rounded-lg border border-mist-300 bg-mist-50 px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-danger"
                    />
                  </>
                )}
                {(mode === "org-take" || mode === "org-reassign") && (
                  <>
                    <div className="flex items-center gap-2 text-[12.5px] font-bold text-ink-900">
                      <Icon name="truck" className="w-4 h-4 text-st-work" />
                      {mode === "org-take" ? "Кто возьмёт в работу?" : "Новый исполнитель"}
                    </div>
                    <div className="mt-2.5 space-y-1.5">
                      {ORGANIZATIONS.map((o) => (
                        <button
                          key={o}
                          onClick={() => setOrg(o)}
                          className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[12.5px] font-semibold transition-all ${
                            org === o
                              ? "border-st-work bg-st-work-soft text-st-work"
                              : "border-mist-200 bg-mist-50 text-ink-700 hover:border-mist-300"
                          }`}
                        >
                          <Icon name="truck" className="w-4 h-4 shrink-0" /> {o}
                          {org === o && <Icon name="check" className="ml-auto w-3.5 h-3.5" strokeWidth={2.4} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {err && <p className="mt-2 text-[11.5px] font-semibold text-danger">{err}</p>}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={submitForm}
                    className={`flex-1 rounded-lg px-4 py-2 text-[12.5px] font-bold text-white transition-all hover:-translate-y-px ${
                      mode === "reject" ? "bg-danger" : mode === "resolve" ? "bg-leaf-600" : "bg-st-work"
                    }`}
                  >
                    {mode === "resolve" ? "Подтвердить устранение" : mode === "reject" ? "Отклонить заявку" : "Подтвердить"}
                  </button>
                  <button
                    onClick={() => { setMode(null); setErr(""); setText(""); }}
                    className="rounded-lg border border-mist-300 px-4 py-2 text-[12.5px] font-bold text-ink-500 transition-colors hover:bg-mist-100"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* таймлайн */}
          <div className="px-5 pt-5">
            <h3 className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">ИСТОРИЯ СТАТУСОВ</h3>
            <ol className="mt-3 space-y-0">
              {r.timeline.map((t, i) => {
                const meta = TL_ICON[t.type] ?? TL_ICON.created;
                const last = i === r.timeline.length - 1;
                return (
                  <li key={t.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {!last && <span className="absolute left-[13px] top-7 bottom-0 w-px bg-mist-300" />}
                    <span className={`z-10 grid h-[27px] w-[27px] shrink-0 place-items-center rounded-full ${meta.cls}`}>
                      <Icon name={meta.icon} className="w-3.5 h-3.5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="text-[12.5px] font-semibold leading-snug text-ink-900">{t.text}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-ink-400">
                        {fmtDate(t.ts)} · {t.actor}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* комментарии */}
          <div className="px-5 pb-5 pt-5">
            <h3 className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">
              ОБСУЖДЕНИЕ {r.comments.length > 0 && `· ${r.comments.length}`}
            </h3>
            <div className="mt-3 space-y-2.5">
              {r.comments.length === 0 && (
                <p className="text-[12px] text-ink-400">Пока нет сообщений — начните обсуждение.</p>
              )}
              {r.comments.map((c) => (
                <div key={c.id} className={`rounded-xl border p-3 ${c.role === role && c.author === userName ? "border-leaf-500/40 bg-leaf-100/50" : "border-mist-200 bg-white"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-ink-900">{c.author}</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider ${ROLE_TAG[c.role].cls}`}>
                      {ROLE_TAG[c.role].label}
                    </span>
                    <span className="ml-auto font-mono text-[9.5px] text-ink-400">{timeAgo(c.ts)}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-700">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
                rows={1}
                placeholder={`Комментарий от «${userName}»…`}
                className="min-h-[42px] flex-1 resize-none rounded-lg border border-mist-300 bg-white px-3 py-2.5 text-[12.5px] outline-none transition-colors focus:border-leaf-500"
              />
              <button
                onClick={sendComment}
                disabled={!comment.trim()}
                className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg bg-pine-900 text-mist-50 transition-all enabled:hover:bg-pine-800 enabled:hover:-translate-y-px disabled:opacity-40"
                aria-label="Отправить"
              >
                <Icon name="send" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
