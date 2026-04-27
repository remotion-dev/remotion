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

// `el.offsetWidth` / `el.offsetHeight` is the element's CSS layout box —
// the pre-transform width and height the browser allocates during layout.
// Reading those is robust against ALL ancestor CSS transforms (uniform 2D
// scale, asymmetric 2D scale, 3D rotation, perspective, matrix3d) which
// `getClientRects()` cannot recover from with a single scalar.
//
// `getClientRects()[0]` is still used for the (x, y) corner since
// `offsetLeft` / `offsetTop` are relative to the offset parent (not the
// viewport), and consumers like the controls layer want viewport coords.
//
// Callers that explicitly want the post-transform AABB pass
// `shouldApplyCssTransforms: true` (used by `PlayerSeekBar` to track the
// transformed scrubber). For those, we keep the current `getClientRects()`
// behaviour for both axes.
const measureElement = (
	el: HTMLElement,
	shouldApplyCssTransforms: boolean,
): {width: number; height: number; left: number; top: number} | null => {
	const rect = el.getClientRects();
	if (!rect[0]) {
		return null;
	}

	if (shouldApplyCssTransforms) {
		return {
			width: rect[0].width,
			height: rect[0].height,
			left: rect[0].x,
			top: rect[0].y,
		};
	}

	return {
		width: el.offsetWidth || rect[0].width,
		height: el.offsetHeight || rect[0].height,
		left: rect[0].x,
		top: rect[0].y,
	};
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

		const measured = measureElement(
			ref.current,
			options.shouldApplyCssTransforms,
		);
		if (!measured) {
			return null;
		}

		return {
			...measured,
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
			const {target} = entries[0];
			const measured = measureElement(
				target as HTMLElement,
				options.shouldApplyCssTransforms,
			);

			if (!measured) {
				setSize(null);
				return;
			}

			setSize((prevState) => {
				const isSame =
					prevState &&
					prevState.width === measured.width &&
					prevState.height === measured.height &&
					prevState.left === measured.left &&
					prevState.top === measured.top &&
					prevState.windowSize.height === window.innerHeight &&
					prevState.windowSize.width === window.innerWidth;
				if (isSame) {
					return prevState;
				}

				return {
					...measured,
					windowSize: {
						height: window.innerHeight,
						width: window.innerWidth,
					},
				};
			});
		});
	}, [options.shouldApplyCssTransforms]);

	const updateSize = useCallback(() => {
		if (!ref.current) {
			return;
		}

		const measured = measureElement(
			ref.current,
			options.shouldApplyCssTransforms,
		);
		if (!measured) {
			setSize(null);
			return;
		}

		setSize((prevState) => {
			const isSame =
				prevState &&
				prevState.width === measured.width &&
				prevState.height === measured.height &&
				prevState.left === measured.left &&
				prevState.top === measured.top &&
				prevState.windowSize.height === window.innerHeight &&
				prevState.windowSize.width === window.innerWidth;
			if (isSame) {
				return prevState;
			}

			return {
				...measured,
				windowSize: {
					height: window.innerHeight,
					width: window.innerWidth,
				},
			};
		});
	}, [ref, options.shouldApplyCssTransforms]);

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
