import {saveDefaultProps, updateDefaultProps} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {z} from 'zod';

export const saveStudioSchema = z.object({
	color: z.string(),
});

export const SaveDefaultProps: React.FC = () => {
	const {id} = useVideoConfig();

	const onClickUpdate = useCallback(() => {
		updateDefaultProps({
			compositionId: id,
			defaultProps: ({unsavedDefaultProps}) => {
				return {
					...unsavedDefaultProps,
					color: 'red',
				};
			},
		});
	}, [id]);

	const onClickSave = useCallback(async () => {
		await saveDefaultProps({
			compositionId: id,
			defaultProps: ({unsavedDefaultProps}) => {
				console.log(unsavedDefaultProps);
				return unsavedDefaultProps;
			},
		});

		console.log('Saved!');
	}, [id]);

	return (
		<AbsoluteFill>
			<button type="button" onClick={onClickUpdate}>
				update some props
			</button>
			<button type="button" onClick={onClickSave}>
				save some props
			</button>
		</AbsoluteFill>
	);
};
