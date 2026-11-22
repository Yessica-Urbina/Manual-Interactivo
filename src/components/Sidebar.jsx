import { BookOpen, X } from 'lucide-react';
import { NAV } from '../nav.js';

export default function Sidebar({ active, onSelect, open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b1220] text-slate-400 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
          <div className="flex items-center gap-3 text-white">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="text-base font-bold">Manual Trámites</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10 lg:hidden" aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto pb-6">
          {NAV.map((g) => (
            <div key={g.group}>
              <p className="px-5 pb-2 pt-6 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{g.group}</p>
              {g.items.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={`flex w-full items-center gap-3 border-l-[3px] px-5 py-3 text-left text-sm transition-colors ${
                    active === id ? 'border-blue-500 bg-blue-500/10 font-semibold text-blue-400' : 'border-transparent hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
