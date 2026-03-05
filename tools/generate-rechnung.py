#!/usr/bin/env python3
"""
Monthly Rechnung (Invoice) Generator
=====================================

Generates a proper German Rechnung PDF matching the practice template,
with GebüH codes, diagnosis, client address — ready for PKV submission.

Usage:
  python3 generate-rechnung.py

The script reads client/session data from a JSON file (sessions.json)
or you can pass arguments directly. Output PDFs land in ./rechnungen/

Requirements:
  pip3 install reportlab

Example sessions.json:
[
  {
    "client_name": "Maria Beispiel",
    "client_address": "Beispielweg 5\\n10117 Berlin",
    "client_dob": "15.03.1985",
    "diagnosis": "V: F43.2 Anpassungsstörungen",
    "sessions": [
      {"date": "03.02.2026", "code": "19.1", "desc": "Erstgespräch", "amount": 150.00},
      {"date": "10.02.2026", "code": "19.2", "amount": 150.00},
      {"date": "17.02.2026", "code": "19.2", "amount": 150.00},
      {"date": "24.02.2026", "code": "19.2", "amount": 150.00}
    ]
  }
]
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.pdfgen import canvas
    from reportlab.lib.styles import getSampleStyleSheet
except ImportError:
    print("Missing dependency. Install with: pip3 install reportlab")
    sys.exit(1)


# ─── Practice details ────────────────────────────────────────

PRACTICE = {
    "name": "Robert Rozek, MSc, MA",
    "title": "Heilpraktiker für Psychotherapie",
    "address": "Augsburgerstraße 6 | 80337 München",
    "phone": "+49 157 5469 5230",
    "email": "praxis@robertrozek.de",
    "steuernummer": "921/310/68453",
}

# Colors
GOLD = HexColor("#b8976a")
DARK = HexColor("#1c1917")
GREY = HexColor("#78716c")
LIGHT_GREY = HexColor("#e7e5e4")

# Default GebüH descriptions
GEBUEH_DESCRIPTIONS = {
    "19.1": "Erhebung einer biographischen Anamnese unter Einbeziehung der Ergebnisse der Verhaltens- und Problemanalyse (Erstgespräch)",
    "19.2": "Psychotherapie, tiefenpsychologisch fundierte Einzelbehandlung, Dauer mind. 45 Min.",
}

# Invoice counter file
COUNTER_FILE = Path(__file__).parent / ".invoice_counter"


def get_next_invoice_number():
    """Get next sequential invoice number (YYYY-NNNN format)."""
    year = datetime.now().strftime("%Y")

    if COUNTER_FILE.exists():
        data = json.loads(COUNTER_FILE.read_text())
        if data.get("year") == year:
            counter = data["counter"] + 1
        else:
            counter = 1
    else:
        counter = 1

    COUNTER_FILE.write_text(json.dumps({"year": year, "counter": counter}))
    return f"{year}-{counter:04d}"


def generate_rechnung(client_data, output_dir="./rechnungen"):
    """Generate a Rechnung PDF for a client."""

    os.makedirs(output_dir, exist_ok=True)

    invoice_nr = get_next_invoice_number()
    today = datetime.now().strftime("%d.%m.%Y")

    client_name = client_data["client_name"]
    client_address = client_data.get("client_address", "")
    client_dob = client_data.get("client_dob", "")
    diagnosis = client_data.get("diagnosis", "")
    sessions = client_data.get("sessions", [])

    # Safe filename
    safe_name = client_name.replace(" ", "_").replace("/", "-")
    filename = f"Rechnung_{invoice_nr}_{safe_name}.pdf"
    filepath = os.path.join(output_dir, filename)

    w, h = A4
    c = canvas.Canvas(filepath, pagesize=A4)
    c.setTitle(f"Rechnung {invoice_nr}")
    c.setAuthor(PRACTICE["name"])

    left = 55
    right = w - 55
    content_width = right - left

    # ─── Gold accent line ──────────────────────────────────
    c.setFillColor(GOLD)
    c.rect(left, h - 40, content_width, 3, fill=True, stroke=False)

    # ─── Header: practice info (left) ──────────────────────
    y = h - 60

    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(DARK)
    c.drawString(left, y, PRACTICE["name"])
    y -= 14

    c.setFont("Helvetica", 8.5)
    c.setFillColor(GREY)
    c.drawString(left, y, PRACTICE["title"])
    y -= 12
    c.drawString(left, y, PRACTICE["address"])
    y -= 12
    c.drawString(left, y, f"Tel: {PRACTICE['phone']} | {PRACTICE['email']}")
    y -= 12
    c.drawString(left, y, f"Steuernummer: {PRACTICE['steuernummer']}")

    # ─── Header: RECHNUNG title (right) ────────────────────
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(DARK)
    c.drawRightString(right, h - 60, "RECHNUNG")

    c.setFont("Helvetica", 9)
    c.setFillColor(GREY)
    c.drawRightString(right, h - 78, f"Nr. {invoice_nr}")
    c.drawRightString(right, h - 90, f"Datum: {today}")

    # ─── Sender line (small, above client address) ─────────
    y = h - 140

    c.setFont("Helvetica", 7)
    c.setFillColor(GREY)
    c.drawString(left, y, f"{PRACTICE['name']} | {PRACTICE['address']}")

    # ─── Client address block ──────────────────────────────
    y -= 20

    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(DARK)
    c.drawString(left, y, client_name)
    y -= 14

    if client_address:
        c.setFont("Helvetica", 9)
        for line in client_address.split("\n"):
            c.drawString(left, y, line.strip())
            y -= 13

    if client_dob:
        y -= 4
        c.setFont("Helvetica", 8.5)
        c.setFillColor(GREY)
        c.drawString(left, y, f"Geb.-Datum: {client_dob}")
        y -= 18

    # ─── Diagnosis ─────────────────────────────────────────
    if diagnosis:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(DARK)
        c.drawString(left, y, "Diagnose:")
        c.setFont("Helvetica", 9)
        c.drawString(left + 60, y, diagnosis)
        y -= 22

    # ─── Intro text ────────────────────────────────────────
    y -= 8
    c.setFont("Helvetica", 9)
    c.setFillColor(DARK)
    text = "Für die nachfolgend aufgeführten heilkundlichen Leistungen erlaube ich mir, folgendes Honorar in Rechnung zu stellen:"
    c.drawString(left, y, text)
    y -= 26

    # ─── Table header ──────────────────────────────────────
    col_date = left
    col_code = left + 80
    col_desc = left + 130
    col_amount = right - 10
    desc_max_width = col_amount - col_desc - 80  # leave space for amount column

    # Header background
    c.setFillColor(HexColor("#f5f4f3"))
    c.rect(left, y - 4, content_width, 18, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(GREY)
    c.drawString(col_date, y + 2, "Datum")
    c.drawString(col_code, y + 2, "GebüH")
    c.drawString(col_desc, y + 2, "Leistungsbeschreibung")
    c.drawRightString(col_amount, y + 2, "Betrag")

    y -= 22

    # ─── Table rows ────────────────────────────────────────
    total = 0.0

    for session in sessions:
        date = session["date"]
        code = session["code"]
        desc = session.get("desc", GEBUEH_DESCRIPTIONS.get(code, ""))
        amount = session["amount"]
        total += amount

        c.setFont("Helvetica", 9)
        c.setFillColor(DARK)
        c.drawString(col_date, y, date)

        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(GOLD)
        c.drawString(col_code, y, code)

        c.setFont("Helvetica", 8.5)
        c.setFillColor(DARK)

        # Word-wrap description
        desc_width = desc_max_width
        words = desc.split()
        lines = []
        current_line = ""
        for word in words:
            test = f"{current_line} {word}".strip()
            if c.stringWidth(test, "Helvetica", 8.5) < desc_width:
                current_line = test
            else:
                lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)

        for i, line in enumerate(lines):
            c.drawString(col_desc, y - (i * 12), line)

        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(DARK)
        c.drawRightString(col_amount, y, f"{amount:.2f} EUR")

        row_height = max(len(lines) * 12, 14) + 16
        y -= row_height

        # Check for page break
        if y < 180:
            c.showPage()
            y = h - 60

    # ─── Total ─────────────────────────────────────────────
    y -= 4
    c.setStrokeColor(LIGHT_GREY)
    c.setLineWidth(0.5)
    c.line(left, y + 8, right, y + 8)

    # Total box
    box_x = col_amount - 140
    c.setFillColor(HexColor("#f5f4f3"))
    c.rect(box_x, y - 8, 150, 24, fill=True, stroke=False)

    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(GREY)
    c.drawString(box_x + 6, y, "Gesamtbetrag:")

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(DARK)
    c.drawRightString(col_amount, y - 1, f"{total:.2f} EUR")

    # ─── Tax note ──────────────────────────────────────────
    y -= 30
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(GREY)
    c.drawString(left, y, "Gemäß § 4 Nr. 14 UStG umsatzsteuerbefreit (heilkundliche Tätigkeit).")

    # ─── Payment info ──────────────────────────────────────
    y -= 30
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(DARK)
    c.drawString(left, y, "Zahlungsinformationen")
    y -= 16

    c.setFont("Helvetica", 8.5)
    c.setFillColor(DARK)
    payment_lines = [
        "Zahlung erfolgt per Kreditkarte über Stripe zum Zeitpunkt der Buchung.",
        f"Verwendungszweck: Rechnung {invoice_nr}",
    ]
    for line in payment_lines:
        c.drawString(left, y, line)
        y -= 13

    # ─── Reimbursement notice ──────────────────────────────
    y -= 16
    c.setStrokeColor(LIGHT_GREY)
    c.line(left, y + 8, right, y + 8)
    y -= 6

    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(DARK)
    c.drawString(left, y, "Hinweis zur Kostenerstattung:")
    y -= 14

    c.setFont("Helvetica", 7.5)
    c.setFillColor(GREY)
    notice = (
        "Die Abrechnung erfolgt in Anlehnung an das Gebührenverzeichnis für Heilpraktiker (GebüH). "
        "Eine Erstattung durch private Krankenversicherungen oder Zusatzversicherungen ist je nach Vertrag "
        "möglich, jedoch nicht garantiert. Bitte klären Sie die Erstattungsfähigkeit vorab mit Ihrer "
        "Versicherung. Der Rechnungsbetrag ist unabhängig von einer etwaigen Erstattung in voller Höhe "
        "durch den Patienten / die Patientin zu begleichen."
    )
    text_obj = c.beginText(left, y)
    text_obj.setFont("Helvetica", 7.5)
    text_obj.setFillColor(GREY)

    words = notice.split()
    current_line = ""
    for word in words:
        test = f"{current_line} {word}".strip()
        if c.stringWidth(test, "Helvetica", 7.5) < content_width:
            current_line = test
        else:
            text_obj.textLine(current_line)
            current_line = word
    if current_line:
        text_obj.textLine(current_line)
    c.drawText(text_obj)

    # ─── Footer ────────────────────────────────────────────
    footer_y = 35
    c.setStrokeColor(LIGHT_GREY)
    c.line(left, footer_y + 12, right, footer_y + 12)

    c.setFont("Helvetica", 7)
    c.setFillColor(GREY)
    footer = f"{PRACTICE['name']} | {PRACTICE['title']} | {PRACTICE['address']} | Steuernr.: {PRACTICE['steuernummer']}"
    c.drawCentredString(w / 2, footer_y, footer)

    c.save()
    print(f"✓ Generated: {filepath}")
    return filepath


def main():
    """Main entry point — reads sessions.json or prompts interactively."""

    sessions_file = Path(__file__).parent / "sessions.json"

    if sessions_file.exists():
        clients = json.loads(sessions_file.read_text())
        print(f"Found {len(clients)} client(s) in sessions.json\n")
        for client in clients:
            generate_rechnung(client)
    else:
        # Interactive mode: create a sample sessions.json
        print("No sessions.json found. Creating a sample file...\n")
        sample = [
            {
                "client_name": "Maria Beispiel",
                "client_address": "Beispielweg 5\n10117 Berlin",
                "client_dob": "15.03.1985",
                "diagnosis": "V: F43.2 Anpassungsstörungen",
                "sessions": [
                    {"date": "03.02.2026", "code": "19.1", "amount": 150.00},
                    {"date": "10.02.2026", "code": "19.2", "amount": 150.00},
                    {"date": "17.02.2026", "code": "19.2", "amount": 150.00},
                    {"date": "24.02.2026", "code": "19.2", "amount": 150.00},
                ],
            }
        ]
        sessions_file.write_text(json.dumps(sample, indent=2, ensure_ascii=False))
        print(f"Created: {sessions_file}")
        print("Edit the file with your client data, then run this script again.")
        print(f"\nGenerating sample invoice anyway...\n")
        generate_rechnung(sample[0])


if __name__ == "__main__":
    main()
