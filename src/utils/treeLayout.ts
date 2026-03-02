import type { Edge, FamilyMember, LayoutNode } from '@/types/family';

export const NODE_W = 120;
export const NODE_H = 156;
export const PARTNER_GAP = 40;
export const SIBLING_GAP = 80;
export const LEVEL_H = 280;

interface LayoutResult {
	positions: Map<number, LayoutNode>;
	edges: Edge[];
	totalWidth: number;
	totalHeight: number;
}

export function computeLayout(data: FamilyMember[]): LayoutResult {
	const nodeMap = new Map<number, FamilyMember>(data.map(n => [n.id, n]));

	// ── Determine which IDs are "primary" (appear as fid of any child) ──
	const primaryIds = new Set<number>();
	for (const n of data) {
		if (n.fid != null) primaryIds.add(n.fid);
	}

	// ── Find root(s): primary with no fid ──
	const roots = data.filter(n => primaryIds.has(n.id) && n.fid == null);

	const positions = new Map<number, LayoutNode>();
	const edges: Edge[] = [];

	// ── Helpers ──
	const getChildren = (id: number) => data.filter(n => n.fid === id);

	const getSpouse = (n: FamilyMember): FamilyMember | null => {
		const spouseId = n.pids?.[0];
		if (spouseId == null) return null;
		return nodeMap.get(spouseId) ?? null;
	};

	// Memoised subtree width
	const widthCache = new Map<number, number>();
	function subtreeWidth(primaryId: number): number {
		if (widthCache.has(primaryId)) return widthCache.get(primaryId)!;

		const n = nodeMap.get(primaryId)!;
		const spouse = getSpouse(n);
		const children = getChildren(primaryId);

		const coupleW = NODE_W + (spouse ? PARTNER_GAP + NODE_W : 0);

		if (children.length === 0) {
			widthCache.set(primaryId, coupleW);
			return coupleW;
		}

		const childW = children.reduce((sum, c) => sum + subtreeWidth(c.id), 0) + (children.length - 1) * SIBLING_GAP;

		const w = Math.max(coupleW, childW);
		widthCache.set(primaryId, w);
		return w;
	}

	// Recursive layout
	function layoutNode(primaryId: number, startX: number, y: number) {
		const n = nodeMap.get(primaryId)!;
		const spouse = getSpouse(n);
		const children = getChildren(primaryId);

		const sw = subtreeWidth(primaryId);
		const coupleW = NODE_W + (spouse ? PARTNER_GAP + NODE_W : 0);
		const coupleLeft = startX + (sw - coupleW) / 2;

		// Position primary node
		positions.set(primaryId, { id: primaryId, x: coupleLeft, y });

		// Position spouse
		if (spouse) {
			positions.set(spouse.id, {
				id: spouse.id,
				x: coupleLeft + NODE_W + PARTNER_GAP,
				y
			});
		}

		if (children.length === 0) return;

		const childrenTotalW =
			children.reduce((sum, c) => sum + subtreeWidth(c.id), 0) + (children.length - 1) * SIBLING_GAP;

		let cx = startX + (sw - childrenTotalW) / 2;
		const coupleCenter = coupleLeft + coupleW / 2;

		for (const child of children) {
			const childSw = subtreeWidth(child.id);
			const childCoupleW = NODE_W + (getSpouse(child) ? PARTNER_GAP + NODE_W : 0);
			// centre of child couple within their subtree column
			const childCoupleLeft = cx + (childSw - childCoupleW) / 2;
			// drop line targets the centre of the primary child node (not couple midpoint)
			const childNodeCenter = childCoupleLeft + NODE_W / 2;

			edges.push({
				parentId: primaryId,
				childId: child.id,
				coupleX: coupleCenter,
				parentY: y,
				childY: y + LEVEL_H,
				childX: childNodeCenter
			});

			layoutNode(child.id, cx, y + LEVEL_H);
			cx += childSw + SIBLING_GAP;
		}
	}

	// If multiple roots exist (unlikely), lay them out side by side
	let rootX = 0;
	for (const root of roots) {
		layoutNode(root.id, rootX, 0);
		rootX += subtreeWidth(root.id) + SIBLING_GAP;
	}

	// Normalise so min x/y is 0
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const p of positions.values()) {
		minX = Math.min(minX, p.x);
		minY = Math.min(minY, p.y);
		maxX = Math.max(maxX, p.x + NODE_W);
		maxY = Math.max(maxY, p.y + NODE_H);
	}

	const offsetX = -minX;
	const offsetY = -minY;
	for (const p of positions.values()) {
		p.x += offsetX;
		p.y += offsetY;
	}
	for (const e of edges) {
		e.coupleX += offsetX;
		e.childX += offsetX;
		e.parentY += offsetY;
		e.childY += offsetY;
	}

	return {
		positions,
		edges,
		totalWidth: maxX - minX,
		totalHeight: maxY - minY
	};
}
