export interface FamilyMember {
	id: number;
	name: string;
	img: string;
	gender: 'm' | 'f';
	pids?: number[];
	fid?: number;
	mid?: number;
}

export interface LayoutNode {
	id: number;
	x: number;
	y: number;
}

export interface Edge {
	/** id of the parent (tree node, not spouse) */
	parentId: number;
	childId: number;
	/** x centre of the couple connector line */
	coupleX: number;
	/** y of the parent row */
	parentY: number;
	/** y of the child row */
	childY: number;
	/** x centre of the child node */
	childX: number;
}
