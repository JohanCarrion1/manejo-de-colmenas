import { HARVEST_2024, HARVEST_2025, MONTHS, sum } from "../data";
import { useCountUp, useReveal } from "../hooks";

const MAX = 80;
const TARGET = 55;

export default function Production({ hivesCount }: { hivesCount: number }) {
  const { ref, inView } = useReveal();
  const total25 = sum(HARVEST_2025);
  const totalAnim = useCountUp(total25, inView, 1600);
  const bestIdx = HARVEST_2025.indexOf(Math.max(...HARVEST_2025));
  const active = HARVEST_2025.filter((v) => v > 0);
  const avg = Math.round(sum(active) / active.length);

  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} card p-6 sm:p-8`}>
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* gráfica */}
        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="tick-label">Kg de miel por mes</p>
            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-husk">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-honey" /> 2025
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-line2" /> 2024
              </span>
            </div>
          </div>

          <div className="relative">
            {/* líneas guía */}
            {[20, 40, 60].map((v) => (
              <div key={v} className="absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${(v / MAX) * 100}%` }}>
                <span className="absolute -top-2 left-0 font-mono text-[9px] text-husk">{v}</span>
              </div>
            ))}
            {/* objetivo */}
            <div className="absolute inset-x-0 z-10 border-t border-honey/50" style={{ bottom: `${(TARGET / MAX) * 100}%` }}>
              <span className="absolute -top-4 right-0 rounded bg-honey/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-honey">
                objetivo {TARGET} kg
              </span>
            </div>

            <div className="relative flex h-60 items-end gap-1 sm:gap-2">
              {MONTHS.map((m, i) => (
                <div key={m} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line2 bg-pane3 px-2.5 py-1.5 text-center opacity-0 shadow-xl transition-all duration-200 group-hover:-top-10 group-hover:opacity-100">
                    <p className="font-mono text-[11px] font-semibold text-honey">{HARVEST_2025[i]} kg</p>
                    <p className="font-mono text-[9px] text-husk">2024: {HARVEST_2024[i]} kg</p>
                  </div>
                  <div className="flex h-full items-end justify-center gap-[3px]">
                    <div
                      className="bar w-2 rounded-t-sm bg-line2 sm:w-2.5"
                      style={{ height: `${(HARVEST_2024[i] / MAX) * 100}%`, transitionDelay: `${i * 45}ms` }}
                    />
                    <div
                      className="bar w-2.5 rounded-t-sm transition-[filter] group-hover:brightness-125 sm:w-3.5"
                      style={{
                        height: `${(HARVEST_2025[i] / MAX) * 100}%`,
                        background: "linear-gradient(180deg,#ffc961,#f0a41c 45%,#b97d15)",
                        transitionDelay: `${i * 45 + 60}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-1 sm:gap-2">
            {MONTHS.map((m) => (
              <span key={m} className="flex-1 text-center font-mono text-[9px] uppercase tracking-wider text-husk">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* resumen */}
        <div className="flex shrink-0 flex-row gap-6 border-t border-line pt-8 lg:w-60 lg:flex-col lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex-1">
            <p className="tick-label">Total temporada</p>
            <p className="mt-1 font-display text-5xl font-black text-cream">
              {totalAnim}
              <span className="ml-1 text-2xl font-bold text-honey">kg</span>
            </p>
          </div>
          <div className="flex-1 space-y-5">
            <div>
              <p className="tick-label">Mejor mes</p>
              <p className="mt-1 text-sm font-semibold text-cream">
                {MONTHS[bestIdx]} · <span className="font-mono text-honey">{HARVEST_2025[bestIdx]} kg</span>
              </p>
            </div>
            <div>
              <p className="tick-label">Media mensual activa</p>
              <p className="mt-1 font-mono text-sm font-semibold text-cream">{avg} kg</p>
            </div>
            <div>
              <p className="tick-label">Rendimiento por colmena</p>
              <p className="mt-1 font-mono text-sm font-semibold text-cream">{(total25 / hivesCount).toFixed(1)} kg</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
