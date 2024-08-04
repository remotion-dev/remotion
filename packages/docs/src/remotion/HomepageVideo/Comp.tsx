import React, {useCallback, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {Cards} from './Card';
import type {Location} from './types';

export const calculateMetadata: CalculateMetadataFunction<
	z.infer<typeof schema> & Props
> = async ({props}) => {
	const trending = await fetch('https://bugs.remotion.dev/trending')
		.then((res) => res.json())
		.then((data) => data.repos.slice(0, 3));

	return {
		durationInFrames: 120,
		fps: 30,
		height: 360,
		width: 640,
		props: {
			...props,
			trending,
		},
	};
};

type Props = {
	readonly location: Location;
	readonly trending: null | string[];
};

export const schema = z.object({
	theme: z.enum(['light', 'dark']),
});

export const HomepageVideoComp: React.FC<z.infer<typeof schema> & Props> = ({
	theme,
	location,
	trending,
}) => {
	const [state, setRerenders] = useState({
		rerenders: 0,
		indices: [0, 1, 2, 3],
	});

	const onUpdate = useCallback((newIndices: number[]) => {
		setRerenders((i) => ({
			indices: newIndices,
			rerenders: i.rerenders + 1,
		}));
	}, []);

	if (!location) {
		return null;
	}

	if (!trending) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{
				backgroundColor: theme === 'dark' ? '#222' : 'white',
			}}
		>
			<Cards
				key={state.rerenders}
				onUpdate={onUpdate}
				indices={state.indices}
				theme={theme}
				location={location}
				trending={trending}
			/>
		</AbsoluteFill>
	);
};
