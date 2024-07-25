import {getBoundingBox, resetPath} from '@remotion/paths';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ISO_3166_ALPHA_2_MAPPINGS, countriesPaths} from './paths';
import type {Location} from './types';

export const CurrentCountry: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly location: Location;
}> = ({theme, location}) => {
	const paths = countriesPaths.filter((c) => c.class === location.country);
	const joined = paths.map((p) => p.d).join(' ');
	const reset = resetPath(joined);
	const boundingBox = getBoundingBox(reset);

	return (
		<AbsoluteFill>
			<AbsoluteFill style={{}}>
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
				}}
			>
				<div
					style={{
						color: '#0b84f3',
						fontFamily: 'GT Planar',
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
						fontFamily: 'GT Planar',
						textAlign: 'center',
						fontWeight: '500',
						fontSize: 30,
						color: theme === 'dark' ? 'white' : 'black',
					}}
				>
					{ISO_3166_ALPHA_2_MAPPINGS[location.country]}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
