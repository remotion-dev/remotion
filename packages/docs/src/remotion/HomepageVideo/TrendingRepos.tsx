import React, {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {RemoteData} from './Comp';

const TrendingRepoItem: React.FC<{
	readonly repo: string;
	readonly theme: 'dark' | 'light';
	readonly number: number;
}> = ({repo, theme, number}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: number * 10 + 20,
	});

	const item: React.CSSProperties = useMemo(() => {
		return {
			lineHeight: 1.1,
			fontFamily: 'GTPlanar',
			fontWeight: '500',
			color: theme === 'dark' ? 'white' : 'black',
			fontFeatureSettings: "'ss03' 1",
			opacity: progress,
		};
	}, [progress, theme]);

	return (
		<div style={item}>
			{number}. {repo}
		</div>
	);
};

export const TrendingRepos: React.FC<{
	readonly theme: 'dark' | 'light';
	readonly trending: RemoteData | null;
}> = ({theme, trending}) => {
	const fill = theme === 'light' ? '#666' : '#999';
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress1 = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
		delay: 0,
	});

	if (trending === null) {
		return null;
	}

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
							fontFamily: 'GTPlanar',
							fontWeight: '500',
							fontSize: 12,
							opacity: progress1,
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
							fontFamily: 'GTPlanar',
							fontWeight: '500',
							fontSize: 16,
							marginBottom: 15,
							opacity: progress1,
							lineHeight: 1,
						}}
					>
						Trending repositories
					</div>
					<TrendingRepoItem number={1} repo={trending.repos[0]} theme={theme} />
					<TrendingRepoItem number={2} repo={trending.repos[1]} theme={theme} />
					<TrendingRepoItem number={3} repo={trending.repos[2]} theme={theme} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
