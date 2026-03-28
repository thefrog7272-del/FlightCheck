# Checklist Converter

Python CLI tool that converts aircraft checklist files into structured CSV or JSON compatible with FlightCheck's import.

## Supported Formats

| Input | Library | Notes |
|-------|---------|-------|
| PDF | pdfplumber | Extracts tables first, falls back to text. Works best with text-based PDFs (not scanned images). |
| Word (.docx) | python-docx | Reads paragraphs and tables. |
| Excel (.xlsx, .xls) | openpyxl | Auto-detects structured (has `phase`/`item` columns) vs. free-form layout. |
| Google Sheets | requests | Downloads public sheets as CSV. Sheet must be shared as "Anyone with the link". |
| CSV | built-in | Structured (with headers) or free-form text. |
| TXT | built-in | Heuristic parsing of common checklist formats. |

## Setup

```bash
cd tools
pip install -r requirements.txt
```

Requires Python 3.9+. Dependencies are optional per format -- the script will tell you what to install if a library is missing.

## Usage

### Interactive Mode

```bash
python checklist_converter.py
```

Walks you through selecting a source file, previewing the parsed result, entering aircraft metadata, and choosing output format/location.

### Command Line

```bash
# PDF to CSV (default)
python checklist_converter.py path/to/checklist.pdf

# Excel to JSON
python checklist_converter.py checklist.xlsx -f json

# Word to both CSV and JSON
python checklist_converter.py checklist.docx -f both

# Google Sheets to CSV
python checklist_converter.py "https://docs.google.com/spreadsheets/d/SHEET_ID/edit" -f csv

# Specify aircraft metadata and output directory
python checklist_converter.py checklist.pdf -n "Cessna 172" -m "Cessna" -o ./output

# Print full parsed checklist to console
python checklist_converter.py checklist.txt --full
```

### Options

| Flag | Description |
|------|-------------|
| `-f`, `--format` | Output format: `csv`, `json`, or `both` (default: `csv`) |
| `-o`, `--output` | Output directory (default: current directory) |
| `-n`, `--name` | Aircraft name, e.g. `"Cessna 172"` |
| `-m`, `--manufacturer` | Manufacturer name, e.g. `"Cessna"` |
| `--full` | Print full parsed checklist to console |

## Output Formats

### CSV

Matches FlightCheck's CSV import format:

```
name,manufacturer,type,image,phase,item,expectedState,notes,category
Cessna 172,Cessna,GA,,Pre-Start,Battery,ON,,
Cessna 172,Cessna,GA,,Pre-Start,Fuel Selector,BOTH,,
```

### JSON

Matches FlightCheck's data model:

```json
{
  "plane": {
    "id": "cessna-172",
    "name": "Cessna 172",
    "manufacturer": "Cessna",
    "image": "",
    "type": "GA"
  },
  "checklist": {
    "planeId": "cessna-172",
    "phases": [
      {
        "id": "pre-start",
        "title": "Pre-Start",
        "items": [
          { "id": "pre-start-0", "label": "Battery", "expectedState": "ON" }
        ]
      }
    ]
  }
}
```

## Checklist Text Formats

The heuristic parser recognises these common patterns:

| Style | Example |
|-------|---------|
| Dot-leader | `Parking Brake ......... SET` |
| Dash-separated | `Parking Brake - SET` |
| Tab-separated | `Parking Brake⇥SET` |
| Multi-space | `Parking Brake    SET` |
| Bullet | `- Parking Brake` |
| Numbered | `1. Parking Brake` |

Phase headers are detected by ALL CAPS lines, lines ending with `:`, or common aviation keywords (Before Start, Taxi, Takeoff, Cruise, etc.).

## Structured Excel / CSV

If your Excel or CSV file has column headers, the parser will use them directly instead of heuristic parsing. Recognised column names:

| Field | Accepted Headers |
|-------|-----------------|
| Phase | `phase`, `section`, `checklist`, `step`, `group` |
| Item | `item`, `action`, `check`, `label`, `task`, `description`, `challenge`, `subject` |
| State | `expectedState`, `expected state`, `state`, `response`, `value`, `setting`, `expectation` |
| Notes | `notes`, `remarks`, `comment`, `details`, `clue` |
| Category | `category`, `checklist category`, `type` |
| Aircraft | `name`, `aircraft`, `plane` |
| Manufacturer | `manufacturer`, `make`, `oem`, `brand` |

## Sample Files

The `samples/` directory contains test files covering four formats:

| File | Format | Aircraft | Items |
|------|--------|----------|-------|
| `cessna_172_dots.txt` | Dot-leader | Cessna 172S | 85 |
| `a320neo_dashes.txt` | Dash-separated | Airbus A320neo | 69 |
| `boeing_737_structured.csv` | Structured CSV | Boeing 737-800 | 78 + emergency |
| `king_air_350_bullets.txt` | Bullets & numbered | King Air 350 | 79 |

Try them out:

```bash
python checklist_converter.py samples/cessna_172_dots.txt -n "Cessna 172S" -m "Cessna" --full
python checklist_converter.py samples/boeing_737_structured.csv -f both --full
```

## Google Sheets

For Google Sheets, the sheet must be publicly accessible:

1. Open your Google Sheet
2. Click **Share** > **Anyone with the link** > **Viewer**
3. Copy the URL and pass it to the converter

The tool extracts the sheet ID from the URL and downloads it as CSV. If the sheet has multiple tabs, include the `gid` parameter in the URL to select a specific tab.

## Tips

- **PDF quality matters**: Text-based PDFs work well. Scanned/image-based PDFs won't parse -- use OCR first or convert to text manually.
- **Excel with headers**: Adding `phase` and `item` column headers gives the best results. Without them, the tool falls back to heuristic text parsing.
- **FlightCheck import**: The CSV output can be directly imported into FlightCheck via the web app's CSV import feature.
