import type {Dimensions} from '@remotion/media-parser';
import {useCallback, useEffect, useState} from 'react';
import type {VideoThumbnailRef} from '~/components/VideoThumbnail';

export const useThumbnailCopy = ({
	sourceRef,
	targetRef,
	dimensions,
}: {
	sourceRef: React.RefObject<VideoThumbnailRef | null>;
	targetRef: React.RefObject<HTMLCanvasElement | null> | null;
	dimensions: Dimensions;
}) => {
	const [drawn, setDrawn] = useState(
		() => sourceRef.current?.hasBitmap ?? false,
	);

	const draw = useCallback(() => {
		if (!targetRef) {
			return;
		}

		sourceRef.current?.copy().then((map) => {
			const ctx = targetRef.current?.getContext('2d');
			if (!ctx) {
				return;
			}

			ctx.drawImage(map, 0, 0, dimensions.width, dimensions.height);

			setDrawn(true);
		});
	}, [sourceRef, targetRef, dimensions.width, dimensions.height]);

	useEffect(() => {
		const {current} = sourceRef;
		if (!current) {
			return;
		}

		current.addOnChangeListener(draw);
		return () => {
			current.removeOnChangeListener(draw);
		};
	}, [draw, sourceRef]);

	useEffect(() => {
		draw();
	}, [draw]);

	return drawn;
};
