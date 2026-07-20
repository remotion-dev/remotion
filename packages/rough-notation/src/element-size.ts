import {useCallback, useEffect, useMemo, useState} from 'react';

export type Size = {
	readonly width: number;
	readonly height: number;
	readonly left: number;
	readonly top: number;
	readonly refresh: () => void;
};

export const useElementSize = (
	ref: React.RefObject<HTMLElement | null>,
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
			width: rect[0].width,
			height: rect[0].height,
			left: rect[0].x,
			top: rect[0].y,
		};
	});

	const observer = useMemo(() => {
		if (typeof ResizeObserver === 'undefined') {
			return null;
		}

		return new ResizeObserver((entries) => {
			const {target} = entries[0];
			const newSize = target.getClientRects();

			if (!newSize?.[0]) {
				setSize(null);
				return;
			}

			const {width, height} = newSize[0];

			setSize({
				width,
				height,
				left: newSize[0].x,
				top: newSize[0].y,
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

		setSize((prevState) => {
			const isSame =
				prevState &&
				prevState.width === rect[0].width &&
				prevState.height === rect[0].height &&
				prevState.left === rect[0].x &&
				prevState.top === rect[0].y;

			if (isSame) {
				return prevState;
			}

			return {
				width: rect[0].width,
				height: rect[0].height,
				left: rect[0].x,
				top: rect[0].y,
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

	return useMemo(() => {
		if (!size) {
			return null;
		}

		return {...size, refresh: updateSize};
	}, [size, updateSize]);
};
