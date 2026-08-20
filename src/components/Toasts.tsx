import type { ToastItem } from "../types";
import { Icon } from "./Icons";

const TONE = {
  ok: { icon: "checkCircle" as const, cls: "bg-leaf-600 text-mist-50" },
  info: { icon: "info" as const, cls: "bg-pine-800 text-mist-50" },
  warn: { icon: "alert" as const, cls: "bg-amber text-pine-950" },
};

export default function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <button
            key={t.id}
            onClick={() => onDismiss(t.id)}
            className={`anim-toast flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-left text-[13px] font-medium leading-snug shadow-lg shadow-pine-950/20 ${tone.cls}`}
          >
            <Icon name={tone.icon} className="w-4.5 h-4.5 mt-px shrink-0" />
            <span>{t.text}</span>
          </button>
        );
      })}
    </div>
  );
}
