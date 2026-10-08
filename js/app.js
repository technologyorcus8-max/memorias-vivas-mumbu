/* =================================================================
   Memorias Vivas · Mumbú — Lógica de la aplicación
   Vanilla JS, sin dependencias. Organizado en módulos (IIFE):
     1. DATA      contenido de las 4 estaciones (editable por la comunidad)
     2. ART       ilustraciones SVG de reemplazo mientras no hay fotos
     3. ROUTER    lectura de ?estacion=N y navegación sin recargar
     4. VIEW      pintado de la estación en el DOM
     5. PLAYER    reproductor de audio accesible
     6. NET       estado de conexión + Service Worker + audios offline
     7. SHOP      drawer de compra comunitaria directa
   ================================================================= */
(() => {
  "use strict";

  /* ---------------------------------------------------------------
     1. DATA
     Todos los textos son BORRADOR para validar con la comunidad.
     Los nombres de narradores son de ejemplo: reemplazarlos por los
     de quienes graben, con su consentimiento firmado.
     Audios: colocar los MP3 en /audio con el nombre indicado.
     Fotos: poner la ruta en "src" (WebP < 60 KB); vacío = ilustración.
     --------------------------------------------------------------- */
  const DATA = {
    asociacion: {
      nombre: "Asociación de Productores de Mumbú",
      telefono: "+57 300 000 0000", // EJEMPLO: reemplazar por el número real
      lote: [
        ["Lote", "MV-2026-03"],
        ["Destilado", "Septiembre 2026"],
        ["Botellas disponibles", "48 de 120"],
        ["Grado", "Por medir en destilería"],
        ["Productoras", "Familias vicheras de Mumbú"]
      ],
      oferta: [
        { t: "Botella de viche puro", d: "375 ml, etiqueta con QR de esta ruta", p: "Precio comunitario" },
        { t: "Curado o arrechón", d: "Según disponibilidad del lote", p: "Precio comunitario" },
        { t: "Aporte al fondo de custodia biocultural", d: "Semillas de azotea, bateas y grabación de nuevas voces", p: "Aporte libre" }
      ]
    },

    estaciones: [
      {
        n: 1,
        corto: "Río y Bienvenida",
        titulo: "El Abrazo del Río y la Bienvenida",
        tagline: "Aquí el río San Juan es el más viejo de todos nosotros.",
        lugar: "Tótem del embarcadero, orilla del río San Juan",
        narrador: "Relato de Tía Rosalba",
        rol: "Sabedora de Mumbú · nombre de ejemplo",
        audio: "audio/estacion-01.mp3",
        transcripcion: [
          "Buenas, buenas. Bienvenidos a Mumbú.",
          "Yo soy hija de esta orilla. Aquí nací, aquí aprendí a nadar, a sembrar y a moler la caña.",
          "Este río es el San Juan. Por aquí pasaron los que vinieron a buscar oro hace casi quinientos años, y por aquí pasamos nosotros, los que nos quedamos a cuidarlo.",
          "No les voy a mentir: aquí hubo tiempos duros. Hubo años en que el miedo nos cambió los caminos. Eso no se olvida, pero tampoco es lo único que somos.",
          "Lo que nos sostuvo fue lo de siempre: la azotea, el colino, la batea y el viche que hacían nuestras abuelas.",
          "Les pido tres cosas: pregunten con respeto, pidan permiso antes de una foto y escuchen. Sigan, que esta es su casa."
        ],
        ficha: "Mumbú es un pequeño poblado de Tadó, a orillas del río San Juan. Su nombre aparece en crónicas de 1532 como el lugar por donde los españoles bajaron al San Juan buscando oro. El río fue camino de llegada, de salida y de regreso: por él se fueron familias en los años más duros y por él volvieron. Hoy la comunidad abre su casa para mostrar lo que la sostuvo: el viche, la azotea, el pancoger y la batea. Recibir visitantes en sus propios términos, con sus voces y a su ritmo, es también una forma de soberanía sobre su historia.",
        tags: ["#RíoSanJuan", "#MemoriaViva", "#TurismoComunitario"],
        galeria: [
          { etiqueta: "Memoria", pie: "Canoas en el embarcadero, camino de ida y de regreso", alt: "Canoas de madera amarradas en la orilla del río", src: "", arte: 0 },
          { etiqueta: "Siembra", pie: "El colino que alimentó a las familias que se quedaron", alt: "Plantas de plátano junto a la orilla", src: "", arte: 1 },
          { etiqueta: "Territorio vivo", pie: "El San Juan al amanecer, hoy", alt: "El río San Juan al amanecer", src: "", arte: 2 }
        ],
        pregunta: "¿Qué historia de su propia tierra le gustaría que alguien escuchara con este mismo respeto?"
      },
      {
        n: 2,
        corto: "Viche Ancestral",
        titulo: "El Alambique y el Viche Ancestral",
        tagline: "Lo que la abuela destilaba para curar, celebrar y despedir.",
        lugar: "Destilería comunitaria, junto a la cachimba",
        narrador: "Maestro Destilador Eusebio",
        rol: "Vichero de la destilería · nombre de ejemplo",
        audio: "audio/estacion-02.mp3",
        transcripcion: [
          "Esta caña la sembramos nosotros, sin químicos. La molemos en el trapiche y el guarapo se deja reposar varios días.",
          "Esto es la cachimba, el alambique. El guarapo se calienta despacio y el vapor se vuelve gotas.",
          "Lo primero que sale no se toma: es la cabeza y se aparta. Después viene el viche bueno.",
          "Mi mamá me enseñó a conocerlo por el olor y por cómo corre en el vaso. Eso no está escrito en ningún libro."
        ],
        ficha: "El viche nace en el colino: caña sembrada sin químicos, molida en trapiche y fermentada varios días en canecas. En la cachimba, el alambique artesanal, el guarapo se calienta a fuego lento; la primera salida se aparta y lo que sigue es el viche puro. Con él se preparan el curado, el arrechón y la tomaseca, cuyas recetas guarda cada familia. Mientras la violencia y el abandono empujaban a dejar el territorio, destilar fue una forma de quedarse y de sostener la economía de las mujeres. Desde 2021, la Ley 2158 reconoce el viche como patrimonio de las comunidades negras del Pacífico.",
        tags: ["#VicheAncestral", "#Cachimba", "#Ley2158", "#EconomíaDeMujeres"],
        galeria: [
          { etiqueta: "Memoria", pie: "La olla de barro y el saber de las abuelas", alt: "Vasija de barro tradicional para destilar", src: "", arte: 3 },
          { etiqueta: "Siembra", pie: "La caña crece mezclada con plátano y frutales", alt: "Cañaduzal junto a plátanos", src: "", arte: 4 },
          { etiqueta: "Territorio vivo", pie: "La destilería comunitaria en funcionamiento", alt: "Alambique artesanal con gotas de viche", src: "", arte: 5 }
        ],
        pregunta: "Si el viche se hizo para curar, celebrar y despedir, ¿qué le gustaría brindar usted hoy?"
      },
      {
        n: 3,
        corto: "Azotea y Pancoger",
        titulo: "La Farmacia de Azotea y el Pancoger",
        tagline: "Lo que va a la olla también va al remedio.",
        lugar: "Azotea detrás de la cocina y finca de pancoger",
        narrador: "Relato de Doña Ana Lucía",
        rol: "Cocinera tradicional · nombre de ejemplo",
        audio: "audio/estacion-03.mp3",
        transcripcion: [
          "La azotea es la huerta en alto, en una canoa vieja o un cajón sobre palos, para que no la alcancen las gallinas ni la creciente.",
          "Aquí está la chillangua, el alma de nuestra cocina. El poleo, la albahaca, el orégano de hoja ancha. Unas son para la olla y otras para el remedio.",
          "Cuando llegaron los tiempos duros, lo que nos salvó fue el colino. Nadie pasaba hambre teniendo su plátano y su yuca."
        ],
        ficha: "La azotea es una huerta elevada sobre una canoa vieja o un cajón con patas, cuidada sobre todo por las mujeres. Allí crecen chillangua, poleo, albahaca, orégano de hoja ancha y cebollín, que sazonan la cocina y sirven de remedio. Más allá está el pancoger: plátano, yuca, maíz, chontaduro y borojó mezclados con monte, sembrados por lunas y trabajados en minga o mano cambiada. En los años más difíciles, esta finca diversa fue la que permitió a las familias quedarse sin pasar hambre. Comer de lo propio es la base de la autonomía de Mumbú.",
        tags: ["#PlantasDeAzotea", "#Pancoger", "#Minga", "#SoberaníaAlimentaria"],
        galeria: [
          { etiqueta: "Memoria", pie: "La azotea en una canoa vieja, como la de la abuela", alt: "Huerta de hierbas sembrada en una canoa elevada", src: "", arte: 6 },
          { etiqueta: "Siembra", pie: "Minga de siembra entre vecinos", alt: "Vecinos sembrando juntos en la finca", src: "", arte: 7 },
          { etiqueta: "Territorio vivo", pie: "Tapao de pescado con chillangua en la mesa", alt: "Plato de pescado guisado con hierbas", src: "", arte: 8 }
        ],
        pregunta: "¿Qué planta de la cocina de su casa le recuerda a alguien que quiere?"
      },
      {
        n: 4,
        corto: "La Batea",
        titulo: "La Batea que no Envenena",
        tagline: "El oro que se saca sin matar el río.",
        lugar: "Playa de mazamorreo, orilla del San Juan",
        narrador: "Relato de Doña Etelvina",
        rol: "Minera tradicional de batea · nombre de ejemplo",
        audio: "audio/estacion-04.mp3",
        transcripcion: [
          "Esta batea era de mi abuela. Con ella se lava la arena del río, dando vueltas, hasta que queda la jagua, la arena negra. Ahí, si el río quiere, brilla el oro.",
          "Nosotros no usamos mercurio. La batea no tumba el monte ni mata el río. Por eso todavía hay pescado.",
          "Hoy le contamos esto para que se sepa, no para que nos tengan lástima. Aquí seguimos."
        ],
        ficha: "El mazamorreo es la minería con batea de madera, oficio heredado desde tiempos de la esclavitud. Se lava arena del río con movimientos circulares hasta separar la jagua, la arena negra donde quedan las chispas de oro. A diferencia de dragas y retroexcavadoras, la batea no usa mercurio, no tumba el bosque y deja el río vivo para la pesca y la finca. Defender la batea es defender el agua y el derecho a decidir cómo se trabaja el territorio. Con el río crecido, esta parada se hace en la orilla, con arena traída.",
        tags: ["#MineríaDeBatea", "#SinMercurio", "#RíoVivo"],
        galeria: [
          { etiqueta: "Memoria", pie: "Mineras con batea en la quebrada", alt: "Mujeres lavando arena con bateas de madera", src: "", arte: 9 },
          { etiqueta: "Siembra", pie: "El río limpio también riega la finca", alt: "Orilla del río con cultivos", src: "", arte: 10 },
          { etiqueta: "Territorio vivo", pie: "Chispas de oro en la jagua, sin químicos", alt: "Batea con arena negra y puntos dorados", src: "", arte: 11 }
        ],
        pregunta: "¿Qué cambiaría si cada gramo de oro se midiera también por el agua que deja limpia?"
      }
    ]
  };

  /* ---------------------------------------------------------------
     2. ART — ilustraciones SVG livianas (~1 KB c/u) usadas como
     reemplazo hasta tener fotos reales. Tres motivos: río, hojas, batea.
     --------------------------------------------------------------- */
  const ART = (() => {
    const pal = ["#8C4830", "#1B3B2B", "#D4A346"];
    const motivos = [
      // Río y orilla
      (a, b) => `<path d="M0 78 Q25 66 45 78 T90 72 V120 H0Z" fill="#6f8f86" opacity=".5"/>
        <path d="M0 92 Q30 82 50 92 T90 88" stroke="#F8F6F0" stroke-width="2" fill="none" opacity=".7"/>
        <path d="M10 76 L16 42 L22 76Z" fill="${a}"/><path d="M62 72 l6-34 6 34z" fill="${b}"/>
        <circle cx="70" cy="22" r="8" fill="#D4A346" opacity=".85"/>`,
      // Hojas / azotea
      (a) => `<rect x="10" y="80" width="70" height="12" rx="3" fill="${a}" opacity=".85"/>
        <path d="M45 80C30 60 30 40 45 24C60 40 60 60 45 80Z" fill="#1B3B2B"/>
        <path d="M27 80C13 66 15 52 23 46C33 56 33 68 27 80Z" fill="#2a5240"/>
        <path d="M63 80C77 66 75 52 67 46C57 56 57 68 63 80Z" fill="#2a5240"/>
        <rect x="18" y="92" width="4" height="22" fill="#8C4830"/><rect x="68" y="92" width="4" height="22" fill="#8C4830"/>`,
      // Batea / vasija
      (a, b) => `<ellipse cx="45" cy="68" rx="34" ry="14" fill="${a}"/>
        <ellipse cx="45" cy="64" rx="26" ry="8" fill="#efebe1"/>
        <circle cx="40" cy="64" r="2" fill="#D4A346"/><circle cx="50" cy="63" r="1.5" fill="#D4A346"/><circle cx="46" cy="66" r="1.2" fill="#D4A346"/>
        <path d="M0 100 Q45 88 90 100 V120 H0Z" fill="${b}" opacity=".3"/>`
    ];
    return (k, alt) => {
      const a = pal[k % 3], b = pal[(k + 1) % 3];
      return `<svg class="gallery__img" viewBox="0 0 90 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(alt)} (foto pendiente)">
        <rect width="90" height="120" fill="#efebe1"/>${motivos[k % 3](a, b)}
        <text x="45" y="113" text-anchor="middle" font-size="6.5" fill="#5a5f58" font-family="sans-serif">foto pendiente</text></svg>`;
    };
  })();

  /* Utilidades */
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, "0");
  const fmt = s => (!isFinite(s) || s < 0) ? "--:--" : `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

  /* ---------------------------------------------------------------
     3. ROUTER — ?estacion=N (1..4). Navega con history.pushState
     para no recargar (clave con mala señal).
     --------------------------------------------------------------- */
  const ROUTER = {
    actual() {
      const n = parseInt(new URLSearchParams(location.search).get("estacion"), 10);
      return DATA.estaciones.find(e => e.n === n) || DATA.estaciones[0];
    },
    ir(n, push = true) {
      const url = new URL(location.href);
      url.searchParams.set("estacion", n);
      if (push) history.pushState({ n }, "", url);
      VIEW.pintar(ROUTER.actual());
      window.scrollTo(0, 0);
      $("main").focus({ preventScroll: true });
    }
  };

  /* ---------------------------------------------------------------
     4. VIEW — pinta la estación activa
     --------------------------------------------------------------- */
  const VIEW = {
    tabs() {
      $("tabs").innerHTML = DATA.estaciones.map(e => {
        return `<li><a href="?estacion=${e.n}" data-n="${e.n}"><b>${pad(e.n)}</b>${esc(e.corto)}</a></li>`;
      }).join("");
      $("tabs").addEventListener("click", ev => {
        const a = ev.target.closest("a[data-n]");
        if (!a) return;
        ev.preventDefault();
        ROUTER.ir(+a.dataset.n);
      });
    },

    pintar(e) {
      const total = DATA.estaciones.length;
      document.title = `Estación ${pad(e.n)}: ${e.titulo} · Memorias Vivas`;
      $("st-kicker").textContent = `Estación ${pad(e.n)} de ${pad(total)}`;
      $("st-title").textContent = e.titulo;
      $("st-tagline").textContent = e.tagline;
      $("st-place").textContent = e.lugar;

      $("narrator").textContent = e.narrador;
      $("narrator-role").textContent = e.rol;
      $("transcript").innerHTML = e.transcripcion.map(p => `<p>${esc(p)}</p>`).join("");

      $("ficha").textContent = e.ficha;
      $("tags").innerHTML = e.tags.map(t => `<li>${esc(t)}</li>`).join("");

      $("gallery").innerHTML = e.galeria.map(g => `
        <figure>
          ${g.src
            ? `<img class="gallery__img" src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async" width="300" height="400">`
            : ART(g.arte, g.alt)}
          <figcaption><b>${esc(g.etiqueta)}</b>${esc(g.pie)}</figcaption>
        </figure>`).join("");

      $("question").textContent = e.pregunta;

      document.querySelectorAll("#tabs a").forEach(a => {
        if (+a.dataset.n === e.n) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });

      PLAYER.cargar(e.audio);
    }
  };

  /* ---------------------------------------------------------------
     5. PLAYER — audio con controles propios y accesibles
     --------------------------------------------------------------- */
  const PLAYER = (() => {
    const audio = $("audio"), btn = $("btn-play"), seek = $("seek");
    const cur = $("t-cur"), dur = $("t-dur"), note = $("audio-note");
    let arrastrando = false;

    function estado(sonando) {
      btn.setAttribute("aria-pressed", String(sonando));
      btn.setAttribute("aria-label", sonando ? "Pausar relato" : "Reproducir relato");
    }
    function progreso() {
      const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      if (!arrastrando) seek.value = p;
      seek.style.setProperty("--p", p + "%");
      cur.textContent = fmt(audio.currentTime);
    }
    function aviso(txt) { note.textContent = txt; note.hidden = !txt; }

    btn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play().catch(() => aviso("No se pudo reproducir el audio. Lea la transcripción mientras tanto."));
      } else audio.pause();
    });
    audio.addEventListener("play", () => estado(true));
    audio.addEventListener("pause", () => estado(false));
    audio.addEventListener("ended", () => { estado(false); audio.currentTime = 0; });
    audio.addEventListener("timeupdate", progreso);
    audio.addEventListener("loadedmetadata", () => { dur.textContent = fmt(audio.duration); aviso(""); });
    audio.addEventListener("error", () => {
      estado(false);
      aviso(navigator.onLine
        ? "Este relato todavía no se ha grabado en Mumbú. Puede leer la transcripción abajo."
        : "Sin señal y este audio no está guardado. Lea la transcripción o pida al guía la versión local.");
      const t = document.querySelector(".transcript"); if (t) t.open = true;
    });

    seek.addEventListener("input", () => { arrastrando = true; seek.style.setProperty("--p", seek.value + "%"); });
    seek.addEventListener("change", () => {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
      arrastrando = false;
    });

    // Atajo de teclado: barra espaciadora en el botón ya funciona; flechas mueven 10 s
    seek.addEventListener("keydown", ev => {
      if (!audio.duration) return;
      if (ev.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      if (ev.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 10);
    });

    return {
      cargar(src) {
        audio.pause();
        audio.src = src;          // preload="none": no gasta datos hasta pulsar Play
        seek.value = 0; seek.style.setProperty("--p", "0%");
        cur.textContent = "0:00"; dur.textContent = "--:--";
        estado(false); aviso("");
      }
    };
  })();

  /* ---------------------------------------------------------------
     6. NET — estado de conexión, Service Worker y audios offline
     --------------------------------------------------------------- */
  const NET = (() => {
    const bar = $("status"), txt = $("status-text");
    // Se considera "local" si se sirve desde la red del territorio (IP privada o .local)
    const esLocal = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|\.local$/.test(location.hostname);

    function pintar() {
      if (!navigator.onLine) {
        bar.dataset.state = "offline"; txt.textContent = "Sin señal · Modo Local · Territorio Mumbú";
      } else if (esLocal) {
        bar.dataset.state = "offline"; txt.textContent = "Modo Local · Territorio Mumbú";
      } else {
        bar.dataset.state = "online"; txt.textContent = "En línea · Territorio Mumbú";
      }
    }
    addEventListener("online", pintar);
    addEventListener("offline", pintar);
    pintar();

    // Registro del Service Worker (requiere HTTPS o localhost)
    if ("serviceWorker" in navigator && isSecureContext) {
      addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js").catch(err => console.warn("[SW] registro falló", err));
      });
    }

    // Botón: descarga y guarda los 4 audios en caché para el recorrido
    const btn = $("btn-offline"), msg = $("offline-msg");
    if (!("caches" in window) || !isSecureContext) {
      btn.hidden = true;
    } else {
      btn.addEventListener("click", async () => {
        btn.disabled = true; msg.textContent = "Guardando relatos…";
        const cache = await caches.open("mv-audio-v1");
        let ok = 0;
        for (const e of DATA.estaciones) {
          try {
            const r = await fetch(e.audio, { cache: "no-store" });
            if (r.ok) { await cache.put(e.audio, r); ok++; }
          } catch (_) { /* sin red o archivo inexistente */ }
        }
        msg.textContent = ok === DATA.estaciones.length
          ? "Listo: los 4 relatos quedaron guardados en este teléfono."
          : `Se guardaron ${ok} de ${DATA.estaciones.length} relatos. Los demás aún no están grabados o no hay señal.`;
        btn.disabled = false;
      });
    }
  })();

  /* ---------------------------------------------------------------
     7. SHOP — drawer de compra comunitaria directa
     --------------------------------------------------------------- */
  const SHOP = (() => {
    const d = $("drawer"), a = DATA.asociacion;
    $("lot").innerHTML = a.lote.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
    $("offer").innerHTML = a.oferta.map(o => `<li><strong>${esc(o.t)}</strong><em>${esc(o.p)}</em><span>${esc(o.d)}</span></li>`).join("");
    $("contact-num").textContent = a.telefono;

    $("btn-support").addEventListener("click", () => {
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    });
    // Cerrar tocando el fondo
    d.addEventListener("click", ev => { if (ev.target === d) d.close(); });

    $("btn-copy").addEventListener("click", () => {
      const out = $("copy-msg");
      const seleccionar = () => {
        const r = document.createRange(); r.selectNodeContents($("contact-num"));
        const s = getSelection(); s.removeAllRanges(); s.addRange(r);
        out.textContent = "Número seleccionado. Cópielo desde el menú del teléfono.";
      };
      if (navigator.clipboard) navigator.clipboard.writeText(a.telefono).then(() => out.textContent = "Número copiado.", seleccionar);
      else seleccionar();
    });
  })();

  /* ---------------------------------------------------------------
     Arranque
     --------------------------------------------------------------- */
  VIEW.tabs();
  ROUTER.ir(ROUTER.actual().n, false);
  addEventListener("popstate", () => VIEW.pintar(ROUTER.actual()));
})();
