import React from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {LIGHT_TEXT} from '../../helpers/colors';

const container: React.CSSProperties = {
	padding: 12,
};

const title: React.CSSProperties = {
	fontSize: 14,
};

const outputLocation: React.CSSProperties = {
	fontSize: 14,
	color: LIGHT_TEXT,
};

const formatOutputLocation = (location: string) => {
	if (location.startsWith(window.remotion_cwd)) {
		const out = location.substring(window.remotion_cwd.length);

		if (out.startsWith('/') || out.startsWith('\\')) {
			return out.substring(1);
		}

		return out;
	}

	return location;
};

export const RenderQueueItem: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	return (
		<div style={container}>
			<div style={title}>{job.compositionId}</div>
			<div style={outputLocation}>
				{formatOutputLocation(job.outputLocation)}
			</div>
		</div>
	);
};
