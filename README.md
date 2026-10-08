# Memorias Vivas: Mumbú, Resiliencia y Tradición — PWA

App web offline-first para los códigos QR de la ruta de Mumbú (Tadó, Chocó).
Sin librerías, solo fuentes del sistema. **Peso total sin audios: ~60 KB.**

## Estructura

```
index.html            Estructura semántica de la vista de estación
css/styles.css        Sistema de diseño (paleta, mobile-first, tabs, drawer)
js/app.js             Lógica: DATA · ART · ROUTER · VIEW · PLAYER · NET · SHOP
sw.js                 Service Worker (caché de la app, navegación offline, audio con soporte Range)
manifest.webmanifest  Instalable como app ("Agregar a pantalla de inicio")
icons/                Íconos SVG + PNG 192/512
audio/                Grabaciones (ver abajo)
img/                  Fotos reales (ver abajo)
```

## Enlaces de los QR

Cada QR apunta a la misma página con un parámetro:

| QR | URL |
|----|-----|
| 01 El Abrazo del Río y la Bienvenida | `https://SU-DOMINIO/?estacion=1` |
| 02 El Alambique y el Viche Ancestral | `https://SU-DOMINIO/?estacion=2` |
| 03 La Farmacia de Azotea y el Pancoger | `https://SU-DOMINIO/?estacion=3` |
| 04 La Batea que no Envenena | `https://SU-DOMINIO/?estacion=4` |

## Editar el contenido

Todo está en el bloque `DATA` al inicio de `js/app.js`: títulos, transcripciones,
fichas (máx. 140 palabras), etiquetas, galería, pregunta, datos del lote y el
contacto de la Asociación.
**Todos los textos y los nombres de narradores son borradores o ejemplos** para validar con la comunidad.

- **Audios:** viven en la biblioteca central **orcus-audios** (`https://technologyorcus8-max.github.io/orcus-audios/`).
  Cada estación tiene un `audioId` (`estacion-01` … `estacion-04`) que corresponde a una pista de `catalogo.json`.
  Mientras una pista esté `pendiente`, el teléfono lee la transcripción en voz alta, marcada como
  **voz sintética de demostración**, y resalta el párrafo que va leyendo. Al publicar la grabación real, la app la usa sola.
- **Fotos:** WebP de 600×800 px y menos de 60 KB en `img/`; ponga la ruta en `galeria[].src`.
  Cada foto necesita el consentimiento de las personas que aparecen.
- Al cambiar archivos, suba `CACHE_VERSION` en `sw.js` (por ejemplo `mv-shell-v2`) para que los teléfonos reciban la actualización.

## Despliegue

**Importante:** los navegadores solo activan el Service Worker en **HTTPS** o en `localhost`.

### Opción A — Hosting público (recomendada para el modo offline)
Suba la carpeta a cualquier hosting estático con HTTPS (GitHub Pages, Netlify, Cloudflare Pages).
El visitante abre un QR **una vez con señal** (en Tadó o en el embarcadero) y la app queda
guardada: desde ahí las 4 estaciones funcionan sin conexión. El botón
"Guardar audios para usar sin señal" descarga los 4 relatos para el recorrido.

### Opción B — Servidor local en el territorio (Raspberry Pi / edge)
Una Raspberry Pi con red Wi-Fi propia sirve la app sin internet:

```bash
sudo apt install nginx
sudo cp -r memorias-vivas-pwa/* /var/www/html/
```

Configure la Pi como punto de acceso (por ejemplo, red "Memorias-Vivas-Mumbu") y apunte
los QR a `http://mumbu.local/?estacion=N` o a la IP fija de la Pi. En HTTP simple el
Service Worker no se registra, pero no hace falta: la Pi es el servidor offline y
los audios se reproducen directamente desde ella. La barra muestra "Modo Local · Territorio Mumbú".

Para probar en un computador: `python3 -m http.server 8080` dentro de la carpeta y abrir
`http://localhost:8080/?estacion=1`.

## Qué se probó
Chromium en vista móvil (390 px): navegación por tabs y por `?estacion=N`, drawer de compra,
guardado de audios, y abrir una estación y reproducir su audio guardado **con la red apagada**.
Sin desplazamiento horizontal.
