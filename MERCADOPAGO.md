# Conectar Mercado Pago (acreditación automática)

Dos Netlify Functions hacen el trabajo: una crea el pago, la otra acredita los
créditos cuando Mercado Pago confirma. El sitio sigue siendo tu `index.html`.

## 1. Credenciales de Mercado Pago

1. Entrá a https://www.mercadopago.com.ar/developers → tus aplicaciones.
2. Copiá el **Access Token** de producción (empieza con `APP_USR-...`).
   Es secreto: va en Netlify, **nunca** en el HTML.

## 2. Service account de Firebase (para que la función escriba el saldo)

1. Consola de Firebase → ⚙️ → Configuración del proyecto → pestaña **Cuentas de servicio**.
2. "Generar nueva clave privada" → descarga un archivo `.json`.
3. Abrí ese JSON y copiá **todo** el contenido (lo vas a pegar como variable).

## 3. Variables de entorno en Netlify

Site configuration → Environment variables → agregá:

| Variable | Valor |
|---|---|
| `MP_ACCESS_TOKEN` | el Access Token de Mercado Pago |
| `FIREBASE_SERVICE_ACCOUNT` | el JSON completo del service account (pegado tal cual) |
| `SITE_URL` | tu dominio, ej. `https://manosya.com.ar` (sin barra al final) |

## 4. Reglas de Firestore

Volvé a publicar `firestore.rules` (ya incluye la colección `payments`).

## 5. Webhook en Mercado Pago

En el panel de tu aplicación de MP → Webhooks / Notificaciones, configurá la URL:

```
https://TU-DOMINIO/.netlify/functions/mp-webhook
```

Evento: **Pagos** (payment).

## 6. Deploy

Subí todo a GitHub y conectá el repo en Netlify (o arrastrá la carpeta).
Netlify instala `firebase-admin`, publica el sitio y despliega las dos funciones.

## Cómo queda el flujo

1. El profesional toca "Comprar" en /wallet.
2. `crear-preferencia` arma la orden y lo manda a Mercado Pago.
3. Paga → MP redirige de vuelta a la app y le pega al webhook.
4. `mp-webhook` verifica el pago real, acredita los créditos y registra el movimiento.
5. El saldo aparece en la billetera (puede tardar unos segundos).

## Notas

- **No corre con el archivo abierto local** (`file://`): las funciones solo viven en
  Netlify. Para probar local usá `netlify dev`.
- El precio se valida en el servidor (desde `settings/credits`), así nadie puede
  pagar menos manipulando el cliente.
- El webhook es idempotente: aunque MP avise dos veces, los créditos se suman una sola vez.
- La carga manual desde el panel admin sigue disponible como respaldo.
