import React, {
	ComponentType,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import {render} from 'react-dom';
import {
	CompositionManager,
	deferRender,
	getCompositionName,
	getRoot,
	readyToRender,
	RemotionRoot,
	TComposition,
	useVideo,
} from 'remotion';

const Root = getRoot();

if (!Root) {
	throw new Error('Root has not been registered. ');
}

const handle = deferRender();

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = deferRender();
		return () => readyToRender(fallback);
	}, []);
	return null;
};

const GetVideo = () => {
	const video = useVideo();
	const compositions = useContext(CompositionManager);
	const [Component, setComponent] = useState<ComponentType | null>(null);

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
			readyToRender(handle);
		}
	}, [Component]);

	if (!video) {
		return null;
	}

	return (
		<Suspense fallback={<Fallback />}>
			<div
				id="canvas"
				style={{
					width: video.width,
					height: video.height,
					display: 'flex',
					backgroundColor: 'transparent',
				}}
			>
				{Component ? <Component {...((video?.props as {}) ?? {})} /> : null}
			</div>
		</Suspense>
	);
};

render(
	<RemotionRoot>
		<Root />
		<GetVideo />
	</RemotionRoot>,
	document.getElementById('container')
);
