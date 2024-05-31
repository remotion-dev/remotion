import type {Size} from '@remotion/player';
import {PlayerInternals} from '@remotion/player';
import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import type {AssetMetadata} from './get-asset-metadata';
import type {Dimensions} from './is-current-selected-still';

export const useStudioCanvasDimensions = ({
	canvasSize,
	contentDimensions,
	assetMetadata,
}: {
	canvasSize: Size | null;
	contentDimensions: Dimensions | 'none' | null;
	assetMetadata: AssetMetadata | null;
}) => {
	const {size: previewSize} = useContext(Internals.PreviewSizeContext);

	const {centerX, centerY, scale} = useMemo(() => {
		if (
			contentDimensions === 'none' ||
			contentDimensions === null ||
			(assetMetadata && assetMetadata.type === 'not-found') ||
			!canvasSize
		) {
			return {
				centerX: previewSize.translation.x,
				centerY: previewSize.translation.y,
				scale: 1,
			};
		}

		return PlayerInternals.calculateCanvasTransformation({
			canvasSize,
			compositionHeight: contentDimensions.height,
			compositionWidth: contentDimensions.width,
			previewSize: previewSize.size,
		});
	}, [
		canvasSize,
		contentDimensions,
		previewSize.size,
		previewSize.translation.y,
		previewSize.translation.x,
		assetMetadata,
	]);

	const canvasPosition = useMemo(() => {
		return {
			left: centerX - previewSize.translation.x,
			top: centerY - previewSize.translation.y,
			width:
				contentDimensions === 'none' || !contentDimensions
					? canvasSize?.width || 0
					: contentDimensions.width * scale,
			height:
				contentDimensions === 'none' || !contentDimensions
					? canvasSize?.height || 0
					: contentDimensions.height * scale,
		};
	}, [
		scale,
		centerX,
		previewSize.translation.x,
		previewSize.translation.y,
		centerY,
		canvasSize,
		contentDimensions,
	]);

	return {
		canvasPosition,
		scale,
	};
};
