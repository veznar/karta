import { useState } from "react";
import type { CategoryId } from "../types";
import { CATEGORIES } from "../data";
import { CategoryGlyph, Icon } from "./Icons";

export default function NewReportModal({
  x,
  y,
  district,
  nextNum,
  onClose,
  onSubmit,
}: {
  x: number;
  y: number;
  district: string;
  nextNum: number;
  onClose: () => void;
  onSubmit: (d: { category: CategoryId; address: string; description: string }) => void;
}) {
  const [category, setCategory] = useState<CategoryId>("house");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (description.trim().length < 10) {
      setErr("Опишите свалку подробнее — минимум 10 символов");
      return;
    }
    onSubmit({
      category,
      address: address.trim() || "ориентир не указан",
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div className="absolute inset-0 bg-pine-950/60" onClick={onClose} />
      <div className="anim-pop relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-mist-200 bg-mist-50 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-mist-200 bg-pine-950 px-5 py-4 text-mist-50">
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-st-new text-white">
            <Icon name="pin" className="w-4.5 h-4.5" strokeWidth={2.1} />
          </span>
          <div>
            <div className="font-display text-[15px] font-extrabold leading-none">НОВАЯ ЗАЯВКА</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.14em] text-mist-400">
              НЕСАНКЦИОНИРОВАННАЯ СВАЛКА · № ЧГ-{nextNum}
            </div>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-2 text-mist-300 transition-colors hover:bg-pine-800 hover:text-mist-50" aria-label="Закрыть">
            <Icon name="close" className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-leaf-500/30 bg-leaf-100/60 px-3 py-2.5">
            <Icon name="target" className="w-4 h-4 text-leaf-700" />
            <span className="font-mono text-[11px] font-bold text-leaf-700">
              X {Math.round(x)} · Y {Math.round(y)}
            </span>
            <span className="text-[11.5px] font-semibold text-ink-700">
              район определён автоматически: <b>{district}</b>
            </span>
          </div>

          <label className="mt-4 block">
            <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">ТИП ОТХОДОВ *</span>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                    category === c.id
                      ? "border-leaf-600 bg-leaf-100 shadow-sm"
                      : "border-mist-200 bg-white hover:border-mist-300 hover:-translate-y-px"
                  }`}
                >
                  <CategoryGlyph id={c.id} className={`w-5 h-5 ${category === c.id ? "text-leaf-700" : "text-ink-400"}`} />
                  <span className={`text-[11.5px] font-bold leading-tight ${category === c.id ? "text-leaf-700" : "text-ink-700"}`}>
                    {c.label}
                  </span>
                  <span className="text-[9.5px] leading-tight text-ink-400">{c.hint}</span>
                </button>
              ))}
            </div>
          </label>

          <label className="mt-4 block">
            <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">АДРЕС / ОРИЕНТИР</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Ленина, 12, за гаражами"
              className="mt-2 w-full rounded-lg border border-mist-300 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-leaf-500"
            />
          </label>

          <label className="mt-4 block">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-400">ОПИСАНИЕ *</span>
              <span className={`font-mono text-[10px] ${description.trim().length >= 10 ? "text-leaf-600" : "text-ink-400"}`}>
                {description.trim().length} / мин. 10
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Что свалено, какой объём, как давно, мешает ли проходу…"
              className="mt-2 w-full resize-none rounded-lg border border-mist-300 bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none transition-colors focus:border-leaf-500"
            />
          </label>

          {err && (
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-danger">
              <Icon name="alert" className="w-3.5 h-3.5" /> {err}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-mist-200 bg-white px-5 py-3.5">
          <button
            onClick={submit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-st-new px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-st-new/30 transition-all hover:-translate-y-px hover:shadow-lg active:translate-y-0"
          >
            <Icon name="check" className="w-4 h-4" strokeWidth={2.4} /> Зарегистрировать заявку
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-mist-300 px-4 py-2.5 text-[13px] font-bold text-ink-500 transition-colors hover:bg-mist-100"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
