"use client";

import { useEffect, useRef, useCallback } from "react";
import type { AtlasStop } from "@/data/photo-data";

interface GlobeProps {
  stops: AtlasStop[];
  activeStopId: string | null;
  onStopClick: (id: string) => void;
}

export default function Globe({ stops, activeStopId, onStopClick }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);

  const syncSelection = useCallback(
    (animate = true) => {
      const globe = globeRef.current;
      if (!globe) return;

      globe.pointsData([...stops]);
      globe.ringsData([...stops]);

      const stop = stops.find((s) => s.id === activeStopId) ?? stops[0];
      if (!stop) return;

      const view = { lat: stop.lat, lng: stop.lon, altitude: 1.8 };
      if (animate) {
        globe.pointOfView(view, 1200);
      } else {
        globe.pointOfView(view);
      }
    },
    [stops, activeStopId]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    import("globe.gl").then((mod) => {
      if (!mounted || !containerRef.current) return;

      const GlobeFactory = mod.default;
      const globe = new GlobeFactory(containerRef.current, {
        waitForGlobeReady: true,
        animateIn: true,
      })
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl(
          "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        )
        .bumpImageUrl(
          "https://unpkg.com/three-globe/example/img/earth-topology.png"
        )
        .showAtmosphere(true)
        .atmosphereColor("#7fb9ff")
        .atmosphereAltitude(0.16)
        .pointLat("lat")
        .pointLng("lon")
        .pointColor((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? "#ff8a80" : "#d93025";
        })
        .pointAltitude((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? 0.02 : 0.012;
        })
        .pointRadius((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? 0.2 : 0.13;
        })
        .pointResolution(36)
        .pointsMerge(false)
        .ringsData(stops)
        .ringLat("lat")
        .ringLng("lon")
        .ringColor((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId
            ? (t: number) =>
                `rgba(217,48,37,${Math.max(0, 0.78 - t * 0.82)})`
            : (t: number) =>
                `rgba(244,67,54,${Math.max(0, 0.34 - t * 0.38)})`;
        })
        .ringMaxRadius((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? 5.6 : 3.8;
        })
        .ringPropagationSpeed((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? 1.1 : 0.82;
        })
        .ringRepeatPeriod((d: object) => {
          const s = d as AtlasStop;
          return s.id === activeStopId ? 820 : 1180;
        })
        .pointLabel(
          (d: object) => {
            const s = d as AtlasStop;
            return `
              <div style="padding:10px 12px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;color:rgba(248,244,238,0.96);background:rgba(10,12,16,0.92);box-shadow:0 18px 30px rgba(0,0,0,0.2)">
                <strong style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;line-height:0.92;display:block">${s.title}</strong>
                <span style="color:rgba(222,216,208,0.76);font-size:12px;display:block;margin-top:4px">${s.location}</span>
                <span style="color:rgba(222,216,208,0.76);font-size:12px;display:block">${s.when}</span>
              </div>
            `;
          }
        )
        .onPointClick((d: object) => {
          const s = d as AtlasStop;
          onStopClick(s.id);
        })
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

          resize();

          globe.pointsData([...stops]);
          const stop = stops.find((s) => s.id === activeStopId) ?? stops[0];
          if (stop) {
            globe.pointOfView({ lat: stop.lat, lng: stop.lon, altitude: 1.8 });
          }
        });

      globeRef.current = globe;

      function resize() {
        if (!containerRef.current || !globe) return;
        globe
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }

      const observer = new ResizeObserver(resize);
      observer.observe(containerRef.current);

      return () => observer.disconnect();
    });

    return () => {
      mounted = false;
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selection when activeStopId changes
  useEffect(() => {
    syncSelection(true);
  }, [syncSelection]);

  return (
    <div className="relative rounded-[36px] border border-white/20 overflow-hidden" style={{
      minHeight: "clamp(560px, 74vh, 860px)",
      background: "radial-gradient(circle at 50% 42%, rgba(40,48,62,0.78), transparent 34%), radial-gradient(circle at 20% 18%, rgba(89,112,140,0.22), transparent 18%), linear-gradient(180deg, rgba(18,22,29,0.98), rgba(8,10,14,0.98))",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04), 0 26px 60px rgba(32,20,11,0.2)",
    }}>
      <div ref={containerRef} className="w-full" style={{ minHeight: "clamp(520px, 68vh, 800px)" }} />
      <p className="absolute left-7 bottom-6 m-0 px-3 py-2 border border-white/8 rounded-full text-white/90 font-mono text-[10px] tracking-[0.08em] uppercase bg-black/40 backdrop-blur-md">
        {stops.find((s) => s.id === activeStopId)?.title ?? "Globe"} &middot; Drag to orbit
      </p>
    </div>
  );
}
