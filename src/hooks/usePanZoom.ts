import { PointerEvent, useCallback, useEffect, useRef, useState } from 'react';

export interface PanZoomState {
	x: number;
	y: number;
	scale: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 1.2;
const ZOOM_FACTOR = 0.12;

export function usePanZoom(initialScale = 1) {
	const [transform, setTransform] = useState<PanZoomState>({
		x: 0,
		y: 0,
		scale: initialScale
	});

	const containerRef = useRef<HTMLDivElement>(null);
	const isPanning = useRef(false);

	// Multi-pointer tracking (enables pinch-to-zoom on touch)
	const activePtrs = useRef(new Map<number, { x: number; y: number }>());
	const prevPinchDist = useRef(-1);

	// ── Wheel zoom (zoom towards cursor) ──
	const onWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();
		const container = containerRef.current;
		if (!container) return;

		const rect = container.getBoundingClientRect();
		const cx = e.clientX - rect.left;
		const cy = e.clientY - rect.top;

		setTransform(prev => {
			const delta = e.deltaY < 0 ? 1 + ZOOM_FACTOR : 1 - ZOOM_FACTOR;
			const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.scale * delta));
			const r = newScale / prev.scale;
			return { scale: newScale, x: cx - r * (cx - prev.x), y: cy - r * (cy - prev.y) };
		});
	}, []);

	// ── Pointer events – handle both mouse (left-click drag) and touch (pan + pinch) ──
	const onPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		activePtrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		if (activePtrs.current.size === 1) isPanning.current = true;
	}, []);

	const onPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
		if (!activePtrs.current.has(e.pointerId)) return;

		const prev = activePtrs.current.get(e.pointerId)!;
		activePtrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

		if (activePtrs.current.size === 2) {
			// ── Pinch-to-zoom ──
			const [p1, p2] = [...activePtrs.current.values()];
			const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
			const midX = (p1.x + p2.x) / 2;
			const midY = (p1.y + p2.y) / 2;

			if (prevPinchDist.current > 0) {
				const ratio = dist / prevPinchDist.current;
				const container = containerRef.current;
				if (container) {
					const rect = container.getBoundingClientRect();
					const cx = midX - rect.left;
					const cy = midY - rect.top;
					setTransform(t => {
						const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * ratio));
						const r = newScale / t.scale;
						return { scale: newScale, x: cx - r * (cx - t.x), y: cy - r * (cy - t.y) };
					});
				}
			}
			prevPinchDist.current = dist;
		} else if (activePtrs.current.size === 1 && isPanning.current) {
			// ── Single-pointer pan ──
			const dx = e.clientX - prev.x;
			const dy = e.clientY - prev.y;
			setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
		}
	}, []);

	const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
		activePtrs.current.delete(e.pointerId);
		if (activePtrs.current.size < 2) prevPinchDist.current = -1;
		if (activePtrs.current.size === 0) isPanning.current = false;
	}, []);

	// ── Button controls ──
	const zoomIn = useCallback(() => {
		setTransform(prev => ({
			...prev,
			scale: Math.min(MAX_SCALE, prev.scale * (1 + ZOOM_FACTOR * 2))
		}));
	}, []);

	const zoomOut = useCallback(() => {
		setTransform(prev => ({
			...prev,
			scale: Math.max(MIN_SCALE, prev.scale * (1 - ZOOM_FACTOR * 2))
		}));
	}, []);

	/** Fit the entire canvas into the viewport. */
	const fitToScreen = useCallback((contentW: number, contentH: number) => {
		const container = containerRef.current;
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		const PADDING = 60;
		const scale = Math.min((width - PADDING * 2) / contentW, (height - PADDING * 2) / contentH, 1);
		setTransform({ scale, x: (width - contentW * scale) / 2, y: (height - contentH * scale) / 2 });
	}, []);

	/**
	 * Place the first generation at `nodeTopPx` from the viewport top, then
	 * scale so that `contentH` canvas-pixels (the generational content, without
	 * the canvas padding) fills the remaining viewport height.
	 *
	 * @param canvasW        - total canvas width (px)
	 * @param contentH       - height of the visible generations excluding canvas padding
	 * @param canvasPadding  - the PADDING offset used before the first node in the canvas
	 * @param nodeTopPx      - desired viewport-y for the top of the first generation (px)
	 */
	const focusTop = useCallback((canvasW: number, contentH: number, canvasPadding: number, nodeTopPx: number) => {
		const container = containerRef.current;
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		const scale = Math.min(Math.max((height - nodeTopPx) / contentH, MIN_SCALE), MAX_SCALE);
		setTransform({
			scale,
			x: (width - canvasW * scale) / 2,
			y: nodeTopPx - canvasPadding * scale
		});
	}, []);

	/** Pan so that canvas point (cx, cy) is centred in the viewport. */
	const panTo = useCallback((cx: number, cy: number) => {
		const container = containerRef.current;
		if (!container) return;
		const { width, height } = container.getBoundingClientRect();
		setTransform(prev => ({
			...prev,
			x: width / 2 - cx * prev.scale,
			y: height / 2 - cy * prev.scale
		}));
	}, []);

	// ── Passive=false wheel listener (needed to call preventDefault) ──
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	}, [onWheel]);

	return {
		containerRef,
		transform,
		setTransform,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		zoomIn,
		zoomOut,
		fitToScreen,
		focusTop,
		panTo
	};
}
