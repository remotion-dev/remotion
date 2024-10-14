import {getBoundingBox, resetPath} from '@remotion/paths';
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const CurrentCountry: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly countryPaths: {
		d: string;
		class: string;
	}[];
	readonly countryLabel: string;
}> = ({theme, countryPaths, countryLabel}) => {
	const joined = countryPaths.map((p) => p.d).join(' ');
	const reset = resetPath(joined);
	const boundingBox = getBoundingBox(reset);

	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	const progress = spring({
		fps,
		frame,
		delay: 10,
	});

	const progress2 = spring({
		fps,
		frame,
		delay: 20,
	});

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					transform: `scale(${progress})`,
				}}
			>
				<svg
					viewBox={boundingBox.viewBox}
					style={{
						scale: '0.8',
					}}
				>
					<path fill={theme === 'light' ? '#bbb' : '#222'} d={reset} />
				</svg>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					paddingLeft: 20,
					paddingRight: 20,
					transform: `scale(${progress2})`,
				}}
			>
				<div
					style={{
						color: '#0b84f3',
						fontFamily: 'GTPlanar',
						fontWeight: '500',
						fontSize: 13,
						textAlign: 'center',
						marginTop: -10,
					}}
				>
					Your country
				</div>
				<div
					style={{
						lineHeight: 1.1,
						fontFamily: 'GTPlanar',
						textAlign: 'center',
						fontWeight: '500',
						fontSize: 30,
						color: theme === 'dark' ? 'white' : 'black',
					}}
				>
					{countryLabel}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
