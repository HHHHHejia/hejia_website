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
};

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
          <p class="atlas-stop-meta">${escapeHtml(getDisplayLocation(stop))}<span class="focus-separator"></span>${escapeHtml(
            stop.when
          )}</p>
          <p class="atlas-stop-copy">${escapeHtml(stop.summary)}</p>
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
}

function getActiveStop() {
  return atlasStops.find((stop) => stop.id === state.activeStopId) || atlasStops[0];
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
