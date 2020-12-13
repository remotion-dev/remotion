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
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {render} from 'react-dom';

const Root = getRoot();

if (!Root) {
	throw new Error('Root has not been registered. ');
}

deferRender();

const GetVideo = () => {
	const video = useVideo();
	const compositions = useContext(CompositionManager);
	const [Component, setComponent] = useState<React.FC | null>(null);

	useEffect(() => {
		if (!video && compositions.compositions.length > 0) {
			compositions.setCurrentComposition(
				(compositions.compositions.find(
					(c) => c.name === getCompositionName()
				) as TComposition)?.name
			);
		}
	}, [compositions, compositions.compositions, video]);

	const fetchComponent = useCallback(() => {
		if (!video) {
			throw new Error('Expected to have video');
		}
		const Comp = video.component;
		setComponent(Comp);
	}, [video]);

	useEffect(() => {
		if (video) {
			fetchComponent();
		}
	}, [fetchComponent, video]);

	useEffect(() => {
		if (Component) {
			readyToRender();
		}
	}, [Component]);

	return Component ? (
		<div
			id="canvas"
			style={{
				width: video?.width,
				height: video?.height,
				display: 'flex',
				backgroundColor: 'transparent',
			}}
		>
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
