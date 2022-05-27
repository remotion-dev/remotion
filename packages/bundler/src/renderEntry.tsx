import React, {
	ComponentType,
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import type {render, unmountComponentAtNode} from 'react-dom';
// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".
// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here
import ReactDOM from 'react-dom/client';
import {
	BundleState,
	continueRender,
	delayRender,
	getInputProps,
	Internals,
	TCompMetadata,
	TComposition,
} from 'remotion';
import {getBundleMode, setBundleMode} from './bundle-mode';
import {Homepage} from './homepage/homepage';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null, '#fff'));

const Root = Internals.getRoot();

if (!Root) {
	throw new Error('Root has not been registered.');
}

const handle = delayRender('Loading root component');

const Fallback: React.FC = () => {
	useEffect(() => {
		const fallback = delayRender('Waiting for Root component to unsuspend');
		return () => continueRender(fallback);
	}, []);
	return null;
};

const GetVideo: React.FC<{state: BundleState}> = ({state}) => {
	const video = Internals.useVideo();
	const compositions = useContext(Internals.CompositionManager);
	const [Component, setComponent] = useState<ComponentType<unknown> | null>(
		null
	);

	useEffect(() => {
		if (state.type !== 'composition') {
			return;
		}

		if (!video && compositions.compositions.length > 0) {
			const foundComposition = compositions.compositions.find(
				(c) => c.id === state.compositionName
			) as TComposition;
			if (!foundComposition) {
				throw new Error(
					'Found no composition with the name ' + state.compositionName
				);
			}

			compositions.setCurrentComposition(foundComposition?.id ?? null);
		}
	}, [compositions, compositions.compositions, state, video]);

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
		if (state.type === 'evaluation') {
			continueRender(handle);
		} else if (Component) {
			continueRender(handle);
		}
	}, [Component, state.type]);

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
					<Component
						{...((video?.defaultProps as {}) ?? {})}
						{...getInputProps()}
					/>
				) : null}
			</div>
		</Suspense>
	);
};

const videoContainer = document.getElementById(
	'video-container'
) as HTMLElement;
const explainerContainer = document.getElementById(
	'explainer-container'
) as HTMLElement;

let cleanupVideoContainer = () => {
	videoContainer.innerHTML = '';
};

let cleanupExplainerContainer = () => {
	explainerContainer.innerHTML = '';
};

const renderContent = () => {
	const bundleMode = getBundleMode();

	if (bundleMode.type === 'composition' || bundleMode.type === 'evaluation') {
		const markup = (
			<Internals.RemotionRoot>
				<Root />
				<GetVideo state={bundleMode} />
			</Internals.RemotionRoot>
		);

		if (ReactDOM.createRoot) {
			const root = ReactDOM.createRoot(videoContainer);
			root.render(markup);
			cleanupVideoContainer = () => {
				root.unmount();
			};
		} else {
			(ReactDOM as unknown as {render: typeof render}).render(
				markup,
				videoContainer
			);
			cleanupVideoContainer = () => {
				(
					ReactDOM as unknown as {
						unmountComponentAtNode: typeof unmountComponentAtNode;
					}
				).unmountComponentAtNode(videoContainer);
			};
		}
	} else {
		cleanupVideoContainer();
		cleanupVideoContainer = () => {
			videoContainer.innerHTML = '';
		};
	}

	if (bundleMode.type === 'index' || bundleMode.type === 'evaluation') {
		if (ReactDOM.createRoot) {
			const root = ReactDOM.createRoot(explainerContainer);
			root.render(<Homepage />);
			cleanupExplainerContainer = () => {
				root.unmount();
			};
		} else {
			const root = ReactDOM as unknown as {
				render: typeof render;
				unmountComponentAtNode: typeof unmountComponentAtNode;
			};
			root.render(<Homepage />, explainerContainer);
			cleanupExplainerContainer = () => {
				root.unmountComponentAtNode(explainerContainer);
			};
		}
	} else {
		cleanupExplainerContainer();
		cleanupExplainerContainer = () => {
			explainerContainer.innerHTML = '';
		};
	}
};

renderContent();

export const setBundleModeAndUpdate = (state: BundleState) => {
	setBundleMode(state);
	renderContent();
};

if (typeof window !== 'undefined') {
	window.getStaticCompositions = (): TCompMetadata[] => {
		if (!Internals.compositionsRef.current) {
			throw new Error('Unexpectedly did not have a CompositionManager');
		}

		return Internals.compositionsRef.current
			.getCompositions()
			.map((c): TCompMetadata => {
				return {
					defaultProps: c.defaultProps,
					durationInFrames: c.durationInFrames,
					fps: c.fps,
					height: c.height,
					id: c.id,
					width: c.width,
				};
			});
	};

	window.siteVersion = '3';
	window.setBundleMode = setBundleModeAndUpdate;
}
