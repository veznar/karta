import { useEffect, useState } from "react";
import type { Role, View } from "../types";
import { ROLE_META } from "../data";
import { Icon } from "./Icons";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  return (
    <div className="hidden md:flex items-center gap-2 rounded-lg bg-pine-900 px-3 py-1.5 border border-pine-800">
      <Icon name="clock" className="w-3.5 h-3.5 text-leaf-400" />
      <span className="font-mono text-[13px] font-medium tabular-nums text-mist-50">
        {p(now.getHours())}:{p(now.getMinutes())}
        <span className="text-mist-400">:{p(now.getSeconds())}</span>
      </span>
      <span className="font-mono text-[11px] text-mist-400">
        {days[now.getDay()]} {p(now.getDate())}.{p(now.getMonth() + 1)}
      </span>
    </div>
  );
}

const VIEWS: { id: View; label: string; icon: "map" | "list" | "chart" }[] = [
  { id: "map", label: "Карта", icon: "map" },
  { id: "list", label: "Заявки", icon: "list" },
  { id: "stats", label: "Статистика", icon: "chart" },
];

const ROLES: { id: Role; icon: "user" | "truck" | "shield" }[] = [
  { id: "resident", icon: "user" },
  { id: "service", icon: "truck" },
  { id: "admin", icon: "shield" },
];

export default function TopBar({
  view,
  onViewChange,
  role,
  onRoleChange,
  addMode,
  onToggleAdd,
  onMenu,
}: {
  view: View;
  onViewChange: (v: View) => void;
  role: Role;
  onRoleChange: (r: Role) => void;
  addMode: boolean;
  onToggleAdd: () => void;
  onMenu: () => void;
}) {
  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-pine-800 bg-pine-950 px-3 text-mist-50">
      <button
        onClick={onMenu}
        className="rounded-md p-2 hover:bg-pine-800 transition-colors lg:hidden"
        aria-label="Меню"
      >
        <Icon name="menu" className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 pr-2 sm:pr-3">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-leaf-600 text-pine-950">
          <Icon name="leaf" className="w-4.5 h-4.5" strokeWidth={2} />
        </span>
        <div className="leading-none">
          <div className="font-display text-[13px] font-extrabold tracking-wide">ЧИСТОГРАД</div>
          <div className="hidden sm:block font-mono text-[9.5px] text-mist-400 tracking-[0.14em] mt-0.5">
            КОНТРОЛЬ ЧИСТОТЫ ГОРОДА
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1 rounded-lg bg-pine-900 p-1 border border-pine-800">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1.5 text-[12.5px] font-semibold transition-all ${
              view === v.id
                ? "bg-leaf-600 text-pine-950 shadow-sm"
                : "text-mist-300 hover:text-mist-50 hover:bg-pine-800"
            }`}
          >
            <Icon name={v.icon} className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Clock />

        {role === "resident" && (
          <button
            onClick={onToggleAdd}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-bold transition-all ${
              addMode
                ? "bg-st-new text-white shadow-[0_0_0_3px_rgba(242,106,31,0.25)]"
                : "bg-st-new/90 text-white hover:bg-st-new hover:-translate-y-px shadow-md shadow-st-new/30"
            }`}
          >
            <Icon name={addMode ? "target" : "pin"} className="w-4 h-4" strokeWidth={2.1} />
            <span className="hidden sm:inline">{addMode ? "Укажите точку…" : "Сообщить о свалке"}</span>
            {addMode && <span className="sm:hidden">Точка…</span>}
          </button>
        )}

        <div
          className="flex items-center rounded-lg bg-pine-900 p-1 border border-pine-800"
          title="Роль в системе (демо-переключение)"
        >
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => onRoleChange(r.id)}
              title={`${ROLE_META[r.id].label} — ${ROLE_META[r.id].duty}`}
              className={`flex items-center gap-1.5 rounded-md px-2 sm:px-2.5 py-1.5 text-[12px] font-semibold transition-all ${
                role === r.id
                  ? "bg-mist-50 text-pine-900 shadow-sm"
                  : "text-mist-400 hover:text-mist-50 hover:bg-pine-800"
              }`}
            >
              <Icon name={r.icon} className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{ROLE_META[r.id].short}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
