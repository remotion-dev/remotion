import {fitTextOnNLines} from '@remotion/layout-utils';
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';

const BOX_WIDTH = 756;

/**
 * Minimal reproduction for https://github.com/remotion-dev/remotion/issues/7359
 */
export const Issue7359FitTextOnNLines: React.FC = () => {
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
			<div
				style={{
					position: 'absolute',
					bottom: 40,
					color: '#aaa',
					fontFamily: 'monospace',
					fontSize: 14,
				}}
			>
				fontSize: {fontSize} · maxBoxWidth: {BOX_WIDTH}
			</div>
		</AbsoluteFill>
	);
};
