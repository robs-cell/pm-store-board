"""Sample content for the store board. One source for both public/sample-data.json and the Sheet template."""
import json, os

STORES = [
  # store_id, store_name, address, lat, lon, phone, mon_fri_hours, saturday_hours, sunday_hours
  ["doraville", "Doraville", "", 33.8982, -84.2833, "", "", "", ""],
  ["decatur",   "Decatur",   "", 33.7748, -84.2963, "", "", "", ""],
  ["conyers",   "Conyers",   "", 33.6676, -84.0177, "", "", "", ""],
  ["albany",    "Albany",    "", 31.5785, -84.1557, "", "", "", ""],
  ["cumming",   "Cumming",   "", 34.2073, -84.1402, "", "", "", ""],
]
STORE_COLS = ["store_id", "store_name", "address", "lat", "lon", "phone", "mon_fri_hours", "saturday_hours", "sunday_hours"]

PRODUCTS = [
  # part_number, brand, name, description, price, photo_link, drawing, color, on_shelf, shelf_order, on_ask_us
  ["01131",  "3M", "Platinum Plus Filler", "Premium lightweight body filler", "", "", "can", "#e0a422", "Y", 1, "Y"],
  ["0644",   "U-POL", "Tectium Elite Filler", "Builds like filler, smooth like glaze", "", "", "can", "#d6332b", "Y", 2, "Y"],
  ["416",    "Evercoat", "Metal Glaze", "Finishing and blending putty", "", "", "pump", "#3fae6a", "Y", 3, "Y"],
  ["705",    "Axalta", "1K Fine Putty", "One-part, sands easily", "", "", "tube", "#e8662a", "Y", 4, "N"],
  ["09257",  "3M", "Hookit Gold Disc", "6 in, P320, 50 per box", "", "", "disc", "#d9a21b", "Y", 5, "Y"],
  ["06724",  "3M", "Plastic Sheeting", "16 ft x 400 ft roll", "", "", "roll", "#6aa9d8", "Y", 6, "N"],
  ["VS1000", "Axalta", "Surface Cleaner", "Takes off wax, oil and silicone", "", "", "jug", "#2a6cc4", "Y", 7, "Y"],
  ["33430S", "ChromaPremier Pro", "Primer Filler", "High build, easy to sand", "", "", "can", "#5b6675", "Y", 8, "N"],
  ["CC3500", "Cromax", "Multi-Use Clearcoat", "Spot, panel and overall", "", "", "can", "#c7202f", "N", "", "Y"],
  ["496-00", "Nason", "SelectClear Spot Clear", "Fast spot and panel repairs", "", "", "quart", "#1e8fd6", "N", "", "N"],
]
PRODUCT_COLS = ["part_number", "brand", "name", "description", "price", "photo_link", "drawing", "color", "on_shelf", "shelf_order", "on_ask_us"]

SLIDES = [
  # order, slide, show, seconds, tagline, footer
  [1, "today",     "Y", 12, "Painting today? Check the air.", "WALK-INS WELCOME"],
  [2, "bare",      "Y", 10, "Restoring a classic?", "TAKE YOUR TIME. WE WILL HELP."],
  [3, "shelf",     "Y", 12, "Forgot something? We have it.", "PRICES AT THE COUNTER"],
  [4, "spotlight", "Y", 10, "Pro pick of the month.", "ASK FOR A SAMPLE"],
  [5, "ask",       "Y", 10, "Ask us anything. Really.", "WALK-INS WELCOME"],
  [6, "panel",     "Y", 10, "Only painting a panel or two?", "ASK FOR A PANEL MIX"],
]
SLIDE_COLS = ["order", "slide", "show", "seconds", "tagline", "footer"]

TEXT = [
  ["today", "activator_heading", "MATCH YOUR ACTIVATOR TO THE DAY"],
  ["today", "activator_note", "Activators are rated by temperature. Ask us which one fits your booth."],
  ["bare", "kicker", "THE WHOLE REPAIR, ONE STOP"],
  ["bare", "headline", "Bare metal to clear."],
  ["bare", "subline", "Tell us the job. We hand you every step."],
  ["shelf", "feature_kicker", "CLEAR OF THE MONTH"],
  ["shelf", "feature_part", "CC3500"],
  ["shelf", "feature_title", "CROMAX CC3500"],
  ["shelf", "feature_line", "Multi-use 2K clear for spot, panel and overall repairs."],
  ["shelf", "feature_price", ""],
  ["shelf", "feature_price_note", "per gallon kit"],
  ["spotlight", "kicker", "FILLER SPOTLIGHT"],
  ["spotlight", "part", "0644"],
  ["spotlight", "headline", "U-POL Tectium Elite"],
  ["spotlight", "subline", "Part 0644 · Lightweight polyester filler"],
  ["spotlight", "fact1_title", "Builds like filler"],
  ["spotlight", "fact1_text", "Fills the low spots in one product."],
  ["spotlight", "fact2_title", "Smooth like glaze"],
  ["spotlight", "fact2_text", "Pinhole-free, so you can often skip the glaze."],
  ["spotlight", "fact3_title", "Prime in about 20 minutes"],
  ["spotlight", "fact3_text", "Back to work faster."],
  ["spotlight", "footnote", "Prefer 3M? Platinum Plus 01131 is on the shelf too."],
  ["spotlight", "price", ""],
  ["spotlight", "price_note", "Gallon"],
  ["ask", "headline", "Start with a color match."],
  ["ask", "body", "Bring the paint code, a part, or the car. We match it and mix it at the counter."],
  ["ask", "button", "Talk to us"],
  ["ask", "kicker", "PRO FAVORITES ON THE SHELF"],
  ["panel", "kicker", "PANEL MIX DEAL"],
  ["panel", "big_number", "2"],
  ["panel", "big_word", "PANELS"],
  ["panel", "big_line", "One booth. No waste."],
  ["panel", "price", ""],
  ["panel", "price_note", "Only"],
  ["panel", "circle_title", "Two panels, one booth, no waste."],
  ["panel", "check1", "Matched to your paint code"],
  ["panel", "check2", "Mixed for two panels"],
  ["panel", "check3", ""],
  ["panel", "pill", "We mix to the panel, not the gallon."],
]
TEXT_COLS = ["slide", "field", "value"]

STEPS = [
  [1, "CLEAN", "VS1000"], [2, "FILL", "0644"], [3, "GLAZE", "416"],
  [4, "SAND", "09257"], [5, "PRIME", "33430S"], [6, "CLEAR", "496-00"],
]
STEP_COLS = ["step", "word", "part_number"]

PICKS = [
  # card, card_title, part_number, code, label, note, min_f, max_f, signed_off_by
  [1, "PANEL AND OVERALL CLEAR", "CC3500", "XK303", "Fast", "Rated 65°F", "", 70, ""],
  [1, "PANEL AND OVERALL CLEAR", "CC3500", "XK305", "Medium", "Rated 75°F", 70, "", ""],
  [2, "SPOT AND PANEL CLEAR", "496-00", "483-76", "Low temp", "Cool days", "", 65, ""],
  [2, "SPOT AND PANEL CLEAR", "496-00", "483-78", "Mid temp", "Mild days", 65, 80, ""],
  [2, "SPOT AND PANEL CLEAR", "496-00", "483-79", "High temp", "Hot days", 80, "", ""],
]
PICK_COLS = ["card", "card_title", "part_number", "code", "label", "note", "min_f", "max_f", "signed_off_by"]

TABS = {
  "Stores": (STORE_COLS, STORES),
  "Products": (PRODUCT_COLS, PRODUCTS),
  "Slides": (SLIDE_COLS, SLIDES),
  "Slide Text": (TEXT_COLS, TEXT),
  "Repair Steps": (STEP_COLS, STEPS),
  "Weather Picks": (PICK_COLS, PICKS),
}

def as_json():
    return {"configured": False, "sample": True,
            "tabs": {t: [dict(zip(cols, [("" if v is None else str(v)) for v in r])) for r in rows] for t, (cols, rows) in TABS.items()}}

if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, "..", "public", "sample-data.json"), "w") as f:
        json.dump(as_json(), f, indent=1, ensure_ascii=False)
    print("wrote public/sample-data.json")
