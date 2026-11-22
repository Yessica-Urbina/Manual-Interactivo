# Manual Trámites

Guía interactiva Perú → Colombia para el pasaporte venezolano (React + Vite + Tailwind + Lucide).

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción (dist/)
```

**Actualizar datos desde el Excel:** `pip install openpyxl` y luego
`python scripts/excel_to_json.py Guia_Pasaporte_Venezolano.xlsx src/data/data.json`

**Desplegar en GitHub Pages:** sube el proyecto a la rama `main`, ve a *Settings > Pages* y elige
*Source: GitHub Actions*. El workflow `.github/workflows/deploy.yml` publica en cada push.
