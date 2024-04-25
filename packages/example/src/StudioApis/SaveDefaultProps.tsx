import {saveDefaultProps} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';

export const saveStudioSchema = z.object({
	color: z.string(),
});

export const SaveDefaultProps: React.FC = () => {
	useCallback(() => {
		saveDefaultProps({
			id: 'some-id',
			defaultProps: {
				color: 'blue',
			},
		});
	}, []);

	return (
		<AbsoluteFill>
			<button type="button">save some props</button>
		</AbsoluteFill>
	);
};
