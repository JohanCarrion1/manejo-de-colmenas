import { useEffect, useState } from "react";
import {
  APIARY,
  SEED_HIVES,
  SEED_INSPECTIONS,
  SEED_TASKS,
  uid,
  type Hive,
  type HiveStatus,
  type Inspection,
  type Toast,
} from "./data";
import { useClock, useLocalState, useReveal } from "./hooks";
import {
  IconBee,
  IconCheck,
  IconClipboard,
  IconDrop,
  IconFlower,
  IconHex,
  IconPanel,
  IconPlus,
  IconSearch,
  IconSun,
  IconWind,
  SectionHead,
} from "./ui";
import Overview from "./components/Overview";
import HiveComb from "./components/HiveComb";
import HiveDetail from "./components/HiveDetail";
import Production from "./components/Production";
import Panels from "./components/Panels";
import InspectionModal, { type InspectionDraft } from "./components/InspectionModal";

const NAV = [
  { id: "panel", label: "Panel", icon: IconPanel },
  { id: "colmenas", label: "Colmenas", icon: IconHex },
  { id: "produccion", label: "Cosecha", icon: IconDrop },
  { id: "registro", label: "Cuaderno", icon: IconClipboard },
  { id: "tareas", label: "Tareas", icon: IconCheck },
] as const;

const SECTION_IDS = NAV.map((n) => n.id);

/* ---------- ambiente ---------- */

function Ambient() {
  return (
    <>
      <svg className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-[0.05]" aria-hidden="true">
        <defs>
          <pattern id="hexes" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(2.4)">
            <path d="M13.99 9.25l13 7.5v15l-13 7.5-13-7.5v-15z" fill="none" stroke="#f0a41c" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexes)" />
      </svg>
      <div className="glow-a pointer-events-none fixed -left-44 -top-44 z-0 h-[36rem] w-[36rem] rounded-full opacity-[0.13]" style={{ background: "radial-gradient(circle, #f0a41c 0%, transparent 65%)" }} />
      <div className="glow-b pointer-events-none fixed -bottom-52 -right-40 z-0 h-[40rem] w-[40rem] rounded-full opacity-[0.1]" style={{ background: "radial-gradient(circle, #b97d15 0%, transparent 65%)" }} />
      {[
        { top: "14%", dur: "46s", delay: "-8s", cls: "h-5 w-5 opacity-30" },
        { top: "44%", dur: "60s", delay: "-31s", cls: "h-4 w-4 opacity-25" },
        { top: "72%", dur: "52s", delay: "-19s", cls: "h-6 w-6 opacity-20" },
      ].map((b, i) => (
        <div key={i} className="bee-fly pointer-events-none fixed left-0 z-0" style={{ top: b.top, ["--dur" as string]: b.dur, animationDelay: b.delay }}>
          <div className="bee-bob">
            <IconBee className={`text-honey ${b.cls}`} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ---------- cabecera de página ---------- */

function IntroHead({ temp, wind, activity }: { temp: number; wind: number; activity: number }) {
  const now = useClock();
  const { ref, inView } = useReveal();
  const dateCap = (() => {
    const s = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })();
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  return (
    <header ref={ref} className={`reveal ${inView ? "in" : ""} flex flex-wrap items-end justify-between gap-6`}>
      <div>
        <p className="tick-label mb-3 flex items-center gap-2">
          <IconFlower className="h-3.5 w-3.5 text-honey" />
          {APIARY.name} · {APIARY.place}
        </p>
        <h1 className="font-display text-4xl font-black leading-[1.03] tracking-tight text-cream sm:text-5xl xl:text-6xl">
          El colmenar,
          <br />
          <em className="text-honey">bajo control.</em>
        </h1>
      </div>

      <div className="card flex items-center gap-5 px-5 py-4">
        <div>
          <p className="tick-label">{dateCap}</p>
          <p className="mt-1 font-mono text-2xl font-bold leading-none text-cream">
            {time}
            <span className="ml-1 text-xs font-normal text-husk">h</span>
          </p>
        </div>
        <div className="hidden h-11 w-px bg-line sm:block" />
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-cream">
            <IconSun className="h-4 w-4 text-honey" />
            {temp.toFixed(1)}°
          </span>
          <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-cream">
            <IconWind className="h-4 w-4 text-husk" />
            {wind}
            <span className="text-[10px] font-normal text-husk">km/h</span>
          </span>
        </div>
        <div className="hidden h-11 w-px bg-line sm:block" />
        <div className="hidden items-center gap-3 sm:flex">
          <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#392c19" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#f0a41c"
              strokeWidth="4"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${activity} 100`}
              className="transition-all duration-1000"
            />
          </svg>
          <div>
            <p className="font-display text-xl font-black leading-none text-cream">{activity}%</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-husk">actividad de vuelo</p>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- app ---------- */

export default function App() {
  const [hives, setHives] = useLocalState<Hive[]>("panal-hives-v1", SEED_HIVES);
  const [inspections, setInspections] = useLocalState<Inspection[]>("panal-inspections-v1", SEED_INSPECTIONS);
  const [tasks, setTasks] = useLocalState("panal-tasks-v1", SEED_TASKS);

  const [selectedId, setSelectedId] = useState("C-08");
  const [filter, setFilter] = useState<HiveStatus | "todas">("todas");
  const [query, setQuery] = useState("");
  const [modalHive, setModalHive] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [active, setActive] = useState("panel");

  const [temp, setTemp] = useState(22.4);
  const [wind, setWind] = useState(11);

  useEffect(() => {
    const id = setInterval(() => {
      setTemp((t) => +Math.min(24.5, Math.max(20.5, t + (Math.random() - 0.5) * 0.6)).toFixed(1));
      setWind((w) => Math.round(Math.min(16, Math.max(7, w + (Math.random() - 0.5) * 3))));
    }, 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const activity = Math.min(98, Math.max(5, Math.round(20 + (temp - 15) * 8 - wind * 1.4)));
  const alerts = hives.filter((h) => h.status === "alerta").length;
  const pending = tasks.filter((t) => !t.done).length;
  const selectedHive = hives.find((h) => h.id === selectedId) ?? hives[0];

  const pushToast = (title: string, desc?: string) => {
    const t: Toast = { id: uid(), title, desc };
    setToasts((prev) => [...prev, t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3600);
  };

  const handleInspection = (d: InspectionDraft) => {
    const insp: Inspection = { id: uid(), date: new Date().toISOString(), ...d };
    setInspections((prev) => [insp, ...prev]);
    setHives((prev) =>
      prev.map((h) => {
        if (h.id !== d.hiveId) return h;
        const status: HiveStatus = d.varroa >= 3 ? "alerta" : d.queenSeen ? (h.status === "sinreina" ? "revision" : "saludable") : "revision";
        return { ...h, brood: d.brood, honey: d.honey, varroa: d.varroa, status, lastInspection: insp.date, note: d.note };
      })
    );
    setModalHive(null);
    pushToast("Inspección registrada", `${d.hiveId} · ${d.queenSeen ? "reina vista" : "sin ver reina"} · varroa ${d.varroa.toFixed(1)}%`);
  };

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTask = (title: string) => {
    setTasks((prev) => [{ id: uid(), title, hiveId: null, due: "Esta semana", priority: "media" as const, done: false }, ...prev]);
    pushToast("Tarea añadida", title);
  };

  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const openAlerts = () => {
    setFilter("alerta");
    jumpTo("colmenas");
  };

  const navBtn = (n: (typeof NAV)[number], mobile = false) => {
    const isActive = active === n.id;
    const badge = n.id === "colmenas" ? hives.length : n.id === "tareas" ? pending : null;
    return (
      <button
        key={n.id}
        onClick={() => jumpTo(n.id)}
        className={`group relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
          mobile ? "" : "w-full"
        } ${isActive ? "bg-pane3 text-honey" : "text-husk hover:bg-pane2 hover:text-cream"}`}
      >
        {!mobile && (
          <span
            className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-honey transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}
          />
        )}
        <n.icon className={`h-4.5 w-4.5 transition-transform duration-200 ${isActive ? "" : "group-hover:translate-x-0.5"}`} />
        {n.label}
        {badge !== null && badge > 0 && (
          <span className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[10px] font-bold ${n.id === "tareas" && isActive ? "bg-honey text-ink" : "bg-ink text-husk"}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="relative min-h-screen">
      <Ambient />

      {/* barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-pane/80 backdrop-blur-md lg:flex">
        <a href="#panel" className="flex items-center gap-3 px-6 py-6">
          <span className="hexclip flex h-11 w-10 items-center justify-center bg-honey text-ink shadow-[0_0_24px_rgba(240,164,28,.35)]">
            <IconBee className="h-6 w-6" />
          </span>
          <span>
            <span className="block font-display text-xl font-black tracking-[0.08em] text-cream">PANAL</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-husk">cuaderno apícola</span>
          </span>
        </a>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV.map((n) => navBtn(n))}
        </nav>

        <div className="space-y-3 p-4">
          <div className="rounded-xl border border-line bg-ink/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-cream">
              <IconFlower className="h-4 w-4 text-honey" />
              {APIARY.name}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-husk">{APIARY.place}</p>
            <p className="mt-2 font-mono text-[10px] tracking-wider text-husk/70">{APIARY.coords}</p>
          </div>
          <div className="flex items-center gap-3 px-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-honey font-display text-sm font-black text-ink">
              MR
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight text-cream">{APIARY.keeper}</span>
              <span className="block font-mono text-[9px] uppercase tracking-widest text-husk">apicultora titular</span>
            </span>
          </div>
        </div>
      </aside>

      {/* contenido */}
      <div className="relative z-10 lg:pl-60">
        {/* barra superior */}
        <div className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <a href="#panel" className="flex items-center gap-2 lg:hidden">
              <span className="hexclip flex h-8 w-7 items-center justify-center bg-honey text-ink">
                <IconBee className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-lg font-black tracking-wider text-cream">PANAL</span>
            </a>

            <label className="relative ml-auto w-full max-w-[13rem] flex-1 sm:max-w-xs sm:ml-6">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-husk" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar colmena… (C-08)"
                className="w-full rounded-xl border border-line bg-pane py-2 pl-9 pr-3 text-sm text-cream placeholder:text-husk/60 transition-all duration-200 focus:border-honey/70 focus:shadow-[0_0_0_3px_rgba(240,164,28,.12)]"
              />
            </label>

            <button
              onClick={openAlerts}
              className="flex items-center gap-2 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-coral transition-all duration-200 hover:bg-coral/20"
              title="Ver colmenas en alerta"
            >
              <span className="pulse-dot h-2 w-2 rounded-full bg-coral" />
              <span className="hidden sm:inline">{alerts} alertas</span>
              <span className="sm:hidden">{alerts}</span>
            </button>

            <button
              onClick={() => setModalHive(selectedId)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-honey px-3.5 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-honeysoft hover:shadow-[0_6px_24px_rgba(240,164,28,.35)] active:scale-95 sm:px-4"
            >
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva inspección</span>
              <span className="sm:hidden">Inspección</span>
            </button>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-line/70 px-4 py-2 lg:hidden">
            {NAV.map((n) => navBtn(n, true))}
          </nav>
        </div>

        <main className="mx-auto max-w-6xl space-y-20 px-4 pb-10 pt-10 sm:px-6">
          <IntroHead temp={temp} wind={wind} activity={activity} />

          <section id="panel" className="scroll-mt-32">
            <Overview hives={hives} tasks={tasks} />
          </section>

          <section id="colmenas" className="scroll-mt-32">
            <SectionHead
              kicker="Mapa del bancal"
              title="Colmenas"
              right={
                <p className="text-right font-mono text-xs leading-relaxed text-husk">
                  {hives.length} colonias · 2 núcleos
                  <br />
                  distribución por calles
                </p>
              }
            />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <HiveComb hives={hives} selectedId={selectedId} onSelect={setSelectedId} filter={filter} onFilter={setFilter} query={query} />
              </div>
              <div className="lg:col-span-4">
                <HiveDetail hive={selectedHive} inspections={inspections} onInspect={setModalHive} />
              </div>
            </div>
          </section>

          <section id="produccion" className="scroll-mt-32">
            <SectionHead
              kicker="Báscula y alzas"
              title="Cosecha de miel"
              right={<p className="font-mono text-xs text-husk">comparativa 2024 / 2025</p>}
            />
            <Production hivesCount={hives.length} />
          </section>

          <section id="registro" className="scroll-mt-32">
            <SectionHead
              kicker="Diario del apicultor"
              title="Cuaderno y tareas"
              right={<p className="font-mono text-xs text-husk">las inspecciones se guardan en este dispositivo</p>}
            />
            <Panels inspections={inspections} hives={hives} tasks={tasks} onToggle={toggleTask} onAdd={addTask} />
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 text-xs text-husk">
            <span className="flex items-center gap-2">
              <span className="hexclip flex h-6 w-5 items-center justify-center bg-honey/90 text-ink">
                <IconBee className="h-3.5 w-3.5" />
              </span>
              <b className="font-display text-sm tracking-wider text-cream">PANAL</b> — cuaderno apícola digital
            </span>
            <span className="font-mono">{APIARY.coords}</span>
            <span>
              {hives.length} colmenas · {APIARY.season}
            </span>
          </footer>
        </main>
      </div>

      {/* modal */}
      <InspectionModal
        open={modalHive !== null}
        hives={hives}
        initialHive={modalHive ?? selectedId}
        onClose={() => setModalHive(null)}
        onSubmit={handleInspection}
      />

      {/* toasts */}
      <div className="fixed bottom-5 right-5 z-[60] flex w-72 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="toast-in card flex items-start gap-3 border-honey/40 p-4 shadow-[0_16px_40px_rgba(0,0,0,.5)]">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-honey text-ink">
              <IconCheck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cream">{t.title}</p>
              {t.desc && <p className="mt-0.5 truncate font-mono text-[11px] text-husk">{t.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
