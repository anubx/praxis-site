/**
 * generate-receipt.js
 *
 * Generates a Zahlungsbestätigung (payment confirmation) PDF as a Buffer.
 * Used by webhook-booking.js after Cal.com/Stripe payment.
 *
 * This is NOT a full Rechnung — no address, DOB, or diagnosis.
 * For insurance-grade invoices, use the monthly Rechnung generator.
 *
 * Requires: pdfkit (npm)
 */

const PDFDocument = require('pdfkit');

// ─── Practice details (static) ──────────────────────────────

const PRACTICE = {
  name: 'Robert Rozek, MSc, MA',
  title: 'Heilpraktiker für Psychotherapie',
  address: 'Augsburgerstraße 6 · 80337 München',
  email: 'praxis@robertrozek.de',
  phone: '+49 157 5469 5230',
  steuernummer: '921/310/68453',
  website: 'robertrozek.de',
};

// ─── Colors matching site branding ──────────────────────────

const GOLD = [184, 151, 106];       // #b8976a
const DARK = [28, 25, 23];          // #1c1917
const GREY = [120, 113, 108];       // #78716c
const LIGHT_GREY = [231, 229, 228]; // #e7e5e4

/**
 * Generate a Zahlungsbestätigung PDF.
 *
 * @param {Object} opts
 * @param {string} opts.clientName    - Client's full name
 * @param {string} opts.clientEmail   - Client's email
 * @param {string} opts.sessionDate   - ISO date string of the session
 * @param {number} opts.amount        - Amount in EUR (e.g. 150)
 * @param {string} opts.referenceId   - Stripe charge ID or similar
 * @param {string} opts.lang          - 'de' or 'en'
 * @param {boolean} opts.isFirstSession - true if Erstgespräch (GebüH 19.1)
 * @returns {Promise<Buffer>} PDF as Buffer
 */
function generateReceipt(opts) {
  const {
    clientName,
    clientEmail,
    sessionDate,
    amount,
    referenceId,
    lang = 'de',
    isFirstSession = false,
  } = opts;

  const isDE = lang === 'de';
  const priceCents = parseInt(process.env.SESSION_PRICE_CENTS || '15000', 10);
  const price = amount || priceCents / 100;

  // Format date
  const date = new Date(sessionDate);
  const dateStr = date.toLocaleDateString(isDE ? 'de-DE' : 'en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const longDateStr = date.toLocaleDateString(isDE ? 'de-DE' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin',
  });

  const today = new Date().toLocaleDateString(isDE ? 'de-DE' : 'en-GB', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  // GebüH code
  const gebuehCode = isFirstSession ? '19.1' : '19.2';
  const gebuehDesc = isDE
    ? (isFirstSession
      ? 'Erhebung einer biographischen Anamnese unter Einbeziehung der Ergebnisse der Verhaltens- und Problemanalyse (Erstgespräch)'
      : 'Psychotherapie, tiefenpsychologisch fundierte Einzelbehandlung, Dauer mind. 45 Min.')
    : (isFirstSession
      ? 'Biographical anamnesis including behavioral and problem analysis (initial session)'
      : 'Psychotherapy, depth psychology-based individual treatment, min. 45 min.');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: isDE ? 'Zahlungsbestätigung' : 'Payment Confirmation',
        Author: PRACTICE.name,
      },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const leftX = doc.page.margins.left;

    // ─── Gold accent line at top ──────────────────────────
    doc.rect(leftX, 40, pageWidth, 3).fill(GOLD);

    // ─── Header: practice details (left) + document title (right) ─
    let y = 58;

    doc.font('Helvetica-Bold').fontSize(11).fillColor(DARK);
    doc.text(PRACTICE.name, leftX, y);
    y += 15;

    doc.font('Helvetica').fontSize(8.5).fillColor(GREY);
    doc.text(PRACTICE.title, leftX, y);
    y += 12;
    doc.text(PRACTICE.address, leftX, y);
    y += 12;
    doc.text(`${PRACTICE.email} · ${PRACTICE.website}`, leftX, y);
    y += 12;
    doc.text(`${isDE ? 'Steuernummer' : 'Tax ID'}: ${PRACTICE.steuernummer}`, leftX, y);

    // Document title — right aligned
    const titleX = leftX + pageWidth - 200;
    doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK);
    doc.text(
      isDE ? 'ZAHLUNGSBESTÄTIGUNG' : 'PAYMENT CONFIRMATION',
      titleX, 58, { width: 200, align: 'right' }
    );

    // Reference + date under title
    doc.font('Helvetica').fontSize(8.5).fillColor(GREY);
    doc.text(
      `${isDE ? 'Ref' : 'Ref'}: ${referenceId || 'N/A'}`,
      titleX, 82, { width: 200, align: 'right' }
    );
    doc.text(
      `${isDE ? 'Datum' : 'Date'}: ${today}`,
      titleX, 94, { width: 200, align: 'right' }
    );

    // ─── Divider ──────────────────────────────────────────
    y = 140;
    doc.rect(leftX, y, pageWidth, 0.5).fill(LIGHT_GREY);

    // ─── Client info ──────────────────────────────────────
    y = 158;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK);
    doc.text(isDE ? 'Klient/in:' : 'Client:', leftX, y);
    doc.font('Helvetica').fontSize(9).fillColor(DARK);
    doc.text(clientName, leftX + 60, y);
    y += 14;
    doc.font('Helvetica').fontSize(8.5).fillColor(GREY);
    doc.text(clientEmail, leftX + 60, y);

    // ─── Service table ────────────────────────────────────
    y = 210;

    doc.font('Helvetica').fontSize(9).fillColor(DARK);
    doc.text(
      isDE
        ? 'Für die nachfolgend aufgeführte heilkundliche Leistung bestätige ich den Zahlungseingang:'
        : 'I hereby confirm receipt of payment for the following therapeutic service:',
      leftX, y, { width: pageWidth }
    );

    y += 30;

    // Table header
    const colDate = leftX;
    const colCode = leftX + 90;
    const colDesc = leftX + 140;
    const colAmount = leftX + pageWidth - 80;

    doc.rect(leftX, y - 4, pageWidth, 20).fill([245, 244, 243]);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GREY);
    doc.text(isDE ? 'Datum' : 'Date', colDate, y, { width: 80 });
    doc.text('GebüH', colCode, y, { width: 45 });
    doc.text(isDE ? 'Leistungsbeschreibung' : 'Description', colDesc, y, { width: 250 });
    doc.text(isDE ? 'Betrag' : 'Amount', colAmount, y, { width: 80, align: 'right' });

    y += 24;

    // Table row
    doc.font('Helvetica').fontSize(9).fillColor(DARK);
    doc.text(dateStr, colDate, y, { width: 80 });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD);
    doc.text(gebuehCode, colCode, y, { width: 45 });
    doc.font('Helvetica').fontSize(8.5).fillColor(DARK);
    const descHeight = doc.heightOfString(gebuehDesc, { width: 250 });
    doc.text(gebuehDesc, colDesc, y, { width: 250 });
    doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK);
    doc.text(`${price.toFixed(2)} EUR`, colAmount, y, { width: 80, align: 'right' });

    y += Math.max(descHeight, 14) + 12;

    // Divider
    doc.rect(leftX, y, pageWidth, 0.5).fill(LIGHT_GREY);
    y += 8;

    // Total
    const totalBoxX = colAmount - 60;
    doc.rect(totalBoxX, y - 2, 140, 22).fill([245, 244, 243]);
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(GREY);
    doc.text(isDE ? 'Gesamtbetrag:' : 'Total:', totalBoxX + 4, y + 3, { width: 60 });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(DARK);
    doc.text(`${price.toFixed(2)} EUR`, colAmount, y + 1, { width: 80, align: 'right' });

    y += 36;

    // Tax note
    doc.font('Helvetica-Oblique').fontSize(8).fillColor(GREY);
    doc.text(
      isDE
        ? 'Gemäß § 4 Nr. 14 UStG umsatzsteuerbefreit (heilkundliche Tätigkeit).'
        : 'VAT exempt per § 4 Nr. 14 UStG (therapeutic services).',
      leftX, y, { width: pageWidth }
    );

    y += 24;

    // Payment method note
    doc.font('Helvetica').fontSize(8.5).fillColor(DARK);
    doc.text(
      isDE ? 'Zahlungseingang:' : 'Payment received:',
      leftX, y
    );
    doc.font('Helvetica').fontSize(8.5).fillColor(GREY);
    doc.text(
      isDE
        ? `Kreditkarte via Stripe · ${today}`
        : `Credit card via Stripe · ${today}`,
      leftX + 100, y
    );

    // ─── Reimbursement notice ─────────────────────────────
    y += 35;
    doc.rect(leftX, y, pageWidth, 0.5).fill(LIGHT_GREY);
    y += 12;

    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK);
    doc.text(isDE ? 'Hinweis zur Kostenerstattung:' : 'Note on reimbursement:', leftX, y);
    y += 14;

    doc.font('Helvetica').fontSize(8).fillColor(GREY);
    doc.text(
      isDE
        ? 'Die Abrechnung erfolgt in Anlehnung an das Gebührenverzeichnis für Heilpraktiker (GebüH). Eine Erstattung durch private Krankenversicherungen oder Zusatzversicherungen ist je nach Vertrag möglich, jedoch nicht garantiert. Bitte klären Sie die Erstattungsfähigkeit vorab mit Ihrer Versicherung. Der Rechnungsbetrag ist unabhängig von einer etwaigen Erstattung in voller Höhe durch den Patienten / die Patientin zu begleichen.'
        : 'Billing follows the Gebührenverzeichnis für Heilpraktiker (GebüH). Reimbursement by private health insurance or supplementary insurance may be possible depending on your policy, but is not guaranteed. Please check with your insurance provider before starting. The invoiced amount is due in full regardless of any reimbursement.',
      leftX, y, { width: pageWidth, lineGap: 2 }
    );

    // ─── Footer ───────────────────────────────────────────
    const footerY = doc.page.height - doc.page.margins.bottom - 25;
    doc.rect(leftX, footerY - 8, pageWidth, 0.5).fill(LIGHT_GREY);
    doc.font('Helvetica').fontSize(7).fillColor(GREY);
    doc.text(
      `${PRACTICE.name} · ${PRACTICE.title} · ${PRACTICE.address} · ${isDE ? 'Steuernr' : 'Tax ID'}: ${PRACTICE.steuernummer}`,
      leftX, footerY, { width: pageWidth, align: 'center' }
    );

    doc.end();
  });
}

module.exports = { generateReceipt };
