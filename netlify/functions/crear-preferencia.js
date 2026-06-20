// Crea una preferencia de pago en Mercado Pago y registra la orden pendiente.
// El precio se valida en el servidor (nunca se confía en el que manda el cliente).
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}
const db = admin.firestore();
const MP = 'https://api.mercadopago.com';

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Método no permitido' });
  try {
    const { credits, proUid, email } = JSON.parse(event.body || '{}');
    if (!credits || !proUid) return json(400, { error: 'Faltan datos' });

    // Precio confiable: lo tomamos de settings/credits (no de lo que mande el cliente)
    const sSnap = await db.doc('settings/credits').get();
    const packages = (sSnap.exists && sSnap.data().packages) || [
      { credits: 10, price: 4000 }, { credits: 25, price: 9000 },
      { credits: 50, price: 16000 }, { credits: 100, price: 28000 },
    ];
    const pkg = packages.find((p) => p.credits === credits);
    if (!pkg) return json(400, { error: 'Paquete inválido' });

    // Orden pendiente en Firestore (external_reference = su id)
    const payRef = await db.collection('payments').add({
      proUid, credits: pkg.credits, amount: pkg.price, status: 'pendiente',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const site = process.env.SITE_URL || '';
    const pref = await fetch(`${MP}/checkout/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
      body: JSON.stringify({
        items: [{ title: `ManosYa · ${pkg.credits} créditos`, quantity: 1, unit_price: pkg.price, currency_id: 'ARS' }],
        external_reference: payRef.id,
        payer: email ? { email } : undefined,
        back_urls: {
          success: `${site}/#/wallet?pago=ok`,
          failure: `${site}/#/wallet?pago=error`,
          pending: `${site}/#/wallet?pago=pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${site}/.netlify/functions/mp-webhook`,
      }),
    }).then((r) => r.json());

    if (!pref.init_point) return json(502, { error: 'No se pudo crear el pago' });
    await payRef.update({ mpPreferenceId: pref.id });
    return json(200, { init_point: pref.init_point });
  } catch (e) {
    return json(500, { error: e.message });
  }
};
