import { useState, type FormEvent } from "react";
import { STATUS_META, fmtDate, relDays, type Hive, type Inspection, type Task } from "../data";
import { IconBug, IconCheck, IconClipboard, IconCrown, IconPlus } from "../ui";

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  alta: "#e4603f",
  media: "#f0a41c",
  baja: "#a3906a",
};

interface Props {
  inspections: Inspection[];
  hives: Hive[];
  tasks: Task[];
  onToggle: (id: string) => void;
  onAdd: (title: string) => void;
}

export default function Panels({ inspections, hives, tasks, onToggle, onAdd }: Props) {
  const [draft, setDraft] = useState("");
  const statusOf = (id: string) => hives.find((h) => h.id === id)?.status ?? "revision";
  const done = tasks.filter((t) => t.done).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onAdd(title);
    setDraft("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* cuaderno */}
      <div className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-ink text-honey">
            <IconClipboard className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold text-cream">Cuaderno de campo</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-husk">{inspections.length} inspecciones anotadas</p>
          </div>
        </div>

        <div className="divide-y divide-line">
          {inspections.slice(0, 6).map((i) => {
            const color = STATUS_META[statusOf(i.hiveId)].color;
            return (
              <article key={i.id} className="group flex gap-3.5 py-4 transition-colors first:pt-0 hover:bg-pane2/40">
                <span className="w-1 shrink-0 self-stretch rounded-full transition-transform group-hover:scale-y-105" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-line bg-ink px-2 py-0.5 font-mono text-[11px] font-semibold text-cream">{i.hiveId}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-husk">
                      {fmtDate(i.date)} · {relDays(i.date)}
                    </span>
                    {i.queenSeen ? (
                      <span className="ml-auto flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-sage">
                        <IconCrown className="h-3 w-3" /> reina vista
                      </span>
                    ) : (
                      <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-mauve">sin ver reina</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-husk">
                    <span>cría <b className="text-cream">{i.brood}</b></span>
                    <span>miel <b className="text-cream">{i.honey}</b></span>
                    <span className={i.varroa >= 2 ? "flex items-center gap-1 text-coral" : ""}>
                      {i.varroa >= 2 && <IconBug className="h-3 w-3" />}
                      varroa <b>{i.varroa.toFixed(1)}%</b>
                    </span>
                    <span>ánimo {["—", "mansa", "normal", "nerviosa"][i.calm]}</span>
                  </div>
                  <p className="mt-1.5 truncate text-sm italic text-husk">“{i.note}”</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* tareas */}
      <div id="tareas" className="card scroll-mt-32 p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-ink text-honey">
            <IconCheck className="h-4.5 w-4.5" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold text-cream">Tareas del colmenar</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-husk">
              {done}/{tasks.length} completadas
            </p>
          </div>
          <span className="font-display text-3xl font-black text-honey">{Math.round((done / tasks.length) * 100)}%</span>
        </div>

        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-ink">
          <div className="h-full rounded-full bg-honey transition-all duration-500" style={{ width: `${(done / tasks.length) * 100}%` }} />
        </div>

        <ul className="divide-y divide-line">
          {tasks.map((t) => (
            <li key={t.id}>
              <button onClick={() => onToggle(t.id)} className="group flex w-full items-start gap-3.5 py-3.5 text-left">
                <span
                  className="hexclip mt-0.5 flex h-[22px] w-5 shrink-0 items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{ background: t.done ? "#f0a41c" : "#2d2214" }}
                >
                  {t.done && <IconCheck className="h-3 w-3 text-ink" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-medium transition-all duration-300 ${t.done ? "text-husk line-through" : "text-cream"}`}>
                    {t.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-husk">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[t.priority] }} />
                      {t.priority}
                    </span>
                    <span className={t.due === "Hoy" && !t.done ? "text-coral" : ""}>{t.due}</span>
                    {t.hiveId && <span className="rounded border border-line bg-ink px-1.5 py-px text-[10px] text-cream/80">{t.hiveId}</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Añadir tarea… (ej. subir alzas en C-09)"
            className="min-w-0 flex-1 rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-cream placeholder:text-husk/60 transition-colors focus:border-honey/70"
          />
          <button
            type="submit"
            aria-label="Añadir tarea"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-honey text-ink transition-all hover:bg-honeysoft active:scale-95"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
