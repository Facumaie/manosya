# ManosYa (HTML + Firebase) — Puesta en marcha

App de un solo archivo (`index.html`) + Firebase. Mismo flujo que tus otras apps.

## 1. Firebase (consola)

Usás el proyecto `controldsed` que ya tenés. En https://console.firebase.google.com:

1. **Authentication** → Sign-in method → habilitar **Email/Password**.
2. **Firestore Database** → crear base (modo producción).
3. **Reglas** → pestaña "Rules" → pegar el contenido de `firestore.rules` → Publicar.
   - Ojo: estas reglas **reemplazan** las que tenía el proyecto anterior.

## 2. Probar local

Abrí `index.html` en el navegador (o serví la carpeta con cualquier server estático).
Firebase funciona directo desde el archivo, no necesitás build.

## 3. Crear el primer admin

1. Registrate normalmente desde la app (rol "Busco profesional" o "Soy profesional").
2. En la consola → Firestore → colección `users` → tu documento → cambiá
   `role` a `admin`. Recargá la app: te aparece el panel **Admin**.

## 4. Flujo para probar el circuito completo

1. Con una cuenta **cliente**: publicá una solicitud (queda gratis; el contacto va a `jobs/{id}/contact/data`).
2. Con una cuenta **profesional**: entra al feed. Arranca con créditos de bienvenida.
3. Desbloqueá una solicitud → se descuentan créditos (transacción atómica) y aparece el contacto.
4. Como **admin**: aprobá profesionales (badge "Verificado") y cargá/quitá créditos manualmente.

## 5. Deploy en Netlify

Igual que tus apps de siempre: arrastrás la carpeta a Netlify (o conectás el repo de GitHub).
No hay build: Netlify sirve el `index.html` tal cual. Después comprás el dominio y listo.

## Notas

- **Carga de créditos:** por ahora es manual (transferencia + admin carga). Cuando tengas
  volumen, se automatiza con **una** Cloud Function que escuche el webhook de Mercado Pago.
- **Créditos de bienvenida:** el valor está fijo en `2` tanto en la app como en `firestore.rules`.
  Si lo cambiás en el panel admin, actualizá también el número en las reglas.
- **Límite del modelo 100% cliente:** las reglas impiden que alguien suba su propio saldo o
  lea un contacto sin desbloqueo. El único hueco posible (un profesional muy técnico creando
  el doc de desbloqueo sin gastar) requiere manipular la API a mano, queda registrado en el
  historial y se cierra del todo el día que muevas el desbloqueo a una Cloud Function.
