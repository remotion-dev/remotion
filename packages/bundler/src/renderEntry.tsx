import React, {
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import {render} from 'react-dom';
import {
	BundleState,
	continueRender,
	delayRender,
	getInputProps,
	Internals,
	LooseAnyComponent,
	TCompMetadata,
	TComposition,
} from 'remotion';
import {Homepage} from './homepage/homepage';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null, '#fff'));

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
	const [Component, setComponent] = useState<LooseAnyComponent<unknown> | null>(
		null
	);

	useEffect(() => {
		if (getIsEvaluation()) {
			return;
		}

		if (!video && compositions.compositions.length > 0) {
			compositions.setCurrentComposition(
				(
					compositions.compositions.find(
						(c) => c.id === getCompositionName()
					) as TComposition
				)?.id ?? null
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
		if (getIsEvaluation()) {
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
				id="remotion-canvas"
				style={{
					width: video.width,
					height: video.height,
					display: 'flex',
					backgroundColor: 'transparent',
				}}
			>
				{Component ? (
					<Component {...((video?.defaultProps as {}) ?? {})} {...inputProps} />
				) : null}
			</div>
		</Suspense>
	);
};

const renderContent = () => {
	const videoContainer = document.getElementById(
		'video-container'
	) as HTMLElement;
	const explainerContainer = document.getElementById(
		'explainer-container'
	) as HTMLElement;

	if (!isPlainIndex()) {
		render(
			<Internals.RemotionRoot>
				<Root />
				<GetVideo />
			</Internals.RemotionRoot>,
			videoContainer
		);
	} else {
		videoContainer.innerHTML = '';
	}

	if (isPlainIndex() || getIsEvaluation()) {
		render(<Homepage />, explainerContainer);
	} else {
		explainerContainer.innerHTML = '';
	}
};

renderContent();

let bundleMode: BundleState = {
	type: 'index',
};

export const isPlainIndex = () => {
	return bundleMode.type === 'index';
};

export const getCompositionName = () => {
	if (bundleMode.type !== 'composition') {
		return null;
	}
	return bundleMode.compositionName;
};

export const getIsEvaluation = () => {
	return bundleMode.type === 'evaluation';
};

export const setBundleMode = (state: BundleState) => {
	bundleMode = state;
	renderContent();
};

if (typeof window !== 'undefined') {
	window.getStaticCompositions = (): TCompMetadata[] => {
		if (!Internals.compositionsRef.current) {
			throw new Error('Unexpectedly did not have a CompositionManager');
		}

		return Internals.compositionsRef.current.getCompositions();
	};

	window.setBundleMode = setBundleMode;
}
