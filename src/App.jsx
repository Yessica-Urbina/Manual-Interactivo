import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ChecklistInteractivo from './components/ChecklistInteractivo.jsx';
import CronogramaDinamico from './components/CronogramaDinamico.jsx';
import TablaExcel from './components/TablaExcel.jsx';
import { NAV } from './nav.js';
import { useLocalStorage } from './utils.js';

const SHEETS = { resumen: 'Resumen', ruta: 'Ruta', cotizacion: 'Cotizacion', comparativa: 'Comparativa', interpol: 'Interpol', salvoconducto: 'Salvoconducto', pasaporte: 'Pasaporte_VE', fuentes: 'Fuentes' };
const LABELS = Object.fromEntries(NAV.flatMap((g) => g.items.map((i) => [i.id, i.label])));

export default function App() {
  const [page, setPage] = useState(() => window.location.hash.slice(1) || 'panel');
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useLocalStorage('mt-fecha', '2026-12-05');
  const [done, setDone] = useLocalStorage('mt-checklist', {});

  useEffect(() => { window.location.hash = page; window.scrollTo(0, 0); }, [page]);
  const go = (id) => { setPage(id); setOpen(false); };

  let view;
  if (page === 'checklist') view = <ChecklistInteractivo done={done} setDone={setDone} />;
  else if (page === 'cronograma') view = <CronogramaDinamico fecha={fecha} setFecha={setFecha} />;
  else if (SHEETS[page]) view = <TablaExcel sheet={SHEETS[page]} skip={['ÍNDICE DE HOJAS']} />;
  else view = <Dashboard fecha={fecha} done={done} go={go} />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={page} onSelect={go} open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú"><Menu className="h-6 w-6" /></button>
          <h1 className="truncate text-lg font-bold text-slate-900">{LABELS[page] || LABELS.panel}</h1>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-8">{view}</main>
      </div>
    </div>
  );
}
