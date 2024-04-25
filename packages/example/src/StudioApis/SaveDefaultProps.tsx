import {saveDefaultProps} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {z} from 'zod';

export const saveStudioSchema = z.object({
	color: z.string(),
});

export const SaveDefaultProps: React.FC = () => {
	const {id} = useVideoConfig();
	const onClick = useCallback(async () => {
		await saveDefaultProps({
			compositionId: id,
			defaultProps: ({savedDefaultProps, unsavedDefaultProps, schema}) => {
				return {
					color: 'green',
				};
			},
		});

		console.log('Saved!');
	}, [id]);

	return (
		<AbsoluteFill>
			<button type="button" onClick={onClick}>
				save some props
			</button>
		</AbsoluteFill>
	);
};
