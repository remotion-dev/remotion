import {Audio as MediaAudio} from '@remotion/media';
import React from 'react';
import {Audio as LegacyAudio, staticFile, Video as LegacyVideo} from 'remotion';

export const TranscriptionAudioE2e: React.FC = () => {
	return <MediaAudio name="<Audio>" src={staticFile('chirp.wav')} />;
};

export const TranscriptionLegacyMediaE2e: React.FC = () => {
	return (
		<>
			<LegacyVideo name="vp8-vorbis.webm" src={staticFile('vp8-vorbis.webm')} />
			<LegacyAudio name="<Legacy Audio>" src={staticFile('chirp.wav')} />
		</>
	);
};
