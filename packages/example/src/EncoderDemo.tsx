import {reEncodeVideo} from '@remotion/browser-renderer';
import React from 'react';

export const EncoderDemo: React.FC = () => {
	return (
		<input
			type="file"
			onChange={(e) => reEncodeVideo(e.target.files?.[0] as File)}
		/>
	);
};
