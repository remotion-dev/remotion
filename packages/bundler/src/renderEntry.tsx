import {
	CompositionManager,
	deferRender,
	getCompositionName,
	getRoot,
	readyToRender,
	RemotionRoot,
	TComposition,
	useVideo,
} from '@remotion/core';
import React, {useContext, useEffect} from 'react';
import {render} from 'react-dom';

const Root = getRoot();

if (!Root) {
	throw new Error('Root has not been registered. ');
}

deferRender();

const GetVideo = () => {
	const video = useVideo();
	const compositions = useContext(CompositionManager);
	const Component = video ? video.component : null;
	console.log({
		Component,
		c: compositions.compositions,
		name: getCompositionName(),
	});
	useEffect(() => {
		if (!video && compositions.compositions.length > 0) {
			compositions.setCurrentComposition(
				(compositions.compositions.find(
					(c) => c.name === getCompositionName()
				) as TComposition)?.name
			);
		}
	}, [compositions, compositions.compositions, video]);

	useEffect(() => {
		if (Component) {
			readyToRender();
		}
	}, [Component]);

	const style: React.CSSProperties = {
		width: video ? video.width : 0,
		height: video ? video.height : 0,
		display: 'flex',
		backgroundColor: 'transparent',
	};

	return Component ? (
		<div id="canvas" style={style}>
			<Component />
		</div>
	) : null;
};

render(
	<RemotionRoot>
		<Root />
		<GetVideo />
	</RemotionRoot>,
	document.getElementById('container')
);
