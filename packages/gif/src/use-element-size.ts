import {useCallback, useEffect, useMemo, useState} from 'react';

export type Size = {
	width: number;
	height: number;
};

type ElementSizeForceUpdate = () => void;

let elementSizeHooks: ElementSizeForceUpdate[] = [];

export const updateAllElementsSizes = () => {
	for (const listener of elementSizeHooks) {
		listener();
	}
};

export const useElementSize = (
	ref: React.RefObject<HTMLElement | null>,
): Size | null => {
	const [size, setSize] = useState<Size | null>(null);
	const observer = useMemo(() => {
		if (typeof ResizeObserver === 'undefined') {
			return null;
		}

		return new ResizeObserver((entries) => {
			// The contentRect returns the width without any `scale()`'s being applied. The height is wrong
			const {contentRect} = entries[0];
			// The clientRect returns the size with `scale()` being applied.
			const newSize = entries[0].target.getClientRects();

			if (!newSize?.[0]) {
				setSize(null);
				return;
			}

			const probableCssParentScale = newSize[0].width / contentRect.width;

			const width = newSize[0].width * (1 / probableCssParentScale);
			const height = newSize[0].height * (1 / probableCssParentScale);

			setSize({
				width,
				height,
			});
		});
	}, []);

	const updateSize = useCallback(() => {
		if (!ref.current) {
			return;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
			setSize(null);
			return;
		}

		setSize({
			width: rect[0].width as number,
			height: rect[0].height as number,
		});
	}, [ref]);

	useEffect(() => {
		if (!observer) {
			return;
		}

		updateSize();
		const {current} = ref;
		if (ref.current) {
			observer.observe(ref.current);
		}

		return (): void => {
			if (current) {
				observer.unobserve(current);
			}
		};
	}, [observer, ref, updateSize]);

	useEffect(() => {
		elementSizeHooks.push(updateSize);

		return () => {
			elementSizeHooks = elementSizeHooks.filter((e) => e !== updateSize);
		};
	}, [updateSize]);

	return size;
};
