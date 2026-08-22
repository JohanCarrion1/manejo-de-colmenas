import { STATUS_META, STATUS_ORDER, type Hive, type HiveStatus } from "../data";
import { IconAlert, IconCrown } from "../ui";

interface Props {
  hives: Hive[];
  selectedId: string;
  onSelect: (id: string) => void;
  filter: HiveStatus | "todas";
  onFilter: (f: HiveStatus | "todas") => void;
  query: string;
}

const ROW_SHAPE = [7, 6, 7, 6];

function shortDays(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "hoy";
  return `${d}d`;
}

function HexCell({ hive, selected, dim, onSelect }: { hive: Hive; selected: boolean; dim: boolean; onSelect: (id: string) => void }) {
  const meta = STATUS_META[hive.status];
  return (
    <button
      onClick={() => onSelect(hive.id)}
      aria-label={`Colmena ${hive.id} — ${meta.label}`}
      className={`group relative shrink-0 transition-all duration-300 ${dim ? "opacity-20 saturate-50" : "opacity-100"} ${
        selected ? "z-10 -translate-y-1" : "hover:z-10 hover:-translate-y-1"
      }`}
      style={{ width: "var(--hexw)", height: "calc(var(--hexw) * 1.1547)", margin: "3px 4px" }}
    >
      {/* anillo exterior */}
      <span
        className="hexclip absolute inset-0 transition-all duration-300"
        style={{
          background: selected ? "#ffc961" : meta.color,
          filter: selected
            ? "drop-shadow(0 0 18px rgba(240,164,28,.5))"
            : "drop-shadow(0 6px 14px rgba(0,0,0,.35))",
        }}
      />
      {/* celda interior */}
      <span
        className="hexclip absolute transition-all duration-300 group-hover:brightness-125"
        style={{
          inset: selected ? "3px" : "2px",
          background: `radial-gradient(120% 120% at 50% 0%, ${meta.color}30 0%, #241b10 58%, #191209 100%)`,
        }}
      />
      <span className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0.5">
        {hive.status === "alerta" && <IconAlert className="h-3 w-3 text-coral" />}
        {hive.status === "sinreina" && <IconCrown className="h-3 w-3 text-mauve" />}
        <span className="font-mono text-[13px] font-semibold leading-none tracking-tight text-cream">{hive.id}</span>
        <span className="font-mono text-[9px] leading-none text-husk">{shortDays(hive.lastInspection)}</span>
      </span>
    </button>
  );
}

export default function HiveComb({ hives, selectedId, onSelect, filter, onFilter, query }: Props) {
  const rows: Hive[][] = [];
  let idx = 0;
  for (const n of ROW_SHAPE) {
    rows.push(hives.slice(idx, idx + n));
    idx += n;
  }

  const isDim = (h: Hive) =>
    (filter !== "todas" && h.status !== filter) ||
    (query.trim() !== "" && !h.id.toLowerCase().includes(query.trim().toLowerCase()));

  const chips: { key: HiveStatus | "todas"; label: string; n: number; color?: string }[] = [
    { key: "todas", label: "Todas", n: hives.length },
    ...STATUS_ORDER.map((s) => ({ key: s as HiveStatus | "todas", label: STATUS_META[s].label, n: hives.filter((h) => h.status === s).length, color: STATUS_META[s].color })),
  ];

  return (
    <div>
      {/* filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {chips.map((c) => {
          const active = filter === c.key;
          return (
            <button
              key={c.key}
              onClick={() => onFilter(c.key)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider transition-all duration-200 ${
                active
                  ? "border-honey bg-honey text-ink shadow-[0_0_18px_rgba(240,164,28,.35)]"
                  : "border-line bg-pane text-husk hover:border-honey/60 hover:text-cream"
              }`}
            >
              {c.color && <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />}
              {c.label}
              <span className={active ? "text-ink/70" : "text-husk/70"}>{c.n}</span>
            </button>
          );
        })}
      </div>

      {/* panal */}
      <div className="card relative overflow-hidden px-4 py-8 sm:px-8" style={{ ["--hexw" as string]: "clamp(58px, 6.8vw, 92px)" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: "radial-gradient(60% 70% at 50% 40%, rgba(240,164,28,.09) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center">
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-center" style={{ marginTop: ri === 0 ? 0 : "calc(var(--hexw) * -0.27)" }}>
              {row.map((h) => (
                <HexCell key={h.id} hive={h} selected={h.id === selectedId} dim={isDim(h)} onSelect={onSelect} />
              ))}
            </div>
          ))}
        </div>
        <p className="relative mt-7 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-husk">
          Toca una celda para abrir la ficha de la colmena
        </p>
      </div>
    </div>
  );
}
