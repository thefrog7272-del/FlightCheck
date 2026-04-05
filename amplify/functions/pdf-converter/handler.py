"""
FlightCheck PDF Converter — AWS Lambda handler

Accepts a base64-encoded PDF, extracts checklist phases/items and reference
tables using pdfplumber, and returns structured plane + checklist data in the
format expected by the FlightCheck app.

Request body (JSON):
  { "pdf": "<base64 string>", "filename": "my_checklist.pdf" }

Response body (JSON):
  {
    "plane":    { "id", "name", "manufacturer", "type", "image" },
    "checklist": { "planeId", "phases": [...] },
    "variants":  { "Reference Tables": { "planeId", "phases": [...] } }
  }
"""

import base64
import json
import os
import re
import tempfile


# ---------------------------------------------------------------------------
# Lambda entry point
# ---------------------------------------------------------------------------

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json",
    }

    # CORS preflight
    method = (event.get("requestContext") or {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    try:
        raw_body = event.get("body") or "{}"
        if event.get("isBase64Encoded"):
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        body = json.loads(raw_body)

        pdf_b64 = body.get("pdf")
        filename = body.get("filename", "checklist.pdf")

        if not pdf_b64:
            return _err(headers, "No PDF data provided", 400)

        pdf_bytes = base64.b64decode(pdf_b64)

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
            f.write(pdf_bytes)
            tmp_path = f.name

        try:
            result = _convert_pdf(tmp_path, filename)
            return {"statusCode": 200, "headers": headers, "body": json.dumps(result)}
        finally:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    except Exception as exc:
        import traceback
        print(traceback.format_exc())
        return _err(headers, str(exc))


def _err(headers, message, status=500):
    return {"statusCode": status, "headers": headers, "body": json.dumps({"error": message})}


# ---------------------------------------------------------------------------
# Core conversion
# ---------------------------------------------------------------------------

def _convert_pdf(filepath: str, filename: str) -> dict:
    import pdfplumber

    stem = os.path.splitext(os.path.basename(filename))[0]
    plane_name = re.sub(r"[_\-]+", " ", stem).strip()
    plane_id = re.sub(r"[^a-z0-9]+", "-", plane_name.lower()).strip("-")

    # Extract full text
    text_pages = []
    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text_pages.append(page.extract_text(x_tolerance=2, y_tolerance=2) or "")
    full_text = "\n".join(text_pages)

    phases = _parse_text(full_text, plane_id)
    table_data = _extract_tables(filepath)

    plane = {
        "id": plane_id,
        "name": plane_name,
        "manufacturer": "",
        "type": "GA",
        "image": "",
    }
    checklist = {"planeId": plane_id, "phases": phases}
    variants: dict = {}

    if table_data:
        ref_items = [
            {"id": f"reference-tables-{i}", "label": label, "notes": data_uri}
            for i, (label, data_uri) in enumerate(table_data)
        ]
        variants["Reference Tables"] = {
            "planeId": plane_id,
            "phases": [{"id": "reference-tables", "title": "Reference Tables", "items": ref_items}],
        }

    return {"plane": plane, "checklist": checklist, "variants": variants}


# ---------------------------------------------------------------------------
# Text parser (ported from tools/checklist_converter.py)
# ---------------------------------------------------------------------------

_PHASE_KW = re.compile(
    r"^(pre[- ]?flight|before\s|after\s|engine\s|taxi|take[- ]?off|landing|"
    r"climb|cruise|descent|approach|shutdown|securing|startup|run[- ]?up|"
    r"emergency|abnormal|normal\s+checklist|checklist|procedure)",
    re.IGNORECASE,
)


def _parse_text(text: str, plane_id: str) -> list:
    raw_lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Skip pre-content noise — find first phase header
    start = 0
    for i, line in enumerate(raw_lines):
        if _is_phase_header(line):
            start = i
            break

    phases: list = []
    current: dict | None = None

    for line in raw_lines[start:]:
        if len(line) < 3:
            continue

        if _is_phase_header(line):
            title = _clean_title(line)
            if len(title) < 2:
                continue
            pid = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
            current = {"id": f"{pid}-{len(phases)}", "title": title, "items": []}
            phases.append(current)
            continue

        item = _parse_item(line)
        if item:
            if current is None:
                current = {"id": f"{plane_id}-general-0", "title": "General", "items": []}
                phases.append(current)
            entry: dict = {
                "id": f"{current['id']}-item-{len(current['items'])}",
                "label": item["label"],
            }
            if item["state"]:
                entry["expectedState"] = item["state"]
            current["items"].append(entry)

    return [p for p in phases if p["items"]]


def _is_phase_header(line: str) -> bool:
    clean = line.rstrip(":").strip()
    letters = re.sub(r"[^a-zA-Z]", "", clean)

    if len(letters) >= 3 and clean == clean.upper() and re.search(r"[A-Z]", clean):
        if not re.search(r"\.{3,}|_{3,}|-{3,}|\t", line):
            return True

    if line.endswith(":") and len(line) < 60 and not re.search(r"\.{3,}", line):
        return True

    if _PHASE_KW.match(clean) and len(clean) < 50 and not re.search(r"\.{3,}|_{3,}", line):
        return True

    return False


def _clean_title(line: str) -> str:
    t = line.rstrip(":").strip()
    t = re.sub(r"^\d+[.)]\s*", "", t)
    return " ".join(w[0].upper() + w[1:].lower() if w else w for w in t.split())


def _parse_item(line: str) -> dict | None:
    if len(line) < 5:
        return None

    # Arrow: "Label → STATE"
    if "\u2192" in line:
        parts = line.split("\u2192", 1)
        return {"label": parts[0].strip(), "state": parts[1].strip()}

    # Dots/underscores: "Label ..... STATE"
    m = re.match(r"^(.+?)\s*[._]{3,}\s*(.+)$", line)
    if m:
        return {"label": m.group(1).strip(), "state": m.group(2).strip()}

    # Dash: "Label - STATE" (state ALL CAPS)
    m = re.match(r"^(.{5,}?)\s+-{1,3}\s+([A-Z][A-Z0-9 /()]{1,40})$", line)
    if m:
        return {"label": m.group(1).strip(), "state": m.group(2).strip()}

    # Tab: "Label\tSTATE"
    m = re.match(r"^(.+?)\t+(.+)$", line)
    if m and len(m.group(2).strip()) < 40:
        return {"label": m.group(1).strip(), "state": m.group(2).strip()}

    # Multiple spaces + ALL CAPS state
    m = re.match(r"^(.{5,}?)\s{3,}([A-Z][A-Z0-9 /()]{1,40})$", line)
    if m:
        return {"label": m.group(1).strip(), "state": m.group(2).strip()}

    # Bullet/checkbox
    m = re.match(r"^[-\u2022\u25CB\u25A1\u2610\u25A0\u25CF]\s+(.+)$", line)
    if m:
        return {"label": m.group(1).strip(), "state": ""}

    # Numbered: "1. Label"
    m = re.match(r"^\d+[.)]\s+(.+)$", line)
    if m and not _is_phase_header(line):
        return {"label": m.group(1).strip(), "state": ""}

    return None


# ---------------------------------------------------------------------------
# Table extraction (ported from tools/checklist_converter.py)
# ---------------------------------------------------------------------------

def _extract_tables(filepath: str) -> list:
    try:
        import pdfplumber
    except ImportError:
        return []

    results = []
    with pdfplumber.open(filepath) as pdf:
        for page_idx, page in enumerate(pdf.pages):
            for table_spec in page.find_tables():
                rows = table_spec.extract()
                if not rows:
                    continue
                cleaned = [[cell.strip() if cell else "" for cell in row] for row in rows]
                if sum(1 for row in cleaned for cell in row if cell) < 2:
                    continue
                label = _table_title(page, table_spec.bbox, len(results) + 1, page_idx + 1)
                encoded = json.dumps(cleaned, ensure_ascii=False, separators=(",", ":"))
                results.append((label, f"data:table/json,{encoded}"))

    return results


def _table_title(page, bbox: tuple, table_num: int, page_num: int) -> str:
    try:
        x0, top, x1, _ = bbox
        search_top = max(0, top - 80)
        if search_top >= top:
            return f"Table {table_num} — Page {page_num}"
        above = page.crop((0, search_top, page.width, top))
        raw = above.extract_text(x_tolerance=3, y_tolerance=3) or ""
        lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
        if lines:
            candidate = lines[-1]
            if len(candidate) >= 4 and not candidate.isdigit():
                return candidate
    except Exception:
        pass
    return f"Table {table_num} — Page {page_num}"
