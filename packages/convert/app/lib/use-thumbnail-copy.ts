import type {CropRectangle} from 'mediabunny';
import {useCallback, useEffect, useState} from 'react';
import type {VideoThumbnailRef} from '~/components/VideoThumbnail';
import {
	getCropRectangleBeforeMirror,
	getCropRectangleBeforeRotation,
	getVisibleCropRectangle,
} from './apply-crop';
import {
	type Dimensions,
	normalizeVideoRotation,
} from './calculate-new-dimensions-from-dimensions';

export const useThumbnailCopy = ({
	sourceRef,
	targetRef,
	dimensions,
	cropRect,
	crop,
	fullDimensionsBeforeCrop,
	sourceDimensions,
	rotation,
	mirrorHorizontal,
	mirrorVertical,
}: {
	sourceRef: React.RefObject<VideoThumbnailRef | null>;
	targetRef: React.RefObject<HTMLCanvasElement | null> | null;
	dimensions: Dimensions;
	cropRect: CropRectangle;
	crop: boolean;
	fullDimensionsBeforeCrop: Dimensions;
	sourceDimensions: Dimensions;
	rotation: number;
	mirrorHorizontal: boolean;
	mirrorVertical: boolean;
}) => {
	const [drawn, setDrawn] = useState(
		() => sourceRef.current?.hasBitmap ?? false,
	);

	const draw = useCallback(() => {
		if (!targetRef) {
			return;
		}

		sourceRef.current?.copy().then((map) => {
			const canvas = targetRef.current;
			const ctx = canvas?.getContext('2d');
			if (!ctx || !canvas) {
				return;
			}

			const visibleCropRectangle = getVisibleCropRectangle({
				cropRect: crop
					? cropRect
					: {
							left: 0,
							top: 0,
							width: fullDimensionsBeforeCrop.width,
							height: fullDimensionsBeforeCrop.height,
						},
				dimensions: fullDimensionsBeforeCrop,
			});
			const cropBeforeMirror = getCropRectangleBeforeMirror({
				cropRect: visibleCropRectangle,
				dimensions: fullDimensionsBeforeCrop,
				mirrorHorizontal,
				mirrorVertical,
			});
			const sourceCrop = getCropRectangleBeforeRotation({
				cropRect: cropBeforeMirror,
				rotation,
				sourceDimensions,
			});
			const normalizedRotation = normalizeVideoRotation(rotation);
			const switchesDimensions = normalizedRotation % 180 !== 0;
			const drawWidth = switchesDimensions
				? dimensions.height
				: dimensions.width;
			const drawHeight = switchesDimensions
				? dimensions.width
				: dimensions.height;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.translate(dimensions.width / 2, dimensions.height / 2);
			ctx.scale(mirrorHorizontal ? -1 : 1, mirrorVertical ? -1 : 1);
			ctx.rotate((normalizedRotation * Math.PI) / 180);
			ctx.drawImage(
				map,
				(map.width / sourceDimensions.width) * sourceCrop.left,
				(map.height / sourceDimensions.height) * sourceCrop.top,
				(map.width / sourceDimensions.width) * sourceCrop.width,
				(map.height / sourceDimensions.height) * sourceCrop.height,
				-drawWidth / 2,
				-drawHeight / 2,
				drawWidth,
				drawHeight,
			);
			ctx.restore();

			setDrawn(true);
		});
	}, [
		targetRef,
		sourceRef,
		crop,
		dimensions,
		fullDimensionsBeforeCrop,
		cropRect,
		sourceDimensions,
		rotation,
		mirrorHorizontal,
		mirrorVertical,
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
