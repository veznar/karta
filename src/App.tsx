import { useEffect, useMemo, useState } from "react";
import type {
  CategoryId,
  Filters,
  Report,
  Role,
  Status,
  ToastItem,
  View,
} from "./types";
import {
  DEFAULT_FILTERS,
  IMG,
  ROLE_META,
  fmtDay,
  nearestDistrict,
  seedReports,
  uid,
} from "./data";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import CityMap from "./components/CityMap";
import ReportsList from "./components/ReportsList";
import StatsView from "./components/StatsView";
import ReportDrawer from "./components/ReportDrawer";
import NewReportModal from "./components/NewReportModal";
import Toasts from "./components/Toasts";

const LS_REPORTS = "chistograd.reports.v1";
const LS_ROLE = "chistograd.role.v1";

function loadReports(): Report[] {
  try {
    const raw = localStorage.getItem(LS_REPORTS);
    if (raw) {
      const parsed = JSON.parse(raw) as Report[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return seedReports();
}

function loadRole(): Role {
  const r = localStorage.getItem(LS_ROLE);
  return r === "service" || r === "admin" || r === "resident" ? r : "resident";
}

const tLabel = (ts: number) => {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())} ${fmtDay(ts)}`;
};

export default function App() {
  const [reports, setReports] = useState<Report[]>(loadReports);
  const [role, setRole] = useState<Role>(loadRole);
  const [view, setView] = useState<View>("map");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const userName = ROLE_META[role].user;

  /* persistence */
  useEffect(() => {
    try {
      localStorage.setItem(LS_REPORTS, JSON.stringify(reports));
    } catch {
      /* ignore */
    }
  }, [reports]);
  useEffect(() => {
    localStorage.setItem(LS_ROLE, role);
  }, [role]);

  /* esc */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pendingPoint) setPendingPoint(null);
      else if (addMode) setAddMode(false);
      else if (selectedId) setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingPoint, addMode, selectedId]);

  const pushToast = (text: string, tone: ToastItem["tone"] = "ok") => {
    const id = uid();
    setToasts((t) => [...t.slice(-3), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  };

  const changeRole = (r: Role) => {
    if (r === role) return;
    setRole(r);
    setAddMode(false);
    pushToast(`Режим: ${ROLE_META[r].label} — ${ROLE_META[r].user}`, "info");
  };

  /* ---------- действия над заявками ---------- */

  const patchReport = (id: string, fn: (r: Report) => Report) => {
    setReports((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
  };

  const addReport = (d: { category: CategoryId; address: string; description: string }) => {
    if (!pendingPoint) return;
    const num = reports.reduce((m, r) => Math.max(m, r.num), 100) + 1;
    const now = Date.now();
    const rep: Report = {
      id: "r" + num,
      num,
      x: pendingPoint.x,
      y: pendingPoint.y,
      district: nearestDistrict(pendingPoint.x, pendingPoint.y),
      address: d.address,
      category: d.category,
      description: d.description,
      status: "new",
      author: userName,
      createdAt: now,
      updatedAt: now,
      timeline: [
        { id: uid(), ts: now, type: "created", text: "Заявка зарегистрирована жителем", actor: userName },
      ],
      comments: [],
    };
    setReports((rs) => [rep, ...rs]);
    setPendingPoint(null);
    setSelectedId(rep.id);
    pushToast(`Заявка ЧГ-${num} зарегистрирована и передана диспетчеру`);
  };

  const takeReport = (id: string, org: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      status: "work",
      assignee: org,
      updatedAt: now,
      timeline: [
        ...r.timeline,
        { id: uid(), ts: now, type: "work", text: `Заявка взята в работу · ${org}`, actor: org },
      ],
    }));
    const rep = reports.find((r) => r.id === id);
    pushToast(`Заявка ЧГ-${rep?.num ?? ""} взята в работу · ${org}`);
  };

  const resolveReport = (id: string, note: string, withPhoto: boolean) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      status: "done",
      resolvedAt: now,
      resolveNote: note,
      photoAfter: withPhoto ? IMG.cleaned : r.photoAfter,
      updatedAt: now,
      timeline: [
        ...r.timeline,
        { id: uid(), ts: now, type: "done", text: "Свалка устранена, отчёт приложен", actor: r.assignee ?? userName },
      ],
    }));
    const rep = reports.find((r) => r.id === id);
    pushToast(`Заявка ЧГ-${rep?.num ?? ""} устранена — спасибо за работу!`);
  };

  const rejectReport = (id: string, reason: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      status: "rejected",
      rejectReason: reason,
      updatedAt: now,
      timeline: [
        ...r.timeline,
        { id: uid(), ts: now, type: "rejected", text: "Заявка отклонена", actor: userName },
      ],
    }));
    const rep = reports.find((r) => r.id === id);
    pushToast(`Заявка ЧГ-${rep?.num ?? ""} отклонена`, "warn");
  };

  const reopenReport = (id: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      status: r.assignee ? "work" : "new",
      rejectReason: undefined,
      updatedAt: now,
      timeline: [
        ...r.timeline,
        {
          id: uid(),
          ts: now,
          type: "reopened",
          text: r.assignee ? `Заявка возвращена в работу · ${r.assignee}` : "Заявка возвращена в очередь",
          actor: userName,
        },
      ],
    }));
    pushToast("Заявка возвращена в работу", "info");
  };

  const withdrawReport = (id: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      status: "rejected",
      rejectReason: "Заявка отозвана автором",
      updatedAt: now,
      timeline: [
        ...r.timeline,
        { id: uid(), ts: now, type: "rejected", text: "Заявка отозвана автором", actor: userName },
      ],
    }));
    pushToast("Заявка отозвана", "info");
  };

  const reassignReport = (id: string, org: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      assignee: org,
      updatedAt: now,
      timeline: [
        ...r.timeline,
        { id: uid(), ts: now, type: "work", text: `Исполнитель изменён · ${org}`, actor: userName },
      ],
    }));
    pushToast(`Исполнитель заявки изменён: ${org}`, "info");
  };

  const addComment = (id: string, text: string) => {
    const now = Date.now();
    patchReport(id, (r) => ({
      ...r,
      updatedAt: now,
      comments: [...r.comments, { id: uid(), ts: now, author: userName, role, text }],
    }));
  };

  /* ---------- производные ---------- */

  const visible = useMemo(
    () =>
      reports
        .filter(
          (r) =>
            filters.statuses.includes(r.status) &&
            filters.categories.includes(r.category) &&
            (filters.district === "all" || r.district === filters.district)
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [reports, filters]
  );

  const statusCounts = useMemo(() => {
    const c: Record<Status, number> = { new: 0, work: 0, done: 0, rejected: 0 };
    reports.forEach((r) => c[r.status]++);
    return c;
  }, [reports]);

  const feed = useMemo(
    () =>
      reports
        .flatMap((r) => r.timeline.map((t) => ({ ...t, num: r.num })))
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 10),
    [reports]
  );

  const selected = reports.find((r) => r.id === selectedId) ?? null;
  const nextNum = reports.reduce((m, r) => Math.max(m, r.num), 100) + 1;

  const toggleStatus = (s: Status) =>
    setFilters((f) => ({
      ...f,
      statuses: f.statuses.includes(s)
        ? f.statuses.filter((x) => x !== s)
        : [...f.statuses, s],
    }));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-mist-100">
      <TopBar
        view={view}
        onViewChange={setView}
        role={role}
        onRoleChange={changeRole}
        addMode={addMode}
        onToggleAdd={() => {
          setAddMode((a) => !a);
          setSelectedId(null);
          setView("map");
        }}
        onMenu={() => setSidebarOpen(true)}
      />

      {/* лента событий */}
      <div className="ticker-wrap relative z-20 flex h-8 shrink-0 items-center gap-3 overflow-hidden border-b border-pine-800 bg-pine-900 pl-0">
        <div className="flex h-full shrink-0 items-center gap-1.5 bg-pine-850 pl-3 pr-3 border-r border-pine-800">
          <span className="w-1.5 h-1.5 rounded-full bg-st-new live-dot" />
          <span className="font-mono text-[9.5px] font-bold tracking-[0.2em] text-mist-300">ЛЕНТА</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-10">
            {[...feed, ...feed].map((t, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap font-mono text-[10.5px] text-mist-300">
                <span className="font-bold text-leaf-400">ЧГ-{t.num}</span>
                <span className="text-mist-400">{tLabel(t.ts)}</span>
                <span>{t.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          filters={filters}
          onChange={setFilters}
          reports={reports}
          visibleCount={visible.length}
          onOpenView={setView}
        />
        <main className="relative min-w-0 flex-1">
          {view === "map" && (
            <CityMap
              reports={visible}
              selectedId={selectedId}
              onSelect={setSelectedId}
              addMode={addMode}
              onPickPoint={(x, y) => {
                setPendingPoint({ x, y });
                setAddMode(false);
              }}
              filters={filters}
              onToggleStatus={toggleStatus}
              statusCounts={statusCounts}
              total={reports.length}
            />
          )}
          {view === "list" && (
            <ReportsList
              reports={visible}
              totalAll={reports.length}
              onSelect={setSelectedId}
              onResetFilters={() => setFilters({ ...DEFAULT_FILTERS })}
            />
          )}
          {view === "stats" && <StatsView reports={reports} />}
        </main>
      </div>

      <ReportDrawer
        report={selected}
        role={role}
        userName={userName}
        onClose={() => setSelectedId(null)}
        onTake={takeReport}
        onResolve={resolveReport}
        onReject={rejectReport}
        onReopen={reopenReport}
        onWithdraw={withdrawReport}
        onReassign={reassignReport}
        onComment={addComment}
      />

      {pendingPoint && (
        <NewReportModal
          x={pendingPoint.x}
          y={pendingPoint.y}
          district={nearestDistrict(pendingPoint.x, pendingPoint.y)}
          nextNum={nextNum}
          onClose={() => setPendingPoint(null)}
          onSubmit={addReport}
        />
      )}

      <Toasts toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  );
}
