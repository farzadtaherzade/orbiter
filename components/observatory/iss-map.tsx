"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useIssPosition, useIssTrack } from "@/hooks/use-iss";
import { ageOf, type DataState } from "@/hooks/use-live-data";
import { StatusBadge, Panel, SourceChip } from "@/components/ui";
import { subsolarPoint } from "@/lib/astronomy";

const MAP_W = 1024;
const MAP_H = 512;
const MAP_SRC = "/textures/earth_day_4k.jpg";

/**
 * Equirectangular ISS ground track with real day/night shading.
 * The heavy layer (map + terminator + track) renders to an offscreen canvas
 * only when data changes; the rAF loop just composites + pulses the marker.
 */
export function IssMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const mapImgRef = useRef<HTMLImageElement | null>(null);
  const iss = useIssPosition();
  const track = useIssTrack();

  const issLive = iss.state !== "sample" && iss.state !== "loading";
  const trackLive = track.state !== "sample" && track.state !== "loading";

  const toXY = (lat: number, lon: number): [number, number] => [
    ((lon + 180) / 360) * MAP_W,
    ((90 - lat) / 180) * MAP_H,
  ];

  /* rebuild static layer when data or map image is ready */
  const [mapReady, setMapReady] = useState(0);
  const staticVersion = useMemo(
    () => `${issLive ? iss.data.timestamp : 0}:${trackLive ? track.data.length : 0}:${mapReady}`,
    [issLive, iss.data.timestamp, trackLive, track.data, mapReady]
  );

  useEffect(() => {
    const img = new Image();
    img.src = MAP_SRC;
    img.onload = () => {
      mapImgRef.current = img;
      setMapReady((v) => v + 1);
    };
     
  }, []);

  const renderStatic = () => {
    let off = offscreenRef.current;
    if (!off) {
      off = document.createElement("canvas");
      off.width = MAP_W;
      off.height = MAP_H;
      offscreenRef.current = off;
    }
    const ctx = off.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, MAP_W, MAP_H);

    // base map, dimmed
    const img = mapImgRef.current;
    if (img) {
      ctx.globalAlpha = 0.5;
      ctx.drawImage(img, 0, 0, MAP_W, MAP_H);
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = "#0a1226";
      ctx.fillRect(0, 0, MAP_W, MAP_H);
    }

    // day/night terminator
    const sun = subsolarPoint(new Date());
    const dec = (sun.lat * Math.PI) / 180;
    ctx.fillStyle = "rgba(2, 6, 18, 0.72)";
    for (let px = 0; px < MAP_W; px++) {
      const lon = (px / MAP_W) * 360 - 180;
      const H = ((lon - sun.lon) * Math.PI) / 180;
      // terminator latitude for this meridian
      const latTerm = Math.atan(-Math.cos(H) / Math.tan(dec || 1e-6));
      const py = ((90 - (latTerm * 180) / Math.PI) / 180) * MAP_H;
      const sunAboveNorth = dec > 0;
      // night fills from the terminator poleward to the dark pole
      ctx.beginPath();
      if (sunAboveNorth) {
        ctx.rect(px, py, 1, MAP_H - py); // south of terminator is dark
      } else {
        ctx.rect(px, 0, 1, py); // north of terminator is dark
      }
      ctx.fill();
    }

    // graticule
    ctx.strokeStyle = "rgba(103, 232, 249, 0.07)";
    ctx.lineWidth = 1;
    for (let lon = -150; lon <= 150; lon += 30) {
      const [x] = toXY(0, lon);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_H);
      ctx.stroke();
    }
    for (const lat of [-60, -30, 0, 30, 60]) {
      const [, y] = toXY(lat, 0);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_W, y);
      ctx.stroke();
    }
    // equator emphasis
    ctx.strokeStyle = "rgba(103, 232, 249, 0.14)";
    const [ey] = toXY(0, 0);
    ctx.beginPath();
    ctx.moveTo(0, ey);
    ctx.lineTo(MAP_W, ey);
    ctx.stroke();

    // predicted ground track
    if (trackLive && track.data.length > 1) {
      ctx.strokeStyle = "rgba(252, 61, 33, 0.65)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      let prev: [number, number] | null = null;
      for (const p of track.data) {
        const [x, y] = toXY(p.lat, p.lon);
        if (prev && Math.abs(x - prev[0]) > MAP_W / 2) {
          ctx.moveTo(x, y); // dateline wrap
        } else if (prev) {
          ctx.lineTo(x, y);
        } else {
          ctx.moveTo(x, y);
        }
        prev = [x, y];
      }
      ctx.stroke();
    }

    staticVersionRef.current++;
  };

  const staticVersionRef = useRef(0);

  useEffect(() => {
    renderStatic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticVersion]);

  /* animation loop: composite + pulse */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (t: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // fit offscreen map into canvas (cover width)
      const scale = rect.width / MAP_W;
      const h = MAP_H * scale;
      ctx.drawImage(offscreenRef.current!, 0, (rect.height - h) / 2, rect.width, h);

      // ISS marker
      if (issLive) {
        const [x, y] = toXY(iss.data.lat, iss.data.lon);
        const yy = y * scale + (rect.height - h) / 2;
        const xx = x * scale;
        const pulse = ((t / 1600) % 1);
        ctx.beginPath();
        ctx.arc(xx, yy, 4 + pulse * 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(252, 61, 33, ${0.6 * (1 - pulse)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xx, yy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#fc3d21";
        ctx.fill();
        ctx.font = "10px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "rgba(233, 241, 255, 0.9)";
        ctx.fillText("ISS", xx + 10, yy + 3);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
     
  }, [issLive, iss.data.lat, iss.data.lon]);

  return (
    <Panel corners className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-edge px-5 py-3">
        <h3 className="font-display text-lg font-semibold text-star">ISS ground track</h3>
        <StatusBadge state={iss.state as DataState} age={ageOf(iss.fetchedAt)} />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ aspectRatio: "2 / 1" }}
          aria-label="World map showing the live position of the International Space Station and its predicted orbit"
          role="img"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-edge px-5 py-3">
        <div className="flex gap-5">
          <span className="mono-label flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-worm" /> ISS (live position)
          </span>
          <span className="mono-label flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-worm/70" /> next ~95 min
          </span>
          <span className="mono-label flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 bg-void/70" /> night side
          </span>
        </div>
        <SourceChip source="wheretheiss.at" href="https://wheretheiss.at/w/developer" />
      </div>
    </Panel>
  );
}
