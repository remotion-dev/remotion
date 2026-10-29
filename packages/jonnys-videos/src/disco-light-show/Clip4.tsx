import {Video} from '@remotion/media';
import React from 'react';
import {Interactive} from 'remotion';
import {asset} from './assets';

const Clip4Inner: React.FC = () => {
	return (
		<>
			<Video
				name="Party close-up"
				src={asset('IMG_8549.mp4')}
				style={{
					position: 'absolute',
					translate: '-180px 128.8px',
					width: 1440,
					height: 1920,
					scale: 2.033,
				}}
				durationInFrames={47}
				muted
			/>
		</>
	);
};

export const Clip4 = Interactive.create({
	Component: Clip4Inner,
	layout: 'absolute-fill',
});
