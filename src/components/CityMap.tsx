import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Filters, Report, Status } from "../types";
import {
  CITY_CENTER,
  CITY_NAME,
  CITY_ZOOM,
  DISTRICTS,
  ROUTE_LINES,
  STATUS_META,
  STATUS_ORDER,
  categoryLabel,
} from "../data";
import { CATEGORY_SVG_INNER, Icon } from "./Icons";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">участники OpenStreetMap</a>';

function markerHtml(r: Report, selected: boolean) {
  const m = STATUS_META[r.status];
  return `
    <div class="mk-wrap">
      ${r.status === "new" ? `<span class="mk-pulse-ring" style="background:${m.color}"></span>` : ""}
      ${selected ? `<span class="mk-sel-ring" style="border-color:${m.color}"></span>` : ""}
      <span class="mk-dot${selected ? " mk-dot-sel" : ""}" style="background:${m.color}">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="color:#ffffff">${CATEGORY_SVG_INNER[r.category]}</svg>
      </span>
    </div>`;
}

const tipHtml = (r: Report) => {
  const m = STATUS_META[r.status];
  return `
    <div class="tip-num"><span>ЧГ-${r.num}</span><b style="color:${m.color}">${m.label.toUpperCase()}</b></div>
    <div class="tip-title">${categoryLabel(r.category)}</div>
    <div class="tip-addr">${r.district} р-н · ${r.address}</div>`;
};

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
  onPickPoint: (lat: number, lng: number) => void;
  filters: Filters;
  onToggleStatus: (s: Status) => void;
  statusCounts: Record<Status, number>;
  total: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const suppressRef = useRef(false);
  const prevSelRef = useRef<string | null>(null);

  /* инициализация карты */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: CITY_CENTER,
      zoom: CITY_ZOOM,
      zoomControl: false,
      minZoom: 10,
      maxZoom: 18,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    /* подписи районов */
    DISTRICTS.forEach((d) =>
      L.marker([d.lat, d.lng], {
        icon: L.divIcon({
          className: "",
          html: `<div class="district-label-map">${d.name.toUpperCase()}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map)
    );

    /* маршруты патрулей экоконтроля */
    ROUTE_LINES.forEach((pts) =>
      L.polyline(pts, {
        className: "cg-route",
        color: "#2aa763",
        weight: 3.5,
        opacity: 0.55,
        dashArray: "2 10",
        lineCap: "round",
      }).addTo(map)
    );

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  /* маркеры заявок */
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    reports.forEach((r) => {
      const sel = r.id === selectedId;
      const mk = L.marker([r.lat, r.lng], {
        icon: L.divIcon({
          className: "cg-marker",
          html: markerHtml(r, sel),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        zIndexOffset: sel ? 1000 : 0,
        keyboard: false,
      });
      mk.bindTooltip(tipHtml(r), {
        direction: "top",
        offset: L.point(0, -16),
        className: "cg-tip",
        opacity: 1,
      });
      mk.on("click", () => {
        suppressRef.current = true;
        onSelect(r.id);
      });
      layer.addLayer(mk);
    });

    /* подвинуть карту к выбранной заявке, если она за экраном */
    const selRep = reports.find((r) => r.id === selectedId);
    if (selRep && prevSelRef.current !== selRep.id) {
      const pos = L.latLng(selRep.lat, selRep.lng);
      if (!map.getBounds().contains(pos)) map.panTo(pos, { animate: true, duration: 0.6 });
    }
    prevSelRef.current = selRep?.id ?? null;
  }, [reports, selectedId, onSelect]);

  /* клики: режим добавления и снятие выделения */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getContainer().classList.toggle("addmode-map", addMode);
    const onClick = (e: L.LeafletMouseEvent) => {
      if (suppressRef.current) {
        suppressRef.current = false;
        return;
      }
      if (addMode) onPickPoint(e.latlng.lat, e.latlng.lng);
      else onSelect(null);
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [addMode, onPickPoint, onSelect]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* чипы-фильтры по статусам */}
      <div className="pointer-events-none absolute left-3 top-3 z-[1100] flex flex-wrap items-center gap-1.5 max-w-[calc(100%-1rem)] md:max-w-[calc(100%-15rem)]">
        <span className="pointer-events-auto flex items-center gap-1.5 rounded-lg bg-pine-950/90 px-2.5 py-1.5 font-mono text-[10.5px] font-bold text-mist-50 shadow-md backdrop-blur-sm">
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
              className={`pointer-events-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10.5px] font-bold shadow-md backdrop-blur-sm transition-all ${
                on ? "bg-pine-950/90 text-mist-50" : "bg-white/75 text-ink-500 opacity-75 hover:opacity-100"
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

      {/* демо-полигон */}
      <div className="pointer-events-none absolute right-3 top-3 z-[1100] hidden md:block">
        <span className="flex items-center gap-1.5 rounded-lg bg-white/85 px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.14em] text-ink-500 shadow-md backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-leaf-500 live-dot" />
          ДЕМО-ПОЛИГОН · {CITY_NAME.toUpperCase()}
        </span>
      </div>

      {/* подсказка режима добавления */}
      {addMode && (
        <div className="anim-pop pointer-events-none absolute bottom-6 left-1/2 z-[1100] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-pine-700 bg-pine-950/95 px-4 py-2.5 text-mist-50 shadow-xl">
          <span className="relative grid place-items-center">
            <Icon name="pin" className="w-4.5 h-4.5 text-st-new" />
            <span className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-st-new live-dot" />
          </span>
          <span className="whitespace-nowrap text-[12.5px] font-semibold">
            Кликните место свалки на карте
          </span>
          <span className="hidden font-mono text-[10px] text-mist-400 sm:inline">ESC — отмена</span>
        </div>
      )}

      {/* пусто по фильтрам */}
      {reports.length === 0 && !addMode && (
        <div className="anim-pop pointer-events-none absolute left-1/2 top-1/2 z-[1100] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-mist-200 bg-white/95 px-5 py-4 text-center shadow-lg">
          <Icon name="filter" className="mx-auto h-5 w-5 text-ink-400" />
          <p className="mt-2 text-[13px] font-semibold text-ink-700">Нет заявок по выбранным фильтрам</p>
          <p className="text-[11.5px] text-ink-500">Ослабьте условия в панели слева</p>
        </div>
      )}
    </div>
  );
}
