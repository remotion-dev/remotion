import React from 'react';
import {render} from 'react-dom';
import {getVideo, getVideoConfig} from '@jonny/motion-core';

const Video = getVideo();
const videoConfig = getVideoConfig();

const style: React.CSSProperties = {
	width: videoConfig.width,
	height: videoConfig.height,
	display: 'flex',
};

render(
	<div style={style} id="canvas">
		<Video />
	</div>,
	document.getElementById('container')
);
