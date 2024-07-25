import React, {useCallback, useState} from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {Cards} from './Card';
import type {Location} from './types';

export const schema = z.object({
	theme: z.enum(['light', 'dark']),
});

export const HomepageVideoComp: React.FC<
	z.infer<typeof schema> & {
		readonly location: Location;
	}
> = ({theme, location}) => {
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
			/>
		</AbsoluteFill>
	);
};
