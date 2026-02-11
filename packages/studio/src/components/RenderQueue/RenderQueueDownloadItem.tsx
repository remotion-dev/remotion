import React, {useCallback, useMemo} from 'react';
import type {RenderInlineAction} from '../InlineAction';
import {InlineAction} from '../InlineAction';
import {showNotification} from '../Notifications/NotificationCenter';
import {downloadBlob} from './ClientRenderQueueProcessor';
import type {ClientRenderJob} from './client-side-render-types';

export const RenderQueueDownloadItem: React.FC<{
	readonly job: ClientRenderJob;
}> = ({job}) => {
	const onClick: React.MouseEventHandler = useCallback(
		(e) => {
			e.stopPropagation();
			if (job.status !== 'done' || !job.getBlob) {
				return;
			}

			job.getBlob()
				.then((blob) => {
					downloadBlob(blob, job.outName);
				})
				.catch((err) => {
					showNotification(
						`Could not download file: ${(err as Error).message}`,
						2000,
					);
				});
		},
		[job],
	);

	const icon: React.CSSProperties = useMemo(() => {
		return {
			height: 12,
			color: 'currentColor',
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
						d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 242.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7 288 32zM64 352c-35.3 0-64 28.7-64 64l0 32c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-32c0-35.3-28.7-64-64-64l-101.5 0-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352 64 352zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
					/>
				</svg>
			);
		},
		[icon],
	);

	return (
		<InlineAction renderAction={renderAction} onClick={onClick} title="Download" />
	);
};
