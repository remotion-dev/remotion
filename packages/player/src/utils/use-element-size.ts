import {useCallback, useEffect, useMemo, useState} from 'react';

export type Size = {
	width: number;
	height: number;
	left: number;
	top: number;
};

export const useElementSize = (
	ref: React.RefObject<HTMLDivElement>,
	options: {
		triggerOnWindowResize: boolean;
	}
): Size | null => {
	const [size, setSize] = useState<Size | null>(null);
	const observer = useMemo(() => {
		if (typeof ResizeObserver === 'undefined') {
			return null;
		}

		return new ResizeObserver((entries) => {
			const newSize = entries[0].target.getClientRects();
			if (!newSize || !newSize[0]) {
				setSize(null);
				return;
			}

			setSize({
				width: newSize[0].width,
				height: newSize[0].height,
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

		setSize({
			width: rect[0].width as number,
			height: rect[0].height as number,
			left: rect[0].x as number,
			top: rect[0].y as number,
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
		if (!options.triggerOnWindowResize) {
			return;
		}

		window.addEventListener('resize', updateSize);

		return () => {
			window.removeEventListener('resize', updateSize);
		};
	}, [options.triggerOnWindowResize, updateSize]);

	return size;
};
