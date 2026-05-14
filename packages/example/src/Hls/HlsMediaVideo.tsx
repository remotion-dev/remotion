import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const HlsMediaVideo: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video src="https://stream.mux.com/nqGuji1CJuoPoU3iprRRhiy3HXiQN0201HLyliOg44HOU.m3u8" />
		</AbsoluteFill>
	);
};

export const HlsMediaVideoTrimmed: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video
				src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
				trimBefore={60}
				trimAfter={150}
			/>
		</AbsoluteFill>
	);
};

export const HlsMediaVideoMuted: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video
				src="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
				muted
				loop
			/>
		</AbsoluteFill>
	);
};
