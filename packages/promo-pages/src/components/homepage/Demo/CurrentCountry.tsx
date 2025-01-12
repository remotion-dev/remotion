import {getBoundingBox, resetPath} from '@remotion/paths';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const CurrentCountry: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly countryPaths:
		| {
				d: string;
				class: string;
		  }[]
		| null;
	readonly countryLabel: string | null;
}> = ({theme, countryPaths, countryLabel}) => {
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();

	if (!countryPaths) {
		return null;
	}

	const joined = countryPaths.map((p) => p.d).join(' ');
	const reset = resetPath(joined);
	const boundingBox = getBoundingBox(reset);

	const progress = spring({
		fps,
		frame,
		delay: 10,
	});

	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
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
						width: '100%',
						paddingLeft: 20,
						paddingRight: 20,
						transform:
							'translateX(' + interpolate(progress, [0, 1], [-100, 0]) + '%)',
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
						width: '100%',
						paddingLeft: 20,
						paddingRight: 20,
						transform:
							'translateX(' + interpolate(progress, [0, 1], [100, 0]) + '%)',
					}}
				>
					{countryLabel}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
