import {registerVideo, useVideoConfig} from '@remotion/core';
import React from 'react';
import styled from 'styled-components';

const Img = styled.img`
	mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 1024 1024" enable-background="new 0 0 1024 1024" xml:space="preserve" height="1024px" width="1024px"><g><circle cx="${512}" cy="${512}" r="${
	512 - 52
}" fill="none" stroke="black" stroke-width="100"></circle></g></svg>');
`;

export const Mask = () => {
	const {width, height} = useVideoConfig();
	const mask = require('./mask.png').default;
	return (
		<div>
			<Img src={mask} style={{width, height}} />
		</div>
	);
};

registerVideo(Mask, {
	width: 1024,
	height: 1024,
	fps: 1,
	durationInFrames: 1,
});
