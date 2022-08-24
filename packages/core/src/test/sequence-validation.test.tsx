/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import React from 'react';
import {describe, expect, test} from 'vitest';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import type {CompositionManagerContext} from '../CompositionManager';
import {CompositionManager} from '../CompositionManager';
import {Sequence} from '../Sequence';
import {expectToThrow} from './expect-to-throw';

const Comp: React.FC = () => null;

const context: CompositionManagerContext = {
	assets: [],
	compositions: [
		{
			id: 'my-comp',
			durationInFrames: 100,
			// @ts-expect-error
			component: Comp,
			defaultProps: {},
			folderName: null,
			fps: 30,
			height: 1080,
			width: 1080,
			parentFolderName: null,
			nonce: 0,
		},
	],
	currentComposition: 'my-comp',
	folders: [],
	registerAsset: () => undefined,
	registerComposition: () => undefined,
	registerFolder: () => undefined,
	registerSequence: () => undefined,
	sequences: [],
	setCurrentComposition: () => undefined,
	unregisterAsset: () => undefined,
	unregisterComposition: () => undefined,
	unregisterFolder: () => undefined,
	unregisterSequence: () => undefined,
};

describe('Composition-validation render should throw with invalid props', () => {
	describe('Throw with invalid duration props', () => {
		test('It should throw if Sequence has non-integer durationInFrames', () => {
			expectToThrow(
				() =>
					render(
						<Sequence from={0} durationInFrames={1.1}>
							hi
						</Sequence>
					),
				/The "durationInFrames" of a sequence must be an integer, but got 1.1./
			);
		});
		test('It should throw if Sequence has negative duration', () => {
			expectToThrow(
				// @ts-expect-error
				() => render(<Sequence from={0} durationInFrames={-1} />),
				/durationInFrames must be positive, but got -1/
			);
		});
	});

	describe('Throw with invalid from props', () => {
		test('It should throw if "from" props is not a number', () => {
			expectToThrow(
				// @ts-expect-error
				() => render(<Sequence from={'0'} durationInFrames={30} />),
				/You passed to the "from" props of your <Sequence> an argument of type string, but it must be a number./
			);
		});
		test('It should throw if Sequence has non-integer from', () => {
			expectToThrow(
				() =>
					render(
						<Sequence from={0.1} durationInFrames={1}>
							hi
						</Sequence>
					),
				/The "from" prop of a sequence must be an integer, but got 0.1./
			);
		});
	});
	test('It should throw for invalid layout value', () => {
		expectToThrow(
			() =>
				render(
					// @ts-expect-error
					<Sequence from={0} durationInFrames={100} layout={'invalid-value'} />
				),
			/The layout prop of <Sequence \/> expects either "absolute-fill" or "none", but you passed: invalid-value/
		);
	});
});

describe('Composition-validation render should NOT throw with valid props', () => {
	test('It should allow null as children', () => {
		expect(() =>
			render(
				<CanUseRemotionHooksProvider>
					<CompositionManager.Provider value={context}>
						<Sequence durationInFrames={100} from={0}>
							{null}
						</Sequence>
					</CompositionManager.Provider>
				</CanUseRemotionHooksProvider>
			)
		).not.toThrow();
	});
	test('It should allow undefined as children', () => {
		expect(() =>
			render(
				<CanUseRemotionHooksProvider>
					<CompositionManager.Provider value={context}>
						<Sequence durationInFrames={100} from={0}>
							{undefined}
						</Sequence>
					</CompositionManager.Provider>
				</CanUseRemotionHooksProvider>
			)
		).not.toThrow();
	});
});
