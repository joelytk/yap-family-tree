import { useEffect, useMemo, useState } from 'react';

import { Minimap } from '@/components/Minimap';
import { ZoomControls } from '@/components/ZoomControls';
import { FamilyNode } from './FamilyNode';
import { calcSvgDimensions, PartnerLine, TreeEdges } from './TreeEdges';

import { usePanZoom } from '@/hooks/usePanZoom';

import type { FamilyMember } from '@/types/family';

import { computeLayout, LEVEL_H, NODE_H, NODE_W, PARTNER_GAP } from '@/utils/treeLayout';

/** Number of full generation levels visible in the initial/fit view. */
const INITIAL_VISIBLE_LEVELS = 4;

/**
 * Viewport-y where the first generation (great-grandparents) appears.
 * Accounts for the title bar height (~48 px) + 32 px gap.
 */
const NODE_TOP_PX = 32;

export const FamilyTree = ({ data, isDark }: { data: FamilyMember[]; isDark: boolean }) => {
	const { positions, edges, totalWidth, totalHeight } = useMemo(() => computeLayout(data), [data]);

	const { containerRef, transform, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, focusTop, panTo } =
		usePanZoom(0.6);

	const { width: svgW, height: svgH } = calcSvgDimensions(totalWidth, totalHeight);
	const PADDING = 60;
	const canvasW = svgW + PADDING * 2;
	const canvasH = svgH + PADDING * 2;

	/** Height of the generational content (no canvas padding). */
	const visibleContentH = (INITIAL_VISIBLE_LEVELS - 1) * LEVEL_H + NODE_H + 40;

	const doFocusTop = () => focusTop(canvasW, visibleContentH, PADDING, NODE_TOP_PX);

	// Track viewport dimensions for the minimap
	const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight });
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const obs = new ResizeObserver(entries => {
			const { width, height } = entries[0].contentRect;
			setViewport({ w: width, h: height });
		});
		obs.observe(el);
		setViewport({ w: el.clientWidth, h: el.clientHeight });
		return () => obs.disconnect();
	}, [containerRef]);

	// Initial focus on load
	useEffect(() => {
		doFocusTop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasW, canvasH]);

	// Build partner connector pairs: two nodes at same y separated by PARTNER_GAP
	const partnerEdges = useMemo(() => {
		const positionalMap = new Map<number, { x: number; y: number }>();
		for (const [id, pos] of positions) {
			positionalMap.set(id, pos);
		}

		const seen = new Set<string>();
		const lines: Array<{ x1: number; x2: number; y: number }> = [];

		for (const member of data) {
			if (!member.pids?.length) continue;
			const myPos = positionalMap.get(member.id);
			if (!myPos) continue;

			for (const pid of member.pids) {
				const key = [Math.min(member.id, pid), Math.max(member.id, pid)].join('-');
				if (seen.has(key)) continue;
				seen.add(key);

				const spousePos = positionalMap.get(pid);
				if (!spousePos) continue;
				if (Math.abs(myPos.y - spousePos.y) > 1) continue;

				const gap = Math.abs(myPos.x - spousePos.x) - NODE_W;
				if (gap < 0 || gap > PARTNER_GAP + 4) continue;

				const leftX = Math.min(myPos.x, spousePos.x);
				const rightX = Math.max(myPos.x, spousePos.x);
				lines.push({ x1: leftX, x2: rightX, y: myPos.y });
			}
		}

		return lines;
	}, [data, positions]);

	return (
		<main className="relative flex-1 w-full h-full overflow-hidden">
			{/* Pan/zoom container – touch-action:none prevents iOS native scroll */}
			<div
				ref={containerRef}
				className="w-full h-full cursor-grab active:cursor-grabbing"
				style={{ touchAction: 'none' }}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
			>
				{/* Transformed canvas */}
				<div
					style={{
						transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
						transformOrigin: '0 0',
						width: canvasW,
						height: canvasH,
						position: 'relative'
					}}
				>
					{/* SVG edge layer */}
					<svg width={canvasW} height={canvasH} className="absolute inset-0 pointer-events-none">
						<g transform={`translate(${PADDING}, ${PADDING})`}>
							<TreeEdges edges={edges} positions={positions} isDark={isDark} />
							{partnerEdges.map((pe: { x1: number; x2: number; y: number }, i: number) => (
								<PartnerLine key={i} x1={pe.x1} x2={pe.x2} y={pe.y} isDark={isDark} />
							))}
						</g>
					</svg>

					{/* Node layer */}
					<div className="absolute" style={{ left: PADDING, top: PADDING, width: svgW, height: svgH }}>
						{data.map(member => {
							const pos = positions.get(member.id);
							if (!pos) return null;
							return <FamilyNode key={member.id} member={member} x={pos.x} y={pos.y} />;
						})}
					</div>
				</div>
			</div>

			{/* Minimap – bottom left */}
			<Minimap
				canvasW={canvasW}
				canvasH={canvasH}
				padding={PADDING}
				positions={positions}
				members={data}
				transform={transform}
				viewportW={viewport.w}
				viewportH={viewport.h}
				isDark={isDark}
				onPanTo={panTo}
			/>

			{/* Zoom controls – bottom right */}
			<ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFit={doFocusTop} />
		</main>
	);
};
