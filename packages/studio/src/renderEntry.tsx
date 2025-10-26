// This file is not compiled by Typescript, but by ESBuild
// to keep the dynamic import

import React, {useContext, useEffect, useRef, useState} from 'react';
// @ts-expect-error
// eslint-disable-next-line react/no-deprecated
import type {render} from 'react-dom';
// In React 18, you should use createRoot() from "react-dom/client".
// In React 18, you should use render from "react-dom".
// We support both, but Webpack chooses both of them and normalizes them to "react-dom/client",
// hence why we import the right thing all the time but need to differentiate here
import ReactDOM from 'react-dom/client';
import type {
	_InternalTypes,
	BundleCompositionState,
	BundleState,
	VideoConfigWithSerializedProps,
} from 'remotion';
import {
	AbsoluteFill,
	getInputProps,
	getRemotionEnvironment,
	continueRender as globalContinueRender,
	delayRender as globalDelayRender,
	Internals,
	useDelayRender,
} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';

let currentBundleMode: BundleState = {
	type: 'index',
};

const setBundleMode = (state: BundleState) => {
	currentBundleMode = state;
};

const getBundleMode = () => {
	return currentBundleMode;
};

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultPreviewCSS(null, '#1f2428'),
);

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

const isInHeadlessBrowser = () => {
	return typeof window.remotion_puppeteerTimeout !== 'undefined';
};

const DelayedSpinner: React.FC = () => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setShow(true);
		}, 2000);
		return () => {
			clearTimeout(timeout);
		};
	}, []);

	if (!show) {
		return null;
	}

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				fontSize: 13,
				opacity: 0.6,
				color: 'white',
				fontFamily: 'Helvetica, Arial, sans-serif',
			}}
		>
			Loading Studio
		</AbsoluteFill>
	);
};

const GetVideoComposition: React.FC<{
	readonly state: BundleCompositionState;
}> = ({state}) => {
	const {compositions, currentCompositionMetadata, canvasContent} = useContext(
		Internals.CompositionManager,
	);
	const {setCanvasContent} = useContext(Internals.CompositionSetters);

	const portalContainer = useRef<HTMLDivElement>(null);
	const {delayRender, continueRender} = useDelayRender();
	const [handle] = useState(() =>
		delayRender(`Waiting for Composition "${state.compositionName}"`),
	);

	useEffect(() => {
		return () => continueRender(handle);
	}, [handle, continueRender]);

	useEffect(() => {
		if (compositions.length === 0) {
			return;
		}

		const foundComposition = compositions.find(
			(c) => c.id === state.compositionName,
		) as _InternalTypes['AnyComposition'];
		if (!foundComposition) {
			throw new Error(
				`Found no composition with the name ${
					state.compositionName
				}. The following compositions were found instead: ${compositions
					.map((c) => c.id)
					.join(
						', ',
					)}. All compositions must have their ID calculated deterministically and must be mounted at the same time.`,
			);
		}

		setCanvasContent({
			type: 'composition',
			compositionId: foundComposition.id,
		});
	}, [compositions, state, currentCompositionMetadata, setCanvasContent]);

	useEffect(() => {
		if (!canvasContent) {
			return;
		}

		const {current} = portalContainer;
		if (!current) {
			throw new Error('portal did not render');
		}

		current.appendChild(Internals.portalNode());
		continueRender(handle);

		return () => {
			current.removeChild(Internals.portalNode());
		};
	}, [canvasContent, handle, continueRender]);

	if (!currentCompositionMetadata) {
		return null;
	}

	return (
		<div
			ref={portalContainer}
			id="remotion-canvas"
			style={{
				width: currentCompositionMetadata.width,
				height: currentCompositionMetadata.height,
				display: 'flex',
				backgroundColor: 'transparent',
			}}
		/>
	);
};

const DEFAULT_ROOT_COMPONENT_TIMEOUT = 10000;

const waitForRootHandle = globalDelayRender(
	'Loading root component - See https://remotion.dev/docs/troubleshooting/loading-root-component if you experience a timeout',
	{
		timeoutInMilliseconds:
			typeof window === 'undefined'
				? DEFAULT_ROOT_COMPONENT_TIMEOUT
				: (window.remotion_puppeteerTimeout ?? DEFAULT_ROOT_COMPONENT_TIMEOUT),
	},
);

const videoContainer = document.getElementById(
	'video-container',
) as HTMLElement;

let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

const getRootForElement = () => {
	if (root) {
		return root;
	}

	root = ReactDOM.createRoot(videoContainer);
	return root;
};

const renderToDOM = (content: React.ReactElement) => {
	if (!ReactDOM.createRoot) {
		if (NoReactInternals.ENABLE_V5_BREAKING_CHANGES) {
			throw new Error(
				'Remotion 5.0 does only support React 18+. However, ReactDOM.createRoot() is undefined.',
			);
		}

		(ReactDOM as unknown as {render: typeof render}).render(
			content,
			videoContainer,
		);
		return;
	}

	getRootForElement().render(content);
};

const renderContent = (Root: React.FC) => {
	const bundleMode = getBundleMode();

	if (bundleMode.type === 'composition') {
		const markup = (
			<Internals.RemotionRoot
				audioEnabled={window.remotion_audioEnabled}
				videoEnabled={window.remotion_videoEnabled}
				logLevel={window.remotion_logLevel}
				numberOfAudioTags={0}
				audioLatencyHint={window.remotion_audioLatencyHint ?? 'interactive'}
				onlyRenderComposition={bundleMode.compositionName}
				currentCompositionMetadata={{
					props: NoReactInternals.deserializeJSONWithSpecialTypes(
						bundleMode.serializedResolvedPropsWithSchema,
					),
					durationInFrames: bundleMode.compositionDurationInFrames,
					fps: bundleMode.compositionFps,
					height: bundleMode.compositionHeight,
					width: bundleMode.compositionWidth,
					defaultCodec: bundleMode.compositionDefaultCodec,
					defaultOutName: bundleMode.compositionDefaultOutName,
					defaultVideoImageFormat:
						bundleMode.compositionDefaultVideoImageFormat,
					defaultPixelFormat: bundleMode.compositionDefaultPixelFormat,
					defaultProResProfile: bundleMode.compositionDefaultProResProfile,
				}}
			>
				<Root />
				<GetVideoComposition state={bundleMode} />
			</Internals.RemotionRoot>
		);

		renderToDOM(markup);
	}

	if (bundleMode.type === 'evaluation') {
		const markup = (
			<Internals.RemotionRoot
				audioEnabled={window.remotion_audioEnabled}
				videoEnabled={window.remotion_videoEnabled}
				logLevel={window.remotion_logLevel}
				numberOfAudioTags={0}
				onlyRenderComposition={null}
				currentCompositionMetadata={null}
				audioLatencyHint={window.remotion_audioLatencyHint ?? 'interactive'}
			>
				<Root />
			</Internals.RemotionRoot>
		);

		renderToDOM(markup);
	}

	if (bundleMode.type === 'index') {
		if (isInHeadlessBrowser()) {
			return;
		}

		renderToDOM(
			<div>
				<DelayedSpinner />
			</div>,
		);
		import('./internals')
			.then(({StudioInternals}) => {
				window.remotion_isStudio = true;
				window.remotion_isReadOnlyStudio = true;

				Internals.enableSequenceStackTraces();
				renderToDOM(<StudioInternals.Studio readOnly rootComponent={Root} />);
			})
			.catch((err) => {
				renderToDOM(<div>Failed to load Remotion Studio: {err.message}</div>);
			});
	}
};

Internals.waitForRoot((Root) => {
	renderContent(Root);
	globalContinueRender(waitForRootHandle);
});

export const setBundleModeAndUpdate = (state: BundleState) => {
	setBundleMode(state);
	const delay = globalDelayRender(
		'Waiting for root component to load - See https://remotion.dev/docs/troubleshooting/loading-root-component if you experience a timeout',
	);
	Internals.waitForRoot((Root) => {
		renderContent(Root);
		requestAnimationFrame(() => {
			globalContinueRender(delay);
		});
	});
};

if (typeof window !== 'undefined') {
	const getUnevaluatedComps = () => {
		if (!Internals.getRoot()) {
			throw new Error(
				'registerRoot() was never called. 1. Make sure you specified the correct entrypoint for your bundle. 2. If your registerRoot() call is deferred, use the delayRender/continueRender pattern to tell Remotion to wait.',
			);
		}

		if (!Internals.compositionsRef.current) {
			throw new Error('Unexpectedly did not have a CompositionManager');
		}

		const compositions = Internals.compositionsRef.current.getCompositions();

		const canSerializeDefaultProps = getCanSerializeDefaultProps(compositions);
		if (!canSerializeDefaultProps) {
			Internals.Log.warn(
				{logLevel: window.remotion_logLevel, tag: null},
				'defaultProps are too big to serialize - trying to find the problematic composition...',
			);
			Internals.Log.warn(
				{logLevel: window.remotion_logLevel, tag: null},
				'Serialization:',
				compositions,
			);
			for (const comp of compositions) {
				if (!getCanSerializeDefaultProps(comp)) {
					throw new Error(
						`defaultProps too big - could not serialize - the defaultProps of composition with ID ${comp.id} - the object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops`,
					);
				}
			}

			Internals.Log.warn(
				{logLevel: window.remotion_logLevel, tag: null},
				'Could not single out a problematic composition -  The composition list as a whole is too big to serialize.',
			);

			throw new Error(
				'defaultProps too big - Could not serialize - an object that was passed to defaultProps was too big. Learn how to mitigate this error by visiting https://remotion.dev/docs/troubleshooting/serialize-defaultprops',
			);
		}

		return compositions;
	};

	window.getStaticCompositions = (): Promise<
		VideoConfigWithSerializedProps[]
	> => {
		const compositions = getUnevaluatedComps();

		const inputProps =
			typeof window === 'undefined' || getRemotionEnvironment().isPlayer
				? {}
				: (getInputProps() ?? {});

		return Promise.all(
			compositions.map(async (c): Promise<VideoConfigWithSerializedProps> => {
				const handle = globalDelayRender(
					`Running calculateMetadata() for composition ${c.id}. If you didn't want to evaluate this composition, use "selectComposition()" instead of "getCompositions()"`,
				);

				const originalProps = {
					...(c.defaultProps ?? {}),
					...(inputProps ?? {}),
				};

				const comp = Internals.resolveVideoConfig({
					calculateMetadata: c.calculateMetadata,
					compositionDurationInFrames: c.durationInFrames ?? null,
					compositionFps: c.fps ?? null,
					compositionHeight: c.height ?? null,
					compositionWidth: c.width ?? null,
					signal: new AbortController().signal,
					originalProps,
					defaultProps: c.defaultProps ?? {},
					compositionId: c.id,
				});

				const resolved = await Promise.resolve(comp);
				globalContinueRender(handle);
				const {props, defaultProps, ...data} = resolved;

				return {
					...data,
					serializedResolvedPropsWithCustomSchema:
						NoReactInternals.serializeJSONWithSpecialTypes({
							data: props,
							indent: undefined,
							staticBase: null,
						}).serializedString,
					serializedDefaultPropsWithCustomSchema:
						NoReactInternals.serializeJSONWithSpecialTypes({
							data: defaultProps,
							indent: undefined,
							staticBase: null,
						}).serializedString,
				};
			}),
		);
	};

	window.remotion_getCompositionNames = () => {
		return getUnevaluatedComps().map((c) => c.id);
	};

	window.remotion_calculateComposition = async (compId: string) => {
		const compositions = getUnevaluatedComps();
		const selectedComp = compositions.find((c) => c.id === compId);
		if (!selectedComp) {
			throw new Error(
				`Could not find composition with ID ${compId}. Available compositions: ${compositions
					.map((c) => c.id)
					.join(', ')}`,
			);
		}

		const abortController = new AbortController();
		const handle = globalDelayRender(
			`Running the calculateMetadata() function for composition ${compId}`,
		);

		const inputProps =
			typeof window === 'undefined' || getRemotionEnvironment().isPlayer
				? {}
				: (getInputProps() ?? {});

		const originalProps = {
			...(selectedComp.defaultProps ?? {}),
			...(inputProps ?? {}),
		};

		const prom = await Promise.resolve(
			Internals.resolveVideoConfig({
				calculateMetadata: selectedComp.calculateMetadata,
				compositionDurationInFrames: selectedComp.durationInFrames ?? null,
				compositionFps: selectedComp.fps ?? null,
				compositionHeight: selectedComp.height ?? null,
				compositionWidth: selectedComp.width ?? null,
				originalProps,
				signal: abortController.signal,
				defaultProps: selectedComp.defaultProps ?? {},
				compositionId: selectedComp.id,
			}),
		);
		globalContinueRender(handle);

		const {props, defaultProps, ...data} = prom;
		return {
			...data,
			serializedResolvedPropsWithCustomSchema:
				NoReactInternals.serializeJSONWithSpecialTypes({
					data: props,
					indent: undefined,
					staticBase: null,
				}).serializedString,
			serializedDefaultPropsWithCustomSchema:
				NoReactInternals.serializeJSONWithSpecialTypes({
					data: defaultProps,
					indent: undefined,
					staticBase: null,
				}).serializedString,
		};
	};

	window.remotion_setBundleMode = setBundleModeAndUpdate;
}
