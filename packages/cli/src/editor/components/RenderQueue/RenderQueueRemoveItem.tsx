import React, {useCallback, useMemo} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {InlineAction} from '../InlineAction';
import {removeRenderJob} from './actions';

export const RenderQueueRemoveItem: React.FC<{job: RenderJob}> = ({job}) => {
	const onClick = useCallback(() => {
		removeRenderJob(job).catch((err) => {
			// TODO: Handle error
			console.log(err);
		});
	}, [job]);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 16,
		};
	}, []);

	return (
		<InlineAction onClick={onClick}>
			<svg
				style={icon}
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 320 512"
			>
				<path
					fill="currentColor"
					d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
				/>
			</svg>
		</InlineAction>
	);
};
