import { CalendarClock, ListChecks, ShieldAlert, Wallet } from 'lucide-react';
import { calcHitos, checklistItems, flightDays, fmtNum, nums } from '../utils.js';

function Card({ icon: Icon, tone, label, children }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-3 flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function Dashboard({ fecha, done, go }) {
  const [pen = 0, cop = 0, usd = 0] = nums('Cotizacion', 'TOTAL ESTIMADO');
  const items = checklistItems();
  const pending = items.filter((i) => !done[i.id]);
  const pct = Math.round(((items.length - pending.length) / items.length) * 100);
  const vencidos = calcHitos(fecha).filter((h) => h.s === 'red').length;
  const dias = flightDays(fecha);
  const desglose = ['Servicios de agencia', 'Pasajes y gastos de viaje', 'Pasaporte venezolano'].map((l) => [l, nums('Cotizacion', l)[0]]);
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card icon={Wallet} tone="bg-blue-50 text-blue-600" label="Costo total estimado">
          <p className="text-2xl font-bold text-slate-900">S/ {fmtNum(pen)}</p>
          <p className="text-xs text-slate-500">US$ {fmtNum(usd)} · COP {fmtNum(cop)}</p>
        </Card>
        <Card icon={ListChecks} tone="bg-emerald-50 text-emerald-600" label="Progreso del checklist">
          <p className="text-2xl font-bold text-slate-900">{pct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
        </Card>
        <Card icon={CalendarClock} tone="bg-violet-50 text-violet-600" label="Días para el vuelo">
          <p className="text-2xl font-bold text-slate-900">{dias >= 0 ? dias : '—'}</p>
          <p className="text-xs text-slate-500">Vuelo: {fecha.split('-').reverse().join('/')}</p>
        </Card>
        <Card icon={ShieldAlert} tone={vencidos ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'} label="Estado del trámite">
          <p className={`text-2xl font-bold ${vencidos ? 'text-red-600' : 'text-emerald-600'}`}>{vencidos ? 'Con retraso' : 'A tiempo'}</p>
          <button onClick={() => go('cronograma')} className="text-xs font-medium text-blue-600 hover:underline">{vencidos ? `${vencidos} fechas vencidas · ver cronograma` : 'Ver cronograma'}</button>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Desglose de la inversión</h3>
          <ul className="divide-y divide-slate-100 text-sm">
            {desglose.map(([l, v]) => <li key={l} className="flex justify-between py-2.5"><span className="text-slate-600">{l}</span><span className="font-medium tabular-nums text-slate-900">S/ {fmtNum(v || 0)}</span></li>)}
          </ul>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
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
