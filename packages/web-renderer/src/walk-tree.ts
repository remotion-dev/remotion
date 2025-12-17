export function skipToNextNonDescendant(treeWalker: TreeWalker): boolean {
	// Try to go to next sibling
	if (treeWalker.nextSibling()) {
		return true;
	}

	// No sibling, go up to parent and try to find ancestor's sibling
	while (treeWalker.parentNode()) {
		if (treeWalker.nextSibling()) {
			return true;
		}
	}

	// No more nodes
	return false;
}
