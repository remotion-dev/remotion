import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {fitTextOnNLines} from '../../layouts/fit-text-on-n-lines';

const BOX_WIDTH = 756;

const Component: React.FC = () => {
	const {fontSize, lines} = useMemo(
		() =>
			fitTextOnNLines({
				text: 'microtext  abcdefghijklmnopq',
				maxLines: 2,
				maxBoxWidth: BOX_WIDTH,
				maxFontSize: 80,
				fontFamily: 'Verdana',
				fontWeight: '900',
				textTransform: 'uppercase',
			}),
		[],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#111',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: BOX_WIDTH,
					outline: '2px solid #6f6',
					color: '#fff',
					fontFamily: 'Verdana, sans-serif',
					fontWeight: 900,
					textTransform: 'uppercase',
				}}
			>
				{lines.map((line) => (
					<div
						key={line}
						style={{
							fontSize,
							lineHeight: 1.25,
							whiteSpace: 'pre',
						}}
					>
						{line}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const issue7359FitTextOnNLines = {
	component: Component,
	id: 'issue-7359-fit-text-on-n-lines',
	width: 1280,
	height: 720,
	fps: 30,
	durationInFrames: 90,
} as const;
