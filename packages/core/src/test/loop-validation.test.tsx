/**
 * @vitest-environment jsdom
 */
import {render} from '@testing-library/react';
import type {ComponentType} from 'react';
import React, {useContext} from 'react';
import {describe, expect, test} from 'vitest';
import {CanUseRemotionHooksProvider} from '../CanUseRemotionHooks';
import {CompositionManager} from '../CompositionManager';
import {Loop} from '../loop';
import {RemotionRoot} from '../RemotionRoot';
import {expectToThrow} from './expect-to-throw';

const Wrapper: React.FC<{
	children: React.ReactNode;
}> = ({children}) => {
	const compositions = useContext(CompositionManager);
	return (
		<CanUseRemotionHooksProvider>
			<RemotionRoot numberOfAudioTags={0}>
				<CompositionManager.Provider
					// eslint-disable-next-line react/jsx-no-constructed-context-values
					value={{
						...compositions,
						compositions: [
							{
								height: 1080,
								width: 1080,
								fps: 30,
								durationInFrames: 30,
								id: 'markup',
								nonce: 0,
								component: React.lazy(() =>
									Promise.resolve({
										default: (() => null) as ComponentType<unknown>,
									})
								),
								defaultProps: undefined,
								folderName: null,
								parentFolderName: null,
							},
						],
						currentComposition: 'markup',
					}}
				>
					{children}
				</CompositionManager.Provider>
			</RemotionRoot>
		</CanUseRemotionHooksProvider>
	);
};

describe('Loop-validation render should throw with invalid props', () => {
	describe('Throw with invalid durationInFrames prop', () => {
		test('It should throw if Loop has non-number durationInFrames', () => {
			expectToThrow(
				() =>
					render(
						<Wrapper>
							{/* @ts-expect-error */}
							<Loop durationInFrames={'1'}>hi</Loop>
						</Wrapper>
					),
				/The "durationInFrames" prop of the <Loop \/> component must be a number, but you passed a value of type string/
			);
		});
		test('It should throw if Loop has non-integer durationInFrames', () => {
			expectToThrow(
				() =>
					render(
						<Wrapper>
							<Loop durationInFrames={1.1}>hi</Loop>
						</Wrapper>
					),
				/The "durationInFrames" prop of the <Loop \/> component must be an integer, but got 1.1./
			);
		});
		test('It should throw if Loop has a negative duration', () => {
			expectToThrow(
				() =>
					render(
						<Wrapper>
							<Loop durationInFrames={-1}>hi</Loop>
						</Wrapper>
					),
				/The "durationInFrames" prop of the <Loop \/> component must be positive, but got -1./
			);
		});
	});
	describe('Throw with invalid times prop', () => {
		test('It should throw if Loop has non-number times', () => {
			expectToThrow(
				() =>
					render(
						<Wrapper>
							{/* @ts-expect-error */}
							<Loop durationInFrames={50} times="1">
								hi
							</Loop>
						</Wrapper>
					),
				/You passed to "times" an argument of type string, but it must be a number./
			);
		});
		test('It should throw if Loop has non-integer times', () => {
			expectToThrow(
				() =>
					render(
						<Wrapper>
							<Loop durationInFrames={50} times={1.1}>
								hi
							</Loop>
						</Wrapper>
					),
				/The "times" prop of a loop must be an integer, but got 1.1./
			);
		});
	});
});
describe('Should NOT throw with valid props', () => {
	test('It should allow null as children', () => {
		expect(() =>
			render(
				<Wrapper>
					<Loop durationInFrames={50}>{null}</Loop>
				</Wrapper>
			)
		).not.toThrow();
	});
	test('It should allow undefined as children', () => {
		expect(() =>
			render(
				<Wrapper>
					<Loop durationInFrames={50}>{undefined}</Loop>
				</Wrapper>
			)
		).not.toThrow();
	});
});
