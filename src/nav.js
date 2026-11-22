import { BookOpen, Calendar, CheckSquare, FileText, Globe, LayoutGrid, Map as MapIcon, Workflow } from 'lucide-react';

export const NAV = [
  { group: 'Inicio', items: [{ id: 'panel', label: 'Panel Principal', icon: LayoutGrid }] },
  { group: 'Datos Excel', items: [
    { id: 'resumen', label: 'Resumen y Costos', icon: FileText },
    { id: 'ruta', label: 'Ruta Paso a Paso', icon: MapIcon },
    { id: 'cotizacion', label: 'Cotización Detallada', icon: FileText },
    { id: 'comparativa', label: 'Agencia vs Propia', icon: FileText },
  ] },
  { group: 'Trámites', items: [
    { id: 'flujo', label: 'Diagrama de Flujo', icon: Workflow },
    { id: 'interpol', label: 'Guía: Interpol', icon: BookOpen },
    { id: 'salvoconducto', label: 'Guía: Salvoconducto', icon: BookOpen },
    { id: 'pasaporte', label: 'Guía: Pasaporte VE', icon: BookOpen },
  ] },
  { group: 'Seguimiento', items: [
    { id: 'checklist', label: 'Checklist Excel', icon: CheckSquare },
    { id: 'cronograma', label: 'Cronograma', icon: Calendar },
  ] },
  { group: 'Referencias', items: [{ id: 'fuentes', label: 'Fuentes y Links', icon: Globe }] },
];
