import React from 'react';
import {Sequence, interpolate, useCurrentFrame} from 'remotion';
import {FolderTree} from './HomepageAssets/FolderTree';
import {RemotionTriangle} from './HomepageAssets/RemotionTriangle';
import {TemplateRecorderEndcard} from './HomepageAssets/TemplateRecorderEndcard';

export const DesignSystems: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Sequence
				width={1080}
				height={1080}
				durationInFrames={90}
				style={{
					position: 'absolute',
					translate: '747px 7.5px',
					opacity: interpolate(frame, [75], [1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [75], [1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
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
					translate: '243.4px -278px',
					scale: 0.513,
				}}
				from={72}
			>
				<TemplateRecorderEndcard />
			</Sequence>
			<Sequence
				width={480}
				height={160}
				durationInFrames={160}
				style={{
					position: 'absolute',
					translate: '69.6px 448.4px',
					scale: 2.409,
				}}
			>
				<FolderTree />
			</Sequence>
		</>
	);
};
