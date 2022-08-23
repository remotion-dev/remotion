import React, {useContext, useEffect, useRef, useState} from 'react';
import type {render, unmountComponentAtNode} from 'react-dom';
// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".
// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here
import ReactDOM from 'react-dom/client';
import type {BundleState, TCompMetadata, TComposition} from 'remotion';
import {continueRender, delayRender, Internals} from 'remotion';
// In webpack, importing from remotion/version is not supported
import {VERSION} from 'remotion/dist/version';
import {getBundleMode, setBundleMode} from './bundle-mode';
import {Homepage} from './homepage/homepage';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null, '#fff'));

const GetVideo: React.FC<{state: BundleState}> = ({state}) => {
	const video = Internals.useVideo();
	const compositions = useContext(Internals.CompositionManager);

	const portalContainer = useRef<HTMLDivElement>(null);
	const [handle] = useState(() =>
		delayRender('Wait for Composition' + JSON.stringify(state))
	);

	useEffect(() => {
		return () => continueRender(handle);
	}, [handle]);

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

	useEffect(() => {
		if (state.type === 'evaluation') {
			continueRender(handle);
		} else if (video) {
			continueRender(handle);
		}
	}, [handle, state.type, video]);

	useEffect(() => {
		if (!video) {
			return;
		}

		const {current} = portalContainer;
		if (!current) {
			throw new Error('portal did not render');
		}

		current.appendChild(Internals.portalNode());
		return () => {
			current.removeChild(Internals.portalNode());
		};
	}, [video]);

	if (!video) {
		return null;
	}

	return (
		<div
			ref={portalContainer}
			id="remotion-canvas"
			style={{
				width: video.width,
				height: video.height,
				display: 'flex',
				backgroundColor: 'transparent',
			}}
		/>
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

const waitForRootHandle = delayRender('Loading root component');

const WaitForRoot: React.FC = () => {
	const [Root, setRoot] = useState<React.FC | null>(() => Internals.getRoot());

	useEffect(() => {
		if (Root) {
			continueRender(waitForRootHandle);
			return;
		}

		const cleanup = Internals.waitForRoot((NewRoot) => {
			setRoot(() => NewRoot);
		});

		return () => cleanup();
	}, [Root]);

	if (Root === null) {
		return null;
	}

	return <Root />;
};

const renderContent = () => {
	const bundleMode = getBundleMode();

	if (bundleMode.type === 'composition' || bundleMode.type === 'evaluation') {
		const markup = (
			<Internals.RemotionRoot>
				<WaitForRoot />
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
		if (!Internals.getRoot()) {
			throw new Error(
				'registerRoot() was never called. 1. Make sure you specified the correct entrypoint for your bundle. 2. If your registerRoot() call is deferred, use the delayRender/continueRender pattern to tell Remotion to wait.'
			);
		}

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

	window.siteVersion = '4';
	window.remotion_version = VERSION;
	window.setBundleMode = setBundleModeAndUpdate;
}
