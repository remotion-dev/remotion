import {useCallback, useEffect, useMemo, useState} from 'react';

export type Size = {
	width: number;
	height: number;
	left: number;
	top: number;
};

export const useElementSize = (
	ref: React.RefObject<HTMLDivElement>
): Size | null => {
	const [size, setSize] = useState<Size | null>(null);
	const observer = useMemo(
		() =>
			new ResizeObserver((entries) => {
				const newSize = entries[0].target.getClientRects();
				setSize({
					width: newSize[0].width,
					height: newSize[0].height,
					left: newSize[0].x,
					top: newSize[0].y,
				});
			}),
		[]
	);
	const updateSize = useCallback(() => {
		if (!ref.current) {
			return;
		}

		const rect = ref.current.getClientRects();
		if (!rect[0]) {
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
	return size;
};
