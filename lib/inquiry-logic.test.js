const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateField,
  validateInquiry,
  normalizeInquiryPayload,
  buildMailtoUrl,
  createLeadDeduplicator
} = require('./inquiry-logic.js');

test('validates required inquiry fields with German error messages', () => {
  const result = validateInquiry({
    name: '',
    company: 'A',
    email: 'invalid-email',
    phone: '12',
    date: '',
    attendees: '0',
    type: '',
    privacy: false
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.name, 'Bitte geben Sie Ihren Namen an.');
  assert.equal(result.errors.company, 'Bitte geben Sie Ihre Firma oder Organisation an.');
  assert.equal(result.errors.email, 'Bitte geben Sie eine gültige E-Mail-Adresse an.');
  assert.equal(result.errors.phone, 'Bitte geben Sie eine gültige Telefonnummer an.');
  assert.equal(result.errors.date, 'Bitte geben Sie einen Termin oder Zeitraum an.');
  assert.equal(result.errors.attendees, 'Bitte geben Sie die voraussichtliche Teilnehmerzahl an.');
  assert.equal(result.errors.type, 'Bitte wählen Sie ein Veranstaltungsformat aus.');
  assert.equal(result.errors.privacy, 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.');
});

test('accepts valid inquiry with optional phone omitted', () => {
  const result = validateInquiry({
    name: 'Maria Muster',
    company: 'Beispiel GmbH',
    email: 'maria@beispiel.de',
    phone: '',
    date: '12.–14. Juni 2027',
    attendees: '180',
    type: 'Konferenz / Fachtagung',
    privacy: true
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('normalizes whitespace and optional extras cleanly', () => {
  const normalized = normalizeInquiryPayload({
    name: '  Maria Muster ',
    company: ' Beispiel GmbH ',
    email: ' maria@beispiel.de ',
    phone: '  ',
    date: ' 14.10.2027 ',
    attendees: 120,
    type: ' Tagesseminar ',
    extras: [' Catering ', '', null],
    notes: ' Reihenbestuhlung ',
    privacy: true
  });

  assert.equal(normalized.name, 'Maria Muster');
  assert.equal(normalized.attendees, '120');
  assert.deepEqual(normalized.extras, ['Catering']);
  assert.equal(validateInquiry(normalized).valid, true);
});

test('formats mailto link with all provided fields', () => {
  const mail = buildMailtoUrl('info@westhouse-augsburg.de', {
    name: 'Maria Muster',
    company: 'Beispiel GmbH',
    email: 'maria@beispiel.de',
    phone: '+49 821 123456',
    date: '14. Oktober 2027',
    attendees: '120',
    type: 'Tagesseminar',
    extras: ['Catering', 'Technik'],
    notes: 'Reihenbestuhlung gewünscht'
  });

  assert.ok(mail.href.startsWith('mailto:info@westhouse-augsburg.de?subject='));
  assert.match(mail.body, /Teilnehmerzahl: 120/);
  assert.match(mail.body, /Zusätzlicher Bedarf: Catering, Technik/);
});

test('deduplicates identical lead submissions while allowing distinct inquiries', () => {
  const dedup = createLeadDeduplicator();
  const events = [];

  const first = dedup.recordOnce(
    {
      name: 'Maria Muster',
      company: 'Beispiel GmbH',
      email: 'maria@beispiel.de',
      date: '14.10.2027',
      attendees: '120',
      type: 'Tagesseminar',
      extras: ['Catering']
    },
    (evt) => events.push(evt)
  );

  const duplicate = dedup.recordOnce(
    {
      name: 'Maria Muster',
      company: 'Beispiel GmbH',
      email: 'maria@beispiel.de',
      date: '14.10.2027',
      attendees: '120',
      type: 'Tagesseminar',
      extras: ['Catering']
    },
    (evt) => events.push(evt)
  );

  const distinct = dedup.recordOnce(
    {
      name: 'Maria Muster',
      company: 'Beispiel GmbH',
      email: 'maria@beispiel.de',
      date: '20.11.2027',
      attendees: '200',
      type: 'Kongress',
      extras: ['Catering', 'Zimmer']
    },
    (evt) => events.push(evt)
  );

  assert.equal(first.recorded, true);
  assert.equal(duplicate.recorded, false);
  assert.equal(distinct.recorded, true);
  assert.equal(events.length, 2);
  assert.equal(dedup.count(), 2);
});

test('validates individual field changes cleanly', () => {
  assert.equal(validateField('email', 'ok@firma.de'), '');
  assert.notEqual(validateField('email', 'bad'), '');
});

