import { useEffect, useMemo } from 'react';

import { ZoomControls } from '@/components/ZoomControls';
import { FamilyNode } from './FamilyNode';
import { calcSvgDimensions, PartnerLine, TreeEdges } from './TreeEdges';

import { usePanZoom } from '@/hooks/usePanZoom';

import type { FamilyMember } from '@/types/family';

import { computeLayout, NODE_W, PARTNER_GAP } from '@/utils/treeLayout';

interface Props {
	data: FamilyMember[];
	isDark: boolean;
}

export function FamilyTree({ data, isDark }: Props) {
	const { positions, edges, totalWidth, totalHeight } = useMemo(() => computeLayout(data), [data]);

	const { containerRef, transform, onPointerDown, onPointerMove, onPointerUp, zoomIn, zoomOut, fitToScreen } =
		usePanZoom(0.6);

	// Auto-fit on first load
	useEffect(() => {
		const { width, height } = calcSvgDimensions(totalWidth, totalHeight);
		fitToScreen(width, height);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalWidth, totalHeight]);

	const { width: svgW, height: svgH } = calcSvgDimensions(totalWidth, totalHeight);
	const PADDING = 60;

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
				if (Math.abs(myPos.y - spousePos.y) > 1) continue; // only same row

				// Validate they are actually adjacent (separated by PARTNER_GAP)
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
		<div className="relative w-full h-full overflow-hidden">
			{/* Pan/zoom container */}
			<div
				ref={containerRef}
				className="w-full h-full cursor-grab active:cursor-grabbing"
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
			>
				{/* Transformed canvas */}
				<div
					style={{
						transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
						transformOrigin: '0 0',
						width: svgW + PADDING * 2,
						height: svgH + PADDING * 2,
						position: 'relative'
					}}
				>
					{/* SVG edge layer */}
					<svg width={svgW + PADDING * 2} height={svgH + PADDING * 2} className="absolute inset-0 pointer-events-none">
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

			{/* Zoom controls – bottom right */}
			<ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFit={() => fitToScreen(svgW, svgH)} />
		</div>
	);
}
