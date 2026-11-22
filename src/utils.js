import { useEffect, useState } from 'react';
import data from './data/data.json';

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin storage */ } }, [key, value]);
  return [value, setValue];
}

export const fmtNum = (n) => Number(n).toLocaleString('es-PE', { maximumFractionDigits: 2 });
export const isUrl = (s) => typeof s === 'string' && /^(https?:\/\/|www\.)/i.test(s.trim());
export const fmtDate = (d) => d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

// Números de la fila cuya primera celda coincide con `label` (p. ej. el total de la Cotización)
export function nums(sheet, label) {
  for (const b of data[sheet].blocks)
    if (b.type === 'table') for (const r of b.rows) if (r[0] === label) return r.filter((x) => typeof x === 'number');
  return [];
}

// Ítems de la hoja Checklist
export function checklistItems() {
  const t = data.Checklist.blocks.find((b) => b.type === 'table');
  return t.rows.filter((r) => typeof r[0] === 'number').map((r) => ({ id: r[0], etapa: r[1], item: r[2], donde: r[3] }));
}

// Lógica de la hoja Cronograma
const at = (s) => new Date(s + 'T12:00:00');
const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const workdaysBack = (d, n) => { const x = new Date(d); while (n > 0) { x.setDate(x.getDate() - 1); if (x.getDay() % 6) n--; } return x; };
export const daysLeft = (d) => Math.round((d - new Date().setHours(12, 0, 0, 0)) / 864e5);
export const flightDays = (f) => daysLeft(at(f));

export function calcHitos(f) {
  const vuelo = at(f), salv = add(vuelo, -20), c = add(salv, -21);
  const sab = add(c, -((c.getDay() + 1) % 7)); // último sábado <= c
  const vie = add(sab, -1);
  return [
    ['Pasajes comprados', vie, 'Antes de cargar datos y pagar el arancel de Interpol.'],
    ['Pagar arancel Interpol y cargar datos (viernes)', vie, 'Regla de la agencia: viernes previo a la cita del sábado.'],
    ['Pedir la cita de Interpol (último sábado)', sab, 'Cubre el peor caso de espera: 21 días.'],
    ['Tener la Ficha de Canje en mano', salv, 'Requisito para ingresar el salvoconducto.'],
    ['Ingresar el salvoconducto', salv, 'Recomendación de la agencia: 20 días antes del vuelo.'],
    ['Margen mínimo legal (7 días hábiles)', workdaysBack(vuelo, 7), 'Límite extremo; no lo uses como objetivo.'],
    ['Vuelo de ida', vuelo, 'El salvoconducto vence a los 30 días hábiles de emitido.'],
  ].map(([k, d, nota]) => { const n = daysLeft(d); return { k, d, nota, n, s: n < 0 ? 'red' : n <= 7 ? 'amber' : 'green' }; });
}

export const STATUS = {
  red: { label: 'Vencido', badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  amber: { label: 'Urgente', badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  green: { label: 'A tiempo', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
};
