import {createsStackingContext} from './drawing/isolation';

export function skipToNextNonDescendant(
	treeWalker: TreeWalker,
	nextSibling: (() => Node | null) | null = null,
): boolean {
	const advanceSibling = nextSibling ?? (() => treeWalker.nextSibling());
	// Try to go to next sibling
	if (advanceSibling()) {
		return true;
	}

	// No sibling, go up to parent and try to find ancestor's sibling
	while (treeWalker.parentNode()) {
		if (advanceSibling()) {
			return true;
		}
	}

	// No more nodes
	return false;
}

export const createPaintOrderTraversal = ({
	treeWalker,
	rootElement,
	acceptNode,
	onlyBackgroundClipText,
}: {
	treeWalker: TreeWalker;
	rootElement: HTMLElement | SVGElement;
	acceptNode: (node: Node) => number;
	onlyBackgroundClipText: boolean;
}) => {
	const orderedChildren = new WeakMap<Node, Node[] | null>();
	const getChildren = (parent: Node): Node[] | null => {
		if (orderedChildren.has(parent)) return orderedChildren.get(parent)!;
		orderedChildren.set(parent, null);
		if (
			onlyBackgroundClipText ||
			!(parent instanceof HTMLElement || parent instanceof SVGElement)
		)
			return null;
		if (parent !== rootElement && !createsStackingContext(parent)) return null;
		const style = getComputedStyle(parent);
		if (style.transformStyle === 'preserve-3d' || style.perspective !== 'none')
			return null;
		const children = Array.from(parent.childNodes).filter(
			(node) => acceptNode(node) === NodeFilter.FILTER_ACCEPT,
		);
		const elements = children.filter(
			(node): node is HTMLElement | SVGElement =>
				node instanceof HTMLElement || node instanceof SVGElement,
		);
		// Each sibling must be atomic in this context. A non-context wrapper may
		// contain positioned descendants belonging to an ancestor's paint phases.
		if (
			elements.length !== children.length ||
			!elements.every(createsStackingContext)
		)
			return null;
		const flexOrGrid =
			style.display.includes('flex') || style.display.includes('grid');
		const levels = new Map(
			elements.map((child) => {
				const childStyle = getComputedStyle(child);
				const level =
					childStyle.zIndex === 'auto' ||
					(childStyle.position === 'static' && !flexOrGrid)
						? 0
						: Number(childStyle.zIndex);
				return [child, {level, order: Number(childStyle.order)}] as const;
			}),
		);
		const sorted = elements.sort((a, b) => {
			const first = levels.get(a)!;
			const second = levels.get(b)!;
			return (
				first.level - second.level ||
				(flexOrGrid ? first.order - second.order : 0)
			);
		});
		orderedChildren.set(parent, sorted);
		return sorted;
	};

	const nextSibling = (): Node | null => {
		if (treeWalker.currentNode === rootElement) return null;
		const parent = treeWalker.currentNode.parentNode!;
		const children = getChildren(parent);
		if (children === null) return treeWalker.nextSibling();
		const index = children.indexOf(treeWalker.currentNode);
		if (index === children.length - 1) return null;
		treeWalker.currentNode = children[index + 1];
		return treeWalker.currentNode;
	};

	const skipChildren = (): boolean =>
		skipToNextNonDescendant(treeWalker, nextSibling);
	return {
		skipChildren,
		nextNode: (): boolean => {
			const parent = treeWalker.currentNode;
			if (treeWalker.firstChild()) {
				const children = getChildren(parent);
				if (children !== null) treeWalker.currentNode = children[0];
				return true;
			}

			return skipChildren();
		},
	};
};
