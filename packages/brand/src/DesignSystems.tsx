import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {
	FolderTree,
	folderTreeSelectionMoveEnd,
	folderTreeSelectionMoveStart,
} from './HomepageAssets/FolderTree';
import {RemotionTriangle} from './HomepageAssets/RemotionTriangle';
import {TemplateRecorderEndcard} from './HomepageAssets/TemplateRecorderEndcard';

const endcardSequenceStart = folderTreeSelectionMoveStart;
const animatedLogoExitEnd = 72;
const assetScaleOverlap = 8;
const endcardEnterStart = animatedLogoExitEnd - assetScaleOverlap;
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
	const animatedLogoScale = interpolate(
		frame,
		[folderTreeSelectionMoveStart, animatedLogoExitEnd],
		[1.3, 0],
		exitTransition,
	);
	const endcardScale = interpolate(
		frame,
		[endcardEnterStart, folderTreeSelectionMoveEnd],
		[0, 0.513],
		enterTransition,
	);
	const endcardOpacity = interpolate(
		frame,
		[endcardEnterStart, endcardEnterStart + 3],
		[0, 1],
		enterTransition,
	);

	return (
		<>
			<Sequence
				width={480}
				height={160}
				durationInFrames={160}
				style={{
					position: 'absolute',
					translate: '157px 264.7px',
					scale: 3.233,
				}}
			>
				<FolderTree />
			</Sequence>
			<Sequence
				width={1080}
				height={1080}
				durationInFrames={150}
				style={{
					position: 'absolute',
					translate: '189.6px 162px',
					opacity: interpolate(frame, [75], [1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: animatedLogoScale,
				}}
			>
				<RemotionTriangle />
			</Sequence>
			<Sequence
				width={1080}
				height={1620}
				durationInFrames={200}
				style={{
					position: 'absolute',
					translate: '170.7px -145.5px',
					opacity: endcardOpacity,
					scale: endcardScale,
				}}
				from={endcardSequenceStart}
			>
				<TemplateRecorderEndcard />
			</Sequence>
		</>
	);
};
