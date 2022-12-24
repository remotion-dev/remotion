import React, {useCallback} from 'react';
import type {RenderJob} from '../../../preview-server/render-queue/job';
import {openInFileExplorer} from './actions';
import {renderQueueItemSubtitleStyle} from './item-style';

const outputLocation: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
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

export const RenderQueueOutputName: React.FC<{
	job: RenderJob;
}> = ({job}) => {
	const onClick = useCallback(() => {
		openInFileExplorer({directory: job.outputLocation});
	}, [job.outputLocation]);

	return (
		<button
			onClick={onClick}
			type="button"
			style={outputLocation}
			title={job.outputLocation}
		>
			{formatOutputLocation(job.outputLocation)}
		</button>
	);
};
