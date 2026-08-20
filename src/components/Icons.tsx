import type { CategoryId } from "../types";

export type IconName =
  | "user" | "truck" | "shield"
  | "map" | "list" | "chart"
  | "plus" | "minus" | "target" | "close" | "menu"
  | "pin" | "camera" | "chat" | "clock" | "filter" | "leaf" | "alert"
  | "check" | "checkCircle" | "wrench" | "xCircle" | "undo"
  | "send" | "download" | "arrowRight" | "info";

const P: Record<IconName, React.ReactNode> = {
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" />
    </>
  ),
  truck: (
    <>
      <path d="M2 7h11v9H2zM13 10h4.2l2.8 2.8V16h-2" />
      <circle cx="7" cy="17.4" r="1.9" />
      <circle cx="16.4" cy="17.4" r="1.9" />
      <path d="M8.9 16h5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.8V11c0 4.6-3 7.7-7 9.2-4-1.5-7-4.6-7-9.2V5.8z" />
      <path d="M9 11.4l2.2 2.2 4-4.4" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h12M9 12h12M9 18h12" />
      <circle cx="4" cy="6" r="0.6" fill="currentColor" />
      <circle cx="4" cy="12" r="0.6" fill="currentColor" />
      <circle cx="4" cy="18" r="0.6" fill="currentColor" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20v-7M10 20V5M16 20v-10M2 20h20" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  target: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  pin: (
    <>
      <path d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3.2L9 5.4h6L16.8 8H20v11H4z" />
      <circle cx="12" cy="13" r="3.1" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.4 2" />
    </>
  ),
  filter: <path d="M3 5h18l-7 8v5l-4 2v-7z" />,
  leaf: (
    <>
      <path d="M5 19C5 9.5 13 4.5 20 4.5c0 8-5 14.5-15 14.5z" />
      <path d="M5 19c2.8-5.6 6.8-8.8 11-10.6" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5L2.5 20h19z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="17" r="0.4" fill="currentColor" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.4l2.8 2.8 5.4-6" />
    </>
  ),
  wrench: (
    <path d="M14.9 6.2a4.1 4.1 0 0 0-5.7 5L3.5 17a2 2 0 1 0 2.8 2.8l5.8-5.7a4.1 4.1 0 0 0 5-5.7l-2.7 2.7-2.4-.7-.7-2.4z" />
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  undo: (
    <>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-4" />
    </>
  ),
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  download: <path d="M12 3v12M6 9l6 6 6-6M4 21h16" />,
  arrowRight: <path d="M4 12h16M14 6l6 6-6 6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.8" r="0.4" fill="currentColor" />
    </>
  ),
};

export function Icon({
  name,
  className = "w-4 h-4",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {P[name]}
    </svg>
  );
}

/* Glyphs категорий (viewBox 24) — используются и в формах, и в маркерах карты */

const CAT: Record<CategoryId, React.ReactNode> = {
  house: (
    <>
      <path d="M7.2 9.2 6 19.4A1.7 1.7 0 0 0 7.7 21h8.6a1.7 1.7 0 0 0 1.7-1.6L16.8 9.2" />
      <path d="M9.5 9 8.4 5.6 10 3l2 2 2-2 1.6 2.6L14.5 9" />
      <path d="M9 13.5c1 .8 2 1.2 3 1.2s2-.4 3-1.2" />
    </>
  ),
  construction: (
    <>
      <path d="M3 8h18v4H3zM3 12h18v4H3z" />
      <path d="M9 8v4M15 8v4M6 12v4M12 12v4M18 12v4" />
    </>
  ),
  tires: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4" />
    </>
  ),
  hazard: (
    <>
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 9.5V14" />
      <circle cx="12" cy="17" r="0.4" fill="currentColor" />
    </>
  ),
  green: (
    <>
      <path d="M4 20C8 14 12 10 19 5" />
      <path d="M19 5c-3.2 0-5.2 2-5.2 5.2C17 10.2 19 8.2 19 5z" />
      <path d="M11.5 12.5c-2.6 0-4.2 1.6-4.2 4.2 2.6 0 4.2-1.6 4.2-4.2z" />
    </>
  ),
  other: (
    <>
      <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z" />
      <path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" />
    </>
  ),
};

export function CategoryGlyph({
  id,
  className = "w-4 h-4",
  strokeWidth = 1.8,
}: {
  id: CategoryId;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {CAT[id]}
    </svg>
  );
}

/* «Сырые» пути категорий для встраивания внутрь SVG-карты */
export function categoryPaths(id: CategoryId): React.ReactNode {
  return CAT[id];
}

/* SVG-разметка глифов строкой — для HTML-маркеров Leaflet (divIcon) */
export const CATEGORY_SVG_INNER: Record<CategoryId, string> = {
  house: `<path d="M7.2 9.2 6 19.4A1.7 1.7 0 0 0 7.7 21h8.6a1.7 1.7 0 0 0 1.7-1.6L16.8 9.2"/><path d="M9.5 9 8.4 5.6 10 3l2 2 2-2 1.6 2.6L14.5 9"/><path d="M9 13.5c1 .8 2 1.2 3 1.2s2-.4 3-1.2"/>`,
  construction: `<path d="M3 8h18v4H3zM3 12h18v4H3z"/><path d="M9 8v4M15 8v4M6 12v4M12 12v4M18 12v4"/>`,
  tires: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2l-1.4 1.4"/>`,
  hazard: `<path d="M12 3.5 2.5 20h19z"/><path d="M12 9.5V14"/><circle cx="12" cy="17" r="0.4" fill="currentColor"/>`,
  green: `<path d="M4 20C8 14 12 10 19 5"/><path d="M19 5c-3.2 0-5.2 2-5.2 5.2C17 10.2 19 8.2 19 5z"/><path d="M11.5 12.5c-2.6 0-4.2 1.6-4.2 4.2 2.6 0 4.2-1.6 4.2-4.2z"/>`,
  other: `<path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16z"/><path d="M3.5 8 12 12.5 20.5 8M12 12.5v8"/>`,
};
