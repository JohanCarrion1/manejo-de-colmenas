import type { ReactNode } from "react";
import { HARVEST_2024, HARVEST_2025, STATUS_META, STATUS_ORDER, sum, type Hive, type Task } from "../data";
import { useCountUp, useReveal } from "../hooks";

function Card({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useReveal();
  return (
    <div ref={ref} className={`reveal ${inView ? "in" : ""} card p-6 ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Overview({ hives, tasks }: { hives: Hive[]; tasks: Task[] }) {
  const { ref, inView } = useReveal();
  const total = hives.length;
  const counts = STATUS_ORDER.map((s) => ({ s, n: hives.filter((h) => h.status === s).length }));
  const health = Math.round((counts[0].n / total) * 100);
  const healthAnim = useCountUp(health, inView);
  const prodTotal = sum(HARVEST_2025);
  const prodAnim = useCountUp(prodTotal, inView, 1700);
  const avgVarroa = hives.reduce((a, h) => a + h.varroa, 0) / total;
  const varroaAnim = useCountUp(avgVarroa, inView, 1500, 1);
  const pending = tasks.filter((t) => !t.done);
  const nextTask = pending.find((t) => t.due === "Hoy") ?? pending[0];
  const prodDelta = Math.round(((prodTotal - sum(HARVEST_2024)) / sum(HARVEST_2024)) * 100);

  const cum: number[] = [];
  HARVEST_2025.reduce((a, v) => {
    const n = a + v;
    cum.push(n);
    return n;
  }, 0);
  const max = cum[cum.length - 1] || 1;
  const pts = cum.map((v, i) => `${(i * 120) / 11},${38 - (v / max) * 32}`).join(" ");

  const varroaColor = avgVarroa < 1.5 ? "#a3bf7f" : avgVarroa < 2.5 ? "#f0a41c" : "#e4603f";

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 lg:grid-cols-12">
      {/* Estado del colmenar */}
      <Card className="col-span-2 lg:col-span-5" delay={0}>
        <p className="tick-label">Estado del colmenar</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-6xl font-black leading-none text-cream sm:text-7xl">{healthAnim}</span>
          <span className="font-display text-3xl font-bold text-honey">%</span>
          <span className="pb-1.5 text-sm text-husk">de las colmenas en forma</span>
        </div>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full border border-line bg-ink">
          {counts.map(
            ({ s, n }) =>
              n > 0 && (
                <div
                  key={s}
                  className="h-full transition-all duration-700"
                  style={{ width: inView ? `${(n / total) * 100}%` : "0%", background: STATUS_META[s].color }}
                  title={`${STATUS_META[s].label}: ${n}`}
                />
              )
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {counts.map(({ s, n }) => (
            <div key={s} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: STATUS_META[s].color }} />
              <span className="text-xs text-husk">{STATUS_META[s].label}</span>
              <span className="ml-auto font-mono text-sm font-semibold text-cream">{n}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Cosecha */}
      <Card className="col-span-1 lg:col-span-3" delay={90}>
        <div className="flex items-start justify-between">
          <p className="tick-label">Cosecha 2025</p>
          <span className="rounded-full border border-sage/40 bg-sage/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sage">
            +{prodDelta}% vs 24
          </span>
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-5xl font-black leading-none text-cream">{prodAnim}</span>
          <span className="pb-1 font-display text-xl font-bold text-honey">kg</span>
        </div>
        <svg viewBox="0 0 120 40" className="mt-4 h-14 w-full" preserveAspectRatio="none">
          <path d={`M0,38 L${pts.split(" ").join(" L")} L120,38 Z`} fill="#f0a41c" opacity="0.1" />
          <polyline points={pts} pathLength={1} className="spark" fill="none" stroke="#f0a41c" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="mt-2 text-xs text-husk">Acumulado de temporada · pico en julio</p>
      </Card>

      {/* Varroa */}
      <Card className="col-span-1 lg:col-span-2" delay={180}>
        <p className="tick-label">Varroa media</p>
        <div className="mt-3 flex items-end gap-1">
          <span className="font-display text-4xl font-black leading-none" style={{ color: varroaColor }}>
            {varroaAnim.toFixed(1)}
          </span>
          <span className="pb-0.5 text-sm font-semibold" style={{ color: varroaColor }}>
            %
          </span>
        </div>
        <div className="mt-4 flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-2 flex-1 rounded-sm transition-colors duration-500"
              style={{ background: i < Math.round((avgVarroa / 5) * 5) ? varroaColor : "#392c19" }}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-husk">Umbral de tratamiento: 2%</p>
      </Card>

      {/* Tareas */}
      <Card className="col-span-2 lg:col-span-2" delay={270}>
        <p className="tick-label">Tareas</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="font-display text-4xl font-black leading-none text-cream">{pending.length}</span>
          <span className="pb-1 text-sm text-husk">pendientes</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink">
          <div
            className="h-full rounded-full bg-honey transition-all duration-700"
            style={{ width: inView ? `${((tasks.length - pending.length) / tasks.length) * 100}%` : "0%" }}
          />
        </div>
        {nextTask && (
          <p className="mt-4 truncate text-xs text-husk">
            Siguiente: <span className="text-cream">{nextTask.title}</span>
            <span className="ml-1 font-mono text-[10px] uppercase text-honey">{nextTask.due}</span>
          </p>
        )}
      </Card>
    </div>
  );
}
