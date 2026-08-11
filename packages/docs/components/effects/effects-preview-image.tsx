import React from 'react';
import {AbsoluteFill, Img} from 'remotion';

const imageStyle: React.CSSProperties = {
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

export const EFFECTS_PREVIEW_IMAGE_SRC =
	'https://remotion.media/transition-bg-blue.jpg';

export const EffectsPreviewImage: React.FC = () => {
	return (
		<AbsoluteFill>
			<Img
				crossOrigin="anonymous"
				src={EFFECTS_PREVIEW_IMAGE_SRC}
				style={imageStyle}
				alt=""
			/>
		</AbsoluteFill>
	);
};
