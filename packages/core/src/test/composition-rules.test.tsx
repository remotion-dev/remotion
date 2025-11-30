import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, test} from 'bun:test';
import React from 'react';
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

	test('It should throw if multiple components have the same id', () => {
		expectToThrow(
			() =>
				render(
					<CompositionManagerProvider
						onlyRenderComposition={null}
						currentCompositionMetadata={null}
						initialCompositions={[]}
						initialCanvasContent={null}
					>
						<RemotionRootContexts
							frameState={null}
							videoEnabled
							audioEnabled
							numberOfAudioTags={0}
							logLevel="info"
							audioLatencyHint="interactive"
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
					</CompositionManagerProvider>,
				),
			/Multiple composition with id id/,
		);
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
