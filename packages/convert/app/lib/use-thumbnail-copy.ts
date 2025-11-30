import type {CropRectangle} from 'mediabunny';
import {useCallback, useEffect, useState} from 'react';
import type {VideoThumbnailRef} from '~/components/VideoThumbnail';
import type {Dimensions} from './calculate-new-dimensions-from-dimensions';

export const useThumbnailCopy = ({
	sourceRef,
	targetRef,
	dimensions,
	cropRect,
	crop,
	fullDimensionsBeforeCrop,
}: {
	sourceRef: React.RefObject<VideoThumbnailRef | null>;
	targetRef: React.RefObject<HTMLCanvasElement | null> | null;
	dimensions: Dimensions;
	cropRect: CropRectangle;
	crop: boolean;
	fullDimensionsBeforeCrop: Dimensions;
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

			if (!crop) {
				ctx.drawImage(map, 0, 0, dimensions.width, dimensions.height);
			} else {
				ctx.drawImage(
					map,
					(map.width / fullDimensionsBeforeCrop.width) * cropRect.left,
					(map.height / fullDimensionsBeforeCrop.height) * cropRect.top,
					(map.width / fullDimensionsBeforeCrop.width) * cropRect.width,
					(map.height / fullDimensionsBeforeCrop.height) * cropRect.height,
					0,
					0,
					dimensions.width,
					dimensions.height,
				);
			}

			setDrawn(true);
		});
	}, [
		targetRef,
		sourceRef,
		crop,
		dimensions,
		fullDimensionsBeforeCrop,
		cropRect,
	]);

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
