import {PlayerInternals, type Size} from '@remotion/player';
import React, {useContext, useMemo} from 'react';
import {getRulerPoints, getRulerScaleRange} from '../../helpers/editor-ruler';
import type {AssetMetadata} from '../../helpers/get-asset-metadata';
import type {Dimensions} from '../../helpers/is-current-selected-still';
import {
	MAXIMUM_PREDEFINED_RULER_SCALE_GAP,
	MINIMUM_RULER_MARKING_GAP_PX,
	PREDEFINED_RULER_SCALE_GAPS,
	RULER_WIDTH,
} from '../../state/editor-rulers';
import {PreviewSizeContext} from '../../state/preview-size';
import Ruler from './Ruler';

const originBlockStyles: React.CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	borderBottom: '1px solid #444444',
	borderRight: '1px solid #444444',
	width: `${RULER_WIDTH}px`,
	height: `${RULER_WIDTH}px`,
	background: '#000000',
};

export const EditorRulers: React.FC<{
	canvasSize: Size | null;
	contentDimensions: Dimensions | 'none' | null;
	assetMetadata: AssetMetadata | null;
	containerRef: React.RefObject<HTMLDivElement>;
}> = ({contentDimensions, canvasSize, assetMetadata, containerRef}) => {
	const {size: previewSize} = useContext(PreviewSizeContext);

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

	const canvasDimensions = useMemo(() => {
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

	const rulerMarkingGaps = useMemo(() => {
		const minimumGap = MINIMUM_RULER_MARKING_GAP_PX;
		const predefinedGap = PREDEFINED_RULER_SCALE_GAPS.find(
			(gap) => gap * scale > minimumGap,
		);

		return predefinedGap || MAXIMUM_PREDEFINED_RULER_SCALE_GAP;
	}, [scale]);

	const horizontalRulerScaleRange = useMemo(
		() =>
			getRulerScaleRange({
				canvasLength: canvasDimensions.width,
				containerRef,
				scale,
			}),
		[canvasDimensions.width, containerRef, scale],
	);

	const verticalRulerScaleRange = useMemo(
		() =>
			getRulerScaleRange({
				canvasLength: canvasDimensions.height,
				containerRef,
				scale,
			}),
		[canvasDimensions.height, containerRef, scale],
	);

	const {
		points: horizontalRulerPoints,
		startMarking: horizontalRulerStartMarking,
	} = useMemo(
		() =>
			getRulerPoints({
				rulerScaleRange: horizontalRulerScaleRange,
				rulerMarkingGaps,
				scale,
			}),
		[horizontalRulerScaleRange, rulerMarkingGaps, scale],
	);

	const {points: verticalRulerPoints, startMarking: verticalRulerStartMarking} =
		useMemo(
			() =>
				getRulerPoints({
					rulerScaleRange: verticalRulerScaleRange,
					rulerMarkingGaps,
					scale,
				}),
			[verticalRulerScaleRange, rulerMarkingGaps, scale],
		);

	return (
		<>
			<div style={originBlockStyles} />
			<Ruler
				orientation="horizontal"
				scale={scale}
				points={horizontalRulerPoints}
				startMarking={horizontalRulerStartMarking}
				containerRef={containerRef}
				markingGaps={rulerMarkingGaps}
				originOffset={canvasDimensions.left}
			/>
			<Ruler
				orientation="vertical"
				scale={scale}
				points={verticalRulerPoints}
				startMarking={verticalRulerStartMarking}
				containerRef={containerRef}
				markingGaps={rulerMarkingGaps}
				originOffset={canvasDimensions.top}
			/>
		</>
	);
};
