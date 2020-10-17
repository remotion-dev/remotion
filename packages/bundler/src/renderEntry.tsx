import {getVideo, getVideoConfig} from '@remotion/core';
import React from 'react';
import {render} from 'react-dom';

const Video = getVideo();
const videoConfig = getVideoConfig();

const style: React.CSSProperties = {
	width: videoConfig.width,
	height: videoConfig.height,
	display: 'flex',
	backgroundColor: 'transparent',
};

render(
	<div style={style} id="canvas">
		<Video />
	</div>,
	document.getElementById('container')
);
