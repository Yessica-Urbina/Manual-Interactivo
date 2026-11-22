import { Check, RotateCcw } from 'lucide-react';
import { checklistItems } from '../utils.js';

export default function ChecklistInteractivo({ done, setDone }) {
  const items = checklistItems();
  const count = items.filter((i) => done[i.id]).length;
  const pct = Math.round((count / items.length) * 100);
  const etapas = [...new Set(items.map((i) => i.etapa))];
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-500">Progreso del trámite</p>
            <p className="text-3xl font-bold text-slate-900">{pct}%</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            {count} de {items.length} tareas
            <button onClick={() => setDone({})} className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {etapas.map((e) => (
        <div key={e} className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-900">{e}</h3>
          <ul className="divide-y divide-slate-100">
            {items.filter((i) => i.etapa === e).map((i) => (
              <li key={i.id}>
                <button onClick={() => setDone({ ...done, [i.id]: !done[i.id] })} className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-slate-50">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${done[i.id] ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                    {done[i.id] && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${done[i.id] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{i.item}</span>
                    <span className="text-xs text-slate-400">{i.donde}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
