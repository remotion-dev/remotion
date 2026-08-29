import {blur} from '@remotion/effects/blur';
import {chromaticAberration} from '@remotion/effects/chromatic-aberration';
import {noise} from '@remotion/effects/noise';
import {pattern} from '@remotion/effects/pattern';
import {rings} from '@remotion/effects/rings';
import {wave} from '@remotion/effects/wave';
import {Video} from '@remotion/media';
import React from 'react';
import {Solid, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {asset} from './assets';

export const DiscoBallBg: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				color={'#1e1c1c'}
				width={1080}
				height={1920}
				style={{position: 'absolute'}}
			/>
			<Sequence
				style={{
					opacity: 0.1,
				}}
			>
				<Solid
					width={1080}
					height={1920}
					color={'#010101'}
					style={{
						position: 'absolute',
					}}
					effects={[
						rings({
							colors: ['#000000', '#b1b1b1'],
							center: interpolate(
								frame,
								[0, 1839],
								[
									[0, 1],
									[1, 0],
								],
								{
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									posterize: 10,
								},
							),
							thickness: interpolate(frame, [0, 1839], [84.1, 146.3], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								posterize: 10,
							}),
							gap: 24.8,
						}),
						wave({
							phase: interpolate(frame, [0, 1839], [200, 229], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}),
						blur({
							radius: 20,
						}),
						noise({
							amount: 0.25,
						}),
					]}
				/>

				<Solid
					width={1080}
					height={1920}
					color={'rgba(255, 255, 255, 0)'}
					style={{
						position: 'absolute',
					}}
				/>
				<Video
					src={asset('disco-ball-3d-loop.mov')}
					style={{
						position: 'absolute',
						width: 1080,
						height: 1920,
					}}
					objectFit="cover"
					effects={[
						pattern({
							scale: 0.34,
							gapX: -13,
						}),
						chromaticAberration({
							amount: 100,
							angle: interpolate(frame, [0, 1849], [101, 2700], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								posterize: 10,
							}),
						}),
					]}
					playbackRate={0.1}
					loop
				/>
			</Sequence>
		</>
	);
};
