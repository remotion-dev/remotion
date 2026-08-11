const getComputedOverflowY = (el: HTMLElement): string => {
	return getComputedStyle(el).overflowY;
};

const findVerticalScrollParent = (
	element: HTMLElement | null,
): HTMLElement | null => {
	let cur = element?.parentElement ?? null;
	while (cur) {
		const overflowY = getComputedOverflowY(cur);
		if (
			overflowY === 'auto' ||
			overflowY === 'scroll' ||
			overflowY === 'overlay'
		) {
			return cur;
		}

		cur = cur.parentElement;
	}

	return null;
};

const isVerticallyFullyVisibleInSidebarList = (
	element: HTMLElement,
): boolean => {
	const scrollParent = findVerticalScrollParent(element);
	const rect = element.getBoundingClientRect();

	if (!scrollParent) {
		return rect.top >= 0 && rect.bottom <= window.innerHeight;
	}

	const parentRect = scrollParent.getBoundingClientRect();
	return rect.top >= parentRect.top && rect.bottom <= parentRect.bottom;
};

export const scrollSidebarRowIntoViewIfNeeded = (
	element: HTMLElement | null,
): void => {
	if (!element) {
		return;
	}

	if (isVerticallyFullyVisibleInSidebarList(element)) {
		return;
	}

	element.scrollIntoView({block: 'nearest', behavior: 'auto'});
};

let skipCompositionScrollIntoViewForId: string | null = null;

export const markCompositionSidebarScrollFromRowClick = (
	compositionId: string,
): void => {
	skipCompositionScrollIntoViewForId = compositionId;
};

const shouldSkipCompositionScrollIntoView = (
	compositionId: string,
): boolean => {
	if (skipCompositionScrollIntoViewForId === compositionId) {
		skipCompositionScrollIntoViewForId = null;
		return true;
	}

	return false;
};

export const maybeScrollCompositionSidebarRowIntoView = ({
	element,
	compositionId,
	selected,
}: {
	element: HTMLElement | null;
	compositionId: string;
	selected: boolean;
}): void => {
	if (!selected) {
		return;
	}

	if (shouldSkipCompositionScrollIntoView(compositionId)) {
		return;
	}

	scrollSidebarRowIntoViewIfNeeded(element);
};

let skipAssetScrollIntoViewForPath: string | null = null;

export const markAssetSidebarScrollFromRowClick = (assetPath: string): void => {
	skipAssetScrollIntoViewForPath = assetPath;
};

const shouldSkipAssetScrollIntoView = (assetPath: string): boolean => {
	if (skipAssetScrollIntoViewForPath === assetPath) {
		skipAssetScrollIntoViewForPath = null;
		return true;
	}

	return false;
};

export const maybeScrollAssetSidebarRowIntoView = ({
	element,
	assetPath,
	selected,
}: {
	element: HTMLElement | null;
	assetPath: string;
	selected: boolean;
}): void => {
	if (!selected) {
		return;
	}

	if (shouldSkipAssetScrollIntoView(assetPath)) {
		return;
	}

	scrollSidebarRowIntoViewIfNeeded(element);
};
