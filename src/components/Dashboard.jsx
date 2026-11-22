import { useEffect, useState } from 'react';
import { CalendarClock, ListChecks, ShieldAlert } from 'lucide-react';
import { calcHitos, checklistItems, flightDays, fmtNum, nums } from '../utils.js';

function useCountUp(to, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setV(to); return undefined; }
    let raf, t0;
    const step = (t) => { t0 ??= t; const p = Math.min((t - t0) / ms, 1); setV(to * (1 - (1 - p) ** 3)); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
}

const TONES = {
  emerald: 'from-emerald-50 to-white ring-emerald-200 text-emerald-600 bg-emerald-100',
  violet: 'from-violet-50 to-white ring-violet-200 text-violet-600 bg-violet-100',
  red: 'from-red-50 to-white ring-red-200 text-red-600 bg-red-100',
};

function Metric({ icon: Icon, tone, label, children }) {
  const [grad, ring, text, chip] = TONES[tone].split(' ').reduce((a, c) => (c.startsWith('from-') || c.startsWith('to-') ? [`${a[0]} ${c}`, a[1], a[2], a[3]] : c.startsWith('ring-') ? [a[0], c, a[2], a[3]] : c.startsWith('text-') ? [a[0], a[1], c, a[3]] : [a[0], a[1], a[2], c]), ['', '', '', '']);
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${grad} p-5 shadow-sm ring-1 ${ring} transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${chip} ${text}`}><Icon className="h-5 w-5" /></span>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({ fecha, done, go }) {
  const [pen = 0, cop = 0, usd = 0] = nums('Cotizacion', 'TOTAL ESTIMADO');
  const total = useCountUp(pen);
  const items = checklistItems();
  const pending = items.filter((i) => !done[i.id]);
  const pct = Math.round(((items.length - pending.length) / items.length) * 100);
  const vencidos = calcHitos(fecha).filter((h) => h.s === 'red').length;
  const dias = flightDays(fecha);
  const desglose = [['Servicios de agencia', 'bg-blue-500'], ['Pasajes y gastos de viaje', 'bg-indigo-500'], ['Pasaporte venezolano', 'bg-violet-500']]
    .map(([l, c]) => [l, c, nums('Cotizacion', l)[0] || 0]);
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-blue-100">Inversión total estimada</p>
            <p className="mt-1 text-4xl font-bold tabular-nums sm:text-5xl">S/ {fmtNum(total)}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">US$ {fmtNum(usd)}</span>
              <span className="rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">COP {fmtNum(cop)}</span>
            </div>
          </div>
          <button onClick={() => go('flujo')} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-50">Ver diagrama de flujo</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={ListChecks} tone="emerald" label="Progreso del checklist">
          <p className="text-2xl font-bold text-slate-900">{pct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${pct}%` }} /></div>
        </Metric>
        <Metric icon={CalendarClock} tone="violet" label="Días para el vuelo">
          <p className="text-2xl font-bold text-slate-900">{dias >= 0 ? dias : '—'}</p>
          <p className="text-xs text-slate-500">Vuelo: {fecha.split('-').reverse().join('/')}</p>
        </Metric>
        <Metric icon={ShieldAlert} tone={vencidos ? 'red' : 'emerald'} label="Estado del trámite">
          <p className={`text-2xl font-bold ${vencidos ? 'text-red-600' : 'text-emerald-600'}`}>{vencidos ? 'Con retraso' : 'A tiempo'}</p>
          <button onClick={() => go('cronograma')} className="text-xs font-medium text-blue-600 hover:underline">{vencidos ? `${vencidos} fechas vencidas · ver cronograma` : 'Ver cronograma'}</button>
        </Metric>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Desglose de la inversión</h3>
          <ul className="space-y-3 text-sm">
            {desglose.map(([l, c, v]) => (
              <li key={l}>
                <div className="mb-1 flex justify-between"><span className="text-slate-600">{l}</span><span className="font-medium tabular-nums text-slate-900">S/ {fmtNum(v)}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${c} transition-all duration-700`} style={{ width: `${pen ? (v / pen) * 100 : 0}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Próximos pasos</h3>
            <button onClick={() => go('checklist')} className="text-xs font-medium text-blue-600 hover:underline">Ver checklist</button>
          </div>
          {pending.length ? (
            <ul className="space-y-2 text-sm text-slate-600">
              {pending.slice(0, 4).map((i) => <li key={i.id} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />{i.item}</li>)}
            </ul>
          ) : <p className="text-sm text-emerald-600">Completaste todas las tareas.</p>}
        </div>
      </div>
    </div>
  );
}
