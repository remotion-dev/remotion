import {parseVideo} from '@remotion/browser-renderer';
import React from 'react';

export const EncoderDemo: React.FC = () => {
	return (
		<input
			type="file"
			onChange={(e) => parseVideo(e.target.files?.[0] as File)}
		/>
	);
};
