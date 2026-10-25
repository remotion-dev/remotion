import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {
	FolderTree,
	folderTreeSelectionMoveEnd,
	folderTreeSelectionMoveStart,
} from './HomepageAssets/FolderTree';
import {RemotionTriangle} from './HomepageAssets/RemotionTriangle';
import {TemplateRecorderEndcard} from './HomepageAssets/TemplateRecorderEndcard';

const forwardDurationInFrames = 150;
const pingPongDurationInFrames = forwardDurationInFrames * 2 - 1;
const endcardHoldReductionInFrames = 9;
export const designSystemsDurationInFrames =
	pingPongDurationInFrames -
	folderTreeSelectionMoveStart -
	endcardHoldReductionInFrames;
const endcardSequenceStart = folderTreeSelectionMoveStart - 2;
const animatedLogoExitEnd = 100;
const assetScaleOverlap = 1;
const endcardEnterStart = animatedLogoExitEnd - assetScaleOverlap;
// Match the visible half of the 30-unit Batch rendering stroke at its 0.408 scale.
const selectionOutlineStrokeWidth = (30 / 2) * (1920 / 3200) * 0.68;
const animatedLogoRestScale = 1.3;
const endcardRestScale = 0.513;
const selectionOutlineHandleSize = 40 * animatedLogoRestScale * 0.667;
const scaleSpring = Easing.spring({
	damping: 200,
	mass: 1,
	overshootClamping: true,
	stiffness: 100,
});
const exitTransition = {
	easing: Easing.out(scaleSpring),
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};
const enterTransition = {
	easing: scaleSpring,
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

export const DesignSystems: React.FC = () => {
	const frame = useCurrentFrame();
	const pingPongFrame =
		frame < forwardDurationInFrames
			? frame
			: pingPongDurationInFrames - 1 - frame - endcardHoldReductionInFrames;
	const endcardFrame = Math.max(
		0,
		Math.min(frame, forwardDurationInFrames - 1) - endcardSequenceStart,
	);
	const animatedLogoFrame =
		frame < forwardDurationInFrames ? pingPongFrame * 2 : 0;
	const animatedLogoScale = interpolate(
		pingPongFrame,
		[folderTreeSelectionMoveStart, animatedLogoExitEnd],
		[animatedLogoRestScale, 0],
		exitTransition,
	);
	const endcardScale = interpolate(
		pingPongFrame,
		[endcardEnterStart, folderTreeSelectionMoveEnd],
		[0, endcardRestScale],
		enterTransition,
	);
	const endcardOpacity = interpolate(
		pingPongFrame,
		[endcardEnterStart, endcardEnterStart + 3],
		[0, 1],
		enterTransition,
	);

	return (
		<>
			<Sequence
				width={480}
				height={160}
				durationInFrames={designSystemsDurationInFrames}
				style={{
					position: 'absolute',
					translate: '157px 694.7px',
					scale: 3.233,
					zIndex: 1,
				}}
			>
				<FolderTree frame={pingPongFrame} />
			</Sequence>
			<Sequence
				width={1080}
				height={1080}
				durationInFrames={designSystemsDurationInFrames}
				style={{
					position: 'absolute',
					translate: '189.6px -138px',
					opacity: interpolate(pingPongFrame, [75], [1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
			>
				<RemotionTriangle
					frame={animatedLogoFrame}
					scale={animatedLogoScale}
					outlineStrokeWidth={selectionOutlineStrokeWidth}
					outlineHandleSize={
						(selectionOutlineHandleSize * animatedLogoScale) /
						animatedLogoRestScale
					}
				/>
			</Sequence>
			<Sequence
				width={1080}
				height={1620}
				durationInFrames={designSystemsDurationInFrames}
				style={{
					position: 'absolute',
					translate: '170.7px -355.5px',
					opacity: endcardOpacity,
				}}
				from={endcardSequenceStart}
			>
				<TemplateRecorderEndcard
					frame={endcardFrame}
					scale={endcardScale}
					outlineStrokeWidth={selectionOutlineStrokeWidth}
					outlineHandleSize={
						(selectionOutlineHandleSize * endcardScale) / endcardRestScale
					}
				/>
			</Sequence>
		</>
	);
};
