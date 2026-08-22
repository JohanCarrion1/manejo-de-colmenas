export type HiveStatus = "saludable" | "revision" | "alerta" | "sinreina";

export interface Hive {
  id: string;
  status: HiveStatus;
  queenYear: number | null;
  population: number; // 1–5
  brood: number; // cuadros de cría 0–10
  honey: number; // cuadros de miel 0–10
  varroa: number; // % infestación
  weight: number | null; // kg (báscula)
  lastInspection: string; // ISO
  note: string;
}

export interface Inspection {
  id: string;
  hiveId: string;
  date: string; // ISO
  queenSeen: boolean;
  brood: number;
  honey: number;
  varroa: number;
  calm: 1 | 2 | 3;
  note: string;
}

export interface Task {
  id: string;
  title: string;
  hiveId: string | null;
  due: string;
  priority: "alta" | "media" | "baja";
  done: boolean;
}

export interface Toast {
  id: string;
  title: string;
  desc?: string;
}

/* ---------- helpers ---------- */

export const uid = () => Math.random().toString(36).slice(2, 10);

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d.toISOString();
}

export function relDays(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff <= 0) return "hoy";
  if (diff === 1) return "ayer";
  return `hace ${diff} días`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

/* ---------- metadatos ---------- */

export const STATUS_META: Record<HiveStatus, { label: string; color: string }> = {
  saludable: { label: "Saludable", color: "#a3bf7f" },
  revision: { label: "Revisión", color: "#f0a41c" },
  alerta: { label: "Alerta", color: "#e4603f" },
  sinreina: { label: "Sin reina", color: "#bd93b8" },
};

export const STATUS_ORDER: HiveStatus[] = ["saludable", "revision", "alerta", "sinreina"];

export const QUEEN_MARK: Record<number, { name: string; color: string }> = {
  2022: { name: "blanca", color: "#e8e4da" },
  2023: { name: "roja", color: "#e4603f" },
  2024: { name: "verde", color: "#7fb069" },
  2025: { name: "azul", color: "#6fa8dc" },
  2026: { name: "blanca", color: "#e8e4da" },
};

export const APIARY = {
  name: "Apiario La Dehesa",
  place: "Sierra de San Pedro · Extremadura",
  coords: "39.46° N, 6.72° O",
  keeper: "Marta Ruano",
  season: "Temporada 2025",
};

/* ---------- semillas ---------- */

type Row = [string, HiveStatus, number | null, number, number, number, number, number | null, number, string];

const ROWS: Row[] = [
  ["C-01", "saludable", 2024, 5, 8, 6, 0.8, 41.2, 4, "Puesta sólida con patrón compacto."],
  ["C-02", "saludable", 2025, 4, 7, 5, 0.6, 38.5, 6, "Reina nueva en plena postura."],
  ["C-03", "revision", 2024, 3, 5, 4, 1.8, 33.0, 9, "Bajó la entrada de polen esta semana."],
  ["C-04", "saludable", 2024, 5, 8, 7, 0.5, 44.8, 3, "Fuerte; candidata a donante de cría."],
  ["C-05", "saludable", 2023, 4, 6, 6, 1.1, 39.1, 5, "Enjambre del 23, muy estable."],
  ["C-06", "alerta", 2023, 2, 3, 2, 3.4, null, 2, "Varroa en alza: tratar esta semana."],
  ["C-07", "saludable", 2025, 4, 7, 5, 0.4, 36.9, 7, "Núcleo consolidado, muy mansa."],
  ["C-08", "revision", 2024, 3, 4, 5, 1.6, 34.7, 11, "Celdas reales en marco 6: vigilar enjambrazón."],
  ["C-09", "saludable", 2024, 5, 8, 6, 0.7, 42.3, 4, "Trabajando romero a tope."],
  ["C-10", "saludable", 2024, 4, 7, 6, 0.9, 40.0, 6, "Alza a tres cuartos, subir pronto."],
  ["C-11", "sinreina", null, 2, 2, 3, 1.2, null, 1, "Huérfana detectada; celda real introducida."],
  ["C-12", "saludable", 2025, 4, 6, 5, 0.5, 35.6, 8, "Buen temperamento, cuadro a cuadro."],
  ["C-13", "revision", 2023, 3, 4, 4, 2.1, 31.2, 10, "Reservas justas: alimentar 1:1."],
  ["C-14", "alerta", 2023, 2, 2, 2, 3.8, null, 2, "Despoblada y con varroa; valorar reunión."],
  ["C-15", "saludable", 2024, 5, 7, 6, 0.8, 41.7, 5, "Piquera con pecoreo intenso."],
  ["C-16", "saludable", 2024, 4, 6, 5, 1.0, 37.3, 9, "Todo en orden tras el alza."],
  ["C-17", "saludable", 2025, 3, 5, 4, 0.6, 33.8, 6, "Núcleo del año pasado, muy noble."],
  ["C-18", "revision", 2024, 3, 4, 4, 1.9, 32.5, 12, "Postura irregular en dos marcos."],
  ["C-19", "saludable", 2024, 5, 8, 7, 0.7, 43.6, 3, "La mejor del bancal alto."],
  ["C-20", "saludable", 2024, 4, 7, 5, 0.8, 38.9, 7, "Operculado fresco en alza."],
  ["C-21", "sinreina", null, 2, 1, 2, 1.4, null, 2, "Segunda huérfana; pedir reina fecundada."],
  ["C-22", "saludable", 2023, 4, 6, 6, 1.2, 36.1, 8, "Veterana, aguanta bien el calor."],
  ["C-23", "alerta", 2024, 2, 3, 3, 3.1, 28.7, 1, "Moho en dos marcos; limpiar piso."],
  ["C-24", "saludable", 2025, 4, 6, 5, 0.5, 34.4, 5, "Creciendo rápido con la floración."],
  ["C-25", "revision", 2024, 3, 5, 4, 1.7, 33.3, 9, "Zánganos en exceso; revisar láminas."],
  ["C-26", "saludable", 2024, 5, 7, 6, 0.9, 40.6, 4, "Cerrando el bancal, impecable."],
];

export const SEED_HIVES: Hive[] = ROWS.map(
  ([id, status, queenYear, population, brood, honey, varroa, weight, days, note]) => ({
    id,
    status,
    queenYear,
    population,
    brood,
    honey,
    varroa,
    weight,
    lastInspection: daysAgoISO(days),
    note,
  })
);

export const SEED_INSPECTIONS: Inspection[] = [
  { id: "i1", hiveId: "C-14", date: daysAgoISO(2), queenSeen: true, brood: 2, honey: 2, varroa: 3.8, calm: 2, note: "Pocas obreras, varroa visible sobre cría." },
  { id: "i2", hiveId: "C-06", date: daysAgoISO(2), queenSeen: true, brood: 3, honey: 2, varroa: 3.4, calm: 3, note: "Seis ácaros en test de azúcar; trato ya." },
  { id: "i3", hiveId: "C-11", date: daysAgoISO(1), queenSeen: false, brood: 2, honey: 3, varroa: 1.2, calm: 3, note: "Alboroto en piquera, sin huevos a la vista." },
  { id: "i4", hiveId: "C-23", date: daysAgoISO(1), queenSeen: true, brood: 3, honey: 3, varroa: 3.1, calm: 2, note: "Humedad en el piso; retiro marcos con moho." },
  { id: "i5", hiveId: "C-04", date: daysAgoISO(3), queenSeen: true, brood: 8, honey: 7, varroa: 0.5, calm: 1, note: "Entrada intensa de néctar de romero." },
  { id: "i6", hiveId: "C-01", date: daysAgoISO(4), queenSeen: true, brood: 8, honey: 6, varroa: 0.8, calm: 1, note: "Colmena modelo, panal impecable." },
  { id: "i7", hiveId: "C-13", date: daysAgoISO(10), queenSeen: true, brood: 4, honey: 4, varroa: 2.1, calm: 2, note: "Jarabe consumido a medias; repito en 3 días." },
  { id: "i8", hiveId: "C-08", date: daysAgoISO(11), queenSeen: true, brood: 4, honey: 5, varroa: 1.6, calm: 2, note: "Celdas reales en borde inferior del marco 6." },
];

export const SEED_TASKS: Task[] = [
  { id: "t1", title: "Tratamiento varroa (oxálico)", hiveId: "C-14", due: "Hoy", priority: "alta", done: false },
  { id: "t2", title: "Limpiar piso y marcos con moho", hiveId: "C-23", due: "Hoy", priority: "alta", done: false },
  { id: "t3", title: "Comprobar aceptación de celda real", hiveId: "C-11", due: "Mañana", priority: "alta", done: false },
  { id: "t4", title: "Añadir segunda alza", hiveId: "C-04", due: "Esta semana", priority: "media", done: false },
  { id: "t5", title: "Pedir reina fecundada", hiveId: "C-21", due: "Esta semana", priority: "media", done: false },
  { id: "t6", title: "Revisar piqueras tras el viento", hiveId: null, due: "Ayer", priority: "baja", done: true },
  { id: "t7", title: "Desinfectar material de alza", hiveId: null, due: "Ayer", priority: "baja", done: true },
];

/* ---------- cosecha ---------- */

export const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
export const HARVEST_2025 = [0, 3, 12, 26, 38, 52, 64, 71, 58, 34, 12, 0];
export const HARVEST_2024 = [0, 2, 9, 21, 31, 44, 55, 60, 47, 28, 9, 0];

export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
