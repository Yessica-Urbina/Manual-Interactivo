import { CalendarDays } from 'lucide-react';
import { STATUS, calcHitos, fmtDate, flightDays } from '../utils.js';

export default function CronogramaDinamico({ fecha, setFecha }) {
  const hitos = calcHitos(fecha);
  const dias = flightDays(fecha);
  const vencidos = hitos.filter((h) => h.s === 'red').length;
  const banner = vencidos
    ? ['red', `${vencidos} fechas límite ya pasaron con este vuelo. Considera mover el vuelo o consultar a la agencia por una vía rápida.`]
    : dias >= 41
      ? ['green', 'Margen suficiente, incluso en el peor caso (3 semanas de cita + 20 días de salvoconducto).']
      : ['amber', 'Margen ajustado: la suma de los peores plazos es de 41 días.'];
  const tone = { red: 'bg-red-50 text-red-800 ring-red-200', amber: 'bg-amber-50 text-amber-800 ring-amber-200', green: 'bg-emerald-50 text-emerald-800 ring-emerald-200' };
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:flex-row sm:items-end sm:justify-between">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700"><CalendarDays className="h-4 w-4 text-blue-600" /> Fecha de vuelo de ida</span>
          <input type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-56" />
        </label>
        <p className="text-sm text-slate-500">{dias >= 0 ? `Faltan ${dias} días para el vuelo` : 'El vuelo ya pasó'}</p>
      </div>
      <p className={`rounded-xl px-4 py-3 text-sm ring-1 ${tone[banner[0]]}`}>{banner[1]}</p>
      <ol className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        {hitos.map((h, i) => (
          <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {i < hitos.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />}
            <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full ring-4 ring-white ${STATUS[h.s].dot}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{h.k}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS[h.s].badge}`}>{STATUS[h.s].label}</span>
              </div>
              <p className="text-sm text-slate-700">{fmtDate(h.d)} <span className="text-slate-400">· {h.n < 0 ? `hace ${-h.n} días` : h.n === 0 ? 'hoy' : `en ${h.n} días`}</span></p>
              <p className="text-xs text-slate-400">{h.nota}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
