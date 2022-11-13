import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {FAIL_COLOR} from '../../helpers/colors';

const iconStyle: React.CSSProperties = {
	height: 16,
	width: 16,
};

export const RenderQueueItemStatus: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	if (job.status === 'failed') {
		return (
			<div>
				<svg
					style={iconStyle}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
				>
					<path
						fill={FAIL_COLOR}
						d="M0 160V352L160 512H352L512 352V160L352 0H160L0 160zm353.9 32l-17 17-47 47 47 47 17 17L320 353.9l-17-17-47-47-47 47-17 17L158.1 320l17-17 47-47-47-47-17-17L192 158.1l17 17 47 47 47-47 17-17L353.9 192z"
					/>
				</svg>
			</div>
		);
	}

	return <div>{job.status}</div>;
};
