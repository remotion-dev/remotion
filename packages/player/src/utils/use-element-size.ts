import {useCallback, useEffect, useMemo, useState} from 'react';

export type Size = {
	width: number;
	height: number;
	left: number;
	top: number;
	windowSize: {
		width: number;
		height: number;
	};
	refresh: () => void;
};

// If a pane has been moved, it will cause a layout shift without
// the window having been resized. Those UI elements can call this API to
// force an update

type ElementSizeForceUpdate = () => void;

let elementSizeHooks: ElementSizeForceUpdate[] = [];

export const updateAllElementsSizes = () => {
	for (const listener of elementSizeHooks) {
		listener();
	}
};

export const useElementSize = (
	ref: React.RefObject<HTMLElement | null>,
	options: {
		triggerOnWindowResize: boolean;
		shouldApplyCssTransforms: boolean;
	},
): Size | null => {
	const [size, setSize] = useState<Omit<Size, 'refresh'> | null>(() => {
		if (!ref.current) {
			return null;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
			return null;
		}

		return {
			width: rect[0].width as number,
			height: rect[0].height as number,
			left: rect[0].x as number,
			top: rect[0].y as number,
			windowSize: {
				height: window.innerHeight,
				width: window.innerWidth,
			},
		};
	});

	const observer = useMemo(() => {
		if (typeof ResizeObserver === 'undefined') {
			return null;
		}

		return new ResizeObserver((entries) => {
			// The contentRect returns the width without any `scale()`'s being applied. The height is wrong
			const {contentRect, target} = entries[0];
			// The clientRect returns the size with `scale()` being applied.
			const newSize = target.getClientRects();

			if (!newSize?.[0]) {
				setSize(null);
				return;
			}

			const probableCssParentScale =
				contentRect.width === 0 ? 1 : newSize[0].width / contentRect.width;

			const width = options.shouldApplyCssTransforms
				? newSize[0].width
				: newSize[0].width * (1 / probableCssParentScale);
			const height = options.shouldApplyCssTransforms
				? newSize[0].height
				: newSize[0].height * (1 / probableCssParentScale);

			setSize({
				width,
				height,
				left: newSize[0].x,
				top: newSize[0].y,
				windowSize: {
					height: window.innerHeight,
					width: window.innerWidth,
				},
			});
		});
	}, [options.shouldApplyCssTransforms]);

	const updateSize = useCallback(() => {
		if (!ref.current) {
			return;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
			setSize(null);
			return;
		}

		setSize((prevState) => {
			const isSame =
				prevState &&
				prevState.width === rect[0].width &&
				prevState.height === rect[0].height &&
				prevState.left === rect[0].x &&
				prevState.top === rect[0].y &&
				prevState.windowSize.height === window.innerHeight &&
				prevState.windowSize.width === window.innerWidth;
			if (isSame) {
				return prevState;
			}

			return {
				width: rect[0].width as number,
				height: rect[0].height as number,
				left: rect[0].x as number,
				top: rect[0].y as number,
				windowSize: {
					height: window.innerHeight,
					width: window.innerWidth,
				},
			};
		});
	}, [ref]);

	useEffect(() => {
		if (!observer) {
			return;
		}

		const {current} = ref;
		if (current) {
			observer.observe(current);
		}

		return (): void => {
			if (current) {
				observer.unobserve(current);
			}
		};
	}, [observer, ref, updateSize]);

	useEffect(() => {
		if (!options.triggerOnWindowResize) {
			return;
		}

		window.addEventListener('resize', updateSize);

		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [options.triggerOnWindowResize, updateSize]);

	useEffect(() => {
		elementSizeHooks.push(updateSize);

		return () => {
			elementSizeHooks = elementSizeHooks.filter((e) => e !== updateSize);
		};
	}, [updateSize]);

	return useMemo(() => {
		if (!size) {
			return null;
		}

		return {...size, refresh: updateSize};
	}, [size, updateSize]);
};
