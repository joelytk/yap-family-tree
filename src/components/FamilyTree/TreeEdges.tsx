import type { Edge } from '@/types/family';

import { LEVEL_H, NODE_H, NODE_W } from '@/utils/treeLayout';

const MID_VERT_RATIO = 0.5; // how far down between parent bottom and child top the horizontal bus sits

export function TreeEdges({
	edges,
	isDark
}: {
	edges: Edge[];
	/** grouped by parentId so we can draw the horizontal bus line */
	positions: Map<number, { id: number; x: number; y: number }>;
	isDark: boolean;
}) {
	const strokeColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.55)';
	const strokeW = 1.5;

	// Group edges by parent to draw sibling bus lines
	const byParent = new Map<number, Edge[]>();
	for (const e of edges) {
		const arr = byParent.get(e.parentId) ?? [];
		arr.push(e);
		byParent.set(e.parentId, arr);
	}

	const paths: JSX.Element[] = [];

	for (const group of byParent.values()) {
		const first = group[0];
		const parentBottomY = first.parentY + NODE_H / 2;
		const childTopY = first.childY;
		const midY = parentBottomY + (childTopY - parentBottomY) * MID_VERT_RATIO;

		// Vertical from parent couple centre down to bus
		paths.push(
			<line
				key={`pv-${first.parentId}`}
				x1={first.coupleX}
				y1={parentBottomY}
				x2={first.coupleX}
				y2={midY}
				stroke={strokeColor}
				strokeWidth={strokeW}
			/>
		);

		if (group.length > 1) {
			const minX = Math.min(...group.map(e => e.childX));
			const maxX = Math.max(...group.map(e => e.childX));

			// Horizontal bus spanning all siblings
			paths.push(
				<line
					key={`bus-${first.parentId}`}
					x1={minX}
					y1={midY}
					x2={maxX}
					y2={midY}
					stroke={strokeColor}
					strokeWidth={strokeW}
				/>
			);
		}

		// Vertical drop from bus to each child
		for (const e of group) {
			paths.push(
				<line
					key={`cv-${e.parentId}-${e.childId}`}
					x1={e.childX}
					y1={midY}
					x2={e.childX}
					y2={e.childY}
					stroke={strokeColor}
					strokeWidth={strokeW}
				/>
			);
		}
	}

	// Partner connector lines (horizontal line between couples)
	// These are passed separately – we derive them from position pairs that are
	// at the same y and separated by PARTNER_GAP + NODE_W
	// (handled in FamilyTree by passing partnerEdges)

	return <>{paths}</>;
}

interface PartnerLineProps {
	x1: number;
	x2: number;
	y: number;
	isDark: boolean;
}

export function PartnerLine({ x1, x2, y, isDark }: PartnerLineProps) {
	const midY = y + NODE_H / 2;
	const strokeColor = isDark ? 'rgba(148,163,184,0.45)' : 'rgba(100,116,139,0.55)';
	return <line x1={x1 + NODE_W} y1={midY} x2={x2} y2={midY} stroke={strokeColor} strokeWidth={1.5} />;
}

// Calculate the canvas size needed to contain all edges + nodes
export function calcSvgDimensions(totalWidth: number, totalHeight: number): { width: number; height: number } {
	return {
		width: totalWidth + NODE_W + LEVEL_H,
		height: totalHeight + NODE_H + LEVEL_H
	};
}
