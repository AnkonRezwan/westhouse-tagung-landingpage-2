const path = require('path');
const crypto = require('crypto');
const express = require('express');
const inquiryLogic = require('./lib/inquiry-logic');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const INQUIRY_RECIPIENT = process.env.INQUIRY_RECIPIENT || 'info@westhouse-augsburg.de';
const INQUIRY_WEBHOOK_URL = (process.env.INQUIRY_WEBHOOK_URL || '').trim();
const submittedSignatures = new Map();

app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

app.post('/api/inquiries', async (req, res) => {
  const payload = inquiryLogic.normalizeInquiryPayload(req.body);
  const validation = inquiryLogic.validateInquiry(payload);

  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      message: 'Bitte prüfen Sie Ihre Eingaben.',
      errors: validation.errors
    });
  }

  const signature = inquiryLogic.buildInquirySignature(payload);
  const existing = submittedSignatures.get(signature);
  if (existing) {
    return res.status(200).json({
      ok: true,
      duplicate: true,
      deliveryStatus: existing.deliveryStatus,
      referenceId: existing.referenceId,
      recipient: INQUIRY_RECIPIENT
    });
  }

  const referenceId = 'WH-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  let deliveryStatus = 'pending_endpoint';

  if (INQUIRY_WEBHOOK_URL) {
    try {
      const forwardRes = await fetch(INQUIRY_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceId,
          recipient: INQUIRY_RECIPIENT,
          submittedAt: new Date().toISOString(),
          inquiry: payload
        })
      });

      if (!forwardRes.ok) {
        return res.status(502).json({
          ok: false,
          message: 'Die Anfrage konnte derzeit nicht zugestellt werden. Bitte nutzen Sie alternativ E-Mail oder Telefon.'
        });
      }
      deliveryStatus = 'forwarded';
    } catch (_err) {
      return res.status(502).json({
        ok: false,
        message: 'Die Anfrage konnte derzeit nicht zugestellt werden. Bitte nutzen Sie alternativ E-Mail oder Telefon.'
      });
    }
  }

  submittedSignatures.set(signature, { referenceId, deliveryStatus });
  if (submittedSignatures.size > 500) {
    const firstKey = submittedSignatures.keys().next().value;
    submittedSignatures.delete(firstKey);
  }

  return res.status(201).json({
    ok: true,
    duplicate: false,
    deliveryStatus,
    referenceId,
    recipient: INQUIRY_RECIPIENT
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

