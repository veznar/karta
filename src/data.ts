import type {
  CategoryId,
  CommentT,
  Filters,
  Report,
  Role,
  Status,
  TimelineEvent,
} from "./types";

/* ---------- media (демо-фотофиксация) ---------- */

export const IMG = {
  construction:
    "https://image.qwenlm.ai/generated-images/e8a7d14a-55ae-402e-9d33-14fa0bde1ef0/_result.png",
  bags: "https://image.qwenlm.ai/generated-images/16282f58-f732-4151-bc80-c80d7609b233/_result.png",
  tires:
    "https://image.qwenlm.ai/generated-images/0de19716-900e-4be6-8a93-4ba5317e5591/_result.png",
  mixed:
    "https://image.qwenlm.ai/generated-images/5ee1599f-ab33-4469-a55e-b915bd889448/_result.png",
  metal:
    "https://image.qwenlm.ai/generated-images/6b8a0f3d-6308-4abf-b156-45946150dbb3/_result.png",
  branches:
    "https://image.qwenlm.ai/generated-images/4aa7f30f-7c24-4c7b-bed2-22095e80c672/_result.png",
  cleaned:
    "https://image.qwenlm.ai/generated-images/a553af76-8db1-479c-8d0a-ae945cc1df04/_result.png",
};

/* ---------- справочники ---------- */

export const CATEGORIES: { id: CategoryId; label: string; hint: string }[] = [
  { id: "house", label: "Бытовой мусор", hint: "пакеты, ТКО, хлам" },
  { id: "construction", label: "Строительный", hint: "кирпич, бетон, доски" },
  { id: "tires", label: "Шины", hint: "автомобильные покрышки" },
  { id: "hazard", label: "Опасные отходы", hint: "металл, техника, химия" },
  { id: "green", label: "Порубочные остатки", hint: "ветки, ботва, листва" },
  { id: "other", label: "Прочее", hint: "другие отходы" },
];

export const STATUS_ORDER: Status[] = ["new", "work", "done", "rejected"];

export const STATUS_META: Record<
  Status,
  { label: string; color: string; soft: string; text: string }
> = {
  new: { label: "Новая", color: "#f26a1f", soft: "#fde6d6", text: "#b34a10" },
  work: { label: "В работе", color: "#2f74e0", soft: "#dee9fc", text: "#1d4fa3" },
  done: { label: "Устранена", color: "#23a05a", soft: "#dcf1e4", text: "#166e3e" },
  rejected: { label: "Отклонена", color: "#87948b", soft: "#e9ede9", text: "#5c685f" },
};

export const DISTRICTS: { name: string; cx: number; cy: number; lx: number; ly: number }[] = [
  { name: "Заводской", cx: 210, cy: 260, lx: 132, ly: 118 },
  { name: "Северный", cx: 450, cy: 170, lx: 318, ly: 182 },
  { name: "Центральный", cx: 440, cy: 400, lx: 328, ly: 370 },
  { name: "Заречный", cx: 810, cy: 300, lx: 762, ly: 168 },
  { name: "Южный", cx: 350, cy: 545, lx: 292, ly: 505 },
];

export const ORGANIZATIONS = [
  "МУП «Горкомхоз»",
  "ООО «Экосервис»",
  "Подрядчик «Чистый город»",
];

export const ROLE_META: Record<
  Role,
  { label: string; short: string; user: string; duty: string }
> = {
  resident: {
    label: "Житель",
    short: "Житель",
    user: "Мария Ковалёва",
    duty: "Отмечает свалки на карте и следит за заявками",
  },
  service: {
    label: "Коммунальная служба",
    short: "Служба",
    user: "МУП «Горкомхоз» · диспетчер",
    duty: "Берёт заявки в работу и отчитывается об устранении",
  },
  admin: {
    label: "Администратор",
    short: "Админ",
    user: "Администрация г. Чистограда",
    duty: "Контролирует все заявки, распределяет и отклоняет",
  },
};

export const DEFAULT_FILTERS: Filters = {
  statuses: ["new", "work", "done", "rejected"],
  categories: CATEGORIES.map((c) => c.id),
  district: "all",
};

/* ---------- геометрия города (viewBox 1000×640) ---------- */

export const BUILDINGS: [number, number, number, number][] = [
  [120, 230, 34, 20], [162, 208, 26, 26], [108, 330, 40, 18], [170, 350, 30, 22],
  [128, 178, 24, 24], [222, 300, 36, 16], [80, 262, 28, 20], [228, 232, 24, 18],
  [382, 148, 26, 18], [424, 182, 30, 16], [474, 138, 22, 22], [512, 172, 26, 14],
  [360, 222, 34, 18], [452, 232, 24, 20], [540, 212, 28, 16], [500, 232, 22, 14],
  [380, 336, 30, 20], [432, 318, 24, 24], [486, 340, 34, 18], [356, 452, 28, 16],
  [420, 468, 32, 20], [502, 300, 20, 26], [560, 418, 22, 16], [318, 398, 26, 18],
  [242, 520, 30, 16], [302, 560, 26, 20], [382, 588, 34, 18], [180, 540, 24, 20],
  [422, 540, 26, 16], [470, 580, 28, 14],
  [800, 248, 28, 18], [842, 330, 30, 16], [882, 268, 22, 22], [820, 392, 26, 18],
  [902, 350, 30, 16], [862, 202, 24, 18], [782, 442, 28, 16], [912, 452, 24, 18],
];

export const TREES: [number, number][] = [
  [470, 490], [502, 512], [532, 480], [562, 505], [455, 522], [585, 528], [516, 536],
  [330, 82], [372, 112], [412, 70], [452, 100], [502, 82], [540, 120], [362, 140], [482, 142],
  [872, 416], [896, 432], [858, 442],
];

export const ROUTES: string[] = [
  "40,430 470,430 470,300 690,300 840,300 840,452",
  "190,560 190,210 470,210 470,118",
];

/* ---------- помощники ---------- */

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export function plural(n: number, forms: [string, string, string]) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} ${plural(m, ["минуту", "минуты", "минут"])} назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ${plural(h, ["час", "часа", "часов"])} назад`;
  const d = Math.floor(h / 24);
  return `${d} ${plural(d, ["день", "дня", "дней"])} назад`;
}

const MONTHS = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

export function fmtDate(ts: number) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${hh}:${mm}`;
}

export function fmtDay(ts: number) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nearestDistrict(x: number, y: number) {
  let best = DISTRICTS[0];
  let bd = Infinity;
  for (const d of DISTRICTS) {
    const dist = (d.cx - x) ** 2 + (d.cy - y) ** 2;
    if (dist < bd) {
      bd = dist;
      best = d;
    }
  }
  return best.name;
}

export const categoryLabel = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

/* ---------- сид-данные ---------- */

const NOW = Date.now();
const at = (days: number, hours = 0) => NOW - days * 864e5 - hours * 36e5;

const ev = (ts: number, type: TimelineEvent["type"], text: string, actor: string): TimelineEvent => ({
  id: uid(), ts, type, text, actor,
});
const cm = (ts: number, author: string, role: Role, text: string): CommentT => ({
  id: uid(), ts, author, role, text,
});

interface SeedOpts {
  num: number;
  x: number; y: number;
  address: string;
  category: CategoryId;
  description: string;
  status: Status;
  author: string;
  createdAt: number;
  assignee?: string;
  photoBefore?: string;
  photoAfter?: string;
  resolveNote?: string;
  rejectReason?: string;
  workedAt?: number;
  resolvedAt?: number;
  rejectedAt?: number;
  comments?: CommentT[];
}

function mk(o: SeedOpts): Report {
  const district = nearestDistrict(o.x, o.y);
  const timeline: TimelineEvent[] = [
    ev(o.createdAt, "created", "Заявка зарегистрирована жителем", o.author),
  ];
  if (o.workedAt)
    timeline.push(
      ev(o.workedAt, "work", `Заявка взята в работу · ${o.assignee ?? "—"}`, o.assignee ?? "Диспетчер")
    );
  if (o.resolvedAt)
    timeline.push(ev(o.resolvedAt, "done", "Свалка устранена, отчёт приложен", o.assignee ?? "Служба"));
  if (o.rejectedAt)
    timeline.push(ev(o.rejectedAt, "rejected", "Заявка отклонена", "Администратор"));
  return {
    id: "r" + o.num,
    num: o.num,
    x: o.x,
    y: o.y,
    district,
    address: o.address,
    category: o.category,
    description: o.description,
    status: o.status,
    author: o.author,
    assignee: o.assignee,
    photoBefore: o.photoBefore,
    photoAfter: o.photoAfter,
    resolveNote: o.resolveNote,
    rejectReason: o.rejectReason,
    createdAt: o.createdAt,
    updatedAt: timeline[timeline.length - 1].ts,
    resolvedAt: o.resolvedAt,
    timeline,
    comments: o.comments ?? [],
  };
}

export function seedReports(): Report[] {
  return [
    mk({
      num: 111, x: 598, y: 520, address: "у Центрального парка, вход №2",
      category: "green",
      description: "После опиловки деревьев всю кучу веток бросили у входа в парк, уже неделю разрастается, мешает проходу колясок.",
      status: "new", author: "Олег Ткачёв", createdAt: at(0, 5),
      photoBefore: IMG.branches,
    }),
    mk({
      num: 109, x: 118, y: 586, address: "Объездное шоссе, 3-й км",
      category: "tires",
      description: "На обочине вывалена гора покрышек, примерно 40–50 штук, видны следы грузовика. Рядом водосток в реку.",
      status: "new", author: "В. Астахов", createdAt: at(0, 3),
      photoBefore: IMG.tires,
    }),
    mk({
      num: 103, x: 262, y: 232, address: "промзона, тупик Механический",
      category: "tires",
      description: "За гаражами кто-то складировал старые шины и масляные канистры. Летом это будет сильно пахнуть, прошу убрать.",
      status: "new", author: "Мария Ковалёва", createdAt: at(1, 2),
      photoBefore: IMG.tires,
      comments: [cm(at(0, 20), "Мария Ковалёва", "resident", "Добавлю: сегодня видел, как подъезжала «Газель» и что-то докладывала.")],
    }),
    mk({
      num: 106, x: 762, y: 362, address: "берег Быстрицы, у лодочной станции",
      category: "hazard",
      description: "На берегу лежит ржавый металлический лом и старый холодильник, при половодье всё это окажется в воде. Требуется срочный вывоз.",
      status: "new", author: "Елена Мороз", createdAt: at(2, 6),
      photoBefore: IMG.metal,
    }),
    mk({
      num: 108, x: 562, y: 392, address: "пустырь за рынком «Центральный»",
      category: "construction",
      description: "После ремонта магазинов на пустырь свезли бой кирпича, мешки со штукатуркой и обрезки гипсокартона. Объём растёт каждый день.",
      status: "work", author: "Игорь Ватутин", createdAt: at(4, 6),
      assignee: "Подрядчик «Чистый город»", workedAt: at(3, 7),
      photoBefore: IMG.construction,
      comments: [
        cm(at(1, 3), "Подрядчик «Чистый город»", "service", "Заказан бункер-накопитель на 8 м³, вывоз запланирован на пятницу."),
      ],
    }),
    mk({
      num: 105, x: 428, y: 118, address: "ул. Мира, лесополоса",
      category: "green",
      description: "В лесополосе свалена большая куча спиленных веток и стволов, рядом детская тропа в школу. Просим измельчить и вывезти.",
      status: "work", author: "Анна Литвинова", createdAt: at(6, 5),
      assignee: "ООО «Экосервис»", workedAt: at(5, 3),
      photoBefore: IMG.branches,
      comments: [
        cm(at(3, 2), "ООО «Экосервис»", "service", "Требуется измельчитель, работы планируем завершить до пятницы."),
      ],
    }),
    mk({
      num: 102, x: 330, y: 598, address: "ГСК «Юг», вдоль гаражей",
      category: "house",
      description: "Вдоль гаражей рассыпан бытовой мусор: пакеты, коробки, остатки еды. Разносят собаки и птицы, запах на весь двор.",
      status: "work", author: "Д. Смирнов", createdAt: at(9, 4),
      assignee: "МУП «Горкомхоз»", workedAt: at(8, 2),
      photoBefore: IMG.bags,
      comments: [
        cm(at(2, 1), "Д. Смирнов", "resident", "Подскажите, когда уже уберут? Мусора стало ещё больше."),
      ],
    }),
    mk({
      num: 107, x: 852, y: 298, address: "ул. Заречная, 5",
      category: "house",
      description: "Якобы у дома №5 куча мусора на газоне.",
      status: "rejected", author: "аноним", createdAt: at(15, 2),
      rejectedAt: at(14, 1),
      rejectReason: "При осмотре факт не подтвердился: территория чистая, заявка отклонена.",
      photoBefore: IMG.mixed,
    }),
    mk({
      num: 104, x: 505, y: 458, address: "пр-т Ленина, 42, двор",
      category: "house",
      description: "Контейнерная площадка переполнена, мусор лежит вокруг баков уже неделю, УК не реагирует на обращения.",
      status: "done", author: "Наталья Юдина", createdAt: at(19, 7),
      assignee: "МУП «Горкомхоз»", workedAt: at(19, 1), resolvedAt: at(17, 4),
      photoBefore: IMG.mixed, photoAfter: IMG.cleaned,
      resolveNote: "Вывезено 2,5 м³ отходов, площадка промыта и обработана. График вывоза скорректирован.",
      comments: [
        cm(at(17, 1), "Наталья Юдина", "resident", "Спасибо! Теперь во дворе чисто."),
      ],
    }),
    mk({
      num: 101, x: 150, y: 300, address: "ул. Заводская, 14, пустырь",
      category: "construction",
      description: "На пустыре у заброшенного цеха вывалена телега строительного мусора: кирпич, доски, куски обоев. Свалка растёт.",
      status: "done", author: "П. Гордеев", createdAt: at(26, 3),
      assignee: "МУП «Горкомхоз»", workedAt: at(25, 6), resolvedAt: at(23, 2),
      photoBefore: IMG.construction, photoAfter: IMG.cleaned,
      resolveNote: "Вывезено 4 м³ строительного мусора, установлены предупреждающие таблички.",
      comments: [
        cm(at(25, 5), "МУП «Горкомхоз»", "service", "Заявка принята, бригада №2 направлена."),
        cm(at(22, 8), "П. Гордеев", "resident", "Подтверждаю, всё убрали, спасибо!"),
      ],
    }),
    mk({
      num: 110, x: 472, y: 252, address: "ул. Первомайская, 8",
      category: "other",
      description: "За домом кто-то выгрузил старую мебель и ковры, всё промокло под дождём и превратилось в свалку.",
      status: "done", author: "С. Крылов", createdAt: at(32, 1),
      assignee: "ООО «Экосервис»", workedAt: at(31, 5), resolvedAt: at(26, 6),
      photoBefore: IMG.bags, photoAfter: IMG.cleaned,
      resolveNote: "Свалка ликвидирована, установлен знак «Свалка мусора запрещена», ведётся фотофиксация.",
    }),
  ];
}
