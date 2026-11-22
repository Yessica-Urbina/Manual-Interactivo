import { useState } from 'react';
import { ArrowDown, Check, ChevronDown, Clock, Lock, RotateCcw } from 'lucide-react';
import data from '../data/data.json';
import { fmtNum, useLocalStorage } from '../utils.js';

const TONES = { A: 'bg-blue-600', B: 'bg-orange-500', C: 'bg-emerald-600', D: 'bg-amber-500', E: 'bg-violet-600' };
const CARD = { done: 'border-emerald-300 bg-emerald-50', ready: 'border-blue-400 bg-white shadow-md ring-4 ring-blue-100', locked: 'border-slate-200 bg-white/70' };

// Lee los pasos desde la hoja Ruta del Excel
const readSteps = () => data.Ruta.blocks.find((b) => b.type === 'table').rows.map((r) => ({
  n: r[1], etapa: r[0], texto: r[2], donde: r[3], costo: r.slice(4, 7), tiempo: r[7], deps: String(r[8] || '').match(/\d+/g)?.map(Number) || [],
}));

// Pasos consecutivos de la misma etapa con las mismas dependencias se dibujan en paralelo
function toLayers(list) {
  const out = [];
  list.forEach((s) => {
    const last = out[out.length - 1];
    if (last && last[0].etapa === s.etapa && s.deps.length && last[0].deps.join() === s.deps.join()) last.push(s);
    else out.push([s]);
  });
  return out;
}

function Nodo({ s, state, open, onOpen, onToggle }) {
  const bar = TONES[s.etapa[0]];
  const badge = state === 'done' ? 'bg-emerald-500 text-white' : state === 'ready' ? `${bar} text-white motion-safe:animate-pulse` : 'bg-slate-200 text-slate-500';
  const [pen, cop, usd] = s.costo;
  return (
    <div className={`w-full rounded-xl border p-3 transition sm:w-72 ${CARD[state]}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} disabled={state === 'locked'} aria-label={`Marcar paso ${s.n}`} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badge}`}>
          {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : state === 'locked' ? <Lock className="h-3.5 w-3.5" /> : s.n}
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className={`block text-sm font-medium ${state === 'done' ? 'text-emerald-800' : state === 'locked' ? 'text-slate-500' : 'text-slate-900'}`}>{s.texto}</span>
          {s.tiempo && <span className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3 w-3" />{s.tiempo}</span>}
        </button>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <dl className="mt-3 space-y-1.5 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
          <div><dt className="inline font-semibold text-slate-700">Dónde: </dt><dd className="inline">{s.donde && typeof s.donde === 'object' ? <a href={s.donde.url} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{s.donde.text} 🔗</a> : s.donde}</dd></div>
          {typeof pen === 'number' && <div><dt className="inline font-semibold text-slate-700">Costo: </dt><dd className="inline">S/ {fmtNum(pen)} · COP {fmtNum(cop)} · US$ {fmtNum(usd)}</dd></div>}
          {s.deps.length > 0 && <div><dt className="inline font-semibold text-slate-700">Requiere: </dt><dd className="inline">paso{s.deps.length > 1 ? 's' : ''} {s.deps.join(', ')}</dd></div>}
        </dl>
      )}
    </div>
  );
}

export default function DiagramaFlujo() {
  const [done, setDone] = useLocalStorage('mt-flujo', {});
  const [open, setOpen] = useState(null);
  const list = readSteps();
  const layers = toLayers(list);
  const count = list.filter((s) => done[s.n]).length;
  const pct = Math.round((count / list.length) * 100);
  const stateOf = (s) => (done[s.n] ? 'done' : s.deps.every((d) => done[d]) ? 'ready' : 'locked');
  const next = list.find((s) => stateOf(s) === 'ready');
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow-md ring-1 ring-slate-200">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">{next ? <>Siguiente paso: <span className="font-semibold text-slate-900">{next.n}. {next.texto}</span></> : 'Completaste todo el recorrido.'}</p>
          <button onClick={() => setDone({})} className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /> Reiniciar</button>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>{count} de {list.length} pasos ({pct}%)</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completado</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Disponible</span>
          <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Bloqueado (falta un paso previo)</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-slate-200 sm:p-6">
        {layers.map((layer, li) => {
          const etapa = layer[0].etapa;
          const nuevaEtapa = li === 0 || layers[li - 1][0].etapa !== etapa;
          return (
            <div key={li}>
              {li > 0 && <div className="flex justify-center py-2 text-slate-300"><ArrowDown className="h-5 w-5" /></div>}
              {nuevaEtapa && <div className={`mx-auto mb-3 w-fit rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-sm ${TONES[etapa[0]]}`}>{etapa}</div>}
              {layer.length > 1 && <p className="mb-2 text-center text-xs text-slate-400">Puedes hacerlos en paralelo</p>}
              <div className="flex flex-wrap items-start justify-center gap-3">
                {layer.map((s) => (
                  <Nodo key={s.n} s={s} state={stateOf(s)} open={open === s.n} onOpen={() => setOpen(open === s.n ? null : s.n)} onToggle={() => setDone({ ...done, [s.n]: !done[s.n] })} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
