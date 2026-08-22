import type { ReactNode } from "react";
import { QUEEN_MARK, STATUS_META, fmtDate, relDays, type Hive, type Inspection } from "../data";
import { IconBug, IconCrown, IconDrop, IconLayers, IconPlus, IconScale, StatusPill } from "../ui";

interface Props {
  hive: Hive;
  inspections: Inspection[];
  onInspect: (id: string) => void;
}

function MeterRow({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-28 shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-husk">
        {icon}
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Bar({ value, max, color, grad }: { value: number; max: number; color: string; grad?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ink">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${(value / max) * 100}%`, background: grad ?? color }}
      />
    </div>
  );
}

export default function HiveDetail({ hive, inspections, onInspect }: Props) {
  const meta = STATUS_META[hive.status];
  const history = inspections.filter((i) => i.hiveId === hive.id).slice(0, 2);
  const varroaColor = hive.varroa < 1.5 ? "#a3bf7f" : hive.varroa < 2.5 ? "#f0a41c" : "#e4603f";
  const mark = hive.queenYear ? QUEEN_MARK[hive.queenYear] : null;

  return (
    <aside className="lg:sticky lg:top-28">
      <div key={hive.id} className="card fade-in relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: meta.color }} />

        {/* cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="tick-label">Colmena</p>
            <h3 className="font-display text-5xl font-black tracking-tight text-cream">{hive.id}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusPill status={hive.status} />
            <span className="font-mono text-[10px] uppercase tracking-wider text-husk">rev. {relDays(hive.lastInspection)}</span>
          </div>
        </div>

        {/* reina */}
        <div
          className="mt-5 flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{ borderColor: (mark ? mark.color : "#bd93b8") + "44", background: (mark ? mark.color : "#bd93b8") + "10" }}
        >
          <IconCrown className="h-5 w-5" />
          {hive.queenYear && mark ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-cream">Reina {hive.queenYear}</span>
              <span className="h-2.5 w-2.5 rounded-full border border-ink" style={{ background: mark.color }} />
              <span className="text-husk">marcada {mark.name}</span>
            </div>
          ) : (
            <div className="text-sm">
              <span className="font-semibold text-mauve">Sin reina</span>
              <span className="ml-2 text-husk">introducir celda real o reina fecundada</span>
            </div>
          )}
        </div>

        {/* métricas */}
        <div className="mt-6 space-y-4">
          <MeterRow label="Población" icon={<span className="inline-block h-2 w-2 rounded-full bg-sage" />}>
            <div className="flex items-center gap-1.5 pt-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="hexclip h-4 w-3.5" style={{ background: i < hive.population ? "#a3bf7f" : "#392c19" }} />
              ))}
              <span className="ml-2 font-mono text-xs text-husk">{["muy baja", "baja", "media", "buena", "fuerte"][hive.population - 1]}</span>
            </div>
          </MeterRow>

          <MeterRow label="Cría" icon={<IconLayers className="h-3.5 w-3.5 text-husk" />}>
            <div className="flex items-center gap-3">
              <Bar value={hive.brood} max={10} color="#d8b25e" />
              <span className="w-10 text-right font-mono text-xs text-cream">{hive.brood}/10</span>
            </div>
          </MeterRow>

          <MeterRow label="Miel" icon={<IconDrop className="h-3.5 w-3.5 text-honey" />}>
            <div className="flex items-center gap-3">
              <Bar value={hive.honey} max={10} color="#f0a41c" grad="linear-gradient(90deg,#b97d15,#ffc961)" />
              <span className="w-10 text-right font-mono text-xs text-cream">{hive.honey}/10</span>
            </div>
          </MeterRow>

          <MeterRow label="Varroa" icon={<IconBug className="h-3.5 w-3.5" />}>
            <div className="flex items-center gap-3">
              <Bar value={hive.varroa} max={5} color={varroaColor} />
              <span className="w-12 text-right font-mono text-xs font-semibold" style={{ color: varroaColor }}>
                {hive.varroa.toFixed(1)}%
              </span>
            </div>
          </MeterRow>

          <MeterRow label="Peso" icon={<IconScale className="h-3.5 w-3.5 text-husk" />}>
            {hive.weight !== null ? (
              <span className="font-mono text-sm font-semibold text-cream">
                {hive.weight.toFixed(1)} kg <span className="ml-1 text-[10px] font-normal text-husk">en báscula</span>
              </span>
            ) : (
              <span className="font-mono text-xs text-husk">sin báscula</span>
            )}
          </MeterRow>
        </div>

        {/* nota */}
        <p className="mt-6 border-l-2 border-honey/60 pl-3 text-sm italic leading-relaxed text-husk">“{hive.note}”</p>

        {/* historial */}
        {history.length > 0 && (
          <div className="mt-6">
            <p className="tick-label mb-3">Últimas entradas</p>
            <div className="space-y-2">
              {history.map((i) => (
                <div key={i.id} className="flex items-center gap-3 rounded-lg border border-line bg-ink/60 px-3 py-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-husk">{fmtDate(i.date)}</span>
                  <span className="font-mono text-[11px]" style={{ color: i.varroa >= 2 ? "#e4603f" : "#a3bf7f" }}>
                    varroa {i.varroa.toFixed(1)}%
                  </span>
                  <span className="ml-auto truncate text-xs text-husk">{i.note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onInspect(hive.id)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-honey py-3 font-semibold text-ink transition-all duration-200 hover:bg-honeysoft hover:shadow-[0_8px_28px_rgba(240,164,28,.35)] active:scale-[0.98]"
        >
          <IconPlus className="h-4 w-4" />
          Registrar inspección
        </button>
      </div>
    </aside>
  );
}
