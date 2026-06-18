import {brightness} from '@remotion/effects/brightness';
import {burlap} from '@remotion/effects/burlap';
import {colorKey} from '@remotion/effects/color-key';
import {dropShadow} from '@remotion/effects/drop-shadow';
import {duotone} from '@remotion/effects/duotone';
import {noise} from '@remotion/effects/noise';
import {tint} from '@remotion/effects/tint';
import {Video} from '@remotion/media';
import React from 'react';
import {Solid, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const EffectsAnnouncement: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#c6b67f'}
				effects={[
					burlap({
						amount: 0.77,
						size: 9,
						seed: interpolate(frame, [2, 199], [12, -19], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							posterize: 10,
						}),
					}),
				]}
			/>
			<Video
				src={staticFile(
					'43776940_caucasian-woman-greenscreen-cut-out-labcoat-scientist_by_bruno135_preview.mp4',
				)}
				style={{
					position: 'absolute',
					translate: '162.2px 70px',
					scale: 1.419,
					width: 960,
					height: 540,
				}}
				effects={[
					colorKey({
						similarity: 0.45,
					}),
					duotone({}),
					tint({
						color: '#ffe374',
						amount: 0.45,
					}),
					brightness({
						amount: -0.38,
					}),
					dropShadow({
						opacity: 1,
						offsetX: -14,
					}),
					noise({}),
					burlap({}),
				]}
			/>
		</>
	);
};
