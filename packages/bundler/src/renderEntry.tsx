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
	continueRender,
	delayRender,
	getInputProps,
	Internals,
	TComposition,
} from 'remotion';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null));
Internals.setupEnvVariables();

const Root = Internals.getRoot();

if (!Root) {
	throw new Error('Root has not been registered.');
}

const handle = delayRender();

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender();
		return () => continueRender(fallback);
	}, []);
	return null;
};

const inputProps = getInputProps();

const GetVideo = () => {
	const video = Internals.useVideo();
	const compositions = useContext(Internals.CompositionManager);
	const [Component, setComponent] = useState<ComponentType | null>(null);

	useEffect(() => {
		if (Internals.getIsEvaluation()) {
			return;
		}

		if (!video && compositions.compositions.length > 0) {
			compositions.setCurrentComposition(
				(compositions.compositions.find(
					(c) => c.id === Internals.getCompositionName()
				) as TComposition)?.id ?? null
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
		if (Internals.getIsEvaluation()) {
			continueRender(handle);
		} else if (Component) {
			continueRender(handle);
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
				{Component ? (
					<Component {...((video?.props as {}) ?? {})} {...inputProps} />
				) : null}
			</div>
		</Suspense>
	);
};

if (!Internals.isPlainIndex()) {
	render(
		<Internals.RemotionRoot>
			<Root />
			<GetVideo />
		</Internals.RemotionRoot>,
		document.getElementById('container')
	);
}
