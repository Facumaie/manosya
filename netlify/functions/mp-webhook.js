// Webhook de Mercado Pago: verifica el pago real y acredita los créditos.
// Idempotente (campo `credited`): aunque MP reintente, no duplica créditos.
const admin = require('firebase-admin');
function serviceAccount() {
  const v = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
  const raw = v.startsWith('{') ? v : Buffer.from(v, 'base64').toString('utf8'); // acepta JSON o base64
  return JSON.parse(raw);
}
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount()) });
}
const db = admin.firestore();
const MP = 'https://api.mercadopago.com';

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch {}
    const topic = body.type || params.topic || params.type;
    const paymentId = (body.data && body.data.id) || params['data.id'] || params.id;
    if (topic !== 'payment' || !paymentId) return { statusCode: 200, body: 'ignored' };

    // Nunca confiamos en el payload: consultamos el pago real contra MP
    const pago = await fetch(`${MP}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    }).then((r) => r.json());

    const orderId = pago.external_reference;
    if (!orderId) return { statusCode: 200, body: 'no ref' };
    const payRef = db.doc(`payments/${orderId}`);

    await db.runTransaction(async (tx) => {
      const paySnap = await tx.get(payRef);
      if (!paySnap.exists) return;
      const pay = paySnap.data();
      if (pay.credited) return;                              // ya acreditado
      if (pago.status !== 'approved') {
        tx.update(payRef, { status: 'rechazado', mpPaymentId: String(pago.id) });
        return;
      }
      const wRef = db.doc(`wallets/${pay.proUid}`);
      const wSnap = await tx.get(wRef);
      const cur = wSnap.exists ? (wSnap.data().balance || 0) : 0;
      const newBal = cur + pay.credits;
      if (wSnap.exists) tx.update(wRef, { balance: newBal, lifetimePurchased: (wSnap.data().lifetimePurchased || 0) + pay.credits });
      else tx.set(wRef, { balance: newBal, lifetimePurchased: pay.credits, lifetimeSpent: 0 });

      const lRef = db.collection(`wallets/${pay.proUid}/ledger`).doc();
      tx.set(lRef, { type: 'compra', amount: pay.credits, balanceAfter: newBal, note: 'Compra Mercado Pago', at: admin.firestore.FieldValue.serverTimestamp() });
      tx.update(payRef, { status: 'aprobado', credited: true, mpPaymentId: String(pago.id), creditedAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error('webhook error', e);
    return { statusCode: 200, body: 'error' }; // 200 para que MP no reintente en loop
  }
};
