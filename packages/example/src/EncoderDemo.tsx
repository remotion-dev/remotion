import {reencodeVideo} from '@remotion/browser-renderer/src/reencode-video';
import React from 'react';

export const EncoderDemo: React.FC = () => {
	return (
		<input
			type="file"
			onChange={(e) => reencodeVideo(e.target.files?.[0] as File)}
		/>
	);
};
