import data from '../data/data.json';
import { fmtNum, isUrl } from '../utils.js';

const A = 'font-medium text-blue-600 hover:underline';
const GROUP_TONES = ['bg-slate-700', 'bg-blue-800', 'bg-emerald-800', 'bg-indigo-800'];

function Cell({ v }) {
  if (v && typeof v === 'object') return <a href={v.url} target="_blank" rel="noreferrer" className={A}>{v.text} 🔗</a>;
  if (typeof v === 'number') return fmtNum(v);
  if (isUrl(v)) return <a href={v.startsWith('www') ? `https://${v}` : v} target="_blank" rel="noreferrer" className={A}>Ir al enlace 🔗</a>;
  return v ?? '';
}

function Tabla({ header, rows }) {
  const n = Math.max(header?.length || 0, ...rows.map((r) => r.length));
  // Oculta automáticamente las columnas sin datos (p. ej. "Automática" o "Manual")
  const cols = [...Array(n).keys()].filter((i) => rows.some((r) => r[i] != null && r[i] !== ''));
  const compact = cols.length > 7; // tablas anchas (p. ej. la comparativa económica) se compactan
  const grouped = !!header && cols.some((i) => header[i]?.includes(' · '));
  const pad = compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-3 text-sm';
  const isTotal = (r) => /^(sub)?total/i.test(String(r[0] || ''));

  // Encabezado de dos niveles: "Grupo · Subtítulo"
  const groups = [];
  if (grouped) {
    let gi = 0;
    cols.forEach((i) => {
      const [g, sub] = header[i].includes(' · ') ? header[i].split(' · ') : [null, header[i]];
      const last = groups[groups.length - 1];
      if (g && last && last.g === g) { last.cols.push([i, sub]); return; }
      groups.push({ g, text: g || sub, cols: [[i, sub]], tone: g ? GROUP_TONES[gi++ % GROUP_TONES.length] : 'bg-blue-900' });
    });
  }
  const th = 'whitespace-nowrap px-2.5 py-2 text-center text-xs font-semibold text-white';

  const table = (
    <div className={`overflow-hidden rounded-xl bg-white ${compact ? 'shadow-md ring-1 ring-slate-300' : 'shadow-sm ring-1 ring-slate-200/70'}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {header && !grouped && (
            <thead>
              <tr className="bg-blue-900 text-white">
                {cols.map((i) => <th key={i} className={`whitespace-nowrap text-left font-semibold ${pad}`}>{header[i]}</th>)}
              </tr>
            </thead>
          )}
          {grouped && (
            <thead>
              <tr>
                {groups.map((g, k) => <th key={k} colSpan={g.cols.length} rowSpan={g.g ? 1 : 2} className={`${th} ${g.tone} ${g.g ? 'border-b border-white/20' : 'text-left'}`}>{g.text}</th>)}
              </tr>
              <tr>
                {groups.filter((g) => g.g).flatMap((g) => g.cols.map(([i, sub]) => <th key={i} className={`${th} ${g.tone} opacity-90`}>{sub}</th>))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={isTotal(r) ? 'bg-blue-100 font-semibold text-slate-900' : ri % 2 ? 'bg-slate-50' : 'bg-white'}>
                {cols.map((i) => (
                  <td key={i} className={`${pad} align-top ${typeof r[i] === 'number' ? 'whitespace-nowrap text-right tabular-nums' : ''} ${i === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                    <Cell v={r[i]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  // Las tablas compactas van sobre un panel azul claro para que no se confundan con el fondo
  return compact ? <div className="rounded-2xl bg-blue-100/70 p-2 ring-1 ring-blue-200/60">{table}</div> : table;
}

export default function TablaExcel({ sheet, skip = [] }) {
  let skipping = false;
  const blocks = data[sheet].blocks.filter((b) => {
    if (b.type === 'section') skipping = skip.includes(b.text);
    return !skipping && b.type !== 'title';
  });
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'subtitle') return <p key={i} className="text-sm text-slate-500">{b.text}</p>;
        if (b.type === 'section') return <h2 key={i} className="pt-3 text-base font-semibold text-slate-900">{b.text}</h2>;
        if (b.type === 'note') return <p key={i} className={`rounded-lg px-4 py-3 text-sm ${b.red ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600 ring-1 ring-slate-200/70'}`}>{b.text}</p>;
        if (b.type === 'link') return <a key={i} href={b.url} target="_blank" rel="noreferrer" className={`block ${A}`}>{b.text} 🔗</a>;
        return <Tabla key={i} header={b.header} rows={b.rows} />;
      })}
    </div>
  );
}
