import React from 'react';

export const AudioCodecDropWarning: React.FC = () => {
	return (
		<div className="text-sm mt-2 text-muted-foreground">
			Your browser doesn't support encoding audio and the audio track cannot be
			copied into the new container.
		</div>
	);
};
