import type {queries, RenderOptions} from '@testing-library/react';
import {render, screen} from '@testing-library/react';
import type {FC, ReactElement} from 'react';
import {Internals} from 'remotion';

const videoConfig = {
	defaultCodec: null,
	defaultOutName: null,
	defaultPixelFormat: null,
	defaultProps: {},
	defaultProResProfile: null,
	defaultSampleRate: null,
	defaultVideoImageFormat: null,
	durationInFrames: 100,
	fps: 30,
	height: 1080,
	id: 'shape-test',
	props: {},
	width: 1920,
};

const initialCanvasContent = {
	compositionId: 'shape-test',
	type: 'composition' as const,
};

const initialCompositions = [
	{
		calculateMetadata: null,
		component: () => null,
		defaultProps: {},
		durationInFrames: 100,
		folderName: null,
		fps: 30,
		height: 1080,
		id: 'shape-test',
		nonce: [[0, 0] as [number, number]],
		parentFolderName: null,
		schema: null,
		stack: null,
		width: 1920,
	},
];

const resolveCompositionContext = {
	'shape-test': {
		result: videoConfig,
		type: 'success' as const,
		metadataSource: null,
	},
};

const AllTheProviders: FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	// overwriting console.error console does not gets poluted with all the errors

	window.console.error = () => {};
	return (
		<Internals.CompositionManagerProvider
			currentCompositionMetadata={videoConfig}
			initialCanvasContent={initialCanvasContent}
			initialCompositions={initialCompositions}
			onlyRenderComposition="shape-test"
		>
			<Internals.RemotionRootContexts
				audioEnabled
				audioLatencyHint="interactive"
				frameState={null}
				logLevel="info"
				numberOfAudioTags={0}
				previewSampleRate={null}
				videoEnabled
			>
				<Internals.CanUseRemotionHooks.Provider value>
					<Internals.ResolveCompositionContext.Provider
						value={resolveCompositionContext}
					>
						<div>{children}</div>
					</Internals.ResolveCompositionContext.Provider>
				</Internals.CanUseRemotionHooks.Provider>
			</Internals.RemotionRootContexts>
		</Internals.CompositionManagerProvider>
	);
};

const customRender = (
	ui: ReactElement,
	options?: Omit<RenderOptions, 'queries'>,
) => render<typeof queries>(ui, {wrapper: AllTheProviders, ...options});

export * from '@testing-library/react';
export {customRender as render, screen};
