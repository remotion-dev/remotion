import React from 'react';
import {Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {FolderTree} from './HomepageAssets/FolderTree';
import {RemotionTriangle} from './HomepageAssets/RemotionTriangle';
import {TemplateRecorderEndcard} from './HomepageAssets/TemplateRecorderEndcard';

const selectionTransitionStart = 84;
const selectionTransitionEnd = 119;
const selectionTransition = {
	easing: Easing.bezier(0.16, 1, 0.3, 1),
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

export const DesignSystems: React.FC = () => {
	const frame = useCurrentFrame();
	const animatedLogoScale = interpolate(
		frame,
		[selectionTransitionStart, selectionTransitionEnd],
		[1.3, 0],
		selectionTransition,
	);
	const endcardScale = interpolate(
		frame,
		[72, selectionTransitionEnd],
		[0.42, 0.513],
		selectionTransition,
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
					translate: '847.2px 224.6px',
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
					scale: endcardScale,
				}}
				from={72}
			>
				<TemplateRecorderEndcard />
			</Sequence>
		</>
	);
};
