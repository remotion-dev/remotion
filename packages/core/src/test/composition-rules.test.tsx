import {afterEach, describe, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Composition} from '../Composition.js';
import {CompositionManagerProvider} from '../CompositionManagerProvider.js';
import {RemotionRootContexts} from '../RemotionRoot.js';
import {RenderAssetManagerProvider} from '../RenderAssetManager.js';
import {expectToThrow} from './expect-to-throw.js';

afterEach(() => {
	cleanup();
});

const AnyComp: React.FC = () => null;

describe('Render composition-rules should throw with invalid props', () => {
	test('It should report invalid component id', () => {
		expectToThrow(
			() =>
				render(
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						id="invalid@id"
						width={100}
					/>,
				),
			/can only contain/,
		);
	});

	test('It should throw if no id is passed', () => {
		expectToThrow(
			() =>
				render(
					// @ts-expect-error
					<Composition
						lazyComponent={() => Promise.resolve({default: AnyComp})}
						durationInFrames={100}
						fps={30}
						height={100}
						width={100}
					/>,
				),
			/No id for composition passed./,
		);
	});

	test('It should throw if multiple components have the same id', async () => {
		const caughtErrors: Error[] = [];
		class ErrorBoundary extends React.Component<
			{readonly children: React.ReactNode},
			{failed: boolean}
		> {
			state = {failed: false};
			static getDerivedStateFromError() {
				return {failed: true};
			}

			componentDidCatch(error: Error) {
				caughtErrors.push(error);
			}

			render() {
				return this.state.failed ? null : this.props.children;
			}
		}

		const root = createRoot(document.createElement('div'), {
			onCaughtError: () => undefined,
		});
		try {
			await act(() => {
				root.render(
					<ErrorBoundary>
						<CompositionManagerProvider
							onlyRenderComposition={null}
							currentCompositionMetadata={null}
							initialCompositions={[]}
							initialCanvasContent={null}
						>
							<RemotionRootContexts
								_experimentalKeepAudioContextAlive={false}
								frameState={null}
								videoEnabled
								audioEnabled
								numberOfAudioTags={0}
								logLevel="info"
								audioLatencyHint="interactive"
								previewSampleRate={null}
							>
								<RenderAssetManagerProvider collectAssets={null}>
									<Composition
										lazyComponent={() => Promise.resolve({default: AnyComp})}
										durationInFrames={100}
										fps={30}
										height={100}
										width={100}
										id="id"
									/>
									<Composition
										lazyComponent={() => Promise.resolve({default: AnyComp})}
										durationInFrames={100}
										fps={30}
										height={100}
										width={100}
										id="id"
									/>
								</RenderAssetManagerProvider>
							</RemotionRootContexts>
						</CompositionManagerProvider>
					</ErrorBoundary>,
				);
			});
			expect(caughtErrors[0]?.message).toMatch(
				/Multiple composition with id id/,
			);
		} finally {
			await act(() => root.unmount());
		}
	});
});
describe('Render composition-rules should not with valid props', () => {
	test('It should validate the component id', () => {
		expect(() =>
			render(
				<Composition
					lazyComponent={() => Promise.resolve({default: AnyComp})}
					durationInFrames={100}
					fps={30}
					height={100}
					id="valid-id"
					width={100}
				/>,
			),
		).not.toThrow();
	});
});
