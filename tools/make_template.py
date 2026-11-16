"""Builds sheet-template/Paint-Masters-Store-Board.xlsx from tools/sample_data.py."""
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.comments import Comment
import sample_data as S

HEAD = {  # friendly header for each column (the board reads them case-insensitively)
 "store_id": "Store ID", "store_name": "Store Name", "address": "Address", "lat": "Lat", "lon": "Lon", "phone": "Phone",
 "mon_fri_hours": "Mon-Fri Hours", "saturday_hours": "Saturday Hours", "sunday_hours": "Sunday Hours",
 "part_number": "Part Number", "brand": "Brand", "name": "Name", "description": "Description", "price": "Price",
 "photo_link": "Photo Link", "drawing": "Drawing", "color": "Color", "on_shelf": "On Shelf", "shelf_order": "Shelf Order",
 "on_ask_us": "On Ask Us", "order": "Order", "slide": "Slide", "show": "Show", "seconds": "Seconds", "tagline": "Tagline",
 "footer": "Footer", "field": "Field", "value": "Value", "step": "Step", "word": "Word", "card": "Card",
 "card_title": "Card Title", "code": "Code", "label": "Label", "note": "Note", "min_f": "Min F", "max_f": "Max F",
 "signed_off_by": "Signed Off By",
}
NOTES = {
 ("Stores", "lat"): "Map coordinates for the weather. Prefilled with each city's center; replace with the store's own if you like (right-click the store in Google Maps).",
 ("Stores", "mon_fri_hours"): "Like 7:30 AM - 5:30 PM, or Closed. The board shows 'Open today until ...'. Leave blank to hide.",
 ("Stores", "store_id"): "Short name used in each TV's link: .../?store=albany",
 ("Products", "photo_link"): "Paste the Google Drive share link of the photo (Share > Anyone with the link). Blank shows a drawing.",
 ("Products", "price"): "Blank shows 'Ask us'.",
 ("Products", "drawing"): "Stand-in drawing until there's a photo: can, quart, tube, pump, jug, disc, roll",
 ("Products", "on_shelf"): "Y to show on the On the Shelf slide (up to 8).",
 ("Products", "on_ask_us"): "Y to show on the Ask Us Anything slide (up to 6).",
 ("Slides", "show"): "Y shows the slide, N hides it.",
 ("Slides", "slide"): "Do not rename: today, bare, shelf, spotlight, ask, panel",
 ("Slide Text", "field"): "Do not rename fields. Edit only the Value column.",
 ("Repair Steps", "part_number"): "Must match a Part Number on the Products tab.",
 ("Weather Picks", "min_f"): "The pick shows as NOW when the store's current temperature is at or above Min F and below Max F. Blank = no limit.",
 ("Weather Picks", "signed_off_by"): "Have a tech confirm these ranges against the tech sheets before the board goes live.",
}
TEXT_COLS = {"part_number", "store_id", "phone", "code", "price", "mon_fri_hours", "saturday_hours", "sunday_hours"}

wb = Workbook(); wb.remove(wb.active)
hdr_fill = PatternFill("solid", fgColor="0E2A52")
for tab, (cols, rows) in S.TABS.items():
    ws = wb.create_sheet(tab)
    ws.append([HEAD[c] for c in cols])
    for i, c in enumerate(cols, 1):
        cell = ws.cell(row=1, column=i)
        cell.font = Font(bold=True, color="FFFFFF"); cell.fill = hdr_fill; cell.alignment = Alignment(vertical="center")
        if (tab, c) in NOTES: cell.comment = Comment(NOTES[(tab, c)], "Store Board")
        ws.column_dimensions[cell.column_letter].width = max(12, min(60, len(HEAD[c]) + 6))
    for r in rows:
        ws.append([("" if v is None else v) for v in r])
    for i, c in enumerate(cols, 1):
        if c in TEXT_COLS:   # keep leading zeros (01131) and stop Sheets from turning part numbers into numbers
            for row in range(2, 400):
                cell = ws.cell(row=row, column=i)
                cell.number_format = "@"
                if cell.value not in (None, ""): cell.value = str(cell.value)
    ws.freeze_panes = "A2"
    for c in ("on_shelf", "on_ask_us", "show"):
        if c in cols:
            dv = DataValidation(type="list", formula1='"Y,N"', allow_blank=True)
            col = ws.cell(row=1, column=cols.index(c) + 1).column_letter
            dv.add(f"{col}2:{col}400"); ws.add_data_validation(dv)
    if "drawing" in cols:
        dv = DataValidation(type="list", formula1='"can,quart,tube,pump,jug,disc,roll"', allow_blank=True)
        col = ws.cell(row=1, column=cols.index("drawing") + 1).column_letter
        dv.add(f"{col}2:{col}400"); ws.add_data_validation(dv)
ws = wb["Slide Text"]; ws.column_dimensions["C"].width = 70
ws = wb["Products"]; ws.column_dimensions["D"].width = 38; ws.column_dimensions["F"].width = 45
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sheet-template", "Paint-Masters-Store-Board.xlsx")
wb.save(out); print("wrote", os.path.normpath(out))
