# ManosYa — Guía paso a paso (de cero a funcionando)

Seguí esto de arriba a abajo. Necesitás cuentas (gratis) de GitHub, Netlify y
Mercado Pago. Firebase ya lo tenés (controldsed).

## FASE 0 · Preparar la carpeta
Descomprimí el zip. Adentro: index.html, firestore.rules, netlify.toml,
package.json, carpeta netlify/functions, y las guías .md. No toques nada todavía.

## FASE 1 · Firebase (base + login)
1. console.firebase.google.com → proyecto controldsed.
2. Authentication → Comenzar → Sign-in method → activar "Correo/contraseña" → Guardar.
3. Firestore Database → Crear base de datos → modo producción → región Sudamérica.
4. Firestore → pestaña Reglas → borrar todo → pegar TODO firestore.rules → Publicar.
   ✅ Listo cuando dice "Reglas publicadas".

## FASE 2 · Probar local (opcional)
Doble clic en index.html → registrate y publicá una solicitud de prueba.
Anda todo menos el pago de Mercado Pago (eso necesita estar publicado).

## FASE 3 · Hacerte admin
1. Registrate en la app (cualquier rol).
2. Firebase → Firestore → users → tu documento → role = admin → Guardar.
3. Recargá: aparece el botón Admin.

## FASE 4 · Subir a GitHub (sin terminal)
1. github.com → New repository → nombre (ej. manosya) → Create.
2. "uploading an existing file" → arrastrar el CONTENIDO de la carpeta
   (index.html en la raíz) + la carpeta netlify → Commit.
   ⚠️ index.html tiene que quedar en la raíz del repo, no dentro de otra carpeta.

## FASE 5 · Publicar en Netlify
1. netlify.com → entrar con GitHub.
2. Add new site → Import an existing project → elegir el repo.
3. Build command: VACÍO (el resto lo define netlify.toml).
4. Deploy → esperar 1–2 min → te da una URL *.netlify.app.
5. Abrir la URL: tiene que verse ManosYa.
6. Firebase → Authentication → Settings → Authorized domains → agregar tu dominio .netlify.app.

## FASE 6 · Dominio propio
1. Netlify → Domain management → comprarlo o agregarlo (.com.ar en NIC.ar; .com donde sea).
2. Seguir las instrucciones de DNS de Netlify.
3. HTTPS se activa solo.
4. Firebase → Authorized domains → agregar también el dominio nuevo.

## FASE 7 · Mercado Pago (acreditación automática)
1. Access Token: mercadopago.com.ar/developers → Tus aplicaciones → Credenciales →
   copiar Access Token (APP_USR-...).
2. Clave de Firebase: ⚙️ Configuración del proyecto → Cuentas de servicio →
   Generar nueva clave privada → baja un .json → copiar TODO el contenido.
3. Netlify → Site configuration → Environment variables → agregar:
   - MP_ACCESS_TOKEN = el token
   - FIREBASE_SERVICE_ACCOUNT = el JSON entero
   - SITE_URL = tu dominio (https://..., sin barra final)
4. Netlify → Deploys → Trigger deploy (para tomar las variables).
5. App de Mercado Pago → Webhooks → URL:
   https://TUDOMINIO/.netlify/functions/mp-webhook → evento Pagos.
   💡 Para probar sin plata real: usá credenciales y tarjetas de PRUEBA de MP primero.

## FASE 8 · Prueba final
1. Registrate como profesional → tenés créditos de bienvenida.
2. Otra cuenta cliente → publicá una solicitud.
3. Como profesional → desbloqueá → se descuentan créditos y aparece el contacto.
4. Comprá un paquete → Mercado Pago → pagá → el saldo sube solo.
Si los 4 andan, está todo funcionando.
