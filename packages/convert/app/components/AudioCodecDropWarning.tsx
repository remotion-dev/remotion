import React from 'react';

export const AudioCodecDropWarning: React.FC = () => {
	if (typeof AudioEncoder === 'undefined') {
		return (
			<div className="text-sm mt-2 text-muted-foreground">
				Your browser doesn&apos;t support encoding audio and the audio track
				cannot be copied into the new container.
			</div>
		);
	}

	return (
		<div className="text-sm mt-2 text-muted-foreground">
			Your browser doesn&apos;t support decoding this audio and the audio track
			cannot be copied into the new container.{' '}
		</div>
	);
};
