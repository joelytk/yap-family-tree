import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface PanZoomState {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.15;
const MAX_SCALE = 3;
const ZOOM_FACTOR = 0.12;

export function usePanZoom(initialScale = 1) {
  const [transform, setTransform] = useState<PanZoomState>({
    x: 0,
    y: 0,
    scale: initialScale
  });

  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Wheel zoom (zoom towards cursor) ──
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setTransform((prev: PanZoomState) => {
      const delta = e.deltaY < 0 ? 1 + ZOOM_FACTOR : 1 - ZOOM_FACTOR;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, prev.scale * delta)
      );
      const ratio = newScale / prev.scale;

      return {
        scale: newScale,
        x: mouseX - ratio * (mouseX - prev.x),
        y: mouseY - ratio * (mouseY - prev.y)
      };
    });
  }, []);

  // ── Pointer pan ──
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTransform((prev: PanZoomState) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Button controls ──
  const zoomIn = useCallback(() => {
    setTransform((prev: PanZoomState) => ({
      ...prev,
      scale: Math.min(MAX_SCALE, prev.scale * (1 + ZOOM_FACTOR * 2))
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform((prev: PanZoomState) => ({
      ...prev,
      scale: Math.max(MIN_SCALE, prev.scale * (1 - ZOOM_FACTOR * 2))
    }));
  }, []);

  const fitToScreen = useCallback((contentW: number, contentH: number) => {
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const PADDING = 60;
    const scaleX = (width - PADDING * 2) / contentW;
    const scaleY = (height - PADDING * 2) / contentH;
    const scale = Math.min(Math.min(scaleX, scaleY), 1);
    const x = (width - contentW * scale) / 2;
    const y = (height - contentH * scale) / 2;
    setTransform({ x, y, scale });
  }, []);

  // ── Passive=false wheel listener ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return {
    containerRef,
    transform,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    zoomIn,
    zoomOut,
    fitToScreen
  };
}
