type CleanupAfterChildrenFn = {
	element: Node;
	cleanupFn: () => void;
};

export const createTreeWalkerCleanupAfterChildren = (
	treeWalker: TreeWalker,
) => {
	const cleanupAfterChildren: CleanupAfterChildrenFn[] = [];

	const checkCleanUpAtBeginningOfIteration = () => {
		for (let i = 0; i < cleanupAfterChildren.length; ) {
			const cleanup = cleanupAfterChildren[i];
			if (
				!(
					cleanup.element === treeWalker.currentNode ||
					cleanup.element.contains(treeWalker.currentNode)
				)
			) {
				cleanup.cleanupFn();
				cleanupAfterChildren.splice(i, 1);
			} else {
				i++;
			}
		}
	};

	const addCleanup = (element: Node, cleanupFn: () => void) => {
		// Last registered must be cleaned up first

		cleanupAfterChildren.unshift({
			element,
			cleanupFn,
		});
	};

	const cleanupInTheEndOfTheIteration = () => {
		for (const cleanup of cleanupAfterChildren) {
			cleanup.cleanupFn();
		}
	};

	return {
		checkCleanUpAtBeginningOfIteration,
		addCleanup,
		cleanupInTheEndOfTheIteration,
	};
};
