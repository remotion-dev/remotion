import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Trending} from './Comp';

export const TrendingRepos: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly trending: Trending;
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
						{new Intl.DateTimeFormat('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
						}).format(new Date(trending.date))}
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
					<div style={item}>1. {trending.repos[0]}</div>
					<div style={item}>2. {trending.repos[1]}</div>
					<div style={item}>3. {trending.repos[2]}</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
