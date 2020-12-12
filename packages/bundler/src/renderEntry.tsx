import {
	CompositionManager,
	deferRender,
	getRoot,
	readyToRender,
	RemotionRoot,
	useVideo,
} from '@remotion/core';
import React, {useContext, useEffect} from 'react';
import {render} from 'react-dom';
/*
const Video = getVideo(getLastKeyShouldRemoveThisMethod());
const videoConfig = getVideoConfig(getLastKeyShouldRemoveThisMethod());

const style: React.CSSProperties = {
	width: videoConfig.width,
	height: videoConfig.height,
	display: 'flex',
	backgroundColor: 'transparent',
};
*/

const Root = getRoot();

if (!Root) {
	throw new Error('Root has not been registered. ');
}

deferRender();

const GetVideo = () => {
	const video = useVideo();
	const compositions = useContext(CompositionManager);
	const Component = video ? video.component : null;

	useEffect(() => {
		if (!video && compositions.compositions.length > 0) {
			// TODO: Take value dynamically
			compositions.setCurrentComposition(compositions.compositions[0].name);
		}
	}, [compositions, compositions.compositions, video]);

	useEffect(() => {
		if (Component) {
			readyToRender();
		}
	}, [Component]);

	return Component ? <Component /> : null;
};

render(
	<RemotionRoot>
		<Root />
		<div id="canvas">
			<GetVideo />
		</div>
	</RemotionRoot>,
	document.getElementById('container')
);
