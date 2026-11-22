import data from '../data/data.json';
import { fmtNum, isUrl } from '../utils.js';

const A = 'font-medium text-blue-600 hover:underline';

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
  const isTotal = (r) => /^(sub)?total/i.test(String(r[0] || ''));
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {header && (
            <thead>
              <tr className="bg-blue-900 text-white">
                {cols.map((i) => <th key={i} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold">{header[i]}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={isTotal(r) ? 'bg-blue-50 font-semibold text-slate-900' : ri % 2 ? 'bg-slate-50' : 'bg-white'}>
                {cols.map((i) => (
                  <td key={i} className={`px-4 py-3 align-top ${typeof r[i] === 'number' ? 'whitespace-nowrap text-right tabular-nums' : ''} ${i === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
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
