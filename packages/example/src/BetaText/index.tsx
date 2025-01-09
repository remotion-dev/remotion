import {zColor} from '@remotion/zod-types';
import {mix} from 'polished';
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import styled from 'styled-components';
import {z} from 'zod';

const BRAND_GRADIENT = ['#5851db', '#405de6'];
const solidBrand = mix(0.5, BRAND_GRADIENT[0], BRAND_GRADIENT[1]);
const Label = styled.span<{
	outline: boolean;
}>`
	font-size: 120px;
	font-family: ${(props) =>
		props.outline ? 'Altero Outline' : 'Altero-Regular'};
	text-align: center;
	transform: scaleX(1);
	line-height: 1em;
	margin-left: 10px;
	margin-right: 10px;
	display: inline-block;
`;

const Row: React.FC<{
	readonly videoWidth: number;
	readonly i: number;
	readonly text: string;
	readonly zoom: number;
	readonly color: string;
}> = ({videoWidth, i, text, zoom, color}) => {
	const frame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const progress = spring({
		config: {
			damping: 30,
			mass: 1,
			stiffness: 40,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		from: 0,
		to: 1,
		frame,
	});
	const posX = interpolate(progress, [0, 1], [1, 0]);

	const dir = i % 2 === 0 ? -1 : 1;

	return (
		<div
			style={{
				whiteSpace: 'nowrap',
				width: 10000,
				marginLeft: -(10000 - videoWidth) / 2 + posX * 1000 * dir,
				textAlign: 'center',
				color,
				opacity: 1 - zoom,
			}}
		>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline={false} style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
			<Label outline style={{transform: `scale(${progress})`}}>
				{text}
			</Label>
		</div>
	);
};

export const betaTextSchema = z.object({
	word1: z.string(),
	color: z.array(zColor()),
});

const BetaText = ({
	word1,
	color,
}: z.infer<typeof betaTextSchema>): React.ReactNode => {
	const videoConfig = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		config: {
			damping: 30,
			mass: 1,
			stiffness: 40,
			overshootClamping: false,
		},
		fps: videoConfig.fps,
		from: 0,
		to: 1,
		frame: Math.max(0, frame - 70),
	});
	const scale = interpolate(progress, [0, 0.4], [1, 10]);
	const backgroundColor = mix(1 - progress, '#fff', solidBrand);

	return (
		<div
			style={{
				width: videoConfig.width,
				height: videoConfig.height,
				display: 'flex',
				transform: `scale(${scale})`,
				fontFamily: 'sans-serif',
			}}
		>
			<div
				style={{
					backgroundColor,
					flex: 1,
				}}
			>
				{new Array(17)
					.fill(true)
					.map((_, i) => i)
					.map((key, i) => {
						return (
							<Row
								key={key}
								color={color[i]}
								zoom={progress}
								text={
									key === 7
										? 'ONE'
										: key === 5
											? 'REMOTION'
											: key === 3
												? (word1 ?? 'COOL')
												: key === 1
													? 'LIT'
													: 'BETA'
								}
								i={key}
								videoWidth={videoConfig.width}
							/>
						);
					})}
			</div>
		</div>
	);
};

export default BetaText;
