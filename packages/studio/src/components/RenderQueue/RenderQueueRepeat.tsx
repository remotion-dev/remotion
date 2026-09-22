import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import {CURRENT_COLOR} from '../../helpers/colors';
import {
	makeClientRetryPayload,
	makeRetryPayload,
} from '../../helpers/retry-payload';
import {SetSelectedModalContext} from '../../state/modals';
import {ActionTooltip} from '../ActionTooltip';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import type {CaptionJob} from './caption-job-types';
import type {
	ClientStillRenderJob,
	ClientVideoRenderJob,
} from './client-side-render-types';
import type {AnyRenderJob} from './context';
import {isClientRenderJob} from './context';
import type {VideoMattingJob} from './video-matting-job-types';

export const RenderQueueRepeatItem: React.FC<{
	readonly job: AnyRenderJob | CaptionJob | VideoMattingJob;
}> = ({job}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);

	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();

			if (job.type === 'caption') {
				setSelectedModal({
					type: 'transcribe',
					src: job.src,
					displayName: job.displayName,
					audioStreamIndex: job.audioStreamIndex,
					requestInit: job.requestInit,
					target: job.target,
				});
			} else if (job.type === 'video-matting') {
				setSelectedModal({
					type: 'video-matting',
					src: job.src,
					displayName: job.displayName,
					target: job.target,
				});
			} else if (isClientRenderJob(job)) {
				const retryPayload = makeClientRetryPayload(
					job as ClientStillRenderJob | ClientVideoRenderJob,
				);
				setSelectedModal(retryPayload);
			} else {
				const retryPayload = makeRetryPayload(job as RenderJob);
				setSelectedModal(retryPayload);
			}
		},
		[job, setSelectedModal],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 12,
			color: CURRENT_COLOR,
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg style={icon} viewBox="0 0 512 512">
					<path
						fill={color}
						d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return (
		<ActionTooltip label="Retry" shortcut={null} delay={800} dismissOnClick>
			<InlineAction
				aria-label="Retry"
				onClick={onClick}
				renderAction={renderAction}
				variant={null}
			/>
		</ActionTooltip>
	);
};
