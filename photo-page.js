import { atlasStops } from "./photo-data.js";

const globeRoot = document.querySelector("[data-real-globe]");
const globeStatus = document.querySelector("[data-globe-status]");
const logRoot = document.querySelector("[data-atlas-log]");
const metricsRoot = document.querySelector("[data-atlas-metrics]");

const satelliteTextureUrl =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const bumpTextureUrl =
  "https://unpkg.com/three-globe/example/img/earth-topology.png";

const state = {
  activeStopId: atlasStops[0]?.id ?? null,
  lightboxStopId: null,
  lightboxIndex: 0,
};

/* ── Lightbox (built with safe DOM methods) ── */
const lightboxEl = document.createElement("div");
lightboxEl.className = "photo-lightbox";

const lbCloseBtn = document.createElement("button");
lbCloseBtn.className = "lightbox-close";
lbCloseBtn.setAttribute("aria-label", "Close");
lbCloseBtn.textContent = "\u00D7";
lightboxEl.appendChild(lbCloseBtn);

const lbPrevBtn = document.createElement("button");
lbPrevBtn.className = "lightbox-nav lightbox-prev";
lbPrevBtn.setAttribute("aria-label", "Previous");
lbPrevBtn.textContent = "\u2039";
lightboxEl.appendChild(lbPrevBtn);

const lbContent = document.createElement("div");
lbContent.className = "lightbox-content";

const lbImg = document.createElement("img");
lbImg.className = "lightbox-img";
lbContent.appendChild(lbImg);

const lbVideo = document.createElement("video");
lbVideo.className = "lightbox-img";
lbVideo.controls = true;
lbVideo.style.display = "none";
lbContent.appendChild(lbVideo);

const lbCaption = document.createElement("p");
lbCaption.className = "lightbox-caption";
lbContent.appendChild(lbCaption);

const lbCounter = document.createElement("p");
lbCounter.className = "lightbox-counter";
lbContent.appendChild(lbCounter);

lightboxEl.appendChild(lbContent);

const lbNextBtn = document.createElement("button");
lbNextBtn.className = "lightbox-nav lightbox-next";
lbNextBtn.setAttribute("aria-label", "Next");
lbNextBtn.textContent = "\u203A";
lightboxEl.appendChild(lbNextBtn);

document.body.appendChild(lightboxEl);

function openLightbox(stopId, photoIndex = 0) {
  const stop = atlasStops.find((s) => s.id === stopId);
  if (!stop?.photos?.length) return;
  state.lightboxStopId = stopId;
  state.lightboxIndex = photoIndex;
  showLightboxPhoto();
  lightboxEl.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightboxEl.classList.remove("is-open");
  document.body.style.overflow = "";
  state.lightboxStopId = null;
  lbVideo.pause();
  lbVideo.removeAttribute("src");
}

function isVideoFile(src) {
  return /\.(mp4|webm|ogg|mov)$/i.test(src);
}

function showLightboxPhoto() {
  const stop = atlasStops.find((s) => s.id === state.lightboxStopId);
  if (!stop?.photos?.length) return;
  const idx = state.lightboxIndex;
  const photo = stop.photos[idx];
  const url = encodeURI(photo.src);

  if (isVideoFile(photo.src)) {
    lbImg.style.display = "none";
    lbVideo.style.display = "";
    lbVideo.src = url;
    lbVideo.load();
  } else {
    lbVideo.style.display = "none";
    lbVideo.pause();
    lbVideo.removeAttribute("src");
    lbImg.style.display = "";
    lbImg.src = url;
    lbImg.alt = photo.alt || getDisplayTitle(stop);
  }

  lbCaption.textContent = photo.caption || getDisplayTitle(stop);
  lbCounter.textContent = `${idx + 1} / ${stop.photos.length}`;
}

function lightboxPrev() {
  const stop = atlasStops.find((s) => s.id === state.lightboxStopId);
  if (!stop?.photos?.length) return;
  state.lightboxIndex = (state.lightboxIndex - 1 + stop.photos.length) % stop.photos.length;
  showLightboxPhoto();
}

function lightboxNext() {
  const stop = atlasStops.find((s) => s.id === state.lightboxStopId);
  if (!stop?.photos?.length) return;
  state.lightboxIndex = (state.lightboxIndex + 1) % stop.photos.length;
  showLightboxPhoto();
}

lbCloseBtn.addEventListener("click", closeLightbox);
lbPrevBtn.addEventListener("click", lightboxPrev);
lbNextBtn.addEventListener("click", lightboxNext);
lightboxEl.addEventListener("click", (e) => {
  if (e.target === lightboxEl) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (!state.lightboxStopId) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lightboxPrev();
  if (e.key === "ArrowRight") lightboxNext();
});

let globe = null;
let globeResizeObserver = null;

if (logRoot && metricsRoot) {
  if (atlasStops.length === 0) {
    renderEmptyState();
  } else {
    renderMetrics();
    renderLog();
    initSatelliteGlobe();
  }
}

logRoot?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stop-id]");
  if (!button) {
    return;
  }

  activateStop(button.dataset.stopId || "");
});

function initSatelliteGlobe() {
  if (!globeRoot) {
    return;
  }

  const GlobeFactory = window.Globe;
  if (typeof GlobeFactory !== "function") {
    if (globeStatus) {
      globeStatus.textContent = "Satellite globe unavailable. Check your network.";
    }
    return;
  }

  globe = new GlobeFactory(globeRoot, {
    waitForGlobeReady: true,
    animateIn: true,
  })
    .backgroundColor("rgba(0, 0, 0, 0)")
    .globeImageUrl(satelliteTextureUrl)
    .bumpImageUrl(bumpTextureUrl)
    .showAtmosphere(true)
    .atmosphereColor("#7fb9ff")
    .atmosphereAltitude(0.16)
    .pointLat("lat")
    .pointLng("lon")
    .pointColor((stop) =>
      stop.id === state.activeStopId ? "#ff8a80" : "#d93025"
    )
    .pointAltitude((stop) =>
      stop.id === state.activeStopId ? 0.02 : 0.012
    )
    .pointRadius((stop) =>
      stop.id === state.activeStopId ? 0.2 : 0.13
    )
    .pointResolution(36)
    .pointsMerge(false)
    .ringsData(atlasStops)
    .ringLat("lat")
    .ringLng("lon")
    .ringColor((stop) =>
      stop.id === state.activeStopId
        ? (t) => `rgba(217, 48, 37, ${Math.max(0, 0.78 - t * 0.82)})`
        : (t) => `rgba(244, 67, 54, ${Math.max(0, 0.34 - t * 0.38)})`
    )
    .ringMaxRadius((stop) =>
      stop.id === state.activeStopId ? 5.6 : 3.8
    )
    .ringPropagationSpeed((stop) =>
      stop.id === state.activeStopId ? 1.1 : 0.82
    )
    .ringRepeatPeriod((stop) =>
      stop.id === state.activeStopId ? 820 : 1180
    )
    .pointLabel(
      (stop) => `
        <div class="globe-tooltip-card">
          <strong>${escapeHtml(getDisplayTitle(stop))}</strong>
          <span>${escapeHtml(getDisplayLocation(stop))}</span>
          <span>${escapeHtml(stop.when)}</span>
        </div>
      `
    )
    .onPointClick((stop) => activateStop(stop.id))
    .onGlobeReady(() => {
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.35;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 160;
        controls.maxDistance = 380;
      }

      resizeGlobe();
      syncGlobeSelection(false);
      renderGlobeStatus();
    });

  if ("ResizeObserver" in window) {
    globeResizeObserver = new ResizeObserver(() => resizeGlobe());
    globeResizeObserver.observe(globeRoot);
  } else {
    window.addEventListener("resize", resizeGlobe);
  }
}

function resizeGlobe() {
  if (!globe || !globeRoot) {
    return;
  }

  globe.width(globeRoot.clientWidth).height(globeRoot.clientHeight);
}

function syncGlobeSelection(animate = true) {
  if (!globe) {
    return;
  }

  globe.pointsData([...atlasStops]);
  globe.ringsData([...atlasStops]);

  const stop = getActiveStop();
  if (!stop) {
    return;
  }

  const view = { lat: stop.lat, lng: stop.lon, altitude: 1.8 };
  if (animate) {
    globe.pointOfView(view, 1200);
  } else {
    globe.pointOfView(view);
  }
}

function renderEmptyState() {
  logRoot.innerHTML = `
    <div class="atlas-empty">
      <p class="block-kicker">Empty Atlas</p>
      <p>Add a city, country, coordinates, and a photos array in photo-data.js.</p>
    </div>
  `;

  metricsRoot.innerHTML = "";
}

function renderGlobeStatus() {
  if (!globeStatus) {
    return;
  }

  const stop = getActiveStop();
  if (!stop) {
    globeStatus.textContent = "Satellite globe. Drag to orbit, click a hotspot.";
    return;
  }

  globeStatus.textContent = `${getDisplayTitle(
    stop
  )} · Drag to orbit · Click a hotspot`;
}

function renderMetrics() {
  const regionCount = new Set(atlasStops.map((stop) => stop.region)).size;
  const photoCount = atlasStops.reduce(
    (total, stop) => total + (stop.photos?.length || 0),
    0
  );

  metricsRoot.innerHTML = `
    <div class="atlas-metric">
      <span class="atlas-metric-value">${atlasStops.length}</span>
      <span class="atlas-metric-label">stops</span>
    </div>
    <div class="atlas-metric">
      <span class="atlas-metric-value">${regionCount}</span>
      <span class="atlas-metric-label">regions</span>
    </div>
    <div class="atlas-metric">
      <span class="atlas-metric-value">${photoCount}</span>
      <span class="atlas-metric-label">images</span>
    </div>
  `;
}

function renderLog() {
  const activeStop = getActiveStop();
  logRoot.innerHTML = atlasStops
    .map((stop, index) => {
      const photo = stop.photos?.[0] || { src: "", caption: "" };
      const isActive = activeStop?.id === stop.id ? " is-active" : "";
      const preview = photo.src
        ? `<img src="${escapeHtml(getAssetUrl(photo.src))}" alt="${escapeHtml(
            photo.alt || getDisplayTitle(stop)
          )}" loading="lazy" />`
        : `<span>${String(index + 1).padStart(2, "0")}</span>`;

      return `
        <button class="atlas-stop-card${isActive}" type="button" data-stop-id="${escapeHtml(
          stop.id
        )}">
          <div class="atlas-stop-media" style="background: ${buildGradient(
            stop.palette,
            index
          )};">
            ${preview}
          </div>
          <p class="atlas-stop-kicker">${escapeHtml(stop.region)}</p>
          <h3>${escapeHtml(getDisplayTitle(stop))}</h3>
          <p class="atlas-stop-meta">${escapeHtml(getDisplayLocation(stop))}</p>
          <p class="atlas-stop-meta">${escapeHtml(stop.when)}</p>
          <p class="atlas-stop-copy">${escapeHtml(buildSummary(stop))}</p>
        </button>
      `;
    })
    .join("");
}

function activateStop(stopId) {
  if (!stopId) {
    return;
  }

  const stop = atlasStops.find((item) => item.id === stopId);
  if (!stop) {
    return;
  }

  state.activeStopId = stop.id;
  renderLog();
  renderGlobeStatus();
  syncGlobeSelection(true);
  openLightbox(stop.id);
}

function getActiveStop() {
  return atlasStops.find((stop) => stop.id === state.activeStopId) || atlasStops[0];
}

function buildSummary(stop) {
  const count = stop.photos?.length || 0;
  const noun = count === 1 ? "photo" : "photos";
  const city = stop.city || stop.title || "this location";
  return `${count} ${noun} from ${city} in ${stop.when}.`;
}

function getDisplayTitle(stop) {
  return stop.title || stop.city || "Untitled stop";
}

function getDisplayLocation(stop) {
  if (stop.location) {
    return stop.location;
  }

  return [stop.city, stop.country].filter(Boolean).join(", ");
}

function getAssetUrl(path) {
  return encodeURI(path);
}

function buildGradient(palette = [], shift = 0) {
  const colors = palette.length >= 3 ? palette : ["#f3e2cd", "#c2794b", "#4d3a35"];
  const ordered = colors
    .slice(shift % colors.length)
    .concat(colors.slice(0, shift % colors.length));
  return `linear-gradient(145deg, ${ordered[0]} 0%, ${ordered[1]} 48%, ${ordered[2]} 100%)`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
