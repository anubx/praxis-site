# Cal.com Workflow Setup — Intake Documents via Booking Confirmation

**Purpose:** Automatically send clients a link to download and review intake documents when they book a session. This is the interim solution while e-signature integration (OpenAPI EU-SES) is pending.

---

## Steps

### 1. Go to Cal.com Workflows

- Log in at [app.cal.com](https://app.cal.com)
- Navigate to **Workflows** in the left sidebar (or go to `app.cal.com/workflows`)
- Click **+ New Workflow**

### 2. Configure the Trigger

- **Name:** `Send Intake Documents`
- **Trigger:** `After a Meeting is booked`
- **Time:** `Immediately` (or "When event is booked")

### 3. Add an Action

- **Action type:** `Send Email`
- **Send to:** `Attendee` (the client who booked)

### 4. Email Content (German — for DACH clients)

**Subject:**
```
Willkommen — Ihre Aufnahmedokumente | Praxis Robert Rozek
```

**Body:**
```
Liebe/r {attendee_name},

vielen Dank für Ihre Buchung. Ich freue mich auf unser Gespräch am {event_date} um {event_time}.

Vor unserer ersten Sitzung bitte ich Sie, die folgenden Aufnahmedokumente zu lesen:

📄 Aufnahmedokumente (PDF):
https://praxis-site-vert.vercel.app/docs/intake-combined-de.pdf

Das Dokument enthält:
• Behandlungsvertrag (Dienstvertrag nach BGB §§ 611 ff.)
• Einwilligungserklärung zur Datenverarbeitung
• Aufklärung nach dem Heilpraktikergesetz
• Informationen zu Ihren Rechten

Bitte lesen Sie die Dokumente in Ruhe durch. Ihre mündliche Zustimmung zu Beginn der ersten Sitzung genügt — eine Unterschrift ist nicht erforderlich.

Falls Sie Fragen haben, antworten Sie einfach auf diese E-Mail.

Herzliche Grüße,
Robert Rozek, MSc, MA
Praxis für Psychotherapie (HeilprG)
rozek.therapy@pm.me
```

### 5. (Optional) Add English Version

If you serve English-speaking clients, create a second workflow or use Cal.com's **locale-based conditions** (if available). Otherwise, add both languages in one email:

**After the German text, add:**
```
---

Dear {attendee_name},

Thank you for booking. I look forward to our session on {event_date} at {event_time}.

Before our first session, please review the intake documents:

📄 Intake Documents (PDF):
https://praxis-site-vert.vercel.app/docs/intake-combined-en.pdf

The document includes:
• Service agreement
• Data processing consent
• Information under the Heilpraktiker Act
• Your rights as a client

Please read through the documents at your leisure. Your verbal consent at the start of our first session is sufficient — no signature is required.

If you have any questions, simply reply to this email.

Best regards,
Robert Rozek, MSc, MA
Psychotherapeutic Practice (HeilprG)
rozek.therapy@pm.me
```

### 6. Assign to Event Types

- Under **"Which event types will this apply to?"**, select your session event type (`rozek.therapy/session`)
- If you later create a supervision event type, add it here too

### 7. Activate

- Toggle the workflow **ON**
- Test by making a test booking

---

## Cal.com Variable Reference

| Variable | Output |
|----------|--------|
| `{attendee_name}` | Client's full name |
| `{event_date}` | Booking date |
| `{event_time}` | Booking time |
| `{organizer_name}` | Your name |
| `{event_name}` | Event type name |
| `{location}` | Meeting location/link |

> **Note:** Cal.com's exact variable syntax may use `{{}}` instead of `{}`. Check their current docs at [cal.com/docs/workflows](https://cal.com/docs/workflows).

---

## When to Remove This Workflow

Once OpenAPI EU-SES is active (`ESIGN_PROVIDER=openapi` in Vercel env vars), the webhook at `/api/webhook-booking` will automatically send documents for e-signature. At that point, you can either:

1. **Deactivate** this workflow (keep it as backup)
2. **Modify** it to just say "intake documents have been sent to your email for digital signature"
