import {render} from '@testing-library/react';
import React, {useContext} from 'react';
import {Internals, LooseAnyComponent} from '..';
import {Loop} from '../loop';
import {expectToThrow} from './expect-to-throw';

const Wrapper: React.FC = ({children}) => {
	const compositions = useContext(Internals.CompositionManager);
	return (
		<Internals.RemotionRoot>
			<Internals.CompositionManager.Provider
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
									default: (() => null) as LooseAnyComponent<unknown>,
								})
							),
						},
					],
					currentComposition: 'markup',
				}}
			>
				{children}
			</Internals.CompositionManager.Provider>
		</Internals.RemotionRoot>
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
				/You passed to durationInFrames an argument of type string, but it must be a number./
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
				/The "durationInFrames" of a loop must be an integer, but got 1.1./
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
				/durationInFrames must be positive, but got -1./
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
