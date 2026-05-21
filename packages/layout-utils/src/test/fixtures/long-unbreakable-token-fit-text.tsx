import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {fitTextOnNLines} from '../../layouts/fit-text-on-n-lines';

const BOX_WIDTH = 420;

const Component: React.FC = () => {
	const {fontSize, lines} = useMemo(
		() =>
			fitTextOnNLines({
				text: 'short  https://example.com/very-long-path-segment-that-must-shrink',
				maxLines: 2,
				maxBoxWidth: BOX_WIDTH,
				maxFontSize: 48,
				fontFamily: 'Verdana, sans-serif',
				fontWeight: '700',
			}),
		[],
	);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0b1020',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					width: BOX_WIDTH,
					outline: '2px solid #8af',
					color: '#e8eefc',
					fontFamily: 'Verdana, sans-serif',
					fontWeight: 700,
				}}
			>
				{lines.map((line) => (
					<div
						key={line}
						style={{
							fontSize,
							lineHeight: 1.25,
							whiteSpace: 'pre',
							wordBreak: 'keep-all',
						}}
					>
						{line}
					</div>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const longUnbreakableTokenFitText = {
	component: Component,
	id: 'long-unbreakable-token-fit-text',
	width: 1280,
	height: 720,
	fps: 30,
	durationInFrames: 90,
} as const;
