import React from 'react';
import {AbsoluteFill} from 'remotion';

export const TrendingRepos: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly trending: string[];
}> = ({theme, trending}) => {
	const item: React.CSSProperties = {
		lineHeight: 1.1,
		fontFamily: 'GT Planar',
		fontWeight: '500',
		color: theme === 'dark' ? 'white' : 'black',
		fontFeatureSettings: "'ss03' 1",
	};

	const fill = theme === 'light' ? '#666' : '#999';

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					paddingLeft: 20,
					paddingRight: 20,
				}}
			>
				<div>
					<div
						style={{
							color: fill,
							fontFamily: 'GT Planar',
							fontWeight: '500',
							fontSize: 12,
						}}
					>
						Saturday, January 13th
					</div>
					<div
						style={{
							color: '#0b84f3',
							fontFamily: 'GT Planar',
							fontWeight: '500',
							fontSize: 16,
							marginBottom: 10,
						}}
					>
						Trending repositories
					</div>
					<div style={item}>1. {trending[0]}</div>
					<div style={item}>2. {trending[1]}</div>
					<div style={item}>3. {trending[2]}</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
