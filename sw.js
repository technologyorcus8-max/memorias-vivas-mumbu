/* =================================================================
   Memorias Vivas · Mumbú — Service Worker (offline-first)
   - Precarga la "cáscara" de la app (HTML, CSS, JS, íconos).
   - Navegación: responde con index.html desde caché aunque la URL
     traiga ?estacion=N, así cualquier QR funciona sin señal.
   - Estáticos: cache-first con actualización en segundo plano.
   - Audios: se sirven desde caché (mv-audio-v1) y soportan
     peticiones Range (necesarias en iPhone/Safari para <audio>).
   Sube CACHE_VERSION cada vez que cambien los archivos.
   ================================================================= */
const CACHE_VERSION = "mv-shell-v2";
const AUDIO_CACHE = "mv-audio-v1";
const IMG_CACHE = "mv-img-v1";

const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* ---------- Instalación: precarga de la cáscara ---------- */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activación: limpia versiones viejas ---------- */
self.addEventListener("activate", event => {
  const vigentes = [CACHE_VERSION, AUDIO_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => !vigentes.includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---------- Peticiones ---------- */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // nada externo

  // 1) Navegación (abrir un QR): red primero con tiempo límite, luego caché
  if (req.mode === "navigate") {
    event.respondWith(navegacion(req));
    return;
  }

  // 2) Audios (de la biblioteca orcus-audios o locales)
  if (/\.(mp3|m4a|aac|ogg|opus|wav)$/i.test(url.pathname)) {
    event.respondWith(audio(req));
    return;
  }

  // 3) Imágenes: caché primero, guarda las nuevas
  if (req.destination === "image") {
    event.respondWith(cacheFirst(req, IMG_CACHE));
    return;
  }

  // 4) Resto de estáticos: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function navegacion(req) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const red = await promesaConLimite(fetch(req), 3500); // 3,5 s: señal rural
    if (red.ok) cache.put("./index.html", red.clone());
    return red;
  } catch (_) {
    return (await cache.match("./index.html")) || (await cache.match("./")) ||
      new Response("<h1>Sin conexión</h1><p>Abra esta guía una vez con señal para guardarla.</p>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_VERSION);
  const guardado = await cache.match(req, { ignoreSearch: true });
  const red = fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
  return guardado || (await red) || new Response("", { status: 504 });
}

async function cacheFirst(req, nombre) {
  const cache = await caches.open(nombre);
  const guardado = await cache.match(req);
  if (guardado) return guardado;
  try {
    const r = await fetch(req);
    if (r.ok) cache.put(req, r.clone());
    return r;
  } catch (_) {
    return new Response("", { status: 504 });
  }
}

/* Audio: si está en caché, responde (con soporte de Range).
   Si no, va a la red sin guardar automáticamente (los audios pesan;
   se guardan con el botón "Guardar audios para usar sin señal"). */
async function audio(req) {
  const cache = await caches.open(AUDIO_CACHE);
  const guardado = await cache.match(req.url, { ignoreSearch: true });
  if (!guardado) {
    try { return await fetch(req); }
    catch (_) { return new Response("", { status: 504 }); }
  }

  const range = req.headers.get("range");
  if (!range) return guardado;

  // Construye una respuesta 206 Partial Content a partir del archivo completo
  const buf = await guardado.arrayBuffer();
  const total = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let inicio = m && m[1] ? parseInt(m[1], 10) : 0;
  let fin = m && m[2] ? parseInt(m[2], 10) : total - 1;
  if (m && !m[1] && m[2]) { inicio = total - parseInt(m[2], 10); fin = total - 1; } // sufijo "bytes=-N"
  fin = Math.min(fin, total - 1);
  if (inicio >= total || inicio > fin) {
    return new Response("", { status: 416, headers: { "Content-Range": `bytes */${total}` } });
  }
  return new Response(buf.slice(inicio, fin + 1), {
    status: 206,
    headers: {
      "Content-Type": guardado.headers.get("Content-Type") || "audio/mpeg",
      "Content-Range": `bytes ${inicio}-${fin}/${total}`,
      "Content-Length": String(fin - inicio + 1),
      "Accept-Ranges": "bytes"
    }
  });
}

function promesaConLimite(p, ms) {
  return new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error("timeout")), ms);
    p.then(v => { clearTimeout(t); ok(v); }, e => { clearTimeout(t); no(e); });
  });
}
