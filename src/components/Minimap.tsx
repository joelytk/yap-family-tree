import { useCallback } from 'react';

import type { PanZoomState } from '@/hooks/usePanZoom';
import type { FamilyMember, LayoutNode } from '@/types/family';
import { NODE_H, NODE_W } from '@/utils/treeLayout';

const MAX_W = 180;
const MAX_H = 120;

export function Minimap({
	canvasW,
	canvasH,
	padding,
	positions,
	members,
	transform,
	viewportW,
	viewportH,
	isDark,
	onPanTo
}: {
	/** Total SVG canvas width (including padding). */
	canvasW: number;
	/** Total SVG canvas height (including padding). */
	canvasH: number;
	/** Padding offset used in FamilyTree – nodes are drawn at (padding + pos.x, padding + pos.y). */
	padding: number;
	positions: Map<number, LayoutNode>;
	members: FamilyMember[];
	transform: PanZoomState;
	viewportW: number;
	viewportH: number;
	isDark: boolean;
	/** Called with canvas-space centre coords when user clicks the minimap. */
	onPanTo: (cx: number, cy: number) => void;
}) {
	// Fit canvas inside MAX_W × MAX_H preserving aspect ratio
	const aspect = canvasH / canvasW;
	let mmW = MAX_W;
	let mmH = mmW * aspect;
	if (mmH > MAX_H) {
		mmH = MAX_H;
		mmW = mmH / aspect;
	}

	const scaleX = mmW / canvasW;
	const scaleY = mmH / canvasH;

	// Visible canvas rect (in canvas pixels)
	const visLeft = -transform.x / transform.scale;
	const visTop = -transform.y / transform.scale;
	const visRight = (viewportW - transform.x) / transform.scale;
	const visBottom = (viewportH - transform.y) / transform.scale;

	// Viewport rectangle in minimap pixels
	const vx = visLeft * scaleX;
	const vy = visTop * scaleY;
	const vw = (visRight - visLeft) * scaleX;
	const vh = (visBottom - visTop) * scaleY;

	// Gender lookup
	const genderMap = new Map(members.map(m => [m.id, m.gender]));

	const handleClick = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;
			// Convert minimap coords → canvas coords
			onPanTo(mx / scaleX, my / scaleY);
		},
		[scaleX, scaleY, onPanTo]
	);

	const bg = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(248,250,252,0.9)';
	const border = isDark ? 'rgba(148,163,184,0.2)' : 'rgba(100,116,139,0.2)';

	return (
		<div
			className="absolute bottom-4 left-4 z-20 rounded-xl overflow-hidden"
			style={{
				width: mmW,
				height: mmH,
				background: bg,
				border: `1px solid ${border}`,
				backdropFilter: 'blur(8px)',
				boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
			}}
		>
			<svg width={mmW} height={mmH} style={{ display: 'block', cursor: 'crosshair' }} onClick={handleClick}>
				{/* Node dots */}
				{[...positions.entries()].map(([id, pos]) => {
					const isMale = genderMap.get(id) === 'm';
					const nx = (padding + pos.x) * scaleX;
					const ny = (padding + pos.y) * scaleY;
					const nw = NODE_W * scaleX;
					const nh = NODE_H * scaleY;
					return (
						<rect
							key={id}
							x={nx}
							y={ny}
							width={Math.max(nw, 1.5)}
							height={Math.max(nh, 1.5)}
							rx={nw * 0.15}
							fill={
								isMale
									? isDark
										? 'rgba(56,189,248,0.5)'
										: 'rgba(14,165,233,0.4)'
									: isDark
										? 'rgba(244,114,182,0.5)'
										: 'rgba(236,72,153,0.4)'
							}
						/>
					);
				})}

				{/* Viewport rectangle */}
				<rect
					x={vx}
					y={vy}
					width={Math.max(vw, 4)}
					height={Math.max(vh, 4)}
					fill={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
					stroke={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'}
					strokeWidth={1}
					rx={2}
				/>
			</svg>
		</div>
	);
}
