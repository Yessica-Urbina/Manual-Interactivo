"""Convierte el Excel de la guía a src/data/data.json.
Uso: python scripts/excel_to_json.py Guia_Pasaporte_Venezolano.xlsx src/data/data.json
Requiere: pip install openpyxl"""
import json, sys, datetime
from openpyxl import load_workbook

src = sys.argv[1] if len(sys.argv) > 1 else "Guia_Pasaporte_Venezolano.xlsx"
out = sys.argv[2] if len(sys.argv) > 2 else "src/data/data.json"
wb = load_workbook(src, data_only=True)

def fill(c):
    f = c.fill
    return f.start_color.rgb[-6:] if f and f.fill_type == "solid" and isinstance(f.start_color.rgb, str) else ""

def fcol(c):
    k = c.font.color if c.font else None
    return k.rgb[-6:] if k is not None and isinstance(k.rgb, str) else ""

def url(c):
    h = c.hyperlink
    return h.target if h is not None and h.target and h.target.startswith("http") else None

def val(c):
    v = c.value
    if v is None or v == "": return None
    if isinstance(v, (datetime.datetime, datetime.date)): return v.strftime("%d/%m/%Y")
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return f"{v * 100:.1f}%" if "%" in (c.number_format or "") else round(v, 2)
    if url(c): return {"text": str(v).split("  ->  ")[0], "url": url(c)}
    return str(v)

def merge_header(rows):
    low, ups = rows[-1], rows[:-1]
    ff = []
    for r in ups:
        last, f = None, []
        for x in r:
            last = x or last
            f.append(last)
        ff.append(f)
    out_ = []
    for i in range(len(low)):
        parts = [(ff[j][i] if low[i] else ups[j][i]) for j in range(len(ups))] + [low[i]]
        out_.append(" · ".join(dict.fromkeys(str(p) for p in parts if p)))
    return out_

data = {}
for ws in wb:
    blocks, table, pend = [], None, []
    for row in ws.iter_rows():
        cells = [val(c) for c in row]
        nz = [c for c in row if c.value not in (None, "")]
        if not nz or cells[0] == "Leyenda:":
            table = None
            continue
        first = nz[0]
        if len(nz) == 1 and first.column == 1:
            table, f = None, fill(first)
            txt = cells[0]["text"] if isinstance(cells[0], dict) else cells[0]
            if f == "1F3864": blocks.append({"type": "title", "text": txt})
            elif f == "F2F2F2": blocks.append({"type": "subtitle", "text": txt})
            elif f == "2F5496": blocks.append({"type": "section", "text": txt})
            elif url(first): blocks.append({"type": "link", "text": txt, "url": url(first)})
            else: blocks.append({"type": "note", "text": txt, "red": fcol(first) == "C00000"})
            continue
        if fill(first) == "DCE6F1" and fcol(first) == "1F3864":
            table = None
            pend.append(cells)
            continue
        if pend:
            table = {"type": "table", "header": merge_header(pend), "rows": []}
            blocks.append(table); pend = []
        elif table is None:
            table = {"type": "table", "header": None, "rows": []}
            blocks.append(table)
        table["rows"].append(cells)
    data[ws.title] = {"blocks": blocks}

json.dump(data, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("OK ->", out, {k: len(v["blocks"]) for k, v in data.items()})
