(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WesthouseInquiry = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var MESSAGES = {
    name: 'Bitte geben Sie Ihren Namen an.',
    company: 'Bitte geben Sie Ihre Firma oder Organisation an.',
    email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    phone: 'Bitte geben Sie eine gültige Telefonnummer an.',
    date: 'Bitte geben Sie einen Termin oder Zeitraum an.',
    attendees: 'Bitte geben Sie die voraussichtliche Teilnehmerzahl an.',
    type: 'Bitte wählen Sie ein Veranstaltungsformat aus.',
    privacy: 'Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.'
  };

  function validateField(fieldName, value, checked) {
    var trimmed = typeof value === 'string' ? value.trim() : '';

    switch (fieldName) {
      case 'name':
        return trimmed.length >= 2 ? '' : MESSAGES.name;
      case 'company':
        return trimmed.length >= 2 ? '' : MESSAGES.company;
      case 'email':
        return EMAIL_PATTERN.test(trimmed) ? '' : MESSAGES.email;
      case 'phone':
        if (!trimmed) return '';
        return /^[+\d\s()/-]{6,}$/.test(trimmed) ? '' : MESSAGES.phone;
      case 'date':
        return trimmed.length >= 2 ? '' : MESSAGES.date;
      case 'attendees': {
        var count = Number.parseInt(trimmed, 10);
        return Number.isFinite(count) && count >= 1 && count <= 5000 ? '' : MESSAGES.attendees;
      }
      case 'type':
        return trimmed.length > 0 ? '' : MESSAGES.type;
      case 'privacy':
        return checked === true ? '' : MESSAGES.privacy;
      default:
        return '';
    }
  }

  function validateInquiry(payload) {
    var data = payload || {};
    var errors = {};

    var nameErr = validateField('name', data.name);
    if (nameErr) errors.name = nameErr;

    var companyErr = validateField('company', data.company);
    if (companyErr) errors.company = companyErr;

    var emailErr = validateField('email', data.email);
    if (emailErr) errors.email = emailErr;

    var phoneErr = validateField('phone', data.phone);
    if (phoneErr) errors.phone = phoneErr;

    var dateErr = validateField('date', data.date);
    if (dateErr) errors.date = dateErr;

    var attendeesErr = validateField('attendees', String(data.attendees || ''));
    if (attendeesErr) errors.attendees = attendeesErr;

    var typeErr = validateField('type', data.type);
    if (typeErr) errors.type = typeErr;

    var privacyErr = validateField('privacy', '', Boolean(data.privacy));
    if (privacyErr) errors.privacy = privacyErr;

    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  function buildInquirySignature(payload) {
    var data = payload || {};
    var extras = Array.isArray(data.extras) ? data.extras.slice().sort().join(',') : '';
    return [
      (data.name || '').trim().toLowerCase(),
      (data.company || '').trim().toLowerCase(),
      (data.email || '').trim().toLowerCase(),
      (data.date || '').trim().toLowerCase(),
      String(data.attendees || '').trim(),
      (data.type || '').trim().toLowerCase(),
      extras
    ].join('|');
  }

  function buildMailtoUrl(recipient, payload) {
    var data = payload || {};
    var extras = Array.isArray(data.extras) ? data.extras.filter(Boolean) : [];
    var subject = 'Tagungsanfrage über die Website: ' + (data.type || '').trim();
    var lines = [
      'Name: ' + (data.name || '').trim(),
      'Firma / Organisation: ' + (data.company || '').trim(),
      'E-Mail: ' + (data.email || '').trim(),
      data.phone && data.phone.trim() ? 'Telefon: ' + data.phone.trim() : null,
      'Termin / Zeitraum: ' + (data.date || '').trim(),
      'Teilnehmerzahl: ' + String(data.attendees || '').trim(),
      'Veranstaltungsformat: ' + (data.type || '').trim(),
      extras.length ? 'Zusätzlicher Bedarf: ' + extras.join(', ') : null,
      data.notes && data.notes.trim() ? 'Hinweise: ' + data.notes.trim() : null
    ].filter(function (line) {
      return line !== null;
    });

    return {
      subject: subject,
      body: lines.join('\r\n'),
      href:
        'mailto:' +
        recipient +
        '?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(lines.join('\r\n'))
    };
  }

  function createLeadDeduplicator() {
    var recorded = new Set();
    return {
      recordOnce: function (payload, emitFn) {
        var signature = buildInquirySignature(payload);
        if (recorded.has(signature)) {
          return { recorded: false, signature: signature };
        }
        recorded.add(signature);
        if (typeof emitFn === 'function') {
          emitFn({
            event: 'tagung_lead_submitted',
            event_format: (payload.type || '').trim(),
            attendees: Number.parseInt(String(payload.attendees || '0'), 10) || 0,
            signature: signature
          });
        }
        return { recorded: true, signature: signature };
      },
      count: function () {
        return recorded.size;
      }
    };
  }

  function normalizeInquiryPayload(payload) {
    var data = payload || {};
    var rawExtras = Array.isArray(data.extras) ? data.extras : [];
    var extras = rawExtras
      .map(function (item) {
        return typeof item === 'string' ? item.trim() : '';
      })
      .filter(Boolean);

    return {
      name: typeof data.name === 'string' ? data.name.trim() : '',
      company: typeof data.company === 'string' ? data.company.trim() : '',
      email: typeof data.email === 'string' ? data.email.trim() : '',
      phone: typeof data.phone === 'string' ? data.phone.trim() : '',
      date: typeof data.date === 'string' ? data.date.trim() : '',
      attendees: String(data.attendees == null ? '' : data.attendees).trim(),
      type: typeof data.type === 'string' ? data.type.trim() : '',
      extras: extras,
      notes: typeof data.notes === 'string' ? data.notes.trim() : '',
      privacy: data.privacy === true
    };
  }

  return {
    MESSAGES: MESSAGES,
    validateField: validateField,
    validateInquiry: validateInquiry,
    normalizeInquiryPayload: normalizeInquiryPayload,
    buildInquirySignature: buildInquirySignature,
    buildMailtoUrl: buildMailtoUrl,
    createLeadDeduplicator: createLeadDeduplicator
  };
});

