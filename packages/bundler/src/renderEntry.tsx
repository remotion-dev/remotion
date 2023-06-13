import React, {useContext, useEffect, useRef, useState} from 'react';
import type {render, unmountComponentAtNode} from 'react-dom';
// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".
// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here
import ReactDOM from 'react-dom/client';
import type {AnyCompMetadata, AnyComposition, BundleState} from 'remotion';
import {continueRender, delayRender, Internals, VERSION} from 'remotion';
import {getBundleMode, setBundleMode} from './bundle-mode';
import {Homepage} from './homepage/homepage';

Internals.CSSUtils.injectCSS(Internals.CSSUtils.makeDefaultCSS(null, '#fff'));

const getCanSerializeDefaultProps = (object: unknown) => {
	try {
		const str = JSON.stringify(object);
		// 256MB is the theoretical limit, making it throw if over 90% of that is reached.
		return str.length < 256 * 1024 * 1024 * 0.9;
	} catch (err) {
		if ((err as Error).message.includes('Invalid string length')) {
			return false;
		}

		throw err;
	}
};

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
			) as AnyComposition;
			if (!foundComposition) {
				throw new Error(
					`Found no composition with the name ${
						state.compositionName
					}. The following compositions were found instead: ${compositions.compositions
						.map((c) => c.id)
						.join(
							', '
						)}. All compositions must have their ID calculated deterministically and must be mounted at the same time.`
				);
			}

			compositions.setCurrentComposition(foundComposition?.id ?? null);
			compositions.setCurrentCompositionMetadata({
				defaultProps: state.compositionDefaultProps,
				durationInFrames: state.compositionDurationInFrames,
				fps: state.compositionFps,
				height: state.compositionHeight,
				width: state.compositionWidth,
			});
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

const waitForRootHandle = delayRender(
	'Loading root component - See https://remotion.dev/docs/troubleshooting/loading-root-component if you experience a timeout'
);

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
			<Internals.RemotionRoot numberOfAudioTags={0}>
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
	const getUnevaluatedComps = () => {
		if (!Internals.getRoot()) {
			throw new Error(
				'registerRoot() was never called. 1. Make sure you specified the correct entrypoint for your bundle. 2. If your registerRoot() call is deferred, use the delayRender/continueRender pattern to tell Remotion to wait.'
			);
		}

		if (!Internals.compositionsRef.current) {
			throw new Error('Unexpectedly did not have a CompositionManager');
		}

		const compositions = Internals.compositionsRef.current.getCompositions();

		const canSerializeDefaultProps = getCanSerializeDefaultProps(compositions);
		if (!canSerializeDefaultProps) {
			console.warn(
				'defaultProps are too big to serialize - trying to find the problematic composition...'
			);
			for (const comp of compositions) {
				if (!getCanSerializeDefaultProps(comp)) {
					throw new Error(
						`defaultProps too big - could not serialize - the defaultProps of composition with ID ${comp.id} - the object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops`
					);
				}
			}

			console.warn(
				'Could not single out a problematic composition -  The composition list as a whole is too big to serialize.'
			);

			throw new Error(
				'defaultProps too big - Could not serialize - an object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops'
			);
		}

		return compositions;
	};

	window.getStaticCompositions = (): Promise<AnyCompMetadata[]> => {
		const compositions = getUnevaluatedComps();

		return Promise.all(
			compositions.map(async (c): Promise<AnyCompMetadata> => {
				const handle = delayRender(
					`Running calculateMetadata() for composition ${c.id}. If you didn't want to evaluate this composition, use "selectComposition()" instead of "getCompositions()"`
				);
				const comp = Internals.resolveVideoConfig({
					composition: c,
					editorProps: {},
					signal: new AbortController().signal,
				});

				const resolved = await Promise.resolve(comp);
				continueRender(handle);
				return resolved;
			})
		);
	};

	window.remotion_getCompositionNames = () => {
		return getUnevaluatedComps().map((c) => c.id);
	};

	window.remotion_calculateComposition = async (compId: string) => {
		const compositions = getUnevaluatedComps();
		const selectedComp = compositions.find((c) => c.id === compId);
		if (!selectedComp) {
			throw new Error(`Could not find composition with ID ${compId}`);
		}

		const abortController = new AbortController();
		const handle = delayRender(
			`Running the calculateMetadata() function for composition ${compId}`
		);

		const prom = await Promise.resolve(
			Internals.resolveVideoConfig({
				composition: selectedComp,
				editorProps: {},
				signal: abortController.signal,
			})
		);
		continueRender(handle);

		return prom;
	};

	window.siteVersion = '5';
	window.remotion_version = VERSION;
	window.remotion_setBundleMode = setBundleModeAndUpdate;
}
