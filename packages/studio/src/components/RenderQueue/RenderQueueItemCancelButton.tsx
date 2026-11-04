import React, {useCallback, useContext, useMemo} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {CURRENT_COLOR} from '../../helpers/colors';
import {ActionTooltip} from '../ActionTooltip';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import type {CaptionJob} from './caption-job-types';
import type {AnyRenderJob} from './context';
import {RenderQueueActionsContext, RenderQueueContext} from './context';
import {useIsRenderJobCancelling} from './use-is-render-job-cancelling';
import type {VideoMattingJob} from './video-matting-job-types';

export const RenderQueueCancelButton: React.FC<{
	readonly job: AnyRenderJob | CaptionJob | VideoMattingJob;
}> = ({job}) => {
	const {cancelClientJob} = useContext(RenderQueueContext);
	const {cancelJob, canCancelJob} = useContext(RenderQueueActionsContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const cancelling = useIsRenderJobCancelling(job.id);
	const isRender = job.type !== 'caption' && job.type !== 'video-matting';
	const isServerRender =
		isRender && job.type !== 'client-still' && job.type !== 'client-video';
	const disabled =
		isRender &&
		(cancelling ||
			!canCancelJob(job.id) ||
			(isServerRender && previewServerState.type !== 'connected'));

	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();

			if (job.type === 'caption' || job.type === 'video-matting') {
				cancelClientJob(job.id);
				return;
			}

			cancelJob(job.id);
		},
		[job, cancelClientJob, cancelJob],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 14,
			color: CURRENT_COLOR,
		};
	}, []);

	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			return (
				<svg
					style={icon}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
				>
					<path
						fill={color}
						d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return (
		<ActionTooltip
			label={cancelling ? 'Cancelling…' : 'Cancel'}
			shortcut={null}
			delay={800}
			dismissOnClick
		>
			<InlineAction
				disabled={disabled}
				aria-label={
					cancelling
						? 'Cancelling render'
						: job.type === 'caption'
							? 'Cancel transcription'
							: job.type === 'video-matting'
								? 'outName' in job
									? 'Cancel background removal'
									: 'Cancel video matting'
								: 'Cancel render'
				}
				renderAction={renderAction}
				onClick={onClick}
				variant={null}
			/>
		</ActionTooltip>
	);
};
